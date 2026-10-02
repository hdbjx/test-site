# Booking phone + spacing polish — v1.4.6

- Keeps the original vehicle/service and time-selection flow intact.
- Keeps only the client-info area as the three mini-steps: Name, Phone & email, Address.
- Uses `autocomplete="tel-national"` for the booking phone field.
- Strips punctuation and a leading US country code (`+1` / `1`) immediately when phone autofill or typing occurs.
- Caps the visible/submitted booking phone value at 10 national digits.
- Normalizes the phone again before submission and in `/api/book` as a backend safeguard.
- Removes the diagonal arrow glyphs from the two client-info Continue buttons.
- Constrains the client-info progress bar and panels to a cleaner 46rem maximum width on larger screens while remaining full width on mobile.
