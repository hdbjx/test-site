import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";

function clean(value: unknown, max = 300) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
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
  const methodLabel = data.payment_method === "venmo" ? "Venmo" : "Zelle";
  const paymentTarget = data.payment_method === "venmo"
    ? (process.env.GIFT_CARD_VENMO_LABEL || "@Every-Detail")
    : (process.env.GIFT_CARD_ZELLE_LABEL || "404-268-7748 · Joseph Perreault");
  const paymentUrl = data.payment_method === "venmo" ? (process.env.GIFT_CARD_VENMO_URL || "https://venmo.com/u/Every-Detail") : "";
  const paymentDestination = paymentTarget ? ` to <strong>${escapeHtml(paymentTarget)}</strong>` : " using the Every Detail payment details you already have";
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111"><h2 style="margin:0 0 12px">Your Every Detail gift card request</h2><p>We reserved a <strong>$${dollars}</strong> gift card for ${escapeHtml(recipientName)}.</p><p>Send <strong>$${dollars}</strong> by ${methodLabel}${paymentDestination} and include <strong>${data.reference}</strong> in the payment note. The gift card stays pending until our team confirms the payment.</p><p style="padding:14px;background:#f3f1ec"><strong>Reference:</strong> ${data.reference}<br><strong>Value:</strong> $${dollars}<br><strong>Payment:</strong> ${methodLabel}</p><p>Purchased gift-card value has no expiration and no inactivity fee.</p></div>`;
  sendEmail({ to: purchaserEmail, subject: `Gift card request ${data.reference} · Every Detail`, html }).catch((emailError) => console.error("[gift-cards] confirmation email failed", emailError));

  return NextResponse.json({
    ok: true,
    reference: data.reference,
    amount: dollars,
    paymentMethod: data.payment_method,
    paymentTarget: paymentTarget || undefined,
    paymentUrl: paymentUrl || undefined,
  });
}
