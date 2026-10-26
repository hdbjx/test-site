import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const giftValidate = read("src/app/api/gift-cards/validate/route.ts");
const book = read("src/app/api/book/route.ts");
const lead = read("src/app/api/lead/route.ts");
const contact = read("src/app/api/contact/route.ts");
const giftOrder = read("src/app/api/gift-cards/route.ts");
const redirectHelper = read("src/lib/safe-redirect.ts");
const signIn = read("src/app/account/sign-in/page.tsx");
const callback = read("src/app/auth/callback/route.ts");
const migration = read("supabase/migrations/20261025_public_form_security_hardening.sql");
const reviewRoute = read("src/app/api/google-review-stats/route.ts");
const bookingForm = read("src/components/forms/BookingForm.tsx");
const publicSecurity = read("src/lib/public-security.ts");

const checks = [
  [giftValidate.includes('.eq("code", code)'), "Gift-card validation must use exact code equality."],
  [!giftValidate.includes('.ilike("code"') && !book.includes('.ilike("code"'), "Gift-card code lookup must never use wildcard-friendly ilike."],
  [giftValidate.includes("enforceRateLimits") && giftValidate.includes("gift_validate_ip"), "Gift-card validation must be rate limited."],
  [!giftValidate.includes("recipient_name") && !giftValidate.includes("recipientName"), "Gift-card validation must not disclose recipient identity."],
  [!giftValidate.includes("code: data.code"), "Gift-card validation must not echo the full code."],
  [book.includes("book_ip") && book.includes("verifyTurnstile") && book.includes("body.company"), "Booking must have rate limit, Turnstile, and honeypot defenses."],
  [lead.includes("lead_ip") && lead.includes("verifyTurnstile") && lead.includes("body.company"), "Lead route must have rate limit, Turnstile, and honeypot defenses."],
  [contact.includes("contact_ip") && contact.includes("verifyTurnstile") && contact.includes("body.company"), "Contact route must have rate limit, Turnstile, and honeypot defenses."],
  [giftOrder.includes("gift_order_ip") && giftOrder.includes("verifyTurnstile") && giftOrder.includes("body.company"), "Gift-card order must have rate limit, Turnstile, and honeypot defenses."],
  [giftOrder.includes('paymentMethod === "zelle"') && giftOrder.includes("GIFT_CARD_ZELLE_LABEL"), "Zelle must be disabled when no configured payment target exists."],
  [giftOrder.includes('paymentMethod === "zelle" && !process.env.GIFT_CARD_ZELLE_LABEL?.trim()') && !giftOrder.includes('GIFT_CARD_ZELLE_LABEL || "@'), "Gift-card Zelle handling must require an explicitly configured payment target."],
  [giftOrder.includes("await sendEmail"), "Gift-card request email must be awaited."],
  [redirectHelper.includes("raw.startsWith(\"//\")") && redirectHelper.includes("decoded.startsWith(\"//\")") && redirectHelper.includes(".test(decoded)"), "Redirect sanitizer must reject protocol-relative, backslash, and decoded control-character forms."],
  [signIn.includes("safeInternalPath") && callback.includes("safeInternalPath"), "Sign-in and callback must share the safe redirect sanitizer."],
  [migration.includes("website_rate_limit_buckets") && migration.includes("consume_website_rate_limit"), "Durable database-backed public rate limits must be present."],
  [migration.includes("Public forms are enrichment-only") && migration.includes("case when nullif(trim(coalesce(c.email"), "Public CRM capture must be non-destructive for established customer identity."],
  [reviewRoute.includes("revalidate = 3600") && reviewRoute.includes("s-maxage=3600"), "Google Places review stats must be cached."],
  [bookingForm.includes('<TurnstileField action="lead" />'), "Fallback booking request form must send the anti-bot token expected by /api/lead."],
  [publicSecurity.includes("if (result.unavailable)") && publicSecurity.includes("status: 503"), "Public endpoint rate limiting must fail closed when its database limiter is unavailable."],
];

const failures = checks.filter(([ok]) => !ok).map(([, message]) => message);
if (failures.length) {
  console.error("Security QA failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(`Security QA passed: ${checks.length} regression checks.`);
