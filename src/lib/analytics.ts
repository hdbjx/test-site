/**
 * Analytics events. GA4 loads only when NEXT_PUBLIC_GA_ID is set (see components/Analytics.tsx).
 * Every conversion in the site calls track() with one of these names — mark the
 * ones you care about as key events in GA4 (Admin → Events).
 */

export type EventName =
  | "book_click"
  | "vehicle_select"
  | "service_select"
  | "booking_add_vehicle"
  | "booking_submit"
  | "quote_start"
  | "quote_submit"
  | "phone_click"
  | "detailplus_start"
  | "detailplus_submit"
  | "paint_inquiry";

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
