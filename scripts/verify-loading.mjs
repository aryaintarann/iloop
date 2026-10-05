import assert from 'node:assert/strict';

export async function verifyLoadingScreen(browser, base, report, errors) {
  const watchErrors = page => {
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  };
  const waitForIntro = page => page.waitForFunction(() => !document.documentElement.classList.contains('intro-active'), null, { timeout: 4000 });

  for (const width of [375, 768, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 960 } });
    await context.addInitScript(() => {
      function recordFirstFrame() {
        if (!document.querySelector('main')) return requestAnimationFrame(recordFirstFrame);
        const overlay = document.getElementById('loading-screen');
        window.__introFirstFrameCovered = Boolean(overlay && getComputedStyle(overlay).display !== 'none' && getComputedStyle(overlay).opacity === '1');
      }
      requestAnimationFrame(recordFirstFrame);
    });
    const page = await context.newPage();
    watchErrors(page);
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('#loading-screen').isVisible(), true, `First visit intro at ${width}`);
    await page.waitForFunction(() => typeof window.__introFirstFrameCovered === 'boolean');
    assert.equal(await page.evaluate(() => window.__introFirstFrameCovered), true, 'First content frame must be covered');
    assert.equal(await page.locator('main').evaluate(el => el.closest('[inert]') !== null), true);
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('a:focus, summary:focus, main:focus').count(), 0);
    await page.mouse.wheel(0, 600);
    assert.equal(await page.evaluate(() => scrollY), 0);
    const bounds = await page.locator('#loading-screen .wordmark').boundingBox();
    assert.ok(Math.abs(bounds.x + bounds.width / 2 - width / 2) < 2);
    assert.ok(Math.abs(bounds.y + bounds.height / 2 - 480) < 2);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.waitForFunction(() => {
      const logo = document.querySelector('#loading-screen .loading-suffix');
      return logo && getComputedStyle(logo).opacity === '1';
    });
    await page.screenshot({ path: `.verification/screenshots/intro-${width}.png` });
    await page.waitForFunction(() => document.documentElement.classList.contains('intro-active') && Number(getComputedStyle(document.getElementById('loading-screen')).opacity) < 1);
    assert.equal(await page.locator('main').evaluate(el => el.closest('[inert]') !== null), true, 'Keep content inert during fade');
    await waitForIntro(page);
    assert.equal(await page.locator('#loading-screen').isVisible(), false);
    assert.equal(await page.locator('[inert]').count(), 0);
    await page.keyboard.press('Tab');
    assert.equal(await page.locator(':focus').textContent(), 'Skip to content');
    await page.keyboard.press('Enter');
    assert.equal(await page.locator(':focus').getAttribute('id'), 'main');
    await page.mouse.wheel(0, 500);
    await page.waitForFunction(() => scrollY > 100);
    await page.goto(base + '/features/', { waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('#loading-screen').isVisible(), false, 'Navigation must skip intro');
    await page.reload({ waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('#loading-screen').isVisible(), false, 'Refresh must skip intro');
    await page.goto(base + '/features/?intro-preview=1', { waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('#loading-screen').isVisible(), false, 'Dev preview parameter must not replay production intro');

    const newTab = await context.newPage();
    watchErrors(newTab);
    await newTab.goto(base + '/contact/', { waitUntil: 'domcontentloaded' });
    assert.equal(await newTab.locator('#loading-screen').isVisible(), true, 'New tab, direct route intro');
    await waitForIntro(newTab);
    await context.close();
    report.push(`Intro at ${width}: first visit, centered logo, scroll/focus lock and recovery, navigation, refresh and new tab PASS`);
  }

  const anchorContext = await browser.newContext();
  const anchorPage = await anchorContext.newPage();
  watchErrors(anchorPage);
  await anchorPage.goto(base + '/features/#security', { waitUntil: 'domcontentloaded' });
  assert.equal(await anchorPage.locator('#loading-screen').isVisible(), true);
  await anchorPage.waitForFunction(() => scrollY > 100);
  const anchorPosition = await anchorPage.evaluate(() => scrollY);
  await waitForIntro(anchorPage);
  assert.equal(new URL(anchorPage.url()).hash, '#security');
  assert.equal(await anchorPage.evaluate(() => scrollY), anchorPosition, 'Intro must preserve anchor scroll');
  await anchorPage.evaluate(() => scrollTo({ top: 400, behavior: 'instant' }));
  await anchorPage.reload();
  assert.equal(await anchorPage.evaluate(() => scrollY), 400, 'Refresh must preserve restored scroll');
  await anchorContext.close();

  for (const mode of ['no-js', 'reduced', 'storage-read-denied', 'storage-write-denied', '404']) {
    const context = await browser.newContext({ javaScriptEnabled: mode !== 'no-js', reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference' });
    if (mode.startsWith('storage-')) {
      await context.addInitScript(method => {
        Storage.prototype[method] = () => { throw new DOMException('Storage denied', 'SecurityError'); };
      }, mode === 'storage-read-denied' ? 'getItem' : 'setItem');
    }
    const page = await context.newPage();
    watchErrors(page);
    await page.goto(base + (mode === '404' ? '/404.html' : '/'), { waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('#loading-screen').isVisible(), false, `${mode} must skip intro`);
    assert.equal(await page.locator('[inert]').count(), 0);
    if (mode !== 'no-js') {
      await page.keyboard.press('Tab');
      assert.equal(await page.locator(':focus').textContent(), 'Skip to content');
    }
    if (mode === 'reduced') {
      await page.goto(base + '/?intro-preview=1', { waitUntil: 'domcontentloaded' });
      assert.equal(await page.locator('#loading-screen').isVisible(), false, 'Dev preview parameter must not override production reduced motion');
    }
    if (mode === '404') {
      await page.goto(base, { waitUntil: 'domcontentloaded' });
      assert.equal(await page.locator('#loading-screen').isVisible(), true, '404 must not consume intro');
      await waitForIntro(page);
    }
    await context.close();
  }

  const slowContext = await browser.newContext();
  const slowPage = await slowContext.newPage();
  watchErrors(slowPage);
  const fontRequests = [];
  await slowPage.route('**/*.woff2', route => fontRequests.push(route));
  await slowPage.goto(base, { waitUntil: 'domcontentloaded' });
  assert.equal(await slowPage.locator('#loading-screen').isVisible(), true);
  const started = Date.now();
  await slowPage.waitForTimeout(250);
  assert.equal(await slowPage.locator('.loading-name').evaluate(el => getComputedStyle(el).opacity), '0', 'Reveal must wait for logo fonts');
  await waitForIntro(slowPage);
  assert.ok(Date.now() - started < 3200, 'Blocked fonts must release intro within three seconds');
  assert.equal(await slowPage.locator('[inert]').count(), 0);
  await Promise.all(fontRequests.map(route => route.continue()));
  await slowPage.evaluate(() => document.fonts.ready);
  assert.equal(await slowPage.locator('#loading-screen').isVisible(), false, 'Late fonts must not restart intro');
  await slowContext.close();

  const imageContext = await browser.newContext();
  const imagePage = await imageContext.newPage();
  watchErrors(imagePage);
  const imageRequests = [];
  await imagePage.route(/\.(avif|webp|jpg)$/, route => imageRequests.push(route));
  await imagePage.goto(base, { waitUntil: 'domcontentloaded' });
  await waitForIntro(imagePage);
  assert.ok(imageRequests.length > 0);
  assert.equal(await imagePage.locator('img').first().evaluate(el => el.complete), false, 'Intro must finish before blocked website images load');
  await Promise.all(imageRequests.map(route => route.continue()));
  await imageContext.close();

  const changedMotion = await browser.newContext();
  const motionPage = await changedMotion.newPage();
  await motionPage.goto(base, { waitUntil: 'domcontentloaded' });
  assert.equal(await motionPage.locator('#loading-screen').isVisible(), true);
  await motionPage.emulateMedia({ reducedMotion: 'reduce' });
  await waitForIntro(motionPage);
  assert.equal(await motionPage.locator('[inert]').count(), 0);
  await changedMotion.close();
  report.push('Intro: first frame covered, exit fade, direct anchors, restored scroll, no JS, reduced motion, denied storage, 404, font readiness/deadline, late fonts and image independence PASS');
}
