# SEO release checks

## Local implementation

The five public pages are `/`, `/features/`, `/how-it-works/`, `/contact/` and `/about/`. English copy targets hotel teams in Indonesia. Shared JSON-LD contains Organization, WebSite and WebPage entities with stable IDs under `https://iloop.id`. Page names and descriptions use the same values as visible page metadata; no legal identity, address, rating, price or social profile is supplied.

Astro generates the sitemap. Submit `https://iloop.id/sitemap-index.xml`; do not create a second manual sitemap. The custom 404 is noindex and excluded from the sitemap. Privacy, Terms and the case study template live in `docs/internal/` and are not public routes or build assets. Their publication requires the missing facts and completed documents.

Run `npm run check`, `npm run build`, then `npm run test:browser` against a running production preview. The suite verifies static metadata and JSON-LD, CSP hashes, the exact five sitemap URLs, footer About links, CTA activation with mouse and Enter, FAQ, no-JavaScript access, reduced motion, layouts at 375/768/1440 pixels and accessibility.

## CTA integration contract

The shared script emits a browser `CustomEvent` named `iloop:cta-click` on `window`. It uses a delegated click listener, including the click native links generate on Enter. It does not prevent the link’s default action. Demo navigation and email links work without JavaScript.

Detail has exactly `{ action, placement, path }`. Actions are `demo` and `waitlist`; placements are `header`, `header-mobile`, `home-hero`, `cta-band`, `cta-band-early-access`, `contact-demo` and `contact-waitlist`. Path is the current pathname, excluding query and hash. Email addresses, message contents and query values are never event fields.

This is an event hook for a future integration. The handler does not store data, send requests or produce conversion reports. No analytics consumer is installed. If analytics is added, agree its data/consent rules, assess CSP changes and test whether navigation allows event delivery before claiming measurable conversions. CTA clicks alone do not establish completed demos or pilots.

JSON-LD is rendered during the static build and registered with its SHA-256 CSP hash. The CTA script uses Astro’s normal bundled script processing and local assets. CSP remains strict without `unsafe-inline`.

## Checks after the domain is live

- Verify valid HTTPS for `iloop.id` and permanent HTTP and www redirects to `https://iloop.id`, preserving the path. Confirm trailing-slash behaviour, canonical URLs and final 200 responses.
- Request an unknown path and verify a real HTTP 404 with the custom error content; avoid a 200 fallback. Confirm the 404 is absent from the sitemap.
- Fetch robots.txt, the sitemap index and its child sitemap from outside the hosting network. Verify all five public URLs are accessible to crawlers and no draft URL is present.
- Check CDN/WAF and authentication settings for crawler access. Confirm production HTTP CSP headers do not conflict with the generated meta policy and no script/JSON-LD errors appear.
- Verify domain ownership in Google Search Console and Bing Webmaster Tools, submit the sitemap index, then inspect representative URLs for rendering, canonical selection and indexing status. These account actions require owner access.
- Check email links using a configured mail client and confirm hello@iloop.id can receive enquiries. Local browser checks do not prove mail delivery.

## Production performance measurement

After deployment, record the date, URL, device/network conditions and source of each measurement. Use repeat mobile lab runs to diagnose loading and field measurements to assess real user experience when enough data is available. Targets: LCP ≤2.5 seconds, INP ≤200 milliseconds and CLS ≤0.1. Local preview results do not establish production Core Web Vitals.

Compare the first visit with the brand intro against repeat visits and reduced motion. Inspect whether the intro delays visible content or interaction and check the LCP element, layout shifts, images and fonts. Change the intro if measurements show an adverse effect, then repeat the same measurements. Record the evidence and any remaining limitations.

## Pending inputs and access

Verified business identity, final privacy/service terms, processor and retention details, real case study data and publication permission, analytics configuration, live hosting checks and search-console verification remain pending. `llms.txt` and FAQ schema are not release requirements in this implementation.
