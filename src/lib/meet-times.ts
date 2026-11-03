import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Meet at van = appointment − (drive from the shop + 20 minutes).
 * The drive comes from Google Routes with traffic for that time of day, so the
 * crew leaves when they need to and no earlier. The database does the math
 * (ed_set_auto_meet) and never touches a meet time someone set by hand.
 */

/** The shop (223 Coventry Rd, Decatur). Same point the service-area checker uses. */
const SHOP = { latitude: 33.77867, longitude: -84.30732 };

const key = () => process.env.GOOGLE_PLACES_API_KEY?.trim() || "";

/** One-way drive in minutes from the shop to an address, leaving at `departAt`. */
export async function driveMinutesTo(address: string, departAt: Date): Promise<number | null> {
  if (!key() || !address.trim()) return null;
  const future = departAt.getTime() > Date.now() + 60_000;
  const res = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key(), "X-Goog-FieldMask": "routes.duration" },
    body: JSON.stringify({
      origin: { location: { latLng: SHOP } },
      destination: { address },
      travelMode: "DRIVE",
      // Traffic for the time they'd actually leave; Google needs a future time for that.
      routingPreference: future ? "TRAFFIC_AWARE" : "TRAFFIC_UNAWARE",
      ...(future ? { departureTime: departAt.toISOString() } : {}),
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) {
    console.error("[meet-times] routes failed", res.status, await res.text());
    return null;
  }
  const data = (await res.json()) as { routes?: { duration?: string }[] };
  const seconds = Number.parseFloat(data.routes?.[0]?.duration ?? "");
  return Number.isFinite(seconds) ? Math.max(1, Math.ceil(seconds / 60)) : null;
}

type JobRow = { id: string; address: string | null; scheduled_start: string };

/**
 * Looks up the drive for upcoming jobs that still need one (or one job when
 * `jobIds` is given) and saves the meet time. Returns how many were updated.
 */
export async function refreshMeetTimes(jobIds?: string[], limit = 40): Promise<number> {
  const db = supabaseAdmin();
  let query = db
    .from("jobs")
    .select("id, address, scheduled_start, drive_minutes, drive_from_address")
    .eq("meet_at_auto", true)
    .not("address", "is", null)
    .gt("scheduled_start", new Date().toISOString())
    .not("status", "in", "(complete,cancelled)")
    .order("scheduled_start", { ascending: true })
    .limit(limit);
  if (jobIds?.length) query = query.in("id", jobIds);
  else query = query.lte("scheduled_start", new Date(Date.now() + 21 * 864e5).toISOString());

  const { data, error } = await query;
  if (error) throw error;

  const due = ((data ?? []) as (JobRow & { drive_minutes: number | null; drive_from_address: string | null })[])
    .filter((job) => job.drive_minutes == null || job.drive_from_address !== job.address);

  let updated = 0;
  for (const job of due) {
    const address = String(job.address ?? "").trim();
    // Rough leave time for the traffic lookup: ~45 minutes before the appointment.
    const departAt = new Date(new Date(job.scheduled_start).getTime() - 45 * 60_000);
    const minutes = await driveMinutesTo(address, departAt).catch((e) => {
      console.error("[meet-times] drive lookup", job.id, e);
      return null;
    });
    if (minutes == null) continue;
    const saved = await db.rpc("ed_set_auto_meet", { p_job_id: job.id, p_drive_minutes: minutes, p_address: address });
    if (saved.error) console.error("[meet-times] save", job.id, saved.error);
    else updated += 1;
  }
  return updated;
}
