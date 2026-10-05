# Production verification

Verified on 5 October 2026 with Node 24.19.0, Astro 7.3.5, Chromium via Playwright and axe-core. Production preview: `http://127.0.0.1:4321`.

- PASS: `npm run check`, 15 Astro files, zero errors, warnings or hints.
- PASS: `npm run build`, five static pages, local responsive AVIF/WebP/JPEG images and sitemap, no build warning.
- PASS: `npm run test:browser`, all five pages at 375, 768 and 1440 pixels; no horizontal overflow, failed assets, JavaScript errors, console/CSP errors or axe WCAG A/AA violations.
- PASS: screenshots of every page at every requested width reviewed for spacing, readability, image crop and overlap. Full screenshots are in `.verification/screenshots/`; raw checks are in `.verification/browser-results.txt`. These generated artifacts are ignored by Git.
- PASS: an independent read-only reviewer found no defects and additionally checked 320, 360, 767, 769 and 1024 pixels. An unknown URL returned the custom page with HTTP 404.
- PASS: 200% root text size at 375 pixels on all five pages after reproducing and fixing long-word overflow. Document scroll width equals the viewport width.

## Interaction record

| Control | Verified result |
| --- | --- |
| Header and footer Home, Features, How it works, Contact | Each internal destination clicked through in production; correct route loads directly. Active page indicated in header. |
| Text wordmark | Returns to `/`. |
| Every “Book a demo” destination | `/contact/`. |
| “See the features” / “View all features” | `/features/`. |
| Six Home feature rows | Corresponding feature anchor on `/features/`. |
| “See how it works” / “Discuss your setup” | `/how-it-works/` / `/contact/`. |
| Team control & security links | `/features/#security`. |
| Reporting example link | `/features/#results`. |
| Read all FAQs / footer FAQ | `/how-it-works/#faq`. |
| Ask about early access | `/contact/#early-access`. |
| Home legacy anchors | `#features`, `#security`, `#faq`, `#about`, `#outcomes`, `#how`, `#journey`, `#results`, `#channels`, `#join`: every target exists and contains relevant text. |
| Mobile Menu | Enter opens; Tab enters links; Escape closes and restores summary focus; outside click and focus leaving close the menu. Navigation links clicked on mobile. Native menu remains operable with JavaScript disabled. |
| Home and How it works FAQ | Each summary opened and closed with Enter; answer becomes visible. Also opened with JavaScript disabled. |
| Skip to content | First Tab focuses the visible skip link; Enter focuses `main`. |
| Email us for a demo | `mailto:hello@iloop.id?subject=Book%20an%20iloop.id%20demo`. Address and decoded subject asserted. |
| Join the waitlist | `mailto:hello@iloop.id?subject=Join%20the%20iloop.id%20waitlist`. Address and decoded subject asserted. |
| Direct email links | `mailto:hello@iloop.id`. |
| 404 Back to home / Contact us | `/` / `/contact/`. |

Mailto destinations use the browser/operating system’s email handler. The browser check verifies the address and subject; delivery and a particular visitor’s installed email client are not tested. The Contact page supplies a visible address for webmail users. No email was sent.

## Accessibility and metadata

Text contrast was computed using the antislop-human contrast checker: muted text on ivory 5.64:1; forest on white 9.66:1; muted text on the soft green surface 5.22:1; light CTA copy on forest 7.66:1. All exceed the normal-text AA threshold. Axe checked actual rendered text at every required width.

Visible focus indicators, semantic landmarks, one H1 per page, labelled navigation, image alt text, native disclosure controls and a skip link are present. `prefers-reduced-motion: reduce` gives `scroll-behavior: auto` and zero button transition duration. Page content, links, navigation and FAQs remain usable with JavaScript disabled.

Four unique titles, descriptions, canonicals and Open Graph metadata are present. Canonicals use `https://iloop.id` and directory routes. Favicon, OG image, robots and both sitemap files return 200. The sitemap contains four public pages; 404 is noindex. Fonts, photos, styles and scripts load locally. Production CSP allows build hashes and local assets, with no `unsafe-inline` or external CDN requirement.

## Antislop delivery gate

### Hard gate

