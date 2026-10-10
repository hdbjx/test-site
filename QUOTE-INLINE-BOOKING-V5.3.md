# Quote Inline Booking V5.3

- Quote customers see the next three real openings immediately after contact capture.
- Timing preference shapes suggested slots.
- Selecting a slot asks only for remaining booking information, primarily service address and attribution.
- Booking is completed directly from the quote flow through the existing /api/book endpoint.
- Full calendar remains available as a fallback.
- Quote-origin visits to /book hide repeated vehicle setup, restore saved contact data, open at the address step, and automatically scroll to the live time picker.
- Existing quote-session behavioral events remain intact: availability_viewed, slot_selected, booking_started, booking_completed.
