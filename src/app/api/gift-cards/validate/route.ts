import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

function cleanCode(value: unknown) {
  return typeof value === "string" ? value.trim().toUpperCase().slice(0, 64) : "";
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const code = cleanCode(body.code);
  if (!code) {
    return NextResponse.json({ ok: false, error: "Enter a gift card code." }, { status: 422 });
  }

  const { data, error } = await supabaseAdmin()
    .from("gift_cards")
    .select("id, code, balance_cents, recipient_name, status, expires_at")
    .ilike("code", code)
    .maybeSingle();

  if (error) {
    console.error("[gift-cards/validate]", error);
    return NextResponse.json({ ok: false, error: "We couldn't check that gift card right now." }, { status: 500 });
  }

  if (!data || data.status !== "active") {
    return NextResponse.json({ ok: false, error: "That gift card code is not active." }, { status: 404 });
  }

  if (data.expires_at && new Date(data.expires_at).getTime() <= Date.now()) {
    return NextResponse.json({ ok: false, error: "That gift card is no longer active." }, { status: 410 });
  }

  if (Number(data.balance_cents || 0) <= 0) {
    return NextResponse.json({ ok: false, error: "That gift card has no remaining balance." }, { status: 409 });
  }

  return NextResponse.json({
    ok: true,
    code: data.code,
    codeLast4: data.code.slice(-4),
    balanceCents: Number(data.balance_cents),
    recipientName: data.recipient_name || null,
  });
}
