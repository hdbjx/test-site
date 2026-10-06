# Van HQ website integration v11.5

Merged onto the electric + Detail+ website build.

- `/api/availability` exposes the existing live Supabase availability feed cross-origin for Van HQ and adds the Detail+ preset (75 minutes, 2 crew, 1 rig).
- `/api/vanhq/book` verifies the Van HQ Supabase JWT/device + source-job rig, then calls `book_multi_vehicle_job` for an atomic capacity re-check and confirmed rebooking.
- The newer public website booking/add-on/paint/electric/Detail+ implementation is preserved unchanged.
