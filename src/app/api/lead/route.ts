import { NextResponse } from "next/server";
import { sendLeadEmails } from "@/lib/email";

const REQUIRED: Record<string, string[]> = {
  quote: ["name", "phone", "vehicleYear", "vehicleMake", "vehicleModel", "interest"],
  booking: ["name", "phone", "vehicle", "service", "address", "preferredDays"],
  detailplus: ["name", "phone", "frequency", "coverage", "vehicle"],
};

const MAX_LEN = 2000;

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

  try {
    console.info("[lead] starting email");

    await sendLeadEmails({
      type,
      fields,
    });

    console.info("[lead] email function completed");
  } catch (emailError) {
    console.error("[lead] email failed", emailError);

    return NextResponse.json(
      { ok: false, error: "We couldn't send that right now. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
