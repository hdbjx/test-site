import "server-only";

import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type LimitRule = {
  scope: string;
  value: string;
  windowSeconds: number;
  maxHits: number;
};

function hashKey(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function requestIp(req: Request) {
  const headers = req.headers;
  return (
    headers.get("cf-connecting-ip") ||
    headers.get("x-real-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export function normalizedEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase().slice(0, 254) : "";
}

export function normalizedPhone(value: unknown) {
  if (typeof value !== "string") return "";
  const digits = value.replace(/\D/g, "");
  return (digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits).slice(0, 10);
}

export async function consumeRateLimit(rule: LimitRule) {
  const keyHash = hashKey(`${rule.scope}:${rule.value}`);
  const { data, error } = await supabaseAdmin().rpc("consume_website_rate_limit", {
    p_key_hash: keyHash,
    p_window_seconds: rule.windowSeconds,
    p_limit: rule.maxHits,
  });

  if (error) {
    // Do not silently pretend rate limiting worked. A broken limiter should be
    // visible in logs, while the endpoint can still apply its other defenses.
    console.error("[security] rate limit check failed", rule.scope, error);
    return { allowed: false, retryAfterSeconds: 30, unavailable: true };
  }

  const row = Array.isArray(data) ? data[0] : data;
  return {
    allowed: Boolean(row?.allowed),
    retryAfterSeconds: Number(row?.retry_after_seconds || 60),
    unavailable: false,
  };
}

export async function enforceRateLimits(req: Request, rules: LimitRule[]): Promise<NextResponse | null>;
export async function enforceRateLimits(req: Request, rules: LimitRule[]) {
  for (const rule of rules) {
    const result = await consumeRateLimit(rule);
    if (result.unavailable) {
      return NextResponse.json(
        { ok: false, error: "This form is temporarily unavailable. Please try again shortly." },
        { status: 503, headers: { "Retry-After": "30" } },
      );
    }
    if (!result.allowed) {
      return NextResponse.json(
        { ok: false, error: "Too many requests. Please wait a little and try again." },
        {
          status: 429,
          headers: { "Retry-After": String(result.retryAfterSeconds) },
        },
      );
    }
  }
  return null;
}

export function ipLimit(req: Request, scope: string, windowSeconds: number, maxHits: number): LimitRule {
  return { scope, value: requestIp(req), windowSeconds, maxHits };
}

export function valueLimit(scope: string, value: string, windowSeconds: number, maxHits: number): LimitRule | null {
  const normalized = value.trim().toLowerCase();
  return normalized ? { scope, value: normalized, windowSeconds, maxHits } : null;
}

type TurnstileResponse = {
  success?: boolean;
  hostname?: string;
  action?: string;
  [key: string]: unknown;
};

/**
 * Optional Cloudflare Turnstile verification. Durable rate limiting and
 * honeypots remain active even when Turnstile is not configured.
 *
 * Configure TURNSTILE_SECRET_KEY and NEXT_PUBLIC_TURNSTILE_SITE_KEY together.
 */
export async function verifyTurnstile(req: Request, token: unknown, expectedAction?: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) return { ok: true, configured: false };

  const responseToken = typeof token === "string" ? token.trim() : "";
  if (!responseToken) return { ok: false, configured: true };

  const form = new FormData();
  form.set("secret", secret);
  form.set("response", responseToken.slice(0, 2048));
  const ip = requestIp(req);
  if (ip !== "unknown") form.set("remoteip", ip);

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return { ok: false, configured: true };
    const result = (await response.json()) as TurnstileResponse;
    const actionOk = !expectedAction || !result.action || result.action === expectedAction;
    return { ok: result.success === true && actionOk, configured: true };
  } catch (error) {
    console.error("[security] Turnstile verification failed", error);
    return { ok: false, configured: true };
  }
}