- R-02 PASS: source scan found no em dashes in authored UI or documentation.
- R-03 PASS: all requested viewports and 200% text resize have no horizontal overflow; screenshots show stacked mobile layouts.
- R-17 PASS: only original 12 sec / 78% / 34 reporting values remain, labelled “Illustrative data” with an explicit example-values caption.
- R-18 PASS: source contains no testimonials, invented customers or people’s avatars.
- R-23 PASS: navigation, typography and palette follow the approved plan; text wordmark retained; photos are licensed contextual imagery.
- R-24 PASS: all internal links clicked and every anchor checked against built destinations.
- R-25 PASS: computed contrast ratios and rendered axe AA audits pass.
- R-26 PASS: all links resolve; native menu and FAQ change state; email destinations have the correct address and subjects.
- R-27 PASS: no live data fetching or application dashboard exists. The static reporting figure is explicitly an illustration; no artificial loading or empty controls are needed.
- R-28 PASS: six FAQs retained from the original product page, concerning staff, handover, channels, setup, booking systems and pilots.
- R-32 PASS: Tab, Enter, Escape, focus return and skip link verified in Chromium.
- R-33 PASS: changes are written directly in Astro/CSS source; no source-rewriting helper.
- R-34 PASS: the approved light palette is used throughout; no theme toggle or unverified alternate theme.
- R-35 PASS: production build, full browser suite, screenshots and click-through completed.
- R-36 PASS: claims limited to the original six features and original control/privacy scope; no invented compliance, customer or performance claims.
- R-37 PASS: direction and dials recorded in `docs/implementation.md` before interface generation.
- R-38 PASS: conversations and dashboard are visibly illustrative; no fictional teams or customer identities.

### Purpose gate

- R-01 PASS: no gradients or glows; solid approved surfaces establish section hierarchy.
- R-04 PASS: no decorative icon library; menu lines and FAQ signs indicate actual controls.
- R-06 PASS: explicitly requested DM Serif Display and DM Sans, with the hospitality/readability reasons recorded; no large monospace or uppercase tracking.
- R-07 PASS: no background grids, dots or graph-paper patterns.
- R-08 PASS: arrows occur only on linked feature rows to identify navigation to a detailed section.
- R-09 PASS: no capsules, badges or status pills above headings.
- R-10 PASS: no glassmorphism or backdrop blurs.
- R-12 PASS: only the hero conversation has a light shadow, to separate its overlap from the photograph.
- R-13 PASS: no multi-surface glow.
- R-14 PASS: features use content rows and a larger conversation example; numbered journey items reflect actual chronological stages.
- R-19 PASS: motion is limited to brief button hover feedback and optional smooth scroll, with reduced-motion override verified.
- R-22 PASS: hospitality photograph replaces generic illustration; reporting is an explicitly labelled static example.

### Liveliness

- Dials PASS: ENERGY 2 / RHYTHM 3 / MOTION 1 documented before implementation.
- Dial consistency PASS: quiet palette, varied section composition and no automatic looping animation visible in screenshots.
- Focal points PASS: headline/photo on Home, conversation on Features, setup/journey on How it works and email choices on Contact.
- Whitespace PASS: screenshot review confirms separation between introductions, detailed content and CTAs.
- Accent PASS: forest is the single accent, applied to principal actions, linked content and the hospitality headline.
- Identity PASS: repeated serif hospitality voice, forest emphasis and operational sans text across pages.
- Design read PASS: approved audience, visual language and design reasons recorded before interface code.

### Craftsmanship and quality locks

- C-1 PASS: palette and fonts are specified by the plan; composition and shadow purposes recorded.
- C-2 PASS: click-through and disclosure checks find no dead interactions.
- C-3 PASS: sections map to existing product content and the four approved page jobs.
- C-4 PASS: keyboard, no-JS, reduced-motion, 200% text and requested responsive layouts verified.
- C-5 PASS: no invented testimonials, statistics or product claims.
- R-05 PASS: hero/photo, feature rows, split process, journey strip and native FAQ create varied rhythm rather than repeated card sections.
- R-11 PASS: buttons use 5px corners, figures use 8px, content lists remain flat; no blanket pill shape.
- R-15 PASS: action labels name demos, waitlist, feature details or setup.
- R-16 PASS: copy scan found no “seamless” or “revolutionary” product language.
- R-20 PASS: visual review confirms hotel-specific photography, conversations and guest journey content.
- R-21 PASS: approved ivory light direction retained without forced dark mode.
- R-29 PASS: ivory, charcoal, forest and white plus muted derivatives are consistent across all pages.
- R-30 PASS: visual review finds an editorial hospitality composition rather than a clone of a named software product.
- R-31 PASS: major choices and purposes are recorded in implementation notes and this gate.

## Scope and remaining work

The original root HTML entry was removed after Astro production verification. Work remains locally on `feat/astro-hospitality`; public deployment, server headers and production hosting configuration remain outside the requested change. No review findings are deferred.

## Brand intro verification (5 October 2026)

The loading screen change is local on `feat/loading-screen`. The existing wordmark appears on ivory with its forest suffix, reveals once per tab session, then fades for 300 ms. The normal sequence takes about 1.5 seconds after the logo font is ready; an independent deadline releases the website within three seconds. Images do not delay the intro. Layout props and the existing local `package.json` change are preserved; no dependency was added.

