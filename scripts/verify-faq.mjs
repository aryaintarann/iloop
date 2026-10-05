import assert from 'node:assert/strict';

export async function verifyFaqMotion(browser, base, report) {
  for (const width of [375, 768, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 960 }, reducedMotion: 'no-preference' });
    await context.addInitScript(() => sessionStorage.setItem('iloop:intro-seen', '1'));
    const page = await context.newPage();
    for (const route of ['/', '/how-it-works/']) {
      await page.goto(base + route, { waitUntil: 'networkidle' });
      const summary = page.locator('.faq-list summary').first();
      const details = summary.locator('..');
      const answer = details.locator('.faq-answer');
      const icon = details.locator('.faq-sign-vertical');
      await summary.focus();
      await page.keyboard.press('Enter');
      assert.equal(await details.evaluate(element => element.open), true);
      assert.equal(await answer.evaluate(element => element.getAnimations().length > 0), true, 'FAQ answer animates on open');
      assert.equal(await icon.evaluate(element => element.getAnimations().length > 0), true, 'Plus/minus icon animates');
      const expansion = await answer.evaluate(element => {
        const animation = element.getAnimations().find(animation => animation.effect.getKeyframes().some(frame => frame.height !== undefined));
        const frames = animation.effect.getKeyframes();
        animation.pause();
        animation.currentTime = Number(animation.effect.getTiming().duration) / 4;
        const height = element.getBoundingClientRect().height;
        animation.play();
        return { start: parseFloat(frames[0].height), end: parseFloat(frames.at(-1).height), height };
      });
      assert.equal(expansion.start, 0, 'Opening starts at zero height, even when closed details retains layout');
      assert.ok(expansion.height > 0 && expansion.height < expansion.end, 'Opening visibly expands through an intermediate height');
      await page.waitForFunction(element => element.style.height === '' && element.getAnimations().length === 0, await answer.elementHandle());
      assert.equal(await icon.evaluate(element => new DOMMatrix(getComputedStyle(element).transform).b), 0, 'Open icon is minus');
      assert.equal(await answer.evaluate(element => getComputedStyle(element).opacity), '1');
      await page.keyboard.press('Space');
      assert.equal(await details.evaluate(element => element.open), true, 'Keep answer visible during close');
      await page.waitForFunction(element => !element.open, await details.elementHandle());
      assert.equal(await icon.evaluate(element => new DOMMatrix(getComputedStyle(element).transform).b), 1, 'Closed icon is plus');

      await summary.evaluate(element => { element.click(); element.click(); element.click(); });
      await page.waitForFunction(element => {
        const panel = element.querySelector('.faq-answer');
        return element.open && panel.style.height === '' && panel.getAnimations().length === 0;
      }, await details.elementHandle());
      assert.equal(await answer.evaluate(element => getComputedStyle(element).opacity), '1', 'Rapid reversals finish in the latest state');
      await summary.click();
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForFunction(element => !element.open && element.querySelector('.faq-answer').getAnimations().length === 0, await details.elementHandle());
      await summary.click();
      assert.equal(await details.evaluate(element => element.open), true);
      assert.equal(await icon.evaluate(element => element.getAnimations().length), 0, 'Reduced motion updates instantly');
      assert.equal(await answer.evaluate(element => element.style.height), '', 'Open answers keep natural height');
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    }
    await context.close();
    report.push(`FAQ plus/minus at ${width}: both FAQ pages, animated answer/icon, Enter/Space, rapid reversal and reduced motion PASS`);
  }
}
