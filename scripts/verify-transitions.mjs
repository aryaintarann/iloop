import assert from 'node:assert/strict';

export async function verifyPageTransitions(browser, base, report) {
  for (const width of [375, 768, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 960 }, reducedMotion: 'no-preference' });
    await context.addInitScript(() => {
      sessionStorage.setItem('iloop:intro-seen', '1');
      window.__pageTransition = null;
      addEventListener('pagereveal', event => {
        if (!event.viewTransition) return;
        event.viewTransition.ready.then(() => {
          window.__pageTransition = document.getAnimations()
            .filter(animation => animation.effect?.pseudoElement?.startsWith('::view-transition'))
            .map(animation => ({ pseudo: animation.effect.pseudoElement, duration: animation.effect.getTiming().duration, frames: animation.effect.getKeyframes() }));
        }).catch(error => { window.__pageTransition = { error: error.message }; });
      });
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(base + '/404.html', { waitUntil: 'networkidle' });
    for (const [label, route] of [['Back to home', '/'], ['See the features', '/features/'], ['How it works', '/how-it-works/'], ['Book a demo', '/contact/']]) {
      if (width < 768 && label === 'How it works') await page.locator('.mobile-menu summary').click();
      const link = page.getByRole('link', { name: label, exact: true }).first();
      await link.focus();
      await link.click();
      await page.waitForURL(url => url.pathname === route);
      await page.waitForFunction(() => window.__pageTransition !== null);
      const animations = await page.evaluate(() => window.__pageTransition);
      assert.ok(Array.isArray(animations), JSON.stringify(animations));
      const incoming = animations.find(animation => animation.pseudo === '::view-transition-new(root)');
      const outgoing = animations.find(animation => animation.pseudo === '::view-transition-old(root)');
      assert.equal(incoming?.duration, 320, `Incoming transition at ${width} to ${route}`);
      assert.equal(outgoing?.duration, 240);
      assert.equal(incoming.frames[0].opacity, '0');
      assert.equal(incoming.frames[0].transform, 'translateY(8px)');
      assert.equal(outgoing.frames.at(-1).opacity, '0');
      assert.equal(await page.locator('h1').evaluate(element => getComputedStyle(element).opacity), '1', 'First viewport uses the page transition without a second reveal');
      await page.waitForFunction(() => !document.getAnimations().some(animation => animation.effect?.pseudoElement?.startsWith('::view-transition')));
      assert.equal(await page.locator('#loading-screen').isVisible(), false);
    }
    await page.goBack({ waitUntil: 'networkidle' });
    assert.equal(new URL(page.url()).pathname, '/how-it-works/');
    await page.goForward({ waitUntil: 'networkidle' });
    assert.equal(new URL(page.url()).pathname, '/contact/');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.getByRole('link', { name: 'Home', exact: true }).last().click();
    await page.waitForURL(url => url.pathname === '/');
    await page.waitForTimeout(100);
    assert.equal(await page.evaluate(() => window.__pageTransition), null, 'Reduced motion disables document transitions');
    assert.equal(await page.locator('html').evaluate(element => getComputedStyle(element).opacity), '1');
    assert.deepEqual(errors, [], `Transition console/CSP errors at ${width}`);
    await context.close();
    report.push(`Page transitions at ${width}: 404 exit, Home, Features, How it works, Contact, 240/320ms crossfade, Back/Forward, intro bypass and reduced motion PASS`);
  }
}
