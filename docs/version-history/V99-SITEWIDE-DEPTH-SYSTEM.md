# V99 — Sitewide Depth System

V99 adds a controlled depth language across the Every Detail website instead of applying a one-off shadow effect to a single page.

## Design rule

- Flat: editorial content, large copy, reviews, technical paint/service information.
- Soft surface: interactive cards, booking choices, forms, account utility surfaces, drawers.
- Physical object: Detail+ cards, gift cards, draggable prints and photo objects.
- Hard offset: primary actions and selected states.

## Sitewide tokens

V99 adds reusable `--ed-depth-*` shadow tokens in `src/app/globals.css` and connects the existing `--site-shadow` token to the same system.

## Applied areas

- Homepage open service configurator and draggable student photo collage.
- Booking package cards, vehicle/add-on surfaces, school note and full calendar.
- Quote condition/concern choices, intent choices and final recommendation/result surfaces.
- Services core cards, with a stronger featured-state treatment.
- Detail+ club/member cards, cadence tickets, benefit/compare/how cards and physical photos.
- Gift-card object, gift purchase console, benefit points and how-it-works cards.
- Account booking panels, credit/settings surfaces and primary booking action.
- Paint/correction/ceramic forms only, while keeping editorial sections flat.
- Global vehicle picker, first-visit welcome and journey drawer.

## Deliberately left flat

- Homepage hero and major editorial text sections.
- Reviews.
- Service information rows and comparison text where cards are not actionable.
- Paint defect/explanation sections.
- Header/navigation beyond its existing glass treatment.
- Large content sections that would become overly neumorphic with elevation.

## Responsive behavior

Mobile uses the same hierarchy with reduced blur and spread so surfaces feel grounded instead of floaty.

