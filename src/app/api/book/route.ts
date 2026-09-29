import { NextResponse } from "next/server";
import {
  isServiceId,
  isVehicleId,
  PRICING,
  services,
  vehicleIdFromSize,
  vehicleLabel,
} from "@/data/services";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSession, vehicleName } from "@/lib/supabase/account";
import { sendBookingEmails } from "@/lib/email";
import { upsertWebsiteContact } from "@/lib/website-contact";

export const dynamic = "force-dynamic";

const str = (v: unknown, max = 500) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

/**
 * POST /api/book
 *
 * Creates an instant website booking.
 *
 * Price, duration and crew size are always calculated on the server from
 * src/data/services.ts. The browser only chooses the service, vehicle and time.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid request.",
      },
      {
        status: 400,
      },
    );
  }

  // Honeypot.
  if (str(body.company)) {
    return NextResponse.json({ ok: true });
  }

  const service = str(body.service);
  const start = str(body.start);
  const savedVehicleId = str(body.vehicleId, 80) || null;

  let size = str(body.vehicle);

  const address = str(body.address);
  const notes = str(body.notes, 2000);

  if (
    !isServiceId(service) ||
    !start ||
    Number.isNaN(Date.parse(start))
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "Pick a service and a time.",
      },
      {
        status: 422,
      },
    );
  }

  if (!address) {
    return NextResponse.json(
      {
        ok: false,
        error: "Add the address where the car will be.",
        field: "address",
      },
      {
        status: 422,
      },
    );
  }

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
      const vehicle = session.garage.find(
        (garageVehicle) => garageVehicle.id === savedVehicleId,
      );

      if (!vehicle) {
        return NextResponse.json(
          {
            ok: false,
            error: "That vehicle isn't on your account.",
          },
          {
            status: 422,
          },
        );
      }

      size = vehicleIdFromSize(vehicle.vehicle_size) ?? size;
      label = vehicleName(vehicle);
    }
  } else if (savedVehicleId) {
    return NextResponse.json(
      {
        ok: false,
        error: "Sign in again to use a saved vehicle.",
      },
      {
        status: 401,
      },
    );
  }

  if (!isVehicleId(size)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Choose your vehicle size.",
        field: "vehicle",
      },
      {
        status: 422,
      },
    );
  }

  if (!name) {
    return NextResponse.json(
      {
        ok: false,
        error: "Add your name.",
        field: "name",
      },
      {
        status: 422,
      },
    );
  }

  if ((phone.match(/\d/g) ?? []).length < 10) {
    return NextResponse.json(
      {
        ok: false,
        error: "Enter a 10-digit phone number.",
        field: "phone",
      },
      {
        status: 422,
      },
    );
  }

  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Check your email address.",
        field: "email",
      },
      {
        status: 422,
      },
    );
  }

  // Guest bookings should reuse the same canonical contact created by any
  // earlier quote, recommender or Detail+ submission. Signed-in customers
  // already have a canonical client id from their account.
  if (!clientId) {
    try {
      clientId = await upsertWebsiteContact({
        name,
        phone,
        email,
        address,
        source: "Website Booking",
      });
    } catch (contactError) {
      console.error("[book] contact", contactError);
      return NextResponse.json(
        { ok: false, error: "We couldn't save your contact information. Please try again." },
        { status: 502 },
      );
    }
  }

  const pricing = PRICING[size][service];
  const serviceInfo = services[service];

  label = label
    ? `${label} (${vehicleLabel(size)})`
    : vehicleLabel(size);

  const { data, error } = await supabaseAdmin().rpc("book_job", {
    p_client_id: clientId,
    p_vehicle_id: savedVehicleId,
    p_vehicle_label: label,
    p_vehicle_size: vehicleLabel(size),
    p_customer_name: name,
    p_phone: phone,
    p_email: email,
    p_address: address,
    p_service_name: serviceInfo.name,
    p_start: new Date(start).toISOString(),
    p_minutes: pricing.minutes,
    p_crew: serviceInfo.crew,
    p_price: pricing.price,
    p_notes: notes || null,
    p_source: "website",
  });

  if (error) {
    if (error.message.includes("slot_unavailable")) {
      return NextResponse.json(
        {
          ok: false,
          error: "That time was just taken. Pick another.",
          code: "slot_taken",
        },
        {
          status: 409,
        },
      );
    }

    console.error("[book]", error);

    return NextResponse.json(
      {
        ok: false,
        error: "We couldn't book that. Please call or text us.",
      },
      {
        status: 500,
      },
    );
  }

  /*
   * Email is deliberately non-blocking from the customer's perspective.
   *
   * The job already exists in Supabase at this point. If Resend has a temporary
   * problem, we never want a successfully-created booking to appear failed.
   */
  sendBookingEmails({
    name,
    email,
    phone,
    address,
    service: serviceInfo.name,
    vehicle: label,
    start: new Date(start).toISOString(),
    price: pricing.price,
    notes,
  }).catch((emailError) => {
    console.error("[book] email", emailError);
  });

  /*
   * Optional heads-up to the existing Apps Script / Sheets pipeline.
   * This also never blocks the booking.
   */
  if (process.env.LEAD_WEBHOOK_URL) {
    fetch(process.env.LEAD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        type: "booking_confirmed",
        jobId: data,
        submittedAt: new Date().toISOString(),
        name,
        phone,
        email,
        address,
        notes,
        service: serviceInfo.name,
        vehicle: label,
        start,
        price: pricing.price,
        ...(process.env.LEAD_WEBHOOK_SECRET
          ? {
              secret: process.env.LEAD_WEBHOOK_SECRET,
            }
          : {}),
      }),
    }).catch((webhookError) => {
      console.error("[book] webhook", webhookError);
    });
  }

  return NextResponse.json({
    ok: true,
    jobId: data,
    price: pricing.price,
    minutes: pricing.minutes,
    service: serviceInfo.name,
    vehicle: label,
    start,
  });
}
