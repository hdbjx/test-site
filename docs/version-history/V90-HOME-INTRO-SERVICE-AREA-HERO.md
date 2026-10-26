# V90 — Homepage intro + service-area hero reset

## Homepage
- Added a fast word-by-word hero title build.
- Words rise from below with varied deterministic x/y offsets and slight rotations, then settle quickly.
- Preserves the existing personalized vehicle headline behavior.
- Reduced-motion users see the finished title immediately.

## Service-area city pages
- Rebuilt the shared `/service-areas/[slug]` hero used by all 10 city pages.
- Removed the oversized full-bleed headline-over-photo composition.
- New editorial split layout: compact location headline + intro/actions on the left, real-job rig photo on the right.
- Keeps the existing proof strip, pricing, local notes, reviews, booking links, SEO, and city-specific content.
- Mobile stacks cleanly and keeps the CTA hierarchy intact.

## Validation
- Vehicle QA: 1,427 unique entries passed.
- Site-context QA passed.
- SEO QA passed.
- Changed TSX files transpile cleanly.
- CSS braces balanced.
