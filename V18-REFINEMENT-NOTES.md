# Every Detail Website v18 Refinement

This pass keeps the v17.3 functionality intact and focuses on making the customer-facing site feel like one coherent product.

## Site-wide
- Standardized the primary conversion language around **Find My Detail** and **Book Now**.
- Added **Our Work** to primary navigation and the sitemap.
- Reframed the student-run availability banner around scheduling, mobility, and included power/water rather than phone limitations.
- Corrected the legal business name used in site data.
- Removed duplicate page-level `<main>` landmarks because the root layout already owns the main landmark.
- Fixed duplicated quote metadata copy.
- Added a v18 refinement layer for shared spacing, proof modules, plan clarity, and booking progress.

## Homepage
- Tightened hero copy around the fully equipped mobile value proposition.
- Reduced the work gallery from five images to a more editorial three-image proof set.
- Changed the gallery CTA from primarily social-following to a direct path into case studies.
- Added a real-team trust section.
- Reduced How It Works from four steps to three.
- Updated quote CTAs to Find My Detail.

## Services
- Added a fast decision layer before the educational content:
  - Already pretty clean → Maintenance
  - Needs a real detail → Premium
  - Heavy buildup/neglect → Factory Reset
- Added direct Find My Detail and exact-pricing actions.

## Detail+
- Added an early offer-clarity strip showing frequency, coverage, flat-rate structure, and no-contract positioning before the longer story section.

## Booking
- Added a persistent visual four-stage rail: Vehicle → Detail → Time → Your info.
- Changed the mobile sticky bar to Find My Detail + Book Now instead of Text + Book.

## Our Work
- Added `/our-work` as a full editorial proof/case-study page using real site photography.
- Includes Premium, interior, exterior, mobile setup, crew trust, and direct conversion sections.

## Validation note
A production build could not be completed in the execution container because the dependency install repeatedly exceeded the container transport timeout. The source changes themselves were checked for route references, duplicate main landmarks, CTA consistency, and sitemap inclusion. Run `npm ci && npm run build` in the normal project environment before deployment.
