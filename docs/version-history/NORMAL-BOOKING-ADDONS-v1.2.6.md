# Normal booking add-ons v1.2.6

- Add-ons are now selectable directly in the standard `/book` flow, not only when arriving from the quote builder.
- Add-ons are tracked per vehicle for one- and two-vehicle appointments.
- Quote-builder add-ons remain preselected when the customer continues into booking and can be changed before booking.
- Selected add-ons update the appointment total and are submitted through the existing booking API, operational notes, confirmation email data, and job pricing.
- Floor Carpet Extraction is $90, Seat Extraction is $60, and Odor Removal is $60.
- Package-included work cannot be double charged: Premium hides Protective Sealant; Factory Reset hides its included extraction, odor treatment, pet hair removal, clay, sealant, and plastic restoration items.
- The booking API also strips package-included add-ons server-side so a manually modified request cannot create a duplicate charge.
- Paint services carried from a saved quote remain supported and keep their existing separate-production scheduling notice.

Scheduling note: add-on labor duration is not added to live availability because authoritative add-on duration values are not defined in the current source. No duration values were invented in this release.
