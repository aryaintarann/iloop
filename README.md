# iloop.id

A static, English-language hospitality website built with Astro, strict TypeScript and native CSS.

Requires Node.js 22.12 or newer and npm. Dependencies are locked in `package-lock.json`.

```sh
npm ci
npm run dev
```

The brand intro normally runs once per tab and is skipped for reduced motion. To replay it during development, open `http://localhost:4321/?intro-preview=1` (adjust the origin to the dev server URL). This explicit preview also enables the animation when reduced motion is set and replays on reload. The parameter has no effect in a production build.

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
- `/about/`: product purpose, service approach and contact address.
- `/404.html`: custom error page, excluded from indexing.

Edit page content in `src/pages/`, repeated content in `src/data/content.ts`, shared components in `src/components/` and styles in `src/styles/global.css`. Metadata lives in the shared layout and page props. The canonical site URL and sitemap are configured in `astro.config.mjs`.

All six built pages use Motion scroll reveals from `src/scripts/scroll-reveal.js`, loaded by the shared layout. Content blocks fade in with a short upward movement once when they enter the viewport; sibling blocks have a small capped delay. Reveals wait for the brand intro, show focused content immediately, and stop when reduced motion is enabled. With JavaScript disabled, content stays visible. Add a selector to the script when introducing a new content-block layout.

The shared FAQ keeps native `details` and `summary` controls. Motion animates the plus/minus icon and answer height/opacity over 260ms, supports reversing an unfinished transition, and updates instantly with reduced motion. The native disclosures and static plus/minus states work without JavaScript.

Internal page navigation uses native cross-document View Transitions: a 240ms outgoing fade and a 320ms incoming fade with an 8px upward movement. The shared layout supplies the opt-in before the first render, with a CSP style hash. Visible content uses the page transition while below-fold blocks retain their scroll reveals. Reduced motion disables page transitions; browsers without support keep normal document navigation. The intro still runs once per tab.

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

Set `PREVIEW_URL` if the preview uses a different origin. The check visits every page at 375, 768 and 1440 pixels; checks links, assets, overflow, FAQs, mobile keyboard navigation, skip link, email subjects, metadata, scroll reveals, page transitions, reduced motion and JavaScript-disabled access; and runs axe WCAG AA checks. Screenshots and logs go to the ignored `.verification/` folder. Recorded review: [docs/verification.md](docs/verification.md).

With the dev server running, `node scripts/verify-loading-dev.mjs` checks the explicit intro preview under reduced motion. Set `DEV_URL` if the dev server uses a different origin.

## SEO and release

Five public canonical pages use `https://iloop.id` with static Organization, WebSite and WebPage JSON-LD. Submit the Astro-generated `https://iloop.id/sitemap-index.xml` to search consoles. The 404 and internal drafts are excluded.

Demo and waitlist links emit the local browser event `iloop:cta-click` with `{ action, placement, path }`. This hook does not store or send data and has no analytics consumer or conversion reporting.

See [release checks and CTA contract](docs/seo-release.md). [Privacy draft](docs/internal/privacy-draft.md), [Terms draft](docs/internal/terms-draft.md) and [case study template](docs/internal/case-study-template.md) are internal documents requiring verified inputs before publication.
