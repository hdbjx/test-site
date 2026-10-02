import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type GoogleSuggestion = {
  placePrediction?: {
    placeId?: string;
    text?: { text?: string };
    structuredFormat?: {
      mainText?: { text?: string };
      secondaryText?: { text?: string };
    };
  };
};

export async function POST(req: Request) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!apiKey) return NextResponse.json({ ok: false, suggestions: [] }, { status: 503 });

  let body: { input?: string; sessionToken?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, suggestions: [] }, { status: 400 });
  }

  const input = String(body.input ?? "").trim().slice(0, 180);
  const sessionToken = String(body.sessionToken ?? "").trim().slice(0, 100);
  if (input.length < 3) return NextResponse.json({ ok: true, suggestions: [] });

  try {
    const response = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "suggestions.placePrediction.placeId,suggestions.placePrediction.text.text,suggestions.placePrediction.structuredFormat.mainText.text,suggestions.placePrediction.structuredFormat.secondaryText.text",
      },
      body: JSON.stringify({
        input,
        ...(sessionToken ? { sessionToken } : {}),
        includedRegionCodes: ["us"],
        regionCode: "US",
        locationBias: {
          circle: {
            center: { latitude: 33.7748, longitude: -84.2963 },
            radius: 65000,
          },
        },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Google Places address autocomplete failed", response.status, await response.text());
      return NextResponse.json({ ok: false, suggestions: [] }, { status: 502 });
    }

    const json = (await response.json()) as { suggestions?: GoogleSuggestion[] };
    const suggestions = (json.suggestions ?? [])
      .map((item) => item.placePrediction)
      .filter((prediction): prediction is NonNullable<GoogleSuggestion["placePrediction"]> => !!prediction?.placeId)
      .slice(0, 5)
      .map((prediction) => ({
        placeId: prediction.placeId!,
        label: prediction.text?.text ?? "",
        main: prediction.structuredFormat?.mainText?.text ?? prediction.text?.text ?? "",
        secondary: prediction.structuredFormat?.secondaryText?.text ?? "",
      }));

    return NextResponse.json({ ok: true, suggestions }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Google Places address autocomplete errored", error);
    return NextResponse.json({ ok: false, suggestions: [] }, { status: 502 });
  }
}
