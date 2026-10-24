# V101 - Opening card + day-of account handoff

## Opening experience

The first-visit vehicle prompt is now an art-directed two-beat composition rather than a conventional setup modal.

- Desktop opens as a full oxblood Every Detail poster, holds for a beat, then compresses into a left art panel while the vehicle controls reveal on the right.
- Mobile uses the same composition as a top poster that compresses upward into the vehicle/account utility state.
- The poster uses the same cream, oxblood, typography, micro-labels, texture and controlled depth language as the current homepage.
- The vehicle search, remember control, account entry, and browse action remain functional and accessible.
- The existing change-vehicle modal is intentionally left unchanged.
- Reduced-motion users get the final composed state immediately.

## Day-of email

The same-day crew confirmation now includes a dedicated account module:

- Explains that the customer can sign in or create an account using the same email address used for the booking.
- Prints the booking email address directly in the message so the account matching requirement is clear.
- Links to `/account/sign-in?next=/account`.
- Explains that the account shows appointment details, assigned crew and live status changes through final inspection.
- The live account portal already refreshes job progress and crew/status information, so this is a real product handoff rather than marketing copy.

## QA

- 136 TS/TSX files syntax-transpiled with 0 errors.
- Vehicle catalog QA passed.
- Site-context QA passed.
- SEO QA passed.
- Internal link QA passed: 132 links across 22 routes.
- Day-of email HTML was rendered through the actual V101 email function and refreshed at `EMAIL-PREVIEWS/05-day-of.html`.
