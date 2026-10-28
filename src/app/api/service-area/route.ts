import { NextResponse } from "next/server";
import { areas } from "@/data/areas";
import { HOME, areaGeo, milesBetween, zoneFor, type LatLng } from "@/data/coverage";
import { enforceRateLimits, ipLimit } from "@/lib/public-security";

/**
 * Service-area address checker.
 * GET  ?q=        → address suggestions (Google Places Autocomplete, when a key is configured)
 * POST {placeId}  → resolve a picked suggestion
 * POST {address}  → geocode free text (Google, then the free US Census geocoder / ZIP lookup as fallback)
 * Distance is straight-line miles from the Decatur home base.
 */

const PLACES = "https://places.googleapis.com/v1";
const BIAS = { circle: { center: { latitude: HOME.lat, longitude: HOME.lng }, radius: 40000 } };

type Parts = { street: string; unit: string; city: string; state: string; zip: string };
type Geocoded = { formatted: string; parts: Parts; point: LatLng; precise: boolean };

const key = () => process.env.GOOGLE_PLACES_API_KEY?.trim() || "";

/**
 * Durable rate limit when the database limiter exists (production). Preview and
 * local builds without the service role skip it instead of 500ing; a configured
 * limiter that errors still fails closed via enforceRateLimits.
 */
async function limit(req: Request, scope: string, windowSeconds: number, maxHits: number) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return enforceRateLimits(req, [ipLimit(req, scope, windowSeconds, maxHits)]);
}
const clean = (v: unknown, max = 200) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
const cleanToken = (v: unknown) => (typeof v === "string" && /^[A-Za-z0-9-]{8,64}$/.test(v) ? v : undefined);

/* ---------------- suggestions ---------------- */

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = clean(url.searchParams.get("q"), 120);
  const sessionToken = cleanToken(url.searchParams.get("session"));
  if (q.length < 4 || !key()) return NextResponse.json({ suggestions: [] });

  const limited = await limit(req, "area_suggest_ip", 600, 240);
  if (limited) return NextResponse.json({ suggestions: [] }, { status: limited.status });

  try {
    const res = await fetch(`${PLACES}/places:autocomplete`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key() },
      body: JSON.stringify({ input: q, sessionToken, includedRegionCodes: ["us"], locationBias: BIAS }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[service-area] autocomplete failed", res.status, await res.text());
      return NextResponse.json({ suggestions: [] });
    }
    const data = (await res.json()) as {
      suggestions?: { placePrediction?: { placeId: string; structuredFormat?: { mainText?: { text: string }; secondaryText?: { text: string } }; text?: { text: string } } }[];
    };
    const suggestions = (data.suggestions ?? [])
      .map((s) => s.placePrediction)
      .filter((p): p is NonNullable<typeof p> => !!p?.placeId)
      .slice(0, 5)
      .map((p) => ({
        placeId: p.placeId,
        main: p.structuredFormat?.mainText?.text ?? p.text?.text ?? "",
        secondary: p.structuredFormat?.secondaryText?.text ?? "",
      }));
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("[service-area] autocomplete error", error);
    return NextResponse.json({ suggestions: [] });
  }
}

/* ---------------- check ---------------- */

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const placeId = typeof body.placeId === "string" && /^[A-Za-z0-9_-]{10,300}$/.test(body.placeId) ? body.placeId : "";
  const address = clean(body.address);
  if (!placeId && address.length < 5) {
    return NextResponse.json({ ok: false, error: "Enter a street address or ZIP code." }, { status: 422 });
  }

  const limited = await limit(req, "area_check_ip", 600, 40);
  if (limited) return limited;

  let found: Geocoded | null = null;
  try {
    if (placeId && key()) found = await googleDetails(placeId, cleanToken(body.session));
    if (!found && address) {
      if (/^\d{5}$/.test(address)) found = (key() && (await googleText(address))) || (await zipLookup(address));
      else found = (key() && (await googleText(address))) || (await censusLookup(address));
    }
  } catch (error) {
    console.error("[service-area] geocode error", error);
    return NextResponse.json({ ok: false, error: "We couldn't look that up right now. Text us the address instead." }, { status: 502 });
  }

  if (!found) {
    return NextResponse.json({ ok: false, error: "We couldn't find that address. Try the full street, city and ZIP." }, { status: 404 });
  }

  const hit = found;
  const miles = milesBetween(HOME, hit.point);
  const nearest = areas
    .filter((a) => areaGeo[a.slug])
    .map((a) => ({ name: a.name, slug: a.slug, miles: milesBetween(areaGeo[a.slug], hit.point) }))
    .sort((a, b) => a.miles - b.miles)[0];
  const outOfState = !!found.parts.state && !/^(ga|georgia)$/i.test(found.parts.state);

  return NextResponse.json({
    ok: true,
    address: found.formatted,
    parts: found.parts,
    precise: found.precise,
    lat: Number(found.point.lat.toFixed(5)),
    lng: Number(found.point.lng.toFixed(5)),
    miles: Math.round(miles * 10) / 10,
    zone: outOfState ? "outside" : zoneFor(miles),
    nearest: nearest ? { ...nearest, miles: Math.round(nearest.miles * 10) / 10 } : null,
  });
}