- PASS: `npm run check`, 18 files, zero errors, warnings or hints; `npm run build`, all five static pages.
- PASS: `PREVIEW_URL=http://127.0.0.1:4322 npm run test:browser` against production. On Windows these commands ran through `npm.cmd`; Chromium was installed using the existing Playwright package.
- PASS: first content frame covered, centered wordmark and completed reveal screenshots at 375, 768 and 1440 pixels, exit fade, scroll/focus blocked throughout the overlay, and keyboard/scroll restored after dismissal.
- PASS: initial visit, direct Contact route, independent new tabs, navigation and refresh in the same tab. Direct `/features/#security` keeps its anchor and scroll position; refresh preserves a restored scroll offset.
- PASS: no JavaScript, denied storage reads or writes, initial reduced motion, reduced motion enabled during the intro, and 404. Visiting 404 first does not consume the intro for a subsequent main page.
- PASS: held font requests keep the reveal pending; the deadline releases inert content within three seconds; late fonts cannot restart the intro. Held image requests do not delay dismissal.
- PASS: all existing route, link, menu, FAQ, metadata, text resize, accessibility and console/CSP checks. The inline bootstrap hash is registered in Layout before the CSP meta tag is rendered.
- PASS: fresh read-only review found no actionable defects and additionally checked history scroll restoration and Ctrl-click navigation into a new tab.

Browser-native session storage semantics are retained: an explicit `window.open` with an opener can copy the source tab's seen marker. The website does not create these windows; ordinary Ctrl-click and independently opened tabs show the intro. Duplicated browser sessions were not tested.

Intro screenshots are `.verification/screenshots/intro-{375,768,1440}.png`; the complete check record is `.verification/browser-results.txt`. The approved single reveal introduces the brand without looping motion, extra copy, fabricated assets or changes to the site's palette. Screenshot review confirms the final logo is legible and fully revealed at each required width.

## Development intro preview follow-up

Investigated the report that refresh, hot reload and new tabs never show the intro. A clean dev browser session at `http://localhost:4321/` showed the complete reveal/fade; refresh correctly skipped the stored session marker. A read-only Windows `SPI_GETCLIENTAREAANIMATION` query succeeded and reported animations disabled. Emulating reduced motion reproduced the missing intro in every fresh tab, consistent with the original reduced-motion bypass.

Added an explicit development-only preview at `http://localhost:4321/?intro-preview=1`. It bypasses the seen marker and motion preference only when the dev build supplies the preview capability attribute. Returning to the normal URL preserves the original behavior. The query parameter is read by the client because these prerendered routes do not expose the request query in component frontmatter. Production omits the capability attribute, so the same query cannot replay an already seen intro or bypass reduced motion there. No Windows or browser preference was changed.

- PASS: `node scripts/verify-loading-dev.mjs`, reduced motion on a normal URL, opt-in reveal and fade with a seen marker, replay on reload, inert/class cleanup, and return to normal behavior.
- PASS: `npm run check`, 19 files with zero errors, warnings or hints; `npm run build`, five pages.
- PASS: the full production `npm run test:browser` suite, including new checks that the preview parameter cannot override the session marker or reduced motion in production.

## Scroll reveal follow-up

Verified on 5 October 2026 with Node 24.21.0, Motion 14.0.0 and the production preview at `http://127.0.0.1:4322`.

- PASS: `npm run check`, 21 files with zero errors, warnings or hints; `npm run build`, all five static routes.
- PASS: `npm run test:browser`, all five routes at 375, 768 and 1440 pixels. Every reveal block reaches full opacity with its transform and animation styles released, and scrolling back does not replay it. Below-fold blocks on the long pages wait for viewport entry.
- PASS: the first-visit intro finishes before content reveals start; keyboard focus reveals a pending FAQ block immediately; reduced motion bypasses reveals on every route and cancels them when the preference changes; every route retains visible content without JavaScript.
- PASS: the complete existing interaction record above, including all internal link clicks, FAQ disclosures, mobile navigation, skip link, legacy anchors, email subjects, restored scroll, metadata and sitemap. No JavaScript, console/CSP or axe WCAG AA findings. All 15 page/viewport combinations have no horizontal overflow.
- PASS: reviewed current Home and Features screenshots on mobile and desktop, plus the mobile Contact screenshot. Text, image overlap, spacing and contact actions retain the existing layout after scrolling.

The browser suite now waits for direct-anchor smooth scrolling to reach its final pixel before measuring the intro's scroll preservation, positions wheel input over page content, and waits for a link's containing reveal before clicking an actual text fragment. This avoids measuring an intermediate scroll position or clicking empty space inside a wrapped inline link's combined bounding box. Navigation behavior remains covered by real browser clicks.

Scroll animation delivery gate:

