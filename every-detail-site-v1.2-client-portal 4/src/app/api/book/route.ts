import { NextResponse } from "next/server";
import {
  isServiceId,
  isVehicleId,
  PRICING,
  services,
  vehicleIdFromSize,
  vehicleLabel,
  type ServiceId,
  type VehicleId,
} from "@/data/services";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSession, vehicleName, type GarageVehicle } from "@/lib/supabase/account";
import { sendBookingEmails } from "@/lib/email";
import { upsertWebsiteContact } from "@/lib/website-contact";

export const dynamic = "force-dynamic";

const str = (v: unknown, max = 500) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

type RawBookingItem = {
  vehicle?: unknown;
  service?: unknown;
  vehicleId?: unknown;
};

type BookingLine = {
  vehicle: VehicleId;
  service: ServiceId;
  vehicleId: string | null;
  vehicleLabel: string;
  vehicleSize: string;
  serviceName: string;
  price: number;
  minutes: number;
  crew: number;
};

function rawItems(body: Record<string, unknown>): RawBookingItem[] {
  if (Array.isArray(body.vehicles)) {
    return body.vehicles.slice(0, 2).map((item) =>
      item && typeof item === "object" ? (item as RawBookingItem) : {},
    );
  }
  return [{ vehicle: body.vehicle, service: body.service, vehicleId: body.vehicleId }];
}

function savedVehicleLabel(vehicle: GarageVehicle, size: VehicleId) {
  const name = vehicleName(vehicle);
  return name ? `${name} (${vehicleLabel(size)})` : vehicleLabel(size);
}

