# Booking 3-Step + Autofill Fix — v1.4.4

- Live booking is now a true three-step flow: Detail → Time → Your info.
- Client name, phone and email come before the service address.
- Notes are intentionally placed before the address and marked autocomplete off so iOS does not treat the notes box as an address continuation.
- Street address uses the more specific `address-line1` autocomplete token instead of `street-address`.
- The structured address still combines into the same canonical `address` value expected by the existing booking backend.
- Fallback booking now collects client details before the service address as well.
- Existing booking creation, pricing, availability, add-ons, confirmation validation, social metadata and mobile homepage polish are preserved.
