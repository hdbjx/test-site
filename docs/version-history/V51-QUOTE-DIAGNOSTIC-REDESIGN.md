# V51 Quote Diagnostic Redesign

Built on V50.

## What changed
- Replaced the generic inner-page header on `/get-a-quote` with a compact quote-funnel header.
- Added a stronger quote intro focused on three quick questions, instant vehicle-specific pricing, and no payment.
- Rebuilt the assessment into a focused diagnostic flow.
- Completed Vehicle and Condition steps collapse into editable summary rows.
- Added a sticky desktop "What we know" panel that updates as the assessment progresses.
- Preserved the existing make/model catalog search while restyling it to match the booking product UI.
- Condition choices now include their explanatory copy directly in each option.
- Issues remain optional and use cleaner selectable cards.
- Recommendation is revealed before timing/contact capture.
- Restyled recommendation, timing, contact, inline availability, and saved quote surfaces to match V50 booking.
- Shared site header is suppressed on the quote funnel just like `/book`; the main footer remains.

## Preserved logic
- Existing recommendation engine
- Exact vehicle pricing
- Recommended add-ons
- Paint upgrade logic
- Quote session behavioral tracking
- Lead submission
- Saved quote contact handoff
- Inline live booking continuation
- Full-calendar booking handoff

## Validation
- Modified TSX files passed TypeScript syntax transpilation.
- CSS brace count is balanced.
