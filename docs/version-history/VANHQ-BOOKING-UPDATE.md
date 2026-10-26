# Van HQ direct booking endpoint

Adds `POST /api/vanhq/book`.

The endpoint requires the active Van HQ Supabase bearer token, verifies the device in `van_hq_devices`, verifies the source job belongs to that device's rig, and then calls the existing atomic `book_multi_vehicle_job` RPC. It sends the same booking confirmation email as the public website.

Detail+ requests are server-enforced to 75 minutes and 2 technicians. Standard Maintenance, Premium Detail and Factory Reset durations/crew come from the website's service catalog.
