import { NextResponse } from "next/server";
import { isServiceId, isVehicleId, PRICING, services } from "@/data/services";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const isoDate = (s: string | null) => (s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null);

/** GET /api/availability?service=premium&vehicle=sedan&from=2026-10-01&to=2026-10-31 → { slots: ISO strings } */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const service = q.get("service");
  const vehicle = q.get("vehicle");
  const from = isoDate(q.get("from"));
  const to = isoDate(q.get("to"));
  if (!isServiceId(service) || !isVehicleId(vehicle) || !from || !to) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const days = (Date.parse(to) - Date.parse(from)) / 86_400_000;
  if (days < 0 || days > 35) return NextResponse.json({ error: "Range too large" }, { status: 400 });

  try {
    const { data, error } = await supabaseAdmin().rpc("get_open_slots", {
      p_from: from,
      p_to: to,
      p_minutes: PRICING[vehicle][service].minutes,
      p_crew: services[service].crew,
    });
    if (error) throw error;
    const slots = ((data as { slot_start: string }[]) ?? []).map((r) => new Date(r.slot_start).toISOString());
    return NextResponse.json({ slots }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[availability]", err);
    return NextResponse.json({ error: "Availability is unavailable right now." }, { status: 503 });
  }
}
