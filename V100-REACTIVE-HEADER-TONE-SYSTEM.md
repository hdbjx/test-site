# V100 Reactive Header Tone System

## Goal
Keep the shared Every Detail header legible over every visual surface without using unstable pixel/luminance detection.

## Tone states
- `ink`: near-black logo/chrome for cream, white, sand and pale surfaces.
- `light`: warm-white logo/chrome for black, oxblood and dark photography.
- `brand`: Every Detail red for selected light surfaces where a branded moment is intentional.

## Architecture
Every page-level visual band declares `data-header-tone="ink|light|brand"`. The shared `Header` samples the declared surface crossing a narrow line underneath the fixed header. The header changes as one unit: logo, menu control and vehicle/context control.

The logo is a single alpha mask sourced from `/brand/every-detail-logo.png`, recolored with CSS. There are no separate black/white/red image files.

The controller also supports:
- `data-header-tone-mobile`
- `data-header-tone-after`
- `data-header-tone-after-mobile`
- `data-header-tone-split`

The split option is used where one visual section intentionally changes background within its own height, such as Gift Cards.

## Art direction
### Homepage
- Hero: brand
- Curved tape: brand
- Service choice: ink
- Work: light
- Student story: light
- Reviews: light
- Paint / Detail+ editorial area: ink, with photo cards overriding to light when they cross the header
- Clean-car interlude: brand
- Final photography: light

### Site routes
All major sections on About, Account, Blog, Ceramic, Detail+, Gift Cards, Info Form, Mobile Detailing, Services, Our Work, Paint Correction, Blog Posts, Service Areas, Legal pages and 404 declare a tone.

Shared PageHeader, CTA band and Footer also declare tones, so there are no transition gaps between routes and shared components.

## Interaction rules
- 220ms restrained color transition
- no bounce, glow or crossfade
- menu open forces the logo to warm white because the menu panel is dark
- primary content remains art-directed, not automatically classified by pixel brightness
- prefers-reduced-motion removes tone transition animation

## QA
- All 22 page routes have zero untagged `section`, `header`, or `main` elements in the page source.
- All 136 TypeScript/TSX files passed syntax transpilation.
- Vehicle catalog QA passed: 1,427 unique entries.
- Site context QA passed.
- SEO QA passed.
- Link QA passed: 132 static internal links.

A full dependency-aware `tsc --noEmit` cannot run in the extracted workspace because `node_modules` is not included in the source ZIP. The TypeScript compiler therefore reports missing React/Next/Supabase modules rather than project-code errors.
