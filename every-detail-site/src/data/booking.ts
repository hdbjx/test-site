import type { ServiceId, VehicleId } from "./services";

/**
 * Where every "Book" button goes.
 *
 * bookingLinks.sedan.premium, bookingLinks.smallSUV.factoryReset, etc.
 *
 * null  → the on-site booking request at /book?vehicle=…&service=… (default).
 * "https://…" → send that exact vehicle/service straight to an external scheduler
 *               (e.g. the Every Detail app once real-time booking is live).
 *
 * The site is fully off Wix, so none of the old Wix Bookings URLs are used.
 */
export const bookingLinks: Record<VehicleId, Record<ServiceId, string | null>> = {
  sedan: { maintenance: null, premium: null, factoryReset: null },
  smallSUV: { maintenance: null, premium: null, factoryReset: null },
  smallTruck: { maintenance: null, premium: null, factoryReset: null },
  largeSUV: { maintenance: null, premium: null, factoryReset: null },
  minivan: { maintenance: null, premium: null, factoryReset: null },
  largeTruck: { maintenance: null, premium: null, factoryReset: null },
};

/** Old Wix Bookings category IDs → vehicle, used by the /book-online redirects. */
export const legacyWixCategories: Record<string, VehicleId> = {
  "d7da9e57-5142-4414-b522-b18ae5567c8f": "sedan",
  "0d950453-04e5-41f0-9a77-207f68aeb88e": "smallSUV",
  "068924d0-1a44-4e53-bacd-7c80708a8af5": "smallTruck",
  "a405940f-2474-43a6-a68a-bfc5c54c894e": "largeSUV",
  "6f209b5f-75cc-41a1-bfe2-dcc3efdaa44e": "minivan",
  "5ccd2b7d-d8a4-42b5-a572-0a4b64f528d3": "largeTruck",
};

export function bookingHref(vehicle?: VehicleId, service?: ServiceId): string {
  if (vehicle && service) {
    const external = bookingLinks[vehicle][service];
    if (external) return external;
  }
  const q = new URLSearchParams();
  if (vehicle) q.set("vehicle", vehicle);
  if (service) q.set("service", service);
  const qs = q.toString();
  return qs ? `/book?${qs}` : "/book";
}
