import { NextResponse } from "next/server";
import { sendLeadEmails } from "@/lib/email";
import { upsertWebsiteContact } from "@/lib/website-contact";
import { supabaseAdmin } from "@/lib/supabase/admin";

const REQUIRED: Record<string, string[]> = {
  quote: ["name", "phone", "email", "vehicleMake", "vehicleModel", "interest"],
  booking: ["name", "phone", "vehicle", "service", "address", "preferredDays", "leadSource"],
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

async function saveQuoteToCrm(fields: Record<string, string>, clientId: string) {
  const parsedYear = Number.parseInt(fields.vehicleYear, 10);
  const parsedQuote = Number(fields.quote);
  const quoteAmount = Number.isFinite(parsedQuote) && parsedQuote >= 0 ? parsedQuote : null;

  const { data, error } = await supabaseAdmin().rpc("crm_upsert_website_quote", {
    p_full_name: fields.name,
    p_phone: fields.phone,
    p_email: nullable(fields.email),
    p_address: nullable(fields.address),
    p_vehicle_year: Number.isFinite(parsedYear) ? parsedYear : null,
    p_vehicle_make: nullable(fields.vehicleMake),
    p_vehicle_model: nullable(fields.vehicleModel),
    p_vehicle_size: nullable(fields.vehicleSize),
    p_requested_service: nullable(fields.service ?? fields.interest),
    p_message: getQuoteMessage(fields),
    // Persist the exact total the customer saw. Do not recalculate pricing here.
    p_quote_amount: quoteAmount,
    // The recommender already supplies the selected add-ons / paint upgrades here,
    // which gives CRM managers the context behind the final quoted total.
    p_internal_notes: nullable(fields.internalNotes),
  });
  if (error) throw error;
  const leadId = typeof data === "string" ? data : String(data ?? "");
  if (!leadId) throw new Error("CRM quote upsert returned no lead id.");

  // The CRM RPC owns deduplication and sales workflow. The canonical website
  // contact is linked afterward so CRM conversion never has to create a copy.
  const linked = await supabaseAdmin().from("crm_leads").update({ converted_client_id: clientId }).eq("id", leadId);
  if (linked.error) throw linked.error;
  return leadId;
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

  // Honeypot. Bots that fill the hidden company field should not create contacts.
  if (typeof body.company === "string" && body.company.trim()) {
    return NextResponse.json({ ok: true });
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

  if (type === "booking" && fields.address && (!/\d/.test(fields.address) || !/\b(?:GA|Georgia)\b/i.test(fields.address) || !/\b\d{5}(?:-\d{4})?\b/.test(fields.address))) {
    return NextResponse.json(
      { ok: false, error: "Please enter the full service address, including street, city, state and ZIP code.", missing: ["address"] },
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
  let clientId: string | null = null;

  // Every valid public lead form creates or updates the canonical contact first.
  // This applies to quote, recommender, booking-request and Detail+ submissions.
  try {
    console.info("[lead] saving website contact");
    clientId = await upsertWebsiteContact({
      name: fields.name,
      phone: fields.phone,
      email: fields.email,
      address: fields.address,
      source: fields.source ?? `Website ${type}`,
    });
    console.info("[lead] contact save completed", clientId);
  } catch (contactError) {
    console.error("[lead] contact save failed", contactError);
    return NextResponse.json(
      { ok: false, error: "We couldn't save that request right now. Please try again." },
      { status: 502 },
    );
  }

  // Quote requests also enter the Supabase CRM immediately.
  // Booking and Detail+ behavior remains unchanged in this route.
  if (type === "quote") {
    try {
      console.info("[lead] saving quote to CRM");
      crmLeadId = await saveQuoteToCrm(fields, clientId);
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
      return NextResponse.json({ ok: true, crmLeadId, clientId, emailWarning: true });
    }

    return NextResponse.json(
      { ok: false, error: "We couldn't send that right now. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, crmLeadId, clientId });
}
