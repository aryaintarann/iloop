# iloop.id

A static, English-language hospitality website built with Astro, strict TypeScript and native CSS.

Requires Node.js 22.12 or newer and npm. Dependencies are locked in `package-lock.json`.

```sh
npm ci
npm run dev
```

The development server prints its local URL. Production checks and preview:

```sh
npm run check
npm run build
npm run preview -- --host 127.0.0.1
```

The preview normally runs at `http://127.0.0.1:4321`. Deploy the contents of `dist/` to a static host. Configure the host to serve `404.html` for missing URLs and preserve directory routes with trailing slashes. No adapter, server backend, CMS or submission service is required.

## Pages and editing

- `/`: Home, with the original `#features`, `#security`, `#faq`, `#about`, `#outcomes`, `#how`, `#journey`, `#results`, `#channels` and `#join` destinations.
- `/features/`: six features, channels, illustrative reporting and team controls.
- `/how-it-works/`: setup, guest journey, integrations and FAQ.
- `/contact/`: email demo and waitlist actions.
- `/404.html`: custom error page, excluded from indexing.

Edit page content in `src/pages/`, repeated content in `src/data/content.ts`, shared components in `src/components/` and styles in `src/styles/global.css`. Metadata lives in the shared layout and page props. The canonical site URL and sitemap are configured in `astro.config.mjs`.

The Contact page opens the visitor’s email client. It does not submit or store guest data. Sample conversations and reporting values are explicitly illustrative.

## Security and assets

Astro generates a Content Security Policy for production with build hashes for its scripts and local styles. The policy permits local scripts, styles, fonts and images, restricts the default source, and retains `base-uri 'none'`, `form-action 'none'` and `object-src 'none'`. Validate against a production preview because Astro does not apply this CSP in development. Hosting headers may add `frame-ancestors 'none'` and `X-Content-Type-Options: nosniff`; frame restrictions cannot be enforced by a meta tag.

Photos and fonts are served locally. Sources and licensing are documented in [docs/assets.md](docs/assets.md).

## Browser verification

With the production preview running in another terminal:

```sh
npx playwright install chromium
npm run test:browser
```

Set `PREVIEW_URL` if the preview uses a different origin. The check visits every page at 375, 768 and 1440 pixels; checks links, assets, overflow, FAQs, mobile keyboard navigation, skip link, email subjects, metadata, reduced motion and JavaScript-disabled access; and runs axe WCAG AA checks. Screenshots and logs go to the ignored `.verification/` folder. Recorded review: [docs/verification.md](docs/verification.md).
