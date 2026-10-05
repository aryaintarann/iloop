# Astro hospitality migration

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
