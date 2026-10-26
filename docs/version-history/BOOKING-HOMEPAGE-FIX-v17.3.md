# V17.3 Booking + Homepage conversion fixes

- Desktop booking appointment summary now sticks below the actual global header instead of disappearing behind it while the form scrolls.
- Added an explicit final booking action at the bottom of the left booking flow, so finishing the address/details step always leaves a visible Book it action without requiring the customer to scroll back up.
- Bottom action mirrors selected date/time and total and uses the same submit validation as the appointment summary.
- Homepage vehicle selection now waits for the animated result panel to finish expanding before calculating the required scroll. This fixes the short auto-scroll that could leave the price and Choose a time CTA below the viewport.
- Auto-scroll respects manual scrolling while the result is opening.
