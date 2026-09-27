import { NextResponse } from "next/server";
import { isServiceId, isVehicleId, PRICING, services, vehicleIdFromSize, vehicleLabel } from "@/data/services";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSession, vehicleName } from "@/lib/supabase/account";

export const dynamic = "force-dynamic";

const str = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/**
 * POST /api/book — instant booking.
 * Price, length and crew come from src/data/services.ts on the server; the browser only picks.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  if (str(body.company)) return NextResponse.json({ ok: true }); // honeypot

  const service = str(body.service);
  const start = str(body.start);
  const savedVehicleId = str(body.vehicleId, 80) || null;
  let size = str(body.vehicle);
  const address = str(body.address);
  const notes = str(body.notes, 2000);
  if (!isServiceId(service) || !start || Number.isNaN(Date.parse(start))) {
    return NextResponse.json({ ok: false, error: "Pick a service and a time." }, { status: 422 });
  }
  if (!address) return NextResponse.json({ ok: false, error: "Add the address where the car will be.", field: "address" }, { status: 422 });

  const session = await getSession();
  let clientId: string | null = null;
  let name = str(body.name, 120);
  let phone = str(body.phone, 40);
  let email = str(body.email, 200);
  let label = "";

  if (session.state === "customer") {
    clientId = session.account.client_id;
    name ||= session.account.full_name;
    phone ||= session.account.phone ?? "";
    email ||= session.email;
    if (savedVehicleId) {
      const v = session.garage.find((g) => g.id === savedVehicleId);
      if (!v) return NextResponse.json({ ok: false, error: "That vehicle isn't on your account." }, { status: 422 });
      size = vehicleIdFromSize(v.vehicle_size) ?? size;
      label = vehicleName(v);
    }
  } else if (savedVehicleId) {
    return NextResponse.json({ ok: false, error: "Sign in again to use a saved vehicle." }, { status: 401 });
  }

  if (!isVehicleId(size)) return NextResponse.json({ ok: false, error: "Choose your vehicle size.", field: "vehicle" }, { status: 422 });
  if (!name) return NextResponse.json({ ok: false, error: "Add your name.", field: "name" }, { status: 422 });
  if ((phone.match(/\d/g) ?? []).length < 10) {
    return NextResponse.json({ ok: false, error: "Enter a 10-digit phone number.", field: "phone" }, { status: 422 });
  }
  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Check your email address.", field: "email" }, { status: 422 });
  }

  const p = PRICING[size][service];
  const svc = services[service];
  label = label ? `${label} (${vehicleLabel(size)})` : vehicleLabel(size);

  const { data, error } = await supabaseAdmin().rpc("book_job", {
    p_client_id: clientId,
    p_vehicle_id: savedVehicleId,
    p_vehicle_label: label,
    p_vehicle_size: vehicleLabel(size),
    p_customer_name: name,
    p_phone: phone,
    p_email: email,
    p_address: address,
    p_service_name: svc.name,
    p_start: new Date(start).toISOString(),
    p_minutes: p.minutes,
    p_crew: svc.crew,
    p_price: p.price,
    p_notes: notes || null,
    p_source: "website",
  });

  if (error) {
    if (error.message.includes("slot_unavailable")) {
      return NextResponse.json({ ok: false, error: "That time was just taken. Pick another.", code: "slot_taken" }, { status: 409 });
    }
    console.error("[book]", error);
    return NextResponse.json({ ok: false, error: "We couldn't book that. Please call or text us." }, { status: 500 });
  }

  // Optional heads-up to the existing Apps Script/Sheets pipeline. Never blocks the booking.
  if (process.env.LEAD_WEBHOOK_URL) {
    fetch(process.env.LEAD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        type: "booking_confirmed",
        jobId: data,
        submittedAt: new Date().toISOString(),
        name, phone, email, address, notes,
        service: svc.name, vehicle: label, start, price: p.price,
        ...(process.env.LEAD_WEBHOOK_SECRET ? { secret: process.env.LEAD_WEBHOOK_SECRET } : {}),
      }),
    }).catch((e) => console.error("[book] webhook", e));
  }

  return NextResponse.json({ ok: true, jobId: data, price: p.price, minutes: p.minutes, service: svc.name, vehicle: label, start });
}
