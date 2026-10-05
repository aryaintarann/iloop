import assert from 'node:assert/strict';

export async function verifyScrollReveal(page, route, width) {
  await page.waitForFunction(() => document.querySelector('[data-scroll-reveal]'));
  const blocks = page.locator('[data-scroll-reveal]');
  assert.ok(await blocks.count() >= 5, `Reveal coverage on ${route} at ${width}`);
  if (route === '/' || route === '/features/' || route === '/how-it-works/') {
    assert.ok(await page.locator('[data-scroll-reveal="pending"]').count() > 0, 'Below-fold content waits for scroll');
  }

  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let top = 0; top < height; top += 600) {
    await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), top);
    await page.waitForTimeout(60);
  }
  await page.waitForFunction(() => {
    return [...document.querySelectorAll('[data-scroll-reveal]')].every(element => {
      const style = getComputedStyle(element);
      return element.dataset.scrollReveal === 'revealed' && style.opacity === '1' && style.transform === 'none';
    });
  });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(100);
  assert.equal(await blocks.evaluateAll(elements => elements.some(element => element.getAnimations().length > 0)), false, 'Scrolling back must not replay reveals');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Reveal transforms must not introduce horizontal overflow');
}

export async function verifyScrollPreferences(browser, base, routes, report) {
  const reduced = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await reduced.newPage();
  for (const route of routes) {
    await page.goto(base + route, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('[data-scroll-reveal]').count(), 0, `Reduced motion bypass on ${route}`);
    assert.equal(await page.locator('h1').evaluate(element => getComputedStyle(element).opacity), '1');
  }
  await reduced.close();

  const context = await browser.newContext({ reducedMotion: 'no-preference', viewport: { width: 375, height: 960 } });
  const normal = await context.newPage();
  await normal.goto(base, { waitUntil: 'domcontentloaded' });
  await normal.waitForFunction(() => document.querySelector('[data-scroll-reveal]'));
  assert.equal(await normal.locator('html').evaluate(element => element.classList.contains('intro-active')), true);
  assert.equal(await normal.locator('[data-scroll-reveal]').evaluateAll(elements => elements.every(element => element.dataset.scrollReveal === 'pending' && element.getAnimations().length === 0)), true, 'Reveals wait until the intro finishes');
  await normal.waitForFunction(() => !document.documentElement.classList.contains('intro-active'));
  await normal.waitForFunction(() => document.querySelector('h1').getAnimations().length > 0);
  const focused = normal.locator('.faq-list summary').first();
  await focused.focus();
  assert.equal(await focused.evaluate(element => getComputedStyle(element.closest('details')).opacity), '1', 'Keyboard focus reveals content immediately');
  await normal.emulateMedia({ reducedMotion: 'reduce' });
  await normal.waitForFunction(() => [...document.querySelectorAll('[data-scroll-reveal]')].every(element => element.dataset.scrollReveal === 'revealed' && element.getAnimations().length === 0 && getComputedStyle(element).opacity === '1'));
  await context.close();

  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const fallback = await noJs.newPage();
  for (const route of routes) {
    await fallback.goto(base + route);
    assert.equal(await fallback.locator('[data-scroll-reveal]').count(), 0);
    assert.equal(await fallback.locator('h1').evaluate(element => getComputedStyle(element).opacity), '1', `No-JS content on ${route}`);
  }
  await noJs.close();
  report.push(`Scroll reveal: all ${routes.length} routes, once per block, intro coordination, keyboard focus, reduced motion on load/change and no-JS fallback PASS`);
}
