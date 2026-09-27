/**
 * Vehicles, detailing services and the price grid.
 * Prices and durations copied from the live Wix Bookings catalog (Sept 2026).
 * Change a price in PRICING and it updates on every page.
 */

export const vehicles = [
  { id: "sedan", label: "Sedan", hint: "Cars and coupes" },
  { id: "smallSUV", label: "Small SUV", hint: "Two-row SUVs and crossovers" },
  { id: "smallTruck", label: "Small Truck", hint: "Midsize pickups" },
  { id: "largeSUV", label: "Large SUV", hint: "Three-row SUVs" },
  { id: "minivan", label: "Minivan", hint: "Seven and eight seaters" },
  { id: "largeTruck", label: "Large Truck", hint: "Full-size pickups" },
] as const;

export type VehicleId = (typeof vehicles)[number]["id"];

export const serviceIds = ["maintenance", "premium", "factoryReset"] as const;
export type ServiceId = (typeof serviceIds)[number];

export type Service = {
  id: ServiceId;
  name: string;
  slug: string; // anchor on /our-services
  short: string; // three-word positioning line
  summary: string;
  whoFor: string;
  includes: string[];
  cadence: string;
  crew: number; // technicians needed on the job (used for live availability)
  recommended?: boolean;
};

export const services: Record<ServiceId, Service> = {
  maintenance: {
    id: "maintenance",
    name: "Maintenance Detail",
    slug: "maintenance-detail",
    short: "Keep it clean.",
    summary:
      "A thorough inside-and-out refresh for cars that are already in good shape. It's what keeps a clean car from sliding back.",
    whoFor: "Cars that are detailed regularly, or kept clean between deeper services.",
    includes: [
      "Exterior hand wash and dry",
      "Interior vacuum and wipe-down",
      "Windows and wheels cleaned",
    ],
    cadence: "Works best every 3–4 weeks",
    crew: 1,
  },
  premium: {
    id: "premium",
    name: "Premium Detail",
    slug: "premium-detail",
    short: "Bring it back.",
    summary:
      "Our most booked service. A full interior deep clean plus paint protection, so the whole car looks and feels taken care of again.",
    whoFor: "Most first-time clients, and anyone whose car hasn't been professionally detailed in a while.",
    includes: [
      "Everything in Maintenance",
      "Full interior deep clean",
      "Spray sealant paint protection",
      "Trim, leather and surface conditioning",
    ],
    cadence: "Works best every 6–8 weeks",
    crew: 2,
    recommended: true,
  },
  factoryReset: {
    id: "factoryReset",
    name: "Factory Reset",
    slug: "factory-reset",
    short: "Start over.",
    summary:
      "Our deepest clean, for cars that need more than a detail. Extraction, decontamination and time spent in every seam and vent.",
    whoFor: "Heavily used or neglected vehicles: kids, pets, spills, stains, odor, or years of buildup.",
    includes: [
      "Everything in Premium",
      "Carpet and upholstery extraction",
      "Paint decontamination and clay",
      "Every crevice, seam and vent",
    ],
    cadence: "Once or twice a year",
    crew: 2,
  },
};

/** Price in USD and duration in minutes, per vehicle, per service. */
export const PRICING: Record<VehicleId, Record<ServiceId, { price: number; minutes: number }>> = {
  sedan: {
    maintenance: { price: 150, minutes: 120 },
    premium: { price: 260, minutes: 150 },
    factoryReset: { price: 400, minutes: 240 },
  },
  smallSUV: {
    maintenance: { price: 170, minutes: 135 },
    premium: { price: 275, minutes: 160 },
    factoryReset: { price: 425, minutes: 240 },
  },
  smallTruck: {
    maintenance: { price: 180, minutes: 135 },
    premium: { price: 285, minutes: 165 },
    factoryReset: { price: 440, minutes: 240 },
  },
  largeSUV: {
    maintenance: { price: 190, minutes: 150 },
    premium: { price: 300, minutes: 180 },
    factoryReset: { price: 470, minutes: 240 },
  },
  minivan: {
    maintenance: { price: 200, minutes: 180 },
    premium: { price: 320, minutes: 195 },
    factoryReset: { price: 490, minutes: 240 },
  },
  largeTruck: {
    maintenance: { price: 210, minutes: 180 },
    premium: { price: 330, minutes: 180 },
    factoryReset: { price: 500, minutes: 240 },
  },
};

export const serviceList = serviceIds.map((id) => services[id]);

export function startingPrice(id: ServiceId) {
  return Math.min(...vehicles.map((v) => PRICING[v.id][id].price));
}

export function isVehicleId(v: unknown): v is VehicleId {
  return typeof v === "string" && vehicles.some((x) => x.id === v);
}
export function isServiceId(s: unknown): s is ServiceId {
  return typeof s === "string" && (serviceIds as readonly string[]).includes(s);
}

/** Map a stored vehicle_size (label or id, any case) back to a VehicleId. */
export function vehicleIdFromSize(size: string | null | undefined): VehicleId | undefined {
  if (!size) return undefined;
  const k = size.trim().toLowerCase().replace(/[^a-z]/g, "");
  return vehicles.find((v) => v.id.toLowerCase() === k || v.label.toLowerCase().replace(/[^a-z]/g, "") === k)?.id;
}

export const vehicleLabel = (id: VehicleId) => vehicles.find((v) => v.id === id)!.label;
