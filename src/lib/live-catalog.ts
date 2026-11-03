import { PRICING, services, serviceIds, vehicles, type ServiceId, type VehicleId } from "@/data/services";
import { ADDON_INCLUDED_IN, ADDON_LABELS, ADDON_NOT_OFFERED_WITH, ADDON_PRICES, PAINT_UPGRADES, addonIds, type AddonId } from "@/data/quoteExtras";
import { PAINT_PRICING, paintServices, type PaintServiceId } from "@/data/paint";

/**
 * The price catalog managers edit in Team HQ (Supabase: catalog_public()).
 * The site's data modules keep today's numbers as a fallback; this copies the
 * live values over them in place, so every page and the booking API price
 * from the same numbers without each file having to change.
 */
export type LiveCatalog = {
  services: { id: string; name: string; crew: number; active: boolean; prices: Record<string, { price: number | null; minutes: number }> }[];
  addons: { id: string; key: string; name: string; price: number | null; includedIn: string[]; notOfferedWith: string[]; active: boolean }[];
  updatedAt: string | null;
};

const PAINT_IDS: PaintServiceId[] = ["enhancement", "correction", "ceramic2yr"];
const isVehicle = (v: string): v is VehicleId => vehicles.some((x) => x.id === v);
const isWebService = (s: string): s is ServiceId => (serviceIds as readonly string[]).includes(s);
const isWebAddon = (a: string): a is AddonId => (addonIds as readonly string[]).includes(a);

let appliedAt: string | null = null;

/** Copy live values over the site's catalog. Safe to call repeatedly. */
export function applyCatalog(data: LiveCatalog | null | undefined) {
  if (!data?.services?.length) return;
  if (data.updatedAt && data.updatedAt === appliedAt) return;

  for (const s of data.services) {
    for (const [vehicle, row] of Object.entries(s.prices ?? {})) {
      if (!isVehicle(vehicle) || row?.price == null) continue;
      const price = Number(row.price);
      if (!Number.isFinite(price)) continue;
      if (isWebService(s.id)) {
        PRICING[vehicle][s.id] = { price, minutes: Number(row.minutes) || PRICING[vehicle][s.id].minutes };
      } else if ((PAINT_IDS as string[]).includes(s.id)) {
        PAINT_PRICING[vehicle][s.id as PaintServiceId] = price;
      }
    }
    if (isWebService(s.id) && Number(s.crew) > 0) services[s.id].crew = Number(s.crew);
  }

  // Paint add-on upgrades in the booking flow use the same prices as the paint services.
  for (const v of vehicles) {
    PAINT_UPGRADES.polish.prices[v.id] = PAINT_PRICING[v.id].enhancement;
    PAINT_UPGRADES.ceramic.prices[v.id] = PAINT_PRICING[v.id].ceramic2yr;
  }
  for (const p of paintServices) {
    p.startingAt = Math.min(...vehicles.map((v) => PAINT_PRICING[v.id][p.id]));
  }

  for (const a of data.addons ?? []) {
    if (!isWebAddon(a.id)) continue;
    ADDON_PRICES[a.id] = a.price == null ? null : Number(a.price);
    if (a.name) ADDON_LABELS[a.id] = a.name;
    ADDON_INCLUDED_IN[a.id] = (a.includedIn ?? []).filter(isWebService);
    ADDON_NOT_OFFERED_WITH[a.id] = [
      ...(a.notOfferedWith ?? []).filter(isWebService),
      // Turned off in Team HQ: not offered with anything.
      ...(a.active === false ? serviceIds : []),
    ];
  }
  appliedAt = data.updatedAt ?? new Date().toISOString();
}
