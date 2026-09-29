import { NextResponse } from "next/server";
import { sendLeadEmails } from "@/lib/email";

const REQUIRED: Record<string, string[]> = {
  quote: ["name", "phone", "vehicleMake", "vehicleModel", "interest"],
  booking: ["name", "phone", "vehicle", "service", "address", "preferredDays"],
  detailplus: ["name", "phone", "frequency", "coverage", "vehicle"],
};

const MAX_LEN = 2000;

function easternDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Could not determine Eastern date.");
  }

  return `${year}-${month}-${day}`;
}

function nullable(value: string | undefined) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : null;
}

function getQuoteMessage(fields: Record<string, string>) {
  return nullable(
    fields.message ??
      fields.notes ??
      fields.vehicleNotes ??
      fields.additionalInfo ??
      fields.anythingElse,
  );
}

async function saveQuoteToCrm(fields: Record<string, string>) {
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL.");
  }

  if (!supabaseSecretKey) {
    throw new Error("Missing SUPABASE_SECRET_KEY.");
  }

  const parsedYear = Number.parseInt(fields.vehicleYear, 10);

  const lead = {
    full_name: fields.name,
    phone: nullable(fields.phone),
    email: nullable(fields.email),
    address: nullable(fields.address),
    vehicle_year: Number.isFinite(parsedYear) ? parsedYear : null,
    vehicle_make: nullable(fields.vehicleMake),
    vehicle_model: nullable(fields.vehicleModel),
    vehicle_size: nullable(fields.vehicleSize),
    requested_service: nullable(fields.service ?? fields.interest),
    message: getQuoteMessage(fields),
    quote_amount: nullable(fields.quote) ? Number.parseFloat(fields.quote) || null : null,
    internal_notes: nullable(fields.internalNotes),
    status: "active",
    next_action_type: "Call 1 of 2",
    next_action_due_date: easternDateKey(),
    answered: false,
    call_attempts: 0,
    text_attempts: 0,
    email_attempts: 0,
    source: nullable(fields.source) ?? "New Website",
  };

  const headers: Record<string, string> = {
    apikey: supabaseSecretKey,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };

  // Legacy service_role keys are JWTs and also use the Authorization header.
  // New sb_secret_* keys should be sent as the apikey only.
  if (supabaseSecretKey.startsWith("eyJ")) {
    headers.Authorization = `Bearer ${supabaseSecretKey}`;
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/crm_leads`, {
    method: "POST",
    headers,
    body: JSON.stringify(lead),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`CRM insert failed (${response.status}): ${detail.slice(0, 500)}`);
  }

  const rows = (await response.json()) as Array<{ id?: string }>;
  return rows[0]?.id ?? null;
}

export async function POST(req: Request) {
  console.info("[lead] request received");

  let body: Record<string, unknown>;

  try {
    body = await req.json();
  } catch {
    console.error("[lead] invalid JSON");
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const type = String(body.type ?? "");
  const required = REQUIRED[type];

  console.info("[lead] request type:", type);

  if (!required) {
    console.error("[lead] unknown request type:", type);
    return NextResponse.json({ ok: false, error: "Unknown request type." }, { status: 400 });
  }

  const fields: Record<string, string> = {};

  for (const [key, value] of Object.entries(body)) {
    if (key === "type") continue;

    if (typeof value === "string") {
      fields[key] = value.trim().slice(0, MAX_LEN);
    }
  }

  const missing = required.filter((key) => !fields[key]);

  if (missing.length) {
    console.warn("[lead] missing fields:", missing);
    return NextResponse.json(
      { ok: false, error: "Please fill in the required fields.", missing },
      { status: 422 },
    );
  }

  if ((fields.phone.match(/\d/g) ?? []).length < 10) {
    console.warn("[lead] invalid phone");
    return NextResponse.json(
      { ok: false, error: "Please enter a 10-digit phone number.", missing: ["phone"] },
      { status: 422 },
    );
  }

  if (fields.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    console.warn("[lead] invalid email");
    return NextResponse.json(
      { ok: false, error: "Please check your email address.", missing: ["email"] },
      { status: 422 },
    );
  }

  let crmLeadId: string | null = null;

  // Quote requests now enter the Supabase CRM immediately.
  // Booking and Detail+ behavior remains unchanged in this route.
  if (type === "quote") {
    try {
      console.info("[lead] saving quote to CRM");
      crmLeadId = await saveQuoteToCrm(fields);
      console.info("[lead] CRM save completed", crmLeadId);
    } catch (crmError) {
      console.error("[lead] CRM save failed", crmError);

      return NextResponse.json(
        { ok: false, error: "We couldn't save that request right now. Please try again." },
        { status: 502 },
      );
    }
  }

  try {
    console.info("[lead] starting email");

    await sendLeadEmails({
      type,
      fields,
    });

    console.info("[lead] email function completed");
  } catch (emailError) {
    console.error("[lead] email failed", emailError);

    // If a quote is already safely in the CRM, do not make the customer
    // resubmit and create a duplicate lead just because email delivery failed.
    if (type === "quote" && crmLeadId) {
      return NextResponse.json({ ok: true, crmLeadId, emailWarning: true });
    }

    return NextResponse.json(
      { ok: false, error: "We couldn't send that right now. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, crmLeadId });
}
