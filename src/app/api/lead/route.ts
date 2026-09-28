import { NextResponse } from "next/server";
import { sendLeadEmails } from "@/lib/email";

/**
 * Receives quote, booking and Detail+ requests from the website.
 *
 * The existing Apps Script / Google Sheets pipeline remains intact.
 * Resend is added as a second delivery path for customer confirmations
 * and internal notifications.
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

  // Honeypot. Real customers never fill this.
  if (
    typeof body.company === "string" &&
    body.company.trim()
  ) {
    return NextResponse.json({ ok: true });
  }

  const type = String(body.type ?? "");
  const required = REQUIRED[type];

  if (!required) {
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

  const fields: Record<string, string> = {};

  for (const [key, value] of Object.entries(body)) {
    if (key === "company" || key === "type") continue;

    if (typeof value === "string") {
      fields[key] = value.trim().slice(0, MAX_LEN);
    }
  }

  const missing = required.filter(
    (key) => !fields[key],
  );

  if (missing.length) {
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

  if ((fields.phone.match(/\d/g) ?? []).length < 10) {
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
      {
        status: 422,
      },
    );
  }

  const url = process.env.LEAD_WEBHOOK_URL;

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
   * Keep the existing Google Sheets / Apps Script pipeline as the
   * required lead-delivery system.
   */
  if (!url) {
    if (process.env.NODE_ENV !== "production") {
      console.info(
        "[lead] LEAD_WEBHOOK_URL not set — payload:",
        payload,
      );

      /*
       * Still test the email system in development if it is configured.
       */
      sendLeadEmails({
        type,
        fields,
      }).catch((emailError) => {
        console.error("[lead] email", emailError);
      });

      return NextResponse.json({
        ok: true,
        dev: true,
      });
    }

    console.error(
      "[lead] LEAD_WEBHOOK_URL is not configured; request not delivered.",
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

  try {
    const response = await fetch(url, {
      method: "POST",

      // text/plain avoids a CORS preflight on Apps Script.
      // The script parses e.postData.contents.
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

    /*
     * At this point the lead is safely in the existing pipeline.
     *
     * Email is an additional communication layer, so an email outage
     * should never make the form tell the customer their request failed.
     */
    try {
  await sendLeadEmails({
    type,
    fields,
  });
} catch (emailError) {
  console.error("[lead] email", emailError);
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
      {
        status: 502,
      },
    );
  }
}
