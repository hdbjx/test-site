import { NextResponse } from "next/server";

/**
 * Receives quote, booking and Detail+ requests from the site and forwards them
 * to LEAD_WEBHOOK_URL (e.g. an Apps Script doPost that writes to the Quote Pipeline sheet).
 *
 * Payload sent to the webhook:
 *   { type, submittedAt, page, secret?, ...fields }
 */

const REQUIRED: Record<string, string[]> = {
  quote: ["name", "phone", "vehicleYear", "vehicleMake", "vehicleModel", "interest"],
  booking: ["name", "phone", "vehicle", "service", "address", "preferredDays"],
  detailplus: ["name", "phone", "frequency", "coverage", "vehicle"],
};

const MAX_LEN = 2000;

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real people never fill this field.
  if (typeof body.company === "string" && body.company.trim()) {
    return NextResponse.json({ ok: true });
  }

  const type = String(body.type ?? "");
  const required = REQUIRED[type];
  if (!required) return NextResponse.json({ ok: false, error: "Unknown request type." }, { status: 400 });

  const fields: Record<string, string> = {};
  for (const [k, v] of Object.entries(body)) {
    if (k === "company" || k === "type") continue;
    if (typeof v === "string") fields[k] = v.trim().slice(0, MAX_LEN);
  }

  const missing = required.filter((k) => !fields[k]);
  if (missing.length) {
    return NextResponse.json({ ok: false, error: "Please fill in the required fields.", missing }, { status: 422 });
  }
  if ((fields.phone.match(/\d/g) ?? []).length < 10) {
    return NextResponse.json({ ok: false, error: "Please enter a 10-digit phone number.", missing: ["phone"] }, { status: 422 });
  }
  if (fields.email && !/^\S+@\S+\.\S+$/.test(fields.email)) {
    return NextResponse.json({ ok: false, error: "Please check your email address.", missing: ["email"] }, { status: 422 });
  }

  const url = process.env.LEAD_WEBHOOK_URL;
  const payload = {
    type,
    submittedAt: new Date().toISOString(),
    ...fields,
    ...(process.env.LEAD_WEBHOOK_SECRET ? { secret: process.env.LEAD_WEBHOOK_SECRET } : {}),
  };

  if (!url) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[lead] LEAD_WEBHOOK_URL not set — payload:", payload);
      return NextResponse.json({ ok: true, dev: true });
    }
    console.error("[lead] LEAD_WEBHOOK_URL is not configured; request not delivered.");
    return NextResponse.json({ ok: false, error: "We couldn't send that. Please call or text us." }, { status: 503 });
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      // text/plain avoids a CORS preflight on Apps Script; the script parses e.postData.contents.
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow",
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[lead] delivery failed", err);
    return NextResponse.json({ ok: false, error: "We couldn't send that. Please call or text us." }, { status: 502 });
  }
}
