import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const pages = [
  ['/', 'AI Hotel Chatbot & Guest Messaging | iloop.id', 'AI guest communication for your hotel'],
  ['/features/', 'Hotel Chatbot & Messaging Features | iloop.id', 'Guest messaging features for hotel teams'],
  ['/how-it-works/', 'How Our Hotel AI Assistant Works | iloop.id', 'How iloop.id works with your hotel'],
  ['/contact/', 'Book an AI Hotel Chatbot Demo | iloop.id', 'Book a demo for your hotel'],
  ['/about/', 'About Our Hotel AI Assistant | iloop.id', 'About iloop.id'],
];

export async function verifySeo(browser, base, report) {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const descriptions = new Set();
  for (const [path, title, h1] of pages) {
    const response = await page.goto(base + path);
    assert.equal(response.status(), 200, path);
    assert.equal(await page.title(), title);
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal((await page.locator('h1').innerText()).replace(/\s+/g, ' '), h1);
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    assert.ok(description.length > 40);
    descriptions.add(description);
    const canonical = 'https://iloop.id' + path;
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), canonical);
    assert.equal(await page.locator('meta[property="og:url"]').getAttribute('content'), canonical);
    assert.equal(await page.locator('meta[property="og:description"]').getAttribute('content'), description);
    assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'index, follow');
    assert.equal(await page.getByRole('navigation', { name: 'Footer navigation' }).getByRole('link', { name: 'About', exact: true }).getAttribute('href'), '/about/');
    const opening = await page.locator('main .lead').first().innerText();
    for (const text of ['iloop.id', 'Indonesia', 'WhatsApp', 'website chat', 'email']) assert.ok(opening.includes(text), `${path}: ${text}`);
    const scripts = page.locator('script[type="application/ld+json"]');
    assert.equal(await scripts.count(), 1);
    const json = await scripts.textContent();
    const schema = JSON.parse(json);
    assert.equal(schema['@context'], 'https://schema.org');
    const [org, site, webPage] = schema['@graph'];
    assert.deepEqual(schema['@graph'].map(entity => entity['@type']), ['Organization', 'WebSite', 'WebPage']);
    assert.equal(org['@id'], 'https://iloop.id/#organization');
    assert.equal(org.name, 'iloop.id');
    assert.equal(org.email, 'hello@iloop.id');
    assert.ok((await page.locator('body').innerText()).includes(org.email));
    assert.equal(site['@id'], 'https://iloop.id/#website');
    assert.equal(site.publisher['@id'], org['@id']);
    assert.equal(webPage['@id'], canonical + '#webpage');
    assert.equal(webPage.url, canonical);
    assert.equal(webPage.name, title);
    assert.equal(webPage.description, description);
    assert.equal(webPage.isPartOf['@id'], site['@id']);
    assert.equal(webPage.about['@id'], org['@id']);
    assert.equal(site.inLanguage, 'en');
    assert.equal(webPage.inLanguage, 'en');
    const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
    assert.ok(csp.includes(`'sha256-${createHash('sha256').update(json).digest('base64')}'`), 'JSON-LD CSP hash');
    assert.ok(!csp.includes('unsafe-inline'));
  }
  assert.equal(descriptions.size, 5);
  const index = await (await context.request.get(base + '/sitemap-index.xml')).text();
  assert.ok(index.includes('https://iloop.id/sitemap-0.xml'));
  const sitemap = await (await context.request.get(base + '/sitemap-0.xml')).text();
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  assert.deepEqual(urls.sort(), pages.map(([path]) => 'https://iloop.id' + path).sort());
  const robots = await (await context.request.get(base + '/robots.txt')).text();
  assert.ok(robots.includes('Sitemap: https://iloop.id/sitemap-index.xml'));
  await page.goto(base + '/404.html');
  assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex, follow');
  await page.goto(base + '/how-it-works/');
  assert.ok(await page.locator('.faq-list details').count() >= 10);
  for (const summary of await page.locator('.faq-list summary').all()) await summary.click();
  for (const text of ['pricing', 'languages', 'PMS', 'pilot']) assert.ok((await page.locator('.faq-list').innerText()).includes(text));
  assert.ok(await page.locator('.faq-list a[href="/contact/"]').count() >= 3);
  await page.goto(base + '/contact/');
  assert.ok((await page.getByRole('link', { name: 'Email us for a demo' }).getAttribute('href')).startsWith('mailto:hello@iloop.id?subject='));
  assert.ok((await page.getByRole('link', { name: 'Join the waitlist', exact: true }).getAttribute('href')).startsWith('mailto:hello@iloop.id?subject='));
  await context.close();
  report.push('SEO: five public pages, static metadata/schema, strict CSP hashes, About footer link, FAQ/contact, sitemap and robots PASS');
}

export async function verifyCtaEvents(browser, base, report) {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const events = [];
  await context.exposeBinding('recordCta', (_, detail) => events.push(detail));
  await context.addInitScript(() => {
    window.addEventListener('iloop:cta-click', event => window.recordCta(event.detail));
  });
  const page = await context.newPage();
  const checks = [
    ['/', '.header-cta', 'demo', 'header', '/contact/'],
    ['/', '.hero-copy .button', 'demo', 'home-hero', '/contact/'],
    ['/features/', '.cta-band .button', 'demo', 'cta-band', '/contact/'],
    ['/how-it-works/', '.cta-band .light-link', 'waitlist', 'cta-band-early-access', '/contact/#early-access'],
    ['/contact/', '.demo-option .button', 'demo', 'contact-demo'],
    ['/contact/', '.waitlist-option .button', 'waitlist', 'contact-waitlist'],
    ['/', '.mobile-menu .button', 'demo', 'header-mobile', '/contact/'],
  ];
  for (const mode of ['mouse', 'keyboard']) {
    for (const [path, selector, action, placement, destination] of checks) {
      await page.setViewportSize({ width: selector.includes('mobile-menu') ? 375 : 1440, height: 960 });
      await page.goto(base + path + '?private=must-not-appear#main', { waitUntil: 'networkidle' });
      if (selector.includes('mobile-menu')) await page.locator('.mobile-menu summary').click();
      const link = page.locator(selector);
      const before = events.length;
      if (mode === 'mouse') await link.click();
      else { await link.focus(); await page.keyboard.press('Enter'); }
      if (destination) await page.waitForURL(base + destination);
      await page.waitForTimeout(100);
      assert.equal(events.length, before + 1, `${mode}: ${selector} must fire exactly once`);
      assert.deepEqual(events.at(-1), { action, placement, path });
      if (!destination) assert.equal(new URL(page.url()).pathname, path, 'Email action leaves the page available');
    }
  }
  await page.goto(base, { waitUntil: 'networkidle' });
  const before = events.length;
  await page.locator('.hero-copy .text-link').click();
  await page.waitForURL(base + '/features/');
  await page.waitForTimeout(100);
  assert.equal(events.length, before, 'Ordinary navigation must not fire CTA events');
  await context.close();
  report.push('CTA events: mouse and Enter, demo/waitlist, desktop/mobile placements, one event, pathname only and native destinations PASS');
}
