import { NextResponse } from "next/server";
import { upsertWebsiteContact } from "@/lib/website-contact";
import { enforceRateLimits, ipLimit, normalizedEmail, normalizedPhone, valueLimit, verifyTurnstile } from "@/lib/public-security";

const MAX_LENGTH = 500;

function clean(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, MAX_LENGTH) : "";
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (typeof body.company === "string" && body.company.trim()) {
    return NextResponse.json({ ok: true });
  }

  const preEmail = normalizedEmail(body.email);
  const prePhone = normalizedPhone(body.phone);
  const rateRules = [
    ipLimit(req, "contact_ip", 900, 8),
    preEmail ? valueLimit("contact_email", preEmail, 3600, 5) : null,
    prePhone ? valueLimit("contact_phone", prePhone, 3600, 5) : null,
  ].filter(Boolean) as Parameters<typeof enforceRateLimits>[1];
  const limited = await enforceRateLimits(req, rateRules);
  if (limited) return limited;

  const turnstile = await verifyTurnstile(req, body.turnstileToken, "contact");
  if (!turnstile.ok) {
    return NextResponse.json({ ok: false, error: "Please retry the verification and submit again." }, { status: 403 });
  }

  const fields = {
    name: clean(body.name),
    phone: clean(body.phone),
    email: clean(body.email),
    address: clean(body.address),
  };

  const missing = Object.entries(fields)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length) {
    return NextResponse.json(
      { ok: false, error: "Please fill in all four fields.", missing },
      { status: 422 },
    );
  }

  if (!/\d/.test(fields.address) || !/\b(?:GA|Georgia)\b/i.test(fields.address) || !/\b\d{5}(?:-\d{4})?\b/.test(fields.address)) {
    return NextResponse.json(
      { ok: false, error: "Please enter the full service address, including street, city, state and ZIP code.", missing: ["address"] },
      { status: 422 },
    );
  }

  if ((fields.phone.match(/\d/g) ?? []).length < 10) {
    return NextResponse.json(
      { ok: false, error: "Please enter a 10-digit phone number.", missing: ["phone"] },
      { status: 422 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    return NextResponse.json(
      { ok: false, error: "Please check your email address.", missing: ["email"] },
      { status: 422 },
    );
  }

  try {
    const clientId = await upsertWebsiteContact({
      name: fields.name,
      phone: fields.phone,
      email: fields.email,
      address: fields.address,
      source: "Website info form",
    });

    return NextResponse.json({ ok: true, clientId });
  } catch (error) {
    console.error("[contact] save failed", error);
    return NextResponse.json(
      { ok: false, error: "We couldn't save your information right now. Please try again." },
      { status: 502 },
    );
  }
}
