import { NextResponse } from "next/server";
import { areas } from "@/data/areas";
import { areaGeo, estimateMinutes, milesBetween, zoneForMinutes, type LatLng } from "@/data/coverage";
import { enforceRateLimits, ipLimit } from "@/lib/public-security";

/**
 * Service-area address checker.
 * GET  ?q=        → address suggestions (Google Places Autocomplete, when a key is configured)
 * POST {placeId}  → resolve a picked suggestion
 * POST {address}  → geocode free text (Google, then the free US Census geocoder / ZIP lookup as fallback)
 * Coverage tier comes from one-way drive time from the shop (Google Routes, else an estimate).
 */

/** The shop (223 Coventry Rd, Decatur). Server-only: the public site lists no street address. */
const BASE: LatLng = { lat: 33.77867, lng: -84.30732 };

const PLACES = "https://places.googleapis.com/v1";
const BIAS = { circle: { center: { latitude: BASE.lat, longitude: BASE.lng }, radius: 40000 } };

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
      else found = (key() && (await googleText(address))) || (await censusLookup(address)) || (await looseLookup(address));
    }
  } catch (error) {
    console.error("[service-area] geocode error", error);
    return NextResponse.json({ ok: false, error: "We couldn't look that up right now. Text us the address instead." }, { status: 502 });
  }

  if (!found) {
    return NextResponse.json({ ok: false, error: "We couldn't find that address. Try the full street, city and ZIP." }, { status: 404 });
  }

  const hit = found;
  const miles = milesBetween(BASE, hit.point);
  const nearest = areas
    .filter((a) => areaGeo[a.slug])
    .map((a) => ({ name: a.name, slug: a.slug, miles: milesBetween(areaGeo[a.slug], hit.point) }))
    .sort((a, b) => a.miles - b.miles)[0];
  const outOfState = !!hit.parts.state && !/^(ga|georgia)$/i.test(hit.parts.state);

  const driven = miles < 120 ? await driveMinutes(hit.point).catch(() => null) : null;
  const minutes = driven ?? estimateMinutes(miles);
  let zone = outOfState ? "exception" : zoneForMinutes(minutes);
  // Listed areas never drop below "fee": we already advertise service there.
  if (nearest && nearest.miles <= 2.5 && (zone === "premium" || zone === "exception") && !outOfState) zone = "fee";

  return NextResponse.json({
    ok: true,
    address: hit.formatted,
    parts: hit.parts,
    precise: hit.precise,
    lat: Number(hit.point.lat.toFixed(5)),
    lng: Number(hit.point.lng.toFixed(5)),
    miles: Math.round(miles * 10) / 10,
    minutes,
    timed: driven !== null, // true when minutes came from Google Routes
    zone,
    nearest: nearest ? { ...nearest, miles: Math.round(nearest.miles * 10) / 10 } : null,
  });
}

/* ---------------- drive time ---------------- */

/** Traffic-free one-way drive time from the shop, in minutes. Needs Routes API on the key. */
async function driveMinutes(to: LatLng): Promise<number | null> {
  if (!key()) return null;
  const res = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key(), "X-Goog-FieldMask": "routes.duration" },
    body: JSON.stringify({
      origin: { location: { latLng: { latitude: BASE.lat, longitude: BASE.lng } } },
      destination: { location: { latLng: { latitude: to.lat, longitude: to.lng } } },
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_UNAWARE",
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) {
    console.error("[service-area] routes failed", res.status, await res.text());
    return null;
  }
  const data = (await res.json()) as { routes?: { duration?: string }[] };
  const seconds = Number.parseFloat(data.routes?.[0]?.duration ?? "");
  return Number.isFinite(seconds) ? Math.max(1, Math.round(seconds / 60)) : null;
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

/** Last resort: a ZIP or a listed area named in the text. Approximate, so never used to prefill booking. */
async function looseLookup(address: string): Promise<Geocoded | null> {
  const zip = address.match(/\b(\d{5})(?:-\d{4})?\s*$/)?.[1] ?? address.match(/\b(3\d{4})\b/)?.[1];
  if (zip) {
    const hit = await zipLookup(zip);
    if (hit) return hit;
  }
  const lower = address.toLowerCase();
  const area = areas
    .filter((a) => areaGeo[a.slug] && lower.includes(a.name.toLowerCase()))
    .sort((a, b) => b.name.length - a.name.length)[0];
  if (!area) return null;
  return {
    formatted: `${area.name}, GA`,
    parts: { street: "", unit: "", city: area.name, state: "GA", zip: "" },
    point: { lat: areaGeo[area.slug].lat, lng: areaGeo[area.slug].lng },
    precise: false,
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
