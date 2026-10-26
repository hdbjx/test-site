# v1.4.5 Booking client-info steps

- Restores the normal booking flow: vehicle/detail selections and time remain visible in their original positions.
- Only the `3. Your details` section is progressive.
- Client info has three mini-steps: Full name -> Phone & email -> Service address.
- Service address remains structured for iOS/browser autofill: street, unit, city, state, ZIP.
- Extra notes live after the address and use a neutral `service_notes` field with autofill disabled/ignored to prevent Safari from treating it as a second street-address field.
- Final booking button is enabled once the client reaches the address step; server validation remains authoritative for required fields.
- If the API reports a client field error, the UI returns to the relevant client-info step.
