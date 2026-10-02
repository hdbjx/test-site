# Booking Address Autocomplete v1.3.2

- Keeps structured service-address fields and Google Places autocomplete.
- Moves Places session-token generation out of the initial React render and into browser-only interaction.
- Prevents the booking page from depending on browser/random APIs during server rendering.
- Preserves the normalized `address` field used by existing booking, CRM, Supabase, and email flows.