/** POST /api/book - creates one appointment containing one or two vehicle/service lines. */
export async function POST(req: Request) {
  let body: Record<string, unknown>;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (str(body.company)) return NextResponse.json({ ok: true });

  const start = str(body.start);
  const address = str(body.address);
  const notes = str(body.notes, 2000);
  const requested = rawItems(body);

  if (!start || Number.isNaN(Date.parse(start)) || requested.length < 1 || requested.length > 2) {
    return NextResponse.json({ ok: false, error: "Pick your vehicle, service and time." }, { status: 422 });
  }

  if (!address) {
    return NextResponse.json({ ok: false, error: "Add the address where the cars will be.", field: "address" }, { status: 422 });
  }

  const session = await getSession();
  let clientId: string | null = null;
  let name = str(body.name, 120);
  let phone = str(body.phone, 40);
  let email = str(body.email, 200);

  if (session.state === "customer") {
    clientId = session.account.client_id;
    name ||= session.account.full_name;
    phone ||= session.account.phone ?? "";
    email ||= session.email;
  }

  if (!name) {
    return NextResponse.json({ ok: false, error: "Add your name.", field: "name" }, { status: 422 });
  }
  if ((phone.match(/\d/g) ?? []).length < 10) {
    return NextResponse.json({ ok: false, error: "Enter a 10-digit phone number.", field: "phone" }, { status: 422 });
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Enter a valid email for your booking confirmation.", field: "email" }, { status: 422 });
  }

  const lines: BookingLine[] = [];
  const usedSavedIds = new Set<string>();

  for (let index = 0; index < requested.length; index += 1) {
    const item = requested[index];
    const service = str(item.service);
    let vehicle = str(item.vehicle);
    const savedVehicleId = str(item.vehicleId, 80) || null;
    let label = "";

    if (!isServiceId(service)) {
      return NextResponse.json({ ok: false, error: `Choose a service for vehicle ${index + 1}.`, field: "vehicle" }, { status: 422 });
    }

    if (savedVehicleId) {
      if (session.state !== "customer") {
        return NextResponse.json({ ok: false, error: "Sign in again to use a saved vehicle." }, { status: 401 });
      }
      if (usedSavedIds.has(savedVehicleId)) {
        return NextResponse.json({ ok: false, error: "Choose each saved vehicle only once." }, { status: 422 });
      }
      const saved = session.garage.find((garageVehicle) => garageVehicle.id === savedVehicleId);
      if (!saved) {
        return NextResponse.json({ ok: false, error: "One of those vehicles isn't on your account." }, { status: 422 });
      }
      const savedSize = vehicleIdFromSize(saved.vehicle_size);
      if (!savedSize) {
        return NextResponse.json({ ok: false, error: `${vehicleName(saved)} needs a vehicle size before it can be booked online.` }, { status: 422 });
      }
      usedSavedIds.add(savedVehicleId);
      vehicle = savedSize;
      label = savedVehicleLabel(saved, savedSize);
    }

    if (!isVehicleId(vehicle)) {
      return NextResponse.json({ ok: false, error: `Choose a size for vehicle ${index + 1}.`, field: "vehicle" }, { status: 422 });
    }

    const pricing = PRICING[vehicle][service];
    const serviceInfo = services[service];
    lines.push({
      vehicle,
      service,
      vehicleId: savedVehicleId,
      vehicleLabel: label || vehicleLabel(vehicle),
      vehicleSize: vehicleLabel(vehicle),
      serviceName: serviceInfo.name,
      price: pricing.price,
      minutes: pricing.minutes,
      crew: serviceInfo.crew,
    });
  }

  if (!clientId) {
    try {
      clientId = await upsertWebsiteContact({ name, phone, email, address, source: "Website Booking" });
    } catch (contactError) {
      console.error("[book] contact", contactError);
      return NextResponse.json({ ok: false, error: "We couldn't save your contact information. Please try again." }, { status: 502 });
    }
  }

  const totalPrice = lines.reduce((sum, line) => sum + line.price, 0);
  const minutes = Math.max(...lines.map((line) => line.minutes));
  const baseCrew = Math.max(...lines.map((line) => line.crew));
  const crew = baseCrew + Math.max(0, lines.length - 1);
  const appointmentService = lines.length === 1 ? lines[0].serviceName : `${lines.length}-vehicle appointment`;
  const appointmentVehicle = lines.length === 1 ? lines[0].vehicleLabel : `${lines.length} vehicles`;

  const { data, error } = await supabaseAdmin().rpc("book_multi_vehicle_job", {
    p_client_id: clientId,
    p_customer_name: name,
    p_phone: phone,
    p_email: email,
    p_address: address,
    p_start: new Date(start).toISOString(),
    p_lines: lines.map((line) => ({
      vehicle_id: line.vehicleId,
      vehicle_label: line.vehicleLabel,
      vehicle_size: line.vehicleSize,
      service_name: line.serviceName,
      price: line.price,
      minutes: line.minutes,
      crew: line.crew,
    })),
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

  // A confirmed website booking closes any open CRM opportunity for the same
  // person. Booking remains valid even if CRM cleanup fails.
  const crmMatch = await supabaseAdmin().rpc("crm_mark_booked_by_identity", {
    p_phone: phone,
    p_email: email,
    p_actor: "Website booking",
  });
  if (crmMatch.error) console.error("[book] CRM match", crmMatch.error);

  // Await delivery before returning so serverless runtimes cannot terminate the
  // confirmation send after the HTTP response. Email failure never rolls back a
  // valid appointment, but it is surfaced for logs/observability.
  const emailResult = await sendBookingEmails({
    name,
    email,
    phone,
    address,
    service: appointmentService,
    vehicle: appointmentVehicle,
    start: new Date(start).toISOString(),
    price: totalPrice,
    notes,
    lines: lines.map((line) => ({ vehicle: line.vehicleLabel, service: line.serviceName, price: line.price })),
  }).catch((emailError) => {
    console.error("[book] email", emailError);
    return { customerSent: false, internalSent: false };
  });

  if (process.env.LEAD_WEBHOOK_URL) {
    fetch(process.env.LEAD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        type: "booking_confirmed",
        jobId: data,
        submittedAt: new Date().toISOString(),
        name,
        phone,
        email,
        address,
        notes,
        service: appointmentService,
        vehicle: appointmentVehicle,
        vehicles: lines.map((line) => ({ vehicle: line.vehicleLabel, service: line.serviceName, price: line.price })),
        start,
        price: totalPrice,
        ...(process.env.LEAD_WEBHOOK_SECRET ? { secret: process.env.LEAD_WEBHOOK_SECRET } : {}),
      }),
    }).catch((webhookError) => console.error("[book] webhook", webhookError));
  }

  return NextResponse.json({
    ok: true,
    jobId: data,
    price: totalPrice,
    minutes,
    service: appointmentService,
    vehicle: appointmentVehicle,
    vehicleCount: lines.length,
    vehicles: lines.map((line) => ({ vehicle: line.vehicleLabel, service: line.serviceName, price: line.price })),
    start,
    confirmationEmailSent: emailResult.customerSent,
  });
}
