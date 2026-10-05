import assert from 'node:assert/strict';
import { mkdir, access, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { verifyLoadingScreen } from './verify-loading.mjs';
import { verifyScrollReveal, verifyScrollPreferences } from './verify-scroll.mjs';
import { verifyFaqMotion } from './verify-faq.mjs';
import { verifyPageTransitions } from './verify-transitions.mjs';
import { verifySeo, verifyCtaEvents } from './verify-seo.mjs';

const routes = ['/', '/features/', '/how-it-works/', '/contact/', '/about/', '/404.html'];
for (const route of routes) {
  await access(`dist/${route === '/' ? 'index.html' : route === '/404.html' ? '404.html' : `${route.slice(1)}index.html`}`);
}
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4321';
await mkdir('.verification/screenshots', { recursive: true });
const browser = await chromium.launch();
const errors = [];
const report = [];
try {
  await verifySeo(browser, base, report);
  await verifyCtaEvents(browser, base, report);
  await verifyLoadingScreen(browser, base, report, errors);
  await verifyScrollPreferences(browser, base, routes, report);
  await verifyFaqMotion(browser, base, report);
  await verifyPageTransitions(browser, base, report);
  for (const width of [375, 768, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 960 }, reducedMotion: 'no-preference' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(`${message.text()} (${message.location().url})`); });
    page.on('requestfailed', request => {
      const error = request.failure()?.errorText;
      if (error !== 'net::ERR_ABORTED') errors.push(`${error} ${request.url()}`);
    });
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    for (const route of routes) {
      await page.goto(base + route, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() => !document.documentElement.classList.contains('intro-active'));
      await verifyScrollReveal(page, route, width);
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${route} overflow at ${width}`);
      assert.equal(await page.locator('img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0 && img.hasAttribute('alt'))), true);
      const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      assert.deepEqual(audit.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), [], `${route} accessibility at ${width}`);
      const links = await page.locator('a').evaluateAll(anchors => anchors.map(a => a.getAttribute('href')));
      for (const href of links) {
        assert.ok(href && href !== '#', `Empty link on ${route}`);
        if (href.startsWith('mailto:')) { assert.equal(new URL(href).pathname, 'hello@iloop.id'); continue; }
        const url = new URL(href, base + route);
        if (url.origin !== base) continue;
        const response = await context.request.get(url.href);
        assert.equal(response.status(), 200, href);
        if (url.hash) assert.ok((await response.text()).includes(`id="${url.hash.slice(1)}"`), `Missing ${href}`);
      }
      for (const summary of await page.locator('main summary').all()) {
        await summary.focus();
        await page.keyboard.press('Enter');
        assert.equal(await summary.evaluate(el => el.parentElement.open), true);
        await page.keyboard.press('Enter');
        await page.waitForFunction(element => !element.parentElement.open, await summary.elementHandle());
        assert.equal(await summary.evaluate(el => el.parentElement.open), false);
      }
      if (width < 768) {
        const menu = page.locator('.mobile-menu');
        const toggle = menu.locator('summary');
        await toggle.focus();
        await page.keyboard.press('Enter');
        assert.equal(await menu.getAttribute('open') !== null, true);
        await page.keyboard.press('Tab');
        assert.equal(await page.locator(':focus').textContent(), 'Home');
        await page.keyboard.press('Escape');
        assert.equal(await menu.getAttribute('open'), null);
        assert.equal(await toggle.evaluate(el => el === document.activeElement), true);
        await toggle.click();
        await page.mouse.click(5, 40);
        assert.equal(await menu.getAttribute('open'), null);
        await toggle.focus();
        await page.keyboard.press('Enter');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Shift+Tab');
        await page.keyboard.press('Shift+Tab');
        assert.equal(await menu.getAttribute('open'), null);
      }
      await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo({ top: 0, behavior: 'instant' }); });
      await page.screenshot({ path: `.verification/screenshots/${route === '/' ? 'home' : route.replaceAll('/', '').replace('.html', '')}-${width}.png`, fullPage: true });
      if (width === 1440) {
        const destinations = [...new Set(links.filter(href => !href.startsWith('mailto:')))];
        for (const href of destinations) {
          await page.goto(base + route);
          const link = page.locator(`a[href=${JSON.stringify(href)}]:visible`).first();
          if (href === '#main') await link.focus();
          await link.scrollIntoViewIfNeeded();
          await page.waitForFunction(element => {
            const block = element.closest('[data-scroll-reveal]');
            return !block || block.dataset.scrollReveal === 'revealed';
          }, await link.elementHandle());
          // A wrapped inline link's bounding-box center can fall between its text fragments.
          const position = await link.evaluate(element => {
            const bounds = element.getBoundingClientRect();
            const fragment = element.getClientRects()[0];
            return { x: fragment.x + fragment.width / 2 - bounds.x, y: fragment.y + fragment.height / 2 - bounds.y };
          });
          await link.click({ position });
          const expected = new URL(href, base + route);
          await page.waitForURL(url => url.pathname === expected.pathname && url.hash === expected.hash);
          if (expected.hash) assert.equal(await page.locator(expected.hash).count(), 1);
        }
      }
      report.push(`${route} at ${width}: links, FAQ, menu, images, overflow and axe PASS`);
    }
    await context.close();
  }
  const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 900 } });
  const page = await noJs.newPage();
  for (const route of routes) {
    await page.goto(base + route);
    assert.ok(await page.locator('main').innerText());
    await page.locator('.mobile-menu summary').click();
    assert.equal(await page.getByRole('navigation', { name: 'Mobile navigation' }).isVisible(), true);
    for (const summary of await page.locator('main summary').all()) {
      await summary.click();
      assert.equal(await summary.evaluate(el => el.parentElement.open), true);
    }
  }
  await noJs.close();
  const reduced = await browser.newContext({ reducedMotion: 'reduce' });
  const reducedPage = await reduced.newPage();
  await reducedPage.goto(base);
  assert.equal(await reducedPage.locator('html').evaluate(el => getComputedStyle(el).scrollBehavior), 'auto');
  assert.equal(await reducedPage.locator('.button').first().evaluate(el => getComputedStyle(el).transitionDuration), '0s');
  await reduced.close();
  const keyboard = await browser.newPage();
  await keyboard.goto(base);
  await keyboard.waitForFunction(() => !document.documentElement.classList.contains('intro-active'));
  await keyboard.keyboard.press('Tab');
  assert.equal(await keyboard.locator(':focus').textContent(), 'Skip to content');
  await keyboard.keyboard.press('Enter');
  assert.equal(await keyboard.locator(':focus').getAttribute('id'), 'main');
  for (const route of routes.slice(0, 4)) {
    await keyboard.goto(base + route);
    assert.equal(await keyboard.locator('.desktop-nav [aria-current="page"]').count(), 1);
    await keyboard.getByRole('link', { name: 'Book a demo', exact: true }).first().click();
    assert.equal(new URL(keyboard.url()).pathname, '/contact/');
  }
  await keyboard.goto(base + '/contact/');
  for (const [label, subject] of [['Email us for a demo', 'Book an iloop.id demo'], ['Join the waitlist', 'Join the iloop.id waitlist']]) {
    const href = await keyboard.getByRole('link', { name: label, exact: true }).getAttribute('href');
    assert.equal(new URL(href).searchParams.get('subject'), subject);
  }
  const titles = new Set();
  for (const route of routes.slice(0, 4)) {
    await keyboard.goto(base + route);
    titles.add(await keyboard.title());
    assert.equal(await keyboard.locator('link[rel="canonical"]').getAttribute('href'), 'https://iloop.id' + route);
  }
  assert.equal(titles.size, 4);
  await keyboard.goto(base);
  for (const anchor of ['features', 'security', 'faq', 'about', 'outcomes', 'how', 'journey', 'results', 'channels', 'join']) {
    await keyboard.goto(`${base}/#${anchor}`);
    const target = keyboard.locator(`#${anchor}`);
    assert.equal(await target.count(), 1);
    assert.ok(await target.innerText());
  }
  const mobile = await browser.newPage({ viewport: { width: 375, height: 900 } });
  for (const route of routes.slice(0, 4)) {
    await mobile.goto(base);
    await mobile.locator('.mobile-menu summary').click();
    await mobile.locator(`.mobile-menu a[href=${JSON.stringify(route)}]`).first().click();
    await mobile.waitForURL(url => url.pathname === route);
  }
  for (const route of routes) {
    await mobile.goto(base + route);
    await mobile.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${route} text resize overflow`);
  }
  for (const file of ['/robots.txt', '/sitemap-index.xml', '/sitemap-0.xml', '/favicon.svg', '/og-image.jpg']) {
    assert.equal((await keyboard.request.get(base + file)).status(), 200);
  }
  assert.deepEqual(errors, []);
  report.push('JavaScript disabled, reduced motion, keyboard skip link, all internal link clicks, mobile navigation, legacy anchors, 200% text resize, active navigation, demo navigation, email subjects, metadata, sitemap and CSP/console PASS');
  await writeFile('.verification/browser-results.txt', report.join('\n') + '\n');
  console.log(report.join('\n'));
} finally {
  await browser.close();
}
