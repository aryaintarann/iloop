# Astro hospitality migration

The SEO follow-up adds a fifth public page, `/about/`, to the original migration below. See [SEO release checks](seo-release.md) for the current sitemap, CTA event contract and external checks.

Source of intent: the approved four-page migration plan provided in this session.

1. Foundation: stable Astro, strict TypeScript, static routes, local licensed assets.
2. Website: shared layout, navigation, footer, conversation, CTA, four pages and 404.
3. Verification: type check, production build, browser interactions, accessibility, screenshots at 375, 768 and 1440 pixels.

Shared interfaces: page routes and navigation use trailing slashes; legacy Home anchors retain meaningful summaries; shared content supplies Features and Home; email actions use the existing address and subjects.

Design read: hospitality software for hotel managers, with warm editorial typography, spacious native CSS and a restrained forest accent. The approved DM Serif Display provides the hospitality voice; DM Sans keeps operational content legible. ENERGY 2 / RHYTHM 3 / MOTION 1. DESIGN_VARIANCE 6 / MOTION_INTENSITY 2 / VISUAL_DENSITY 3. Numbered lists express actual process order. The only elevated surface is the illustrative conversation over the hospitality photo. No decorative gradients, icon library or motion dependency.

Work is isolated on `feat/astro-hospitality` in the user's workspace. No public deployment or backend is included. Browser verification will be recorded in `docs/verification.md`.

## Progress

- Foundation complete: Astro 7.3.5 verified as npm stable, compatible with installed Node 24.19; strict check clean; AVIF/WebP generated locally.
- Website complete: all routes and shared components built; old root HTML removed after production validation.
- Browser test ran before implementation and failed because the required built routes did not exist. Initial production verification passed all 15 page/viewport combinations.
- Review: fresh read-only reviewer found no defects; extra widths 320, 360, 767, 769 and 1024 passed and a missing route served the custom HTTP 404. Deployment remains outside the approved scope.
- Extended verification reproduced overflow at 200% text size. Cause: large words set grid minimum content widths. Native `overflow-wrap: anywhere` lets long words reflow when the available width is insufficient; ordinary font sizes retain their line breaks. The browser suite checks this behavior on all five pages.
- Final extended browser suite PASS: all internal destinations clicked, legacy anchors checked, 200% text resizing green on all five pages, zero console/CSP errors and zero axe AA findings. No deferred review findings.

## Scroll animation follow-up

The requested scroll animation extends the existing hospitality direction to MOTION 2; ENERGY 2 and RHYTHM 3 continue to describe the existing layout. Short reveals guide reading from headings into supporting content, and small sibling delays express the order of feature and setup lists. Motion's `inView` detects entry once through IntersectionObserver; `motion/mini` animates opacity and transform through the browser's Web Animations API. Each reveal moves 18px over 550ms, with 70ms sibling delays capped at 210ms. There are no looping effects.

The shared layout loads `src/scripts/scroll-reveal.js` on every route, including 404. Its selectors cover the existing content layouts and shared FAQ, CTA and footer. Reveal detection waits for the brand intro to finish. Keyboard focus immediately exposes the relevant block, enabling reduced motion cancels active reveals and exposes pending blocks, and JavaScript-disabled pages retain visible content. Completed animations release their inline styles. The production browser checks scroll through every route and verify these behaviors.

## FAQ plus/minus follow-up

The shared native FAQ now animates the vertical icon stroke between 90 and 0 degrees to indicate a closed or open answer, paired with a 260ms answer height/opacity transition. The disclosure stays open during collapse so its content can animate, then releases fixed heights and inline animation styles. Interrupted transitions continue from their current frame. Reduced motion immediately applies the requested disclosure state. Existing typography, palette and MOTION 2 direction continue to apply.

This is an original implementation using the documented free `motion/mini` API. The named Motion UI section's source is gated behind Motion+ and was not retrieved or copied. Native `details`/`summary` semantics and the no-JavaScript plus/minus fallback are retained on Home and How it works.

Opening explicitly starts at zero height when the disclosure is closed. Chromium retains measurable layout for the hidden answer, so its closed `getBoundingClientRect()` cannot supply the expansion's starting height. An already open disclosure still supplies the current height for closing and rapid reversals.

## Page transition follow-up

Page navigation now fades the outgoing document over 240ms and fades the incoming document over 320ms with an 8px upward movement, preserving the restrained MOTION 2 direction. Native cross-document View Transitions fit the existing full-document navigation and Astro CSP; Astro's ClientRouter is incompatible with the project's CSP configuration. This follows the Motion skill's guidance for CSS opacity/transform animation without adding a router or dependency.

The shared layout inlines the navigation opt-in and hashes that style for production CSP. Keeping the opt-in available before the first rendering opportunity avoids a skipped incoming transition with warm cached assets. Animation styles remain in the global stylesheet. During an active page transition, scroll reveal immediately exposes blocks in the first viewport so their separate fades do not leave the incoming page temporarily blank; below-fold blocks retain their reveal behavior. Reduced motion opts out entirely, and unsupported browsers continue normal navigation. Existing document lifecycle handlers, session intro behavior, anchors and browser history remain in use.
