import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";

/**
 * Service-role client. SERVER ONLY — used for get_open_slots and book_job,
 * which only the website's server may call. Never import this into a client component.
 */
export function supabaseAdmin() {
  if (typeof window !== "undefined") throw new Error("supabaseAdmin() is server-only");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !key) throw new Error("Supabase service role is not configured");
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
