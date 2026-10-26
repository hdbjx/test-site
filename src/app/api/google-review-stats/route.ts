import { NextResponse } from "next/server";
import { site } from "@/data/site";

export const revalidate = 3600;

type GooglePlaceResponse = {
  userRatingCount?: number;
  rating?: number;
};

export async function GET() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  const placeId = process.env.GOOGLE_PLACE_ID?.trim();

  const fallback = {
    count: site.reviews.count,
    rating: site.reviews.rating,
    live: false,
  };

  if (!apiKey || !placeId) {
    return NextResponse.json(fallback, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  }

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "userRatingCount,rating",
        },
        next: { revalidate: 3600 },
      },
    );

    if (!response.ok) {
      console.error("Google Places review-count request failed", response.status, await response.text());
      return NextResponse.json(fallback, {
        headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
      });
    }

    const place = (await response.json()) as GooglePlaceResponse;
    const count = Number(place.userRatingCount);
    const rating = Number(place.rating);

    if (!Number.isFinite(count) || count < 0) {
      return NextResponse.json(fallback, {
        headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
      });
    }

    return NextResponse.json(
      {
        count,
        rating: Number.isFinite(rating) ? rating : site.reviews.rating,
        live: true,
      },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
    );
  } catch (error) {
    console.error("Google Places review-count request errored", error);
    return NextResponse.json(fallback, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  }
}
