import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  buildGiftCardActivatedEmail,
  buildGiftCardSentConfirmationEmail,
  sendEmail,
} from "@/lib/email";

function bearerToken(req: Request) {
  const header = req.headers.get("authorization") || "";
  return header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
}

export async function POST(req: Request) {
  const token = bearerToken(req);
  if (!token) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  const admin = supabaseAdmin();
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  const user = authData.user;
  if (authError || !user) return NextResponse.json({ ok: false, error: "Invalid session." }, { status: 401 });

  const { data: profile } = await admin
    .from("profiles")
    .select("id,role,active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.active || !["manager", "admin"].includes(profile.role)) {
    return NextResponse.json({ ok: false, error: "Manager access required." }, { status: 403 });
  }

  let body: { orderId?: string } = {};
  try { body = await req.json(); } catch {}
  if (!body.orderId) return NextResponse.json({ ok: false, error: "Missing orderId." }, { status: 400 });

  const { data: order, error: orderError } = await admin
    .from("gift_card_orders")
    .select("id,reference,amount_cents,purchaser_name,purchaser_email,recipient_name,recipient_email,message,delivery_mode,status")
    .eq("id", body.orderId)
    .maybeSingle();

  if (orderError || !order) return NextResponse.json({ ok: false, error: "Gift-card order not found." }, { status: 404 });
  if (order.status !== "approved") return NextResponse.json({ ok: false, error: "Gift card is not approved yet." }, { status: 409 });

  const { data: card, error: cardError } = await admin
    .from("gift_cards")
    .select("id,code,initial_value_cents,balance_cents,status")
    .eq("order_id", order.id)
    .maybeSingle();

  if (cardError || !card) return NextResponse.json({ ok: false, error: "Activated gift card not found." }, { status: 404 });

  const amount = Number(card.initial_value_cents || order.amount_cents || 0) / 100;
  const recipientDelivery = order.delivery_mode === "recipient";
  const deliveryEmail = recipientDelivery ? order.recipient_email : order.purchaser_email;
  if (!deliveryEmail) return NextResponse.json({ ok: false, error: "No delivery email is available for this order." }, { status: 422 });

  const giftHtml = buildGiftCardActivatedEmail({
    recipientName: recipientDelivery ? order.recipient_name : order.purchaser_name,
    purchaserName: order.purchaser_name,
    amount,
    code: card.code,
    message: order.message,
    deliveredToPurchaser: !recipientDelivery,
  });

  await sendEmail({
    to: deliveryEmail,
    subject: recipientDelivery
      ? `${order.purchaser_name} sent you an Every Detail gift card`
      : `Your ${amount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} Every Detail gift card`,
    html: giftHtml,
  });

  if (recipientDelivery && order.purchaser_email && order.purchaser_email !== deliveryEmail) {
    const purchaserHtml = buildGiftCardSentConfirmationEmail({
      purchaserName: order.purchaser_name,
      recipientName: order.recipient_name,
      recipientEmail: deliveryEmail,
      amount,
      code: card.code,
    });
    await sendEmail({
      to: order.purchaser_email,
      subject: `Your gift card for ${order.recipient_name} has been sent`,
      html: purchaserHtml,
    });
  }

  return NextResponse.json({ ok: true, deliveredTo: deliveryEmail, code: card.code });
}
