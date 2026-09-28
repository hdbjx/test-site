import { NextResponse } from "next/server";
import { sendLeadEmails } from "@/lib/email";

const REQUIRED: Record<string, string[]> = {
  quote: [
    "name",
    "phone",
    "vehicleYear",
    "vehicleMake",
    "vehicleModel",
    "interest",
  ],
  booking: [
    "name",
    "phone",
    "vehicle",
    "service",
    "address",
    "preferredDays",
  ],
  detailplus: [
    "name",
    "phone",
    "frequency",
    "coverage",
    "vehicle",
  ],
};

const MAX_LEN = 2000;

export async function POST(req: Request) {
  console.info("[lead] request received");

  let body: Record<string, unknown>;

  try {
    body = await req.json();
  } catch {
    console.error("[lead] invalid JSON");

    return NextResponse.json(
      {
        ok: false,
        error: "Invalid request.",
      },
      { status: 400 },
    );
  }

  // Honeypot
  if (
    typeof body.company === "string" &&
    body.company.trim()
  ) {
    console.info("[lead] honeypot triggered");
    return NextResponse.json({ ok: true });
  }

  const type = String(body.type ?? "");
  const required = REQUIRED[type];

  console.info("[lead] request type:", type);

  if (!required) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unknown request type.",
      },
      { status: 400 },
    );
  }

  const fields: Record<string, string> = {};

  for (const [key, value] of Object.entries(body)) {
    if (key === "company" || key === "type") continue;

    if (typeof value === "string") {
      fields[key] = value.trim().slice(0, MAX_LEN);
    }
  }

  const missing = required.filter((key) => !fields[key]);

  if (missing.length) {
    return NextResponse.json(
      {
        ok: false,
        error: "Please fill in the required fields.",
        missing,
      },
      { status: 422 },
    );
  }

  if ((fields.phone.match(/\d/g) ?? []).length < 10) {
    return NextResponse.json(
      {
        ok: false,
        error: "Please enter a 10-digit phone number.",
        missing: ["phone"],
      },
      { status: 422 },
    );
  }

  if (
    fields.email &&
    !/^\S+@\S+\.\S+$/.test(fields.email)
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "Please check your email address.",
        missing: ["email"],
      },
      { status: 422 },
    );
  }

  const url = process.env.LEAD_WEBHOOK_URL;

  const payload = {
    type,
    submittedAt: new Date().toISOString(),
    ...fields,
    ...(process.env.LEAD_WEBHOOK_SECRET
      ? { secret: process.env.LEAD_WEBHOOK_SECRET }
      : {}),
  };

  if (!url) {
    if (process.env.NODE_ENV !== "production") {
      console.info(
        "[lead] development mode, webhook not configured",
      );

      try {
        console.info("[lead] starting email");

        await sendLeadEmails({
          type,
          fields,
        });

        console.info("[lead] email function completed");
      } catch (emailError) {
        console.error("[lead] email failed", emailError);
      }

      return NextResponse.json({
        ok: true,
        dev: true,
      });
    }

    console.error(
      "[lead] LEAD_WEBHOOK_URL is not configured",
    );

    return NextResponse.json(
      {
        ok: false,
        error: "We couldn't send that. Please call or text us.",
      },
      { status: 503 },
    );
  }

  try {
    console.info("[lead] sending to lead pipeline");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
      redirect: "follow",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `Webhook responded ${response.status}`,
      );
    }

    console.info("[lead] pipeline complete");

    /*
     * Email is intentionally secondary.
     * A Resend outage should not cause a successfully delivered
     * lead to appear as a failed form submission.
     */
    try {
      console.info("[lead] starting email");

      await sendLeadEmails({
        type,
        fields,
      });

      console.info("[lead] email function completed");
    } catch (emailError) {
      console.error("[lead] email failed", emailError);
    }

    return NextResponse.json({
      ok: true,
    });
  } catch (err) {
    console.error("[lead] delivery failed", err);

    return NextResponse.json(
      {
        ok: false,
        error: "We couldn't send that. Please call or text us.",
      },
      { status: 502 },
    );
  }
}
