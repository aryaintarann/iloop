import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const base = process.env.DEV_URL || 'http://localhost:4321';
const browser = await chromium.launch();
try {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  assert.equal(await page.locator('#loading-screen').isVisible(), false, 'Normal dev visit respects reduced motion');
  await page.evaluate(() => sessionStorage.setItem('iloop:intro-seen', '1'));
  for (let visit = 0; visit < 2; visit++) {
    if (visit === 0) await page.goto(base + '/?intro-preview=1', { waitUntil: 'domcontentloaded' });
    else await page.reload({ waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('#loading-screen').isVisible(), true, 'Explicit dev preview replays with reduced motion and a seen marker');
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.loading-suffix')).opacity === '1');
    assert.equal(await page.locator('main').evaluate(el => el.closest('[inert]') !== null), true);
    await page.waitForFunction(() => document.documentElement.classList.contains('intro-active') && Number(getComputedStyle(document.getElementById('loading-screen')).opacity) < 1);
    await page.waitForFunction(() => !document.documentElement.classList.contains('intro-active'));
    assert.equal(await page.locator('html').evaluate(el => el.classList.contains('intro-preview')), false);
    assert.equal(await page.locator('[inert]').count(), 0);
  }
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  assert.equal(await page.locator('#loading-screen').isVisible(), false, 'Returning to normal dev URL still skips intro');
  assert.deepEqual(errors, []);
  await context.close();
  console.log('DEV PASS: reduced motion bypass, explicit preview reveal/fade, repeated preview, cleanup and return to normal URL.');
} finally {
  await browser.close();
}
