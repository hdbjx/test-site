# Booking address autocomplete v1.3.1

- Replaced the single booking address field with Street address, Apt/Suite/Unit, City, State, and ZIP.
- Added Google Places Autocomplete (New) suggestions using the existing server-side `GOOGLE_PLACES_API_KEY`.
- Selecting a suggestion fills the structured address fields automatically.
- Manual address entry remains available if a customer does not select a suggestion.
- The existing backend, CRM, confirmation email, account, and booking records still receive one normalized `address` string, preserving downstream compatibility.
- Added complete-address validation to live bookings and the fallback booking request form.
- Autocomplete is biased toward the Atlanta/Decatur service region but can return U.S. addresses outside that bias.
- The Google Places API key remains server-side and is never sent to the browser.
