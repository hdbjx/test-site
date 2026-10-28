/**
 * Service-area geometry for the coverage map and address checker.
 *
 * Coverage is tiered by one-way drive time from the shop. The checker asks
 * Google Routes for a real drive time and falls back to `estimateMinutes`.
 * Road lines are simplified for orientation only; they are not routing data.
 */

export type LatLng = { lat: number; lng: number };
export type CoverageZone = "core" | "route" | "fee" | "premium" | "exception";

/**
 * Public map anchor: downtown Decatur. The shop's street address is a
 * server-only value in the checker API and is never shipped to the browser.
 */
export const HOME: LatLng & { name: string } = { name: "Decatur", lat: 33.7748, lng: -84.2963 };

/** One-way drive-time tiers, in minutes (upper bound of each tier). */
export const TIERS: { zone: CoverageZone; maxMinutes: number }[] = [
  { zone: "core", maxMinutes: 15 }, // core service area
  { zone: "route", maxMinutes: 25 }, // accept normally
  { zone: "fee", maxMinutes: 35 }, // higher-value jobs or travel fee
  { zone: "premium", maxMinutes: 45 }, // premium bookings only
  { zone: "exception", maxMinutes: Infinity }, // exception or multiple jobs in the area
];

export function zoneForMinutes(minutes: number): CoverageZone {
  return TIERS.find((t) => minutes <= t.maxMinutes)!.zone;
}

/** Zones customers can book online without a conversation first. */
export const bookable = (zone: CoverageZone) => zone === "core" || zone === "route" || zone === "fee";

/** Verdict tone for colors: yes / maybe / no. */
export const zoneTone = (zone: CoverageZone) => (bookable(zone) ? "yes" : zone === "premium" ? "maybe" : "no");

/**
 * Rough metro-Atlanta drive time from straight-line miles: ~2.1 min/mile on
 * surface streets for the first 20 miles, highway pace after, plus 4 minutes
 * to get rolling. Used for map rings, list labels, and when Routes is unavailable.
 */
export function estimateMinutes(miles: number) {
  return Math.round(4 + 2.1 * Math.min(miles, 20) + 1.2 * Math.max(0, miles - 20));
}

/** Inverse of estimateMinutes inside 20 miles, for drawing approximate drive-time rings. */
export const milesForMinutes = (minutes: number) => Math.max(0, (minutes - 4) / 2.1);

/** Area centers, keyed by area slug from src/data/areas.ts. `label` controls label placement on the map. */
export const areaGeo: Record<string, LatLng & { short?: string; label: "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw" }> = {
  decatur: { lat: 33.7748, lng: -84.2963, label: "s" },
  brookhaven: { lat: 33.8651, lng: -84.3366, label: "e" },
  "avondale-estates": { lat: 33.7712, lng: -84.2671, short: "Avondale Est.", label: "e" },
  chamblee: { lat: 33.8921, lng: -84.2988, label: "e" },
  "north-buckhead": { lat: 33.865, lng: -84.372, short: "N. Buckhead", label: "w" },
  "north-druid-hills": { lat: 33.8168, lng: -84.3133, short: "N. Druid Hills", label: "w" },
  "sandy-springs": { lat: 33.9304, lng: -84.3733, label: "w" },
  dunwoody: { lat: 33.9462, lng: -84.3346, label: "e" },
  briarcliff: { lat: 33.8285, lng: -84.2855, label: "e" },
  atlanta: { lat: 33.749, lng: -84.388, label: "w" },
};

/** Faint reference points so the map reads as Atlanta, not a diagram. */
export const landmarks: (LatLng & { name: string })[] = [
  { name: "Emory", lat: 33.7925, lng: -84.3237 },
  { name: "Stone Mtn", lat: 33.8053, lng: -84.1455 },
  { name: "Airport", lat: 33.6407, lng: -84.4277 },
  { name: "Tucker", lat: 33.8545, lng: -84.2171 },
];

/** Simplified highways. `closed` paths are drawn as loops. */
export const roads: { name: string; label?: LatLng; closed?: boolean; points: [number, number][] }[] = [
  {
    name: "I-285",
    closed: true,
    label: { lat: 33.735, lng: -84.247 },
    points: [
      [33.9215, -84.356], [33.9205, -84.32], [33.909, -84.285], [33.892, -84.259], [33.866, -84.238],
      [33.83, -84.233], [33.79, -84.238], [33.75, -84.248], [33.713, -84.259], [33.675, -84.286],
      [33.655, -84.313], [33.638, -84.36], [33.627, -84.395], [33.619, -84.44], [33.638, -84.48],
      [33.668, -84.507], [33.71, -84.522], [33.756, -84.528], [33.798, -84.517], [33.843, -84.495],
      [33.883, -84.466], [33.906, -84.428], [33.917, -84.39],
    ],
  },
  {
    name: "I-85",
    points: [[33.748, -84.389], [33.79, -84.389], [33.81, -84.365], [33.834, -84.335], [33.858, -84.305], [33.892, -84.259], [33.925, -84.215], [33.96, -84.17]],
  },
  {
    name: "I-20",
    points: [[33.756, -84.56], [33.75, -84.47], [33.748, -84.389], [33.74, -84.34], [33.73, -84.3], [33.713, -84.259], [33.705, -84.2], [33.7, -84.13]],
  },
  {
    name: "GA-400",
    points: [[33.81, -84.37], [33.84, -84.368], [33.87, -84.36], [33.9215, -84.356], [33.96, -84.355], [34.0, -84.35]],
  },
  {
    name: "I-75",
    points: [[33.748, -84.389], [33.8, -84.395], [33.83, -84.42], [33.86, -84.445], [33.883, -84.466], [33.93, -84.5]],
  },
];

const EARTH_MILES = 3958.8;
const rad = (d: number) => (d * Math.PI) / 180;

export function milesBetween(a: LatLng, b: LatLng) {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_MILES * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Map projection: a 1000×1000 view centered on the service cluster (north of
 * Decatur), `VIEW_MILES` from center to edge. Equirectangular is accurate to a
 * fraction of a percent at this size.
 */
export const VIEW = 1000;
export const VIEW_CENTER: LatLng = { lat: 33.835, lng: -84.322 };
export const VIEW_MILES = 9.5;
const PX_PER_MILE = VIEW / 2 / VIEW_MILES;
const MILES_PER_LNG = 69.172 * Math.cos(rad(VIEW_CENTER.lat));
const MILES_PER_LAT = 69.0;

export function project(p: LatLng) {
  return {
    x: VIEW / 2 + (p.lng - VIEW_CENTER.lng) * MILES_PER_LNG * PX_PER_MILE,
    y: VIEW / 2 - (p.lat - VIEW_CENTER.lat) * MILES_PER_LAT * PX_PER_MILE,
  };
}

export const milesToPx = (miles: number) => miles * PX_PER_MILE;
