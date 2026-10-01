# Quote booking carryover v1.2.4

Selected quote customizations now carry into the booking flow instead of being dropped when the customer clicks the booking CTA.

- Quote CTA passes selected add-ons and paint service selections to `/book`.
- Booking page shows a "From your saved quote" section with the selected services/add-ons.
- Fixed-price add-ons and vehicle-specific paint pricing are included in the displayed booking total and stored job price.
- Floor Carpet Extraction is $90, Seat Extraction is $60, and Odor Removal is $60. These prices carry into the booking total.
- Selected extras are written into operational booking notes so Team HQ / Van HQ staff can see what the customer selected.
- Paint correction/coating selections are explicitly flagged for separate production scheduling confirmation because the current availability engine only schedules the detailing appointment duration.
- Existing quote lead capture remains mandatory before the booking CTA appears.