- Hard gate PASS (R-03, R-24 to R-26, R-32, R-34, R-35): production build, all-route keyboard/link checks, rendered axe audits and overflow checks pass. Remaining content and asset rules retain the unchanged, documented evidence above.
- Purpose gate PASS (R-19, R-31): one-time 18px reveals guide reading; capped sibling delays express list order. No looping motion or additional decorative effects. Completed animations release their styles.
- Liveliness PASS: the existing hospitality direction now uses ENERGY 2 / RHYTHM 3 / MOTION 2, documented in `docs/implementation.md`; screenshots retain the heading hierarchy, spacing and forest accent.
- Craftsmanship PASS (C-1 to C-5): the shared script covers the five routes; focused, reduced-motion and JavaScript-disabled content remains visible; no new copy, assets, statistics or claims were introduced.

## FAQ plus/minus follow-up

Verified the original Motion implementation on Home and How it works in production at 375, 768 and 1440 pixels.

- PASS: Astro check with no diagnostics and the five-route production build.
- PASS: `verifyFaqMotion` in the complete `npm run test:browser` suite. Answer height/opacity and icon rotation animate; the open icon settles to minus and the closed icon to plus; Enter and Space toggle disclosures; rapid reversals settle in the latest state; enabling reduced motion during collapse finishes immediately, and subsequent reduced-motion toggles create no animations. Open answers release their fixed heights.
- PASS: the full regression suite, including all five pages at all three widths, scroll reveals, intro, all internal link clicks, native disclosures with JavaScript disabled, mobile navigation, 200% text resize and axe WCAG AA. Zero console/CSP findings or horizontal overflow.
- PASS: reviewed `.verification/screenshots/faq-open-{375,1440}.png` and matching closed states for readable answers, icon states and native visible focus.

FAQ delivery gate: hard gate PASS, supported by native fallback, keyboard, reduced-motion, axe and overflow checks; purpose gate PASS, icon rotation communicates the disclosure state while the short panel transition maintains continuity; liveliness PASS, consistent with the recorded MOTION 2 hospitality direction; craftsmanship PASS, native controls retain their content and semantics with no added claims or assets. The icon is hidden from assistive technology because the native disclosure already conveys its state.

## FAQ opening-height correction

Reproduced the opening defect in Chromium: a closed answer measured 97.234375px, and the opening height keyframes ran from that full height to 97px. The previous check only established that an animation object existed. A new regression assertion failed with an opening start of 97.2344px instead of zero.

The opening now explicitly starts at zero whenever `details.open` is false; closing and interrupted transitions continue to read their visible height. The regression check also samples the opening animation at a quarter of its duration and requires an intermediate height greater than zero and less than the target.

- PASS: the expanded FAQ check on both FAQ routes at 375, 768 and 1440 pixels, including closing, Enter/Space, rapid reversal and reduced motion.
- PASS: Astro check, 22 files with no errors, warnings or hints; all five routes build successfully.
- PASS: the complete production browser suite, including scroll reveals, all-route navigation, native no-JavaScript disclosures, accessibility and overflow checks with zero console/CSP findings. The FAQ delivery gate above remains satisfied.

## Page transition follow-up

Verified on 6 October 2026 against the production preview at `http://127.0.0.1:4322`.

- PASS: Astro check, 23 files with zero errors, warnings or hints; production build, all five static routes.
- PASS: dedicated transition checks at 375, 768 and 1440 pixels. Real link navigation from 404 through Home, Features, How it works and Contact creates outgoing/incoming View Transition animations with 240/320ms durations, opacity keyframes and an 8px incoming translation. Back/Forward reaches the correct routes, the intro stays bypassed after its first visit, and reduced motion opts out. No console/CSP findings in these contexts.
- PASS: first-viewport headings retain full element opacity during page transitions. Reviewed `.verification/screenshots/page-transition-mid.png` at a paused intermediate frame: incoming content remains visible while the root snapshot fades and moves. Visible blocks use the page transition; below-fold blocks retain scroll reveal.
- PASS: complete production `npm run test:browser` after the viewport coordination fix, covering all five pages at all three widths, intro, FAQ, scroll reveals, internal links, keyboard/mobile navigation, no-JavaScript access, reduced motion, 200% text resize and axe WCAG AA. Zero console/CSP findings or horizontal overflow.

The first production probe reproduced a skipped incoming transition with the opt-in in an external stylesheet. An inline, CSP-hashed opt-in in the shared head resolves it. Visual review then caught content fades overlapping the page transition; scroll reveal now exposes initial viewport blocks immediately during an active native transition.

Page transition delivery gate: hard gate PASS through production CSP, keyboard, reduced-motion, no-JavaScript, axe and overflow verification; purpose gate PASS through short navigation continuity; liveliness PASS within the existing MOTION 2 direction; craftsmanship PASS through shared styles/layout, native navigation fallback and coordination with existing reveals. No new content, assets or claims.
