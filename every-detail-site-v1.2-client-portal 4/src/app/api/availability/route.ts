import { NextResponse } from "next/server";
import { isServiceId, isVehicleId, PRICING, services, type ServiceId, type VehicleId } from "@/data/services";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const isoDate = (s: string | null) => (s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null);

type AvailabilityItem = { vehicle: VehicleId; service: ServiceId };

function parseItems(q: URLSearchParams): AvailabilityItem[] | null {
  const rawItems = q.get("items");
  if (rawItems) {
    try {
      const parsed = JSON.parse(rawItems) as unknown;
      if (!Array.isArray(parsed) || parsed.length < 1 || parsed.length > 2) return null;
      const items = parsed.map((item) => {
        if (!item || typeof item !== "object") return null;
        const vehicle = (item as { vehicle?: unknown }).vehicle;
        const service = (item as { service?: unknown }).service;
        if (!isVehicleId(vehicle) || !isServiceId(service)) return null;
        return { vehicle, service };
      });
      return items.every(Boolean) ? (items as AvailabilityItem[]) : null;
    } catch {
      return null;
    }
  }

  // Backward compatibility for old single-vehicle links/components.
  const vehicle = q.get("vehicle");
  const service = q.get("service");
  return isVehicleId(vehicle) && isServiceId(service) ? [{ vehicle, service }] : null;
}

/**
 * GET /api/availability?items=[{"vehicle":"sedan","service":"premium"}]&from=...&to=...
 *
 * Multi-vehicle appointments use the normal crew requirement plus one additional
 * technician for the second vehicle, while reserving one rig by default. Davis
 * can add a second rig or adjust staffing later in the manager app. The longest
 * selected service determines the appointment length.
 */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const items = parseItems(q);
  const from = isoDate(q.get("from"));
  const to = isoDate(q.get("to"));

  if (!items || !from || !to) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const days = (Date.parse(to) - Date.parse(from)) / 86_400_000;
  if (days < 0 || days > 35) {
    return NextResponse.json({ error: "Range too large" }, { status: 400 });
  }

  const minutes = Math.max(...items.map(({ vehicle, service }) => PRICING[vehicle][service].minutes));
  const baseCrew = Math.max(...items.map(({ service }) => services[service].crew));
  const crew = baseCrew + Math.max(0, items.length - 1);
  const rigs = 1;

  try {
    const { data, error } = await supabaseAdmin().rpc("get_open_slots_multi", {
      p_from: from,
      p_to: to,
      p_minutes: minutes,
      p_crew: crew,
      p_rigs: rigs,
    });
    if (error) throw error;
    const slots = ((data as { slot_start: string }[]) ?? []).map((r) => new Date(r.slot_start).toISOString());
    return NextResponse.json(
      { slots, minutes, crew, rigs },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[availability]", err);
    return NextResponse.json({ error: "Availability is unavailable right now." }, { status: 503 });
  }
}
