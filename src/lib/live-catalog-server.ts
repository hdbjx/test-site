import { createClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase/config";
import { applyCatalog, type LiveCatalog } from "@/lib/live-catalog";

/**
 * Server side: fetch the live catalog at most once a minute and apply it.
 * Every page and API route that shows or charges a price awaits this first.
 * If Supabase can't be reached, the site keeps the built-in prices.
 */
let cached: { data: LiveCatalog | null; at: number } | null = null;
let inflight: Promise<LiveCatalog | null> | null = null;

async function fetchCatalog(): Promise<LiveCatalog | null> {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_PUBLISHABLE_KEY;
  if (!SUPABASE_URL || !key) return null;
  try {
    const db = createClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await db.rpc("catalog_public");
    if (error) {
      // Before the catalog SQL is run this just means "use the built-in prices".
      if (!/catalog_public/.test(error.message)) console.error("[catalog]", error.message);
      return null;
    }
    return data as LiveCatalog;
  } catch (error) {
    console.error("[catalog]", error);
    return null;
  }
}

export async function ensureLiveCatalog(): Promise<LiveCatalog | null> {
  if (cached && Date.now() - cached.at < 60_000) return cached.data;
  inflight ??= fetchCatalog().finally(() => { inflight = null; });
  const data = await inflight;
  // Keep the last good catalog if a refresh fails.
  cached = { data: data ?? cached?.data ?? null, at: Date.now() };
  applyCatalog(cached.data);
  return cached.data;
}
