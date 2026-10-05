# Asset sources

## Hospitality photograph

- Local file: `src/assets/hotel-room.jpg`
- Source: [Pexels photo 164595](https://www.pexels.com/photo/164595/)
- Download: `https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=1800`
- License: [Pexels License](https://www.pexels.com/license/), checked 5 October 2026. Website and commercial use, modification and local storage are permitted; attribution is optional. The photo is contextual hospitality imagery and implies no customer relationship or endorsement.
- Downloaded as a 1800-pixel JPEG. Astro `Picture` produces local AVIF and WebP files with responsive widths. Original kept for rebuilds.

## Fonts

- DM Sans: `@fontsource/dm-sans`, Latin 400, 500 and 600.
- DM Serif Display: `@fontsource/dm-serif-display`, Latin 400.
- Both are distributed under the SIL Open Font License 1.1. Fontsource packages contain their license files; imports emit local WOFF/WOFF2 assets into the static build. No Google Fonts runtime request.
- Original sources: [DM Sans](https://github.com/google/fonts/tree/main/ofl/dmsans), [DM Serif Display](https://github.com/google/fonts/tree/main/ofl/dmserifdisplay).

## Site identity

The existing text name `iloop.id` is retained. The favicon and Open Graph artwork use its initial and the approved palette. Editable social artwork lives in `src/assets/og-image.svg`; `public/og-image.jpg` is its 1200 × 630 raster export.