/* ---------------- providers ---------------- */

type GoogleComponent = { longText?: string; shortText?: string; types?: string[] };
type GooglePlace = { formattedAddress?: string; location?: { latitude: number; longitude: number }; addressComponents?: GoogleComponent[]; types?: string[] };

function googleParts(components: GoogleComponent[] = []): Parts {
  const get = (type: string, short = false) => {
    const c = components.find((x) => x.types?.includes(type));
    return (short ? c?.shortText : c?.longText) ?? "";
  };
  const street = [get("street_number"), get("route", true)].filter(Boolean).join(" ");
  return {
    street,
    unit: get("subpremise"),
    city: get("locality") || get("sublocality") || get("neighborhood") || get("administrative_area_level_3"),
    state: get("administrative_area_level_1", true),
    zip: get("postal_code"),
  };
}

function fromGoogle(place: GooglePlace | undefined): Geocoded | null {
  if (!place?.location) return null;
  const parts = googleParts(place.addressComponents);
  return {
    formatted: place.formattedAddress ?? "",
    parts,
    point: { lat: place.location.latitude, lng: place.location.longitude },
    precise: !!parts.street && /\d/.test(parts.street),
  };
}

const FIELDS = "formattedAddress,location,addressComponents";

async function googleDetails(placeId: string, sessionToken?: string) {
  const qs = sessionToken ? `?sessionToken=${encodeURIComponent(sessionToken)}` : "";
  const res = await fetch(`${PLACES}/places/${encodeURIComponent(placeId)}${qs}`, {
    headers: { "X-Goog-Api-Key": key(), "X-Goog-FieldMask": FIELDS },
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("[service-area] details failed", res.status, await res.text());
    return null;
  }
  return fromGoogle((await res.json()) as GooglePlace);
}

async function googleText(textQuery: string) {
  const res = await fetch(`${PLACES}/places:searchText`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key(), "X-Goog-FieldMask": FIELDS.split(",").map((f) => `places.${f}`).join(",") },
    body: JSON.stringify({ textQuery, regionCode: "us", locationBias: BIAS, pageSize: 1 }),
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("[service-area] text search failed", res.status, await res.text());
    return null;
  }
  const data = (await res.json()) as { places?: GooglePlace[] };
  return fromGoogle(data.places?.[0]);
}

/** Free fallback when no Google key is configured. US addresses only. */
async function censusLookup(address: string): Promise<Geocoded | null> {
  const query = /\b(ga|georgia)\b/i.test(address) ? address : `${address}, GA`;
  const url = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(query)}&benchmark=Public_AR_Current&format=json`;
  const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    result?: { addressMatches?: { matchedAddress: string; coordinates: { x: number; y: number } }[] };
  };
  const m = data.result?.addressMatches?.[0];
  if (!m) return null;
  // matchedAddress looks like "123 MAIN ST, DECATUR, GA, 30030"
  const title = (v = "") => v.toLowerCase().replace(/\b\w/g, (ch) => ch.toUpperCase());
  const [street = "", city = "", state = "", zip = ""] = m.matchedAddress.split(",").map((x) => x.trim());
  return {
    formatted: `${title(street)}, ${title(city)}, ${state.toUpperCase()} ${zip}`,
    parts: { street: title(street), unit: "", city: title(city), state: state.toUpperCase(), zip },
    point: { lat: m.coordinates.y, lng: m.coordinates.x },
    precise: true,
  };
}

async function zipLookup(zip: string): Promise<Geocoded | null> {
  const res = await fetch(`https://api.zippopotam.us/us/${zip}`, { cache: "force-cache", signal: AbortSignal.timeout(6000) });
  if (!res.ok) return null;
  const data = (await res.json()) as { places?: { "place name": string; "state abbreviation": string; latitude: string; longitude: string }[] };
  const p = data.places?.[0];
  if (!p) return null;
  return {
    formatted: `${p["place name"]}, ${p["state abbreviation"]} ${zip}`,
    parts: { street: "", unit: "", city: p["place name"], state: p["state abbreviation"], zip },
    point: { lat: Number(p.latitude), lng: Number(p.longitude) },
    precise: false,
  };
}
