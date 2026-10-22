# V28 Interaction System

V28 extends the v18.9-based V27 homepage with a contextual motion layer inspired by the interaction principles observed on SweetTape without copying its tape-specific visuals.

## Motion grammar

- Scroll controls large composition changes and scene progress.
- Pointer movement controls local depth and physical response.
- Contextual cursor labels reinforce intent on high-value interactive objects.
- Touch devices receive direct, static layouts rather than simulated cursor physics.
- `prefers-reduced-motion` removes non-essential transforms and the custom cursor.

## Implemented interactions

- Hero photography and independently composed headline lines move at different pointer depths while scroll controls the overall hero progression.
- Primary booking CTAs use restrained magnetic pull.
- Service rows react to pointer position with local type displacement and a radial red response field.
- Work photography combines scroll-driven horizontal travel with local 3D tilt and internal image parallax.
- Story photography behaves like physical inserts inside the headline.
- Review/proof composition uses separate scroll and pointer rates.
- Paint care and Detail+ panels use subtle perspective tilt and internal image depth.
- The closing photographic scene drifts slowly with scroll.
- Desktop navigation receives small physical responses instead of decorative animation.
- Contextual cursor switches among VIEW, OPEN, and BOOK.

## Design constraint

No animation should exist solely because animation is available. Large movement is reserved for scene progression. Cursor response is kept local and low-amplitude so the page remains readable and controlled.
