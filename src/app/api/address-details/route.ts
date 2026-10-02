import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type AddressComponent = {
  longText?: string;
  shortText?: string;
  types?: string[];
};

function component(items: AddressComponent[], type: string, short = false) {
  const item = items.find((part) => part.types?.includes(type));
  return String(short ? item?.shortText ?? item?.longText ?? "" : item?.longText ?? item?.shortText ?? "").trim();
}

export async function POST(req: Request) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!apiKey) return NextResponse.json({ ok: false }, { status: 503 });

  let body: { placeId?: string; sessionToken?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const placeId = String(body.placeId ?? "").trim();
  const sessionToken = String(body.sessionToken ?? "").trim().slice(0, 100);
  if (!placeId || !/^[A-Za-z0-9_-]+$/.test(placeId)) return NextResponse.json({ ok: false }, { status: 400 });

  try {
    const url = new URL(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`);
    if (sessionToken) url.searchParams.set("sessionToken", sessionToken);

    const response = await fetch(url, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "addressComponents",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Google Places address details failed", response.status, await response.text());
      return NextResponse.json({ ok: false }, { status: 502 });
    }

    const json = (await response.json()) as { addressComponents?: AddressComponent[] };
    const items = json.addressComponents ?? [];
    const streetNumber = component(items, "street_number");
    const route = component(items, "route");
    const street = [streetNumber, route].filter(Boolean).join(" ");
    const unit = component(items, "subpremise");
    const city = component(items, "locality") || component(items, "postal_town") || component(items, "sublocality_level_1");
    const state = component(items, "administrative_area_level_1", true);
    const zip = component(items, "postal_code");

    return NextResponse.json({ ok: true, address: { street, unit, city, state, zip } }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Google Places address details errored", error);
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
