# V26 Motion + Art Direction

Built from the user-provided v18.9 Sticky Summary Scroll base.

## Homepage architecture
- Full-bleed photographic hero with compact proof rail
- Existing HomeBookingFlow preserved
- 3-stage pinned process scene on desktop
- Horizontally translating real-work archive driven by vertical scroll
- Student-built story as typography + embedded photography
- Single oversized review instead of testimonial cards
- Two bold secondary-service panels
- Quiet FAQ and photographic final CTA

## Motion principles
- Native requestAnimationFrame scroll progress, no React state updates per frame
- Motion concentrated in a few large scenes rather than every element
- Sticky/pinned scenes degrade to normal stacked content on mobile
- `prefers-reduced-motion` disables transforms and reveal choreography
- Existing navigation, booking, quote, and backend behavior are preserved

## Design intent
The reference is the cohesion and choreography of SweetTape, not its exact visual language. Every Detail uses its own physical material: cars, mobile rigs, crew, before/after process, driveway work, and real photography.
