/**
 * Creates or updates the canonical Every Detail contact for a website submission.
 *
 * The database RPC normalizes phone/email before matching, so quote requests,
 * Detail+ inquiries, booking requests and instant bookings all resolve to the
 * same public.clients row instead of creating duplicates.
 */
export async function upsertWebsiteContact(input: {
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  source?: string | null;
}) {
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL.");
  }

  if (!supabaseKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY.");
  }

  const headers: Record<string, string> = {
    apikey: supabaseKey,
    "Content-Type": "application/json",
  };

  // Legacy service_role JWTs require Authorization. New sb_secret_* keys use
  // the apikey header and are intentionally never exposed to the browser.
  if (supabaseKey.startsWith("eyJ")) {
    headers.Authorization = `Bearer ${supabaseKey}`;
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/upsert_website_contact`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      p_full_name: input.name.trim(),
      p_phone: input.phone.trim(),
      p_email: input.email?.trim() || null,
      p_address: input.address?.trim() || null,
      p_source: input.source?.trim() || "website",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `Contact upsert failed (${response.status}): ${detail.slice(0, 500)}`,
    );
  }

  const clientId = (await response.json()) as string | null;

  if (!clientId) {
    throw new Error("Contact upsert did not return a client id.");
  }

  return clientId;
}
