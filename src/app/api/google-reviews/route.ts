import { NextResponse } from "next/server";
import { site } from "@/data/site";

export const revalidate = 3600;

/**
 * Most recent Google reviews for the business, straight from the Places API, so the
 * site can show reviews with real dates instead of an undated quote list. Uses the
 * same GOOGLE_PLACES_API_KEY + GOOGLE_PLACE_ID as the review count. Returns an empty
 * list (and the site hides the strip) when the key is missing or Google errors.
 */

type PlaceReview = {
  rating?: number;
  text?: { text?: string };
  originalText?: { text?: string };
  relativePublishTimeDescription?: string;
  publishTime?: string;
  authorAttribution?: { displayName?: string; uri?: string };
};

type PlaceResponse = { reviews?: PlaceReview[]; googleMapsUri?: string };

const cacheHeaders = { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" };

/** "Mazie Gordon" -> "Mazie G.", matching how the site credits reviewers. */
function shortName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return parts[0] ?? "Google reviewer";
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

export async function GET() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  const placeId = process.env.GOOGLE_PLACE_ID?.trim();
  const empty = { reviews: [], profileUrl: site.reviews.googleUrl, live: false };

  if (!apiKey || !placeId) return NextResponse.json(empty, { headers: cacheHeaders });

  try {
    const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
      headers: { "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": "reviews,googleMapsUri" },
      next: { revalidate: 3600 },
    });
    if (!response.ok) {
      console.error("Google Places reviews request failed", response.status, await response.text());
      return NextResponse.json(empty, { headers: cacheHeaders });
    }

    const place = (await response.json()) as PlaceResponse;
    const reviews = (place.reviews ?? [])
      .map((r) => ({
        author: shortName(r.authorAttribution?.displayName ?? ""),
        authorUrl: r.authorAttribution?.uri ?? null,
        rating: Number(r.rating) || 0,
        text: (r.originalText?.text ?? r.text?.text ?? "").trim(),
        when: r.relativePublishTimeDescription ?? "",
        publishedAt: r.publishTime ?? null,
      }))
      // Newest written reviews, whatever the rating; the full list is one tap away on Google.
      .filter((r) => r.rating > 0 && r.text.length > 0 && r.publishedAt)
      .sort((a, b) => Date.parse(b.publishedAt!) - Date.parse(a.publishedAt!));

    return NextResponse.json(
      { reviews: reviews.slice(0, 3), profileUrl: place.googleMapsUri ?? site.reviews.googleUrl, live: true },
      { headers: cacheHeaders },
    );
  } catch (error) {
    console.error("Google Places reviews request errored", error);
    return NextResponse.json(empty, { headers: cacheHeaders });
  }
}
