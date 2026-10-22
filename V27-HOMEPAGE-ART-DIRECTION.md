# V27 Homepage Art Direction

Base: Every Detail v18.9 Sticky Summary Scroll.

This release rebuilds only the homepage presentation while preserving the existing booking flow, routes, pricing data, forms, and customer logic.

## Design system
- One dominant idea per viewport instead of repeated landing-page sections.
- Display typography uses the existing Bebas Neue brand font as a graphic element.
- Cream, black, and Every Detail red form the core palette.
- Photography is treated as composition, not card content.
- A red horizontal sweep is the recurring motion motif.
- Proof is moved out of the hero and given its own storytelling moment.
- Motion is scroll-linked through requestAnimationFrame and CSS custom properties, with reduced-motion fallbacks.

## Homepage sequence
1. Promise: full-bleed hero with one CTA.
2. Choice: existing HomeBookingFlow restyled as a typographic service selector.
3. Work: desktop sticky horizontal photo sequence, stacked mobile fallback.
4. Story: “Built by students. Run like a company.” with embedded photography.
5. Proof: live review count, one large real review, operational facts.
6. Beyond: paint care and Detail+ as two contrasting visual experiences.
7. Close: full-screen photographic booking close.

## Deliberately removed from the homepage
- Seasonal decorative overlays
- Hero proof rail
- Secondary hero CTA
- Repetitive how-it-works cards
- Generic testimonial grids
- Gift-card interruption in the core homepage narrative
- Repeated eyebrow/headline/paragraph/card section pattern
