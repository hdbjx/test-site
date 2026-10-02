import { NextResponse } from "next/server";
import { upsertWebsiteContact } from "@/lib/website-contact";

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
