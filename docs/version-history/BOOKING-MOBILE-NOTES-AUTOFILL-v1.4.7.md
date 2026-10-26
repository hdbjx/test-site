# v1.4.7 Mobile notes AutoFill fix

- Replaced the booking notes textarea with an AutoFill-safe free-form editor.
- The visible notes editor is no longer an input or textarea, so iOS Safari cannot treat it as a second street-address field.
- A hidden input preserves the existing `service_notes` / `notes` FormData contract, so backend behavior is unchanged.
- Applied to both LiveBooking and the fallback BookingForm.
- Address AutoFill remains enabled on the actual structured address fields.
