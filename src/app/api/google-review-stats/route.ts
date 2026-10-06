import { NextResponse } from "next/server";
import { site } from "@/data/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
      headers: { "Cache-Control": "no-store, max-age=0" },
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
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error("Google Places review-count request failed", response.status, await response.text());
      return NextResponse.json(fallback, {
        headers: { "Cache-Control": "no-store, max-age=0" },
      });
    }

    const place = (await response.json()) as GooglePlaceResponse;
    const count = Number(place.userRatingCount);
    const rating = Number(place.rating);

    if (!Number.isFinite(count) || count < 0) {
      return NextResponse.json(fallback, {
        headers: { "Cache-Control": "no-store, max-age=0" },
      });
    }

    return NextResponse.json(
      {
        count,
        rating: Number.isFinite(rating) ? rating : site.reviews.rating,
        live: true,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    console.error("Google Places review-count request errored", error);
    return NextResponse.json(fallback, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  }
}
