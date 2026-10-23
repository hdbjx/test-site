import { NextResponse } from "next/server";
import { ADDON_LABELS, ADDON_PRICES, isAddonId, isAddonIncludedInService, purchasableAddonIds } from "@/data/quoteExtras";
import { isServiceId, services, type ServiceId } from "@/data/services";
import { getSession } from "@/lib/supabase/account";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const str = (value: unknown, max = 200) => typeof value === "string" ? value.trim().slice(0, max) : "";
const digits = (value: string) => {
  let out = value.replace(/\D/g, "");
  if (out.length === 11 && out.startsWith("1")) out = out.slice(1);
  return out.slice(-10);
};
const addonKey = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

function serviceIdFromName(name: string): ServiceId | null {
  const hit = Object.entries(services).find(([, service]) => service.name === name)?.[0] ?? "";
  return isServiceId(hit) ? hit : null;
}

/** Add one optional extra immediately after a confirmed website booking. */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const jobId = str(body.jobId, 80);
  const addon = body.addon;
  const email = str(body.email).toLowerCase();
  const phone = digits(str(body.phone, 40));

  if (!/^[0-9a-f-]{36}$/i.test(jobId) || !isAddonId(addon)) {
    return NextResponse.json({ ok: false, error: "That add-on could not be attached to this appointment." }, { status: 422 });
  }

  const price = ADDON_PRICES[addon];
  if (price === null || !Number.isFinite(price)) {
    return NextResponse.json({ ok: false, error: "That add-on needs to be confirmed with the crew." }, { status: 422 });
  }

  const admin = supabaseAdmin();
  const { data: job, error: jobError } = await admin
    .from("jobs")
    .select("id, client_id, email, phone, status, price")
    .eq("id", jobId)
    .maybeSingle();

  if (jobError || !job) {
    return NextResponse.json({ ok: false, error: "We couldn't find that appointment." }, { status: 404 });
  }

  const session = await getSession();
  const signedInMatch = session.state === "customer" && session.account.client_id === job.client_id;
  const emailMatch = !!email && email === String(job.email || "").trim().toLowerCase();
  const phoneMatch = !!phone && phone === digits(String(job.phone || ""));
  if (!signedInMatch && !emailMatch && !phoneMatch) {
    return NextResponse.json({ ok: false, error: "We couldn't verify that appointment." }, { status: 403 });
  }

  if (!["booked", "assigned"].includes(String(job.status || ""))) {
    return NextResponse.json({ ok: false, error: "That appointment can no longer be changed online. Text us and we'll help." }, { status: 409 });
  }

  const { data: vehicleLines, error: vehicleError } = await admin
    .from("job_vehicles")
    .select("id, service_name, price, sort_order")
    .eq("job_id", jobId)
    .order("sort_order", { ascending: true });

  if (vehicleError || !vehicleLines || vehicleLines.length !== 1) {
    return NextResponse.json({ ok: false, error: "For multi-vehicle appointments, text us and we'll add it to the right car." }, { status: 422 });
  }

  const line = vehicleLines[0];
  const service = serviceIdFromName(String(line.service_name || ""));
  if (!service || isAddonIncludedInService(service, addon) || !purchasableAddonIds(service).includes(addon)) {
    return NextResponse.json({ ok: false, error: "That extra is already included or isn't available with this detail." }, { status: 422 });
  }

  const key = addonKey(addon);
  const { data: existingRows } = await admin
    .from("job_vehicle_addons")
    .select("id")
    .eq("job_vehicle_id", line.id)
    .eq("addon_key", key)
    .neq("status", "removed")
    .limit(1);

  const jobPrice = Number(job.price || 0);
  const vehiclePrice = Number(line.price || 0);
  if (existingRows?.length) {
    return NextResponse.json({ ok: true, alreadyAdded: true, addon: ADDON_LABELS[addon], jobPrice, vehiclePrice });
  }

  const { data: inserted, error: insertError } = await admin
    .from("job_vehicle_addons")
    .insert({
      job_id: jobId,
      job_vehicle_id: line.id,
      addon_key: key,
      addon_name: ADDON_LABELS[addon],
      price,
      status: "required",
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    console.error("[book/addon] insert", insertError);
    return NextResponse.json({ ok: false, error: "We couldn't add that extra. Please text us and we'll take care of it." }, { status: 500 });
  }

  const nextVehiclePrice = vehiclePrice + price;
  const nextJobPrice = jobPrice + price;
  const vehicleUpdate = await admin.from("job_vehicles").update({ price: nextVehiclePrice }).eq("id", line.id);
  if (vehicleUpdate.error) {
    console.error("[book/addon] vehicle price", vehicleUpdate.error);
    await admin.from("job_vehicle_addons").delete().eq("id", inserted.id);
    return NextResponse.json({ ok: false, error: "We couldn't update that appointment total. Please text us and we'll take care of it." }, { status: 500 });
  }

  const jobUpdate = await admin.from("jobs").update({ price: nextJobPrice }).eq("id", jobId);
  if (jobUpdate.error) {
    console.error("[book/addon] job price", jobUpdate.error);
    await admin.from("job_vehicles").update({ price: vehiclePrice }).eq("id", line.id);
    await admin.from("job_vehicle_addons").delete().eq("id", inserted.id);
    return NextResponse.json({ ok: false, error: "We couldn't update that appointment total. Please text us and we'll take care of it." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    addon: ADDON_LABELS[addon],
    addonPrice: price,
    jobPrice: nextJobPrice,
    vehiclePrice: nextVehiclePrice,
  });
}
