import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { buildGiftCardRequestEmail, sendEmail } from "@/lib/email";
import { enforceRateLimits, ipLimit, normalizedEmail, normalizedPhone, valueLimit, verifyTurnstile } from "@/lib/public-security";

function clean(value: unknown, max = 300) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}


export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (typeof body.company === "string" && body.company.trim()) {
    return NextResponse.json({ ok: true });
  }

  const rateEmail = normalizedEmail(body.purchaserEmail);
  const ratePhone = normalizedPhone(body.purchaserPhone);
  const rateRules = [
    ipLimit(req, "gift_order_ip", 900, 5),
    rateEmail ? valueLimit("gift_order_email", rateEmail, 3600, 4) : null,
    ratePhone ? valueLimit("gift_order_phone", ratePhone, 3600, 4) : null,
  ].filter(Boolean) as Parameters<typeof enforceRateLimits>[1];
  const limited = await enforceRateLimits(req, rateRules);
  if (limited) return limited;

  const turnstile = await verifyTurnstile(req, body.turnstileToken, "gift_order");
  if (!turnstile.ok) {
    return NextResponse.json({ ok: false, error: "Please retry the verification and submit again." }, { status: 403 });
  }

  const amount = Number(body.amount);
  const purchaserName = clean(body.purchaserName, 120);
  const purchaserEmail = clean(body.purchaserEmail, 180).toLowerCase();
  const purchaserPhone = clean(body.purchaserPhone, 40);
  const recipientName = clean(body.recipientName, 120);
  const recipientEmail = clean(body.recipientEmail, 180).toLowerCase();
  const message = clean(body.message, 300);
  const paymentMethod = clean(body.paymentMethod, 20).toLowerCase();
  const deliveryMode = clean(body.deliveryMode, 20).toLowerCase();

  if (!Number.isFinite(amount) || amount < 25 || amount > 2000) {
    return NextResponse.json({ ok: false, error: "Gift cards can be between $25 and $2,000." }, { status: 422 });
  }
  if (!purchaserName || !recipientName || !validEmail(purchaserEmail)) {
    return NextResponse.json({ ok: false, error: "Add your name, a valid email, and the recipient's name." }, { status: 422 });
  }
  if (recipientEmail && !validEmail(recipientEmail)) {
    return NextResponse.json({ ok: false, error: "Check the recipient email address." }, { status: 422 });
  }
  if (!new Set(["venmo", "zelle"]).has(paymentMethod)) {
    return NextResponse.json({ ok: false, error: "Choose Venmo or Zelle." }, { status: 422 });
  }
  if (paymentMethod === "zelle" && !process.env.GIFT_CARD_ZELLE_LABEL?.trim()) {
    return NextResponse.json(
      { ok: false, error: "Zelle is temporarily unavailable. Choose Venmo or contact Every Detail." },
      { status: 503 },
    );
  }
  if (!new Set(["purchaser", "recipient"]).has(deliveryMode)) {
    return NextResponse.json({ ok: false, error: "Choose who should receive the gift card." }, { status: 422 });
  }
  if (deliveryMode === "recipient" && !recipientEmail) {
    return NextResponse.json({ ok: false, error: "Add the recipient's email if you want us to send it directly." }, { status: 422 });
  }

  const { data, error } = await supabaseAdmin().from("gift_card_orders").insert({
    amount_cents: Math.round(amount * 100),
    purchaser_name: purchaserName,
    purchaser_email: purchaserEmail,
    purchaser_phone: purchaserPhone || null,
    recipient_name: recipientName,
    recipient_email: recipientEmail || null,
    message: message || null,
    payment_method: paymentMethod,
    delivery_mode: deliveryMode,
  }).select("id,reference,amount_cents,payment_method").single();

  if (error || !data) {
    console.error("[gift-cards] create failed", error);
    return NextResponse.json({ ok: false, error: "We couldn't create the gift card request. Please try again or text us." }, { status: 500 });
  }

  const dollars = data.amount_cents / 100;
  const paymentTarget = data.payment_method === "venmo"
    ? (process.env.GIFT_CARD_VENMO_LABEL || "@Every-Detail")
    : (process.env.GIFT_CARD_ZELLE_LABEL || "");
  const paymentUrl = data.payment_method === "venmo" ? (process.env.GIFT_CARD_VENMO_URL || "https://venmo.com/u/Every-Detail") : "";
  const html = buildGiftCardRequestEmail({
    purchaserName,
    recipientName,
    amount: dollars,
    reference: data.reference,
    paymentMethod: data.payment_method,
    paymentTarget: paymentTarget || undefined,
    paymentUrl: paymentUrl || undefined,
    deliveryMode: deliveryMode as "purchaser" | "recipient",
  });

  const emailSent = await sendEmail({ to: purchaserEmail, subject: `Gift card request ${data.reference} · Every Detail`, html })
    .then(() => true)
    .catch((emailError) => {
      console.error("[gift-cards] confirmation email failed", emailError);
      return false;
    });

  return NextResponse.json({
    ok: true,
    reference: data.reference,
    amount: dollars,
    paymentMethod: data.payment_method,
    paymentTarget: paymentTarget || undefined,
    paymentUrl: paymentUrl || undefined,
    confirmationEmailSent: emailSent,
  });
}
