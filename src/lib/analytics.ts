/**
 * Analytics events. GA4 loads only when NEXT_PUBLIC_GA_ID is set (see components/Analytics.tsx).
 * Every conversion in the site calls track() with one of these names — mark the
 * ones you care about as key events in GA4 (Admin → Events).
 */

export type EventName =
  | "book_click" // any Book button: { location, vehicle?, service? }
  | "vehicle_select" // { vehicle, location }
  | "service_select" // { service, vehicle?, location }
  | "booking_submit" // booking request sent: { vehicle, service }
  | "booking_add_vehicle" // second vehicle added to a booking: { count }
  | "quote_start" // first interaction with the quote form
  | "quote_submit" // quote sent: { interest }
  | "phone_click" // { location }
  | "detailplus_start" // plan builder interaction
  | "detailplus_submit" // Detail+ request sent
  | "paint_inquiry"; // any paint/ceramic quote click or submit

type Params = Record<string, string | number | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function track(name: EventName, params: Params = {}) {
  if (typeof window === "undefined") return;
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined));
  if (window.gtag) window.gtag("event", name, clean);
  else if (process.env.NODE_ENV === "development") console.info("[track]", name, clean);
}
