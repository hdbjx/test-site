import { NextResponse } from "next/server";
import { sendLeadEmails } from "@/lib/email";

/**
 * Receives quote, booking, and Detail+ requests.
 *
 * Flow:
 * 1. Validate submission
 * 2. Send lead to existing Google Sheets / Apps Script pipeline
 * 3. Await transactional emails through Resend
 * 4. Email failure never destroys an otherwise successful lead
 */

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

  /*
   * Parse request
   */
  try {
    body = await req.json();
  } catch {
    console.error("[lead] invalid JSON");

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

  /*
   * Determine form type
   */
  const type = String(body.type ?? "");
  const required = REQUIRED[type];

  console.info("[lead] request type:", type);

  if (!required) {
    console.error("[lead] unknown request type:", type);

    return NextResponse.json(
      {
        ok: false,
        error: "Unknown request type.",
      },
      {
        status: 400,
      },
    );
  }

  /*
   * Sanitize fields
   *
   * IMPORTANT:
   * We do NOT use "company" as a honeypot.
   * The website can legitimately submit that field.
   */
  const fields: Record<string, string> = {};

  for (const [key, value] of Object.entries(body)) {
    if (key === "type") continue;

    if (typeof value === "string") {
      fields[key] = value.trim().slice(0, MAX_LEN);
    }
  }

  /*
   * Required fields
   */
  const missing = required.filter((key) => !fields[key]);

  if (missing.length) {
    console.warn("[lead] missing fields:", missing);

    return NextResponse.json(
      {
        ok: false,
        error: "Please fill in the required fields.",
        missing,
      },
      {
        status: 422,
      },
    );
  }

  /*
   * Phone validation
   */
  if ((fields.phone.match(/\d/g) ?? []).length < 10) {
    console.warn("[lead] invalid phone");

    return NextResponse.json(
      {
        ok: false,
        error: "Please enter a 10-digit phone number.",
        missing: ["phone"],
      },
      {
        status: 422,
      },
    );
  }

  /*
   * Email validation
   *
   * Email remains optional unless the frontend/form requires it.
   */
  if (
    fields.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)
  ) {
    console.warn("[lead] invalid email");

    return NextResponse.json(
      {
        ok: false,
        error: "Please check your email address.",
        missing: ["email"],
      },
      {
        status: 422,
      },
    );
  }

  /*
   * Existing Google Sheets / Apps Script pipeline
   */
  const webhookUrl = process.env.LEAD_WEBHOOK_URL;

  const payload = {
    type,
    submittedAt: new Date().toISOString(),
    ...fields,

    ...(process.env.LEAD_WEBHOOK_SECRET
      ? {
          secret: process.env.LEAD_WEBHOOK_SECRET,
        }
      : {}),
  };

  /*
   * Production requires the existing lead pipeline.
   */
  if (!webhookUrl) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[lead] LEAD_WEBHOOK_URL is not configured",
      );

      return NextResponse.json(
        {
          ok: false,
          error: "We couldn't send that. Please call or text us.",
        },
        {
          status: 503,
        },
      );
    }

    /*
     * Development mode
     */
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

  /*
   * Deliver lead to existing pipeline first.
   */
  try {
    console.info("[lead] sending to lead pipeline");

    const response = await fetch(webhookUrl, {
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
        `Webhook responded with HTTP ${response.status}`,
      );
    }

    console.info("[lead] pipeline complete");
  } catch (error) {
    console.error("[lead] delivery failed", error);

    return NextResponse.json(
      {
        ok: false,
        error: "We couldn't send that. Please call or text us.",
      },
      {
        status: 502,
      },
    );
  }

  /*
   * Lead is safely delivered.
   *
   * Now WAIT for Resend before allowing the serverless
   * invocation to finish.
   */
  try {
    console.info("[lead] starting email");

    await sendLeadEmails({
      type,
      fields,
    });

    console.info("[lead] email function completed");
  } catch (emailError) {
    /*
     * Do not tell the customer their quote failed if their
     * lead already made it into the primary pipeline.
     */
    console.error("[lead] email failed", emailError);
  }

  /*
   * Successful submission
   */
  return NextResponse.json({
    ok: true,
  });
}
