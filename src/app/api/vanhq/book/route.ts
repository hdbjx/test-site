import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PRICING, services, isVehicleId, isServiceId, vehicleLabel, type VehicleId } from "@/data/services";
import { sendBookingEmails } from "@/lib/email";

export const dynamic = "force-dynamic";

const cors = {
  "Cache-Control": "no-store",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
const json = (body: unknown, init: ResponseInit = {}) =>
  NextResponse.json(body, { ...init, headers: { ...cors, ...(init.headers ?? {}) } });
const str = (v: unknown, max = 1000) => typeof v === "string" ? v.trim().slice(0,max) : "";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors });
}

/**
 * Authenticated Van HQ booking endpoint. The browser never receives a service
 * role key. A Van HQ device JWT is verified here, its source job is checked
 * against the device's rig, and book_multi_vehicle_job performs the final
 * advisory-lock + live-capacity check atomically.
 */
export async function POST(req: Request) {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return json({ ok:false, error:"Van HQ authorization required." }, { status:401 });

  const admin = supabaseAdmin();
  const auth = await admin.auth.getUser(token);
  const userId = auth.data.user?.id;
  if (auth.error || !userId) return json({ ok:false, error:"Van HQ session expired." }, { status:401 });

  const device = await admin.from("van_hq_devices").select("rig_id,active").eq("user_id", userId).eq("active", true).maybeSingle();
  if (device.error || !device.data?.rig_id) return json({ ok:false, error:"This account is not an active Van HQ device." }, { status:403 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ ok:false, error:"Invalid booking request." }, { status:400 }); }

  const sourceJobId = str(body.sourceJobId, 80);
  const start = str(body.start, 80);
  const vehicleId = str(body.vehicleId, 80) || null;
  const vehicle = str(body.vehicle, 40);
  const notes = str(body.notes, 2000);
  const mode = str(body.mode, 30);
  const requestedPrice = Number(body.price);
  if (!sourceJobId || !start || Number.isNaN(Date.parse(start))) return json({ ok:false, error:"Pick an available appointment first." }, { status:422 });

  const source = await admin.from("jobs")
    .select("id,rig_id,client_id,customer_name,phone,email,address")
    .eq("id", sourceJobId).maybeSingle();
  if (source.error || !source.data || String(source.data.rig_id) !== String(device.data.rig_id)) {
    return json({ ok:false, error:"That source job is not assigned to this Van HQ." }, { status:403 });
  }
  if (!source.data.client_id) return json({ ok:false, error:"This client is not linked in Supabase yet." }, { status:422 });
  if (!source.data.address) return json({ ok:false, error:"The current job needs an address before rebooking." }, { status:422 });

  if (vehicleId) {
    const owned = await admin.from("vehicles").select("id").eq("id", vehicleId).eq("client_id", source.data.client_id).maybeSingle();
    if (owned.error || !owned.data) return json({ ok:false, error:"That vehicle is not linked to this client." }, { status:422 });
  }

  let serviceName = "";
  let minutes = 0;
  let crew = 0;
  let linePrice = Number.isFinite(requestedPrice) && requestedPrice >= 0 ? requestedPrice : 0;

  if (mode === "detailplus") {
    if (!isVehicleId(vehicle)) return json({ ok:false, error:"Choose the Detail+ vehicle size." }, { status:422 });
    serviceName = str(body.serviceName, 160) || "Detail+ Visit";
    minutes = 75;
    crew = 2;
  } else {
    const service = str(body.service, 40);
    if (!isVehicleId(vehicle) || !isServiceId(service)) return json({ ok:false, error:"Choose a supported vehicle and service." }, { status:422 });
    const p = PRICING[vehicle][service];
    serviceName = services[service].name;
    minutes = p.minutes;
    crew = services[service].crew;
    if (!Number.isFinite(requestedPrice) || requestedPrice < 0) linePrice = p.price;
  }

  const label = str(body.vehicleLabel, 180) || vehicleLabel(vehicle as VehicleId);
  const email = str(body.email, 200) || source.data.email || "";
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return json({ ok:false, error:"Add a valid email so the client gets confirmation.", field:"email" }, { status:422 });

  const lines = [{
    vehicle_id: vehicleId,
    vehicle_label: label,
    vehicle_size: vehicleLabel(vehicle as VehicleId),
    service_name: serviceName,
    price: linePrice,
    minutes,
    crew,
  }];

  const booked = await admin.rpc("book_multi_vehicle_job", {
    p_client_id: source.data.client_id,
    p_customer_name: source.data.customer_name || "Client",
    p_phone: source.data.phone || "",
    p_email: email,
    p_address: source.data.address,
    p_start: new Date(start).toISOString(),
    p_lines: lines,
    p_notes: notes || null,
    p_source: "van_hq",
  });

  if (booked.error) {
    if (booked.error.message.includes("slot_unavailable")) return json({ ok:false, error:"That time was just taken. Pick another.", code:"slot_taken" }, { status:409 });
    console.error("[vanhq/book]", booked.error);
    return json({ ok:false, error:"We couldn't create that appointment." }, { status:500 });
  }

  const crmMatch = await admin.rpc("crm_mark_booked_by_identity", {
    p_phone: source.data.phone || "",
    p_email: email,
    p_actor: "Van HQ rebooking",
  });
  if (crmMatch.error) console.error("[vanhq/book] CRM match", crmMatch.error);

  const emailResult = await sendBookingEmails({
    name: source.data.customer_name || "Client",
    email,
    phone: source.data.phone || "",
    address: source.data.address,
    service: serviceName,
    vehicle: label,
    start: new Date(start).toISOString(),
    price: linePrice,
    notes,
    lines: [{ vehicle: label, service: serviceName, price: linePrice }],
  }).catch((error) => {
    console.error("[vanhq/book] email", error);
    return { customerSent:false, internalSent:false };
  });

  return json({
    ok:true,
    jobId:booked.data,
    start:new Date(start).toISOString(),
    service:serviceName,
    vehicle:label,
    price:linePrice,
    minutes,
    confirmationEmailSent:emailResult.customerSent,
  });
}
