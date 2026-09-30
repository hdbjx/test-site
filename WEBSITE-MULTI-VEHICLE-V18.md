# Website multi-vehicle booking v18

## What changed
- Live booking supports one or two vehicles in one appointment.
- Each vehicle can have its own service and price.
- Signed-in customers can select different saved vehicles without duplicating the same garage vehicle.
- Guest customers can choose a size for each vehicle.
- For a second vehicle, availability adds one technician to the normal crew requirement and reserves one rig by default. Davis can add a second rig or adjust staffing later in the manager app. The longest selected service determines the appointment duration.
- The booking is written atomically to `jobs`, `job_vehicles`, and `job_rigs`.
- Booking confirmation email is now required for guest bookings and the API awaits the Resend send before returning.
- Confirmation emails list every vehicle/service line and the total.
- A valid booking is never rolled back just because email delivery fails. The response records whether the customer confirmation was actually accepted by Resend.
- Website contact matching no longer overwrites an existing trusted email merely because a public form matched the phone number.

## Required Supabase migration
Run `supabase/migrations/20260930_website_multi_vehicle_booking.sql` once in Supabase SQL Editor before deploying this website version.

It expects `public.job_vehicles` and `public.job_rigs` to already exist from the app migrations.
