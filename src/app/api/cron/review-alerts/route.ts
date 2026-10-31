import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Every 30 minutes (Supabase pg_cron): pull the newest Google reviews, save any
 * we haven't seen, and let the database push Marketing + managers about them.
 * Google's public data only returns the newest ~5 reviews, so the count is also
 * sent; the database turns any gap into "+N more" in the alert.
 */

type IncomingReview = {
  id: string;
  author: string;
  rating: number;
  text: string;
  publishedAt: string;
  url: string | null;
};

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  return !!secret && request.headers.get("authorization") === `Bearer ${secret}`;
}

// Legacy Place Details can sort by newest, which is what we need for alerts.
async function fromLegacy(apiKey: string, placeId: string) {
  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "rating,user_ratings_total,reviews");
  url.searchParams.set("reviews_sort", "newest");
  url.searchParams.set("key", apiKey);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Places details ${res.status}`);
  const body = await res.json();
  if (body.status !== "OK") throw new Error(`Places details ${body.status}: ${body.error_message || ""}`);
  const r = body.result || {};
  const reviews: IncomingReview[] = (r.reviews || []).map((x: any) => ({
    id: `legacy:${x.author_url || x.author_name}:${x.time}`,
    author: String(x.author_name || "Google user"),
    rating: Number(x.rating) || 0,
    text: String(x.text || ""),
    publishedAt: new Date(Number(x.time) * 1000).toISOString(),
    url: x.author_url || null,
  }));
  return { count: Number(r.user_ratings_total) || 0, rating: Number(r.rating) || 0, reviews };
}

// Places API (New) — no "newest" sort, so used only if the legacy API is off.
async function fromNew(apiKey: string, placeId: string) {
  const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
    headers: { "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": "userRatingCount,rating,reviews" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Places (new) ${res.status}: ${await res.text()}`);
  const r = await res.json();
  const reviews: IncomingReview[] = (r.reviews || []).map((x: any) => ({
    id: String(x.name),
    author: String(x.authorAttribution?.displayName || "Google user"),
    rating: Number(x.rating) || 0,
    text: String(x.originalText?.text || x.text?.text || ""),
    publishedAt: String(x.publishTime || new Date().toISOString()),
    url: x.googleMapsUri || x.authorAttribution?.uri || null,
  }));
  return { count: Number(r.userRatingCount) || 0, rating: Number(r.rating) || 0, reviews };
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  const placeId = process.env.GOOGLE_PLACE_ID?.trim();
  if (!apiKey || !placeId) return NextResponse.json({ ok: false, error: "Google Places is not configured" }, { status: 500 });

  let data: Awaited<ReturnType<typeof fromLegacy>>;
  try {
    data = await fromLegacy(apiKey, placeId);
  } catch (legacyError) {
    console.warn("[review-alerts] legacy details unavailable, using Places (new)", legacyError);
    try {
      data = await fromNew(apiKey, placeId);
    } catch (newError) {
      console.error("[review-alerts] google", newError);
      return NextResponse.json({ ok: false, error: "Could not reach Google" }, { status: 502 });
    }
  }

  const { data: result, error } = await supabaseAdmin().rpc("ed_record_google_reviews", {
    p_count: data.count,
    p_rating: data.rating,
    p_reviews: data.reviews.map((r) => ({
      id: r.id,
      author: r.author,
      rating: r.rating,
      text: r.text.slice(0, 4000),
      published_at: r.publishedAt,
      url: r.url,
    })),
  });
  if (error) {
    console.error("[review-alerts] record", error);
    return NextResponse.json({ ok: false, error: "Could not save reviews" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, count: data.count, result });
}
