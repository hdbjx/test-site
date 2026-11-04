import { PRICING, services, serviceIds, vehicles, type ServiceId, type VehicleId } from "@/data/services";
import { ADDON_INCLUDED_IN, ADDON_LABELS, ADDON_NOT_OFFERED_WITH, ADDON_PRICES, PAINT_UPGRADES, addonIds, type AddonId } from "@/data/quoteExtras";
import { PAINT_PRICING, paintServices, type PaintServiceId } from "@/data/paint";
import { site } from "@/data/site";
import { TIERS } from "@/data/coverage";
import { GIFT_CARD_PRESETS } from "@/data/giftCards";
import { setEmailCopy, setReviewUrl, type EmailCopyOverride, type EmailKind } from "@/lib/email-copy";

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
  /** Company settings from Team HQ → Settings (company_settings_public()). */
  settings?: CompanySettings | null;
};

export type CompanySettings = {
  contact?: { phone?: string; email?: string; reviewUrl?: string };
  announcement?: { enabled?: boolean; text?: string; linkText?: string; linkUrl?: string; endsOn?: string };
  gift_cards?: { presets?: number[] };
  emails?: Partial<Record<EmailKind, EmailCopyOverride>>;
  payment_methods?: string[];
  service_area?: { core?: number; route?: number; fee?: number; premium?: number };
  updatedAt?: string | null;
};

let settingsAppliedAt: string | null = null;

/** Copy live company settings over src/data/site.ts and the service-area tiers. */
export function applySettings(settings: CompanySettings | null | undefined) {
  if (!settings) return;
  if (settings.updatedAt && settings.updatedAt === settingsAppliedAt) return;

  const phone = settings.contact?.phone?.trim();
  const digits = phone?.replace(/\D/g, "") ?? "";
  if (phone && (digits.length === 10 || (digits.length === 11 && digits.startsWith("1")))) {
    const e164 = `+1${digits.slice(-10)}`;
    site.phone.display = phone;
    site.phone.href = `tel:${e164}`;
    site.phone.sms = `sms:${e164}`;
  }
  const email = settings.contact?.email?.trim();
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) site.email = email;

  const methods = (settings.payment_methods ?? []).map((m) => String(m).trim()).filter(Boolean);
  if (methods.length) site.paymentMethods.splice(0, site.paymentMethods.length, ...methods);

  const reviewUrl = settings.contact?.reviewUrl?.trim();
  if (reviewUrl && /^https:\/\//.test(reviewUrl)) site.reviews.googleUrl = reviewUrl;
  setReviewUrl(reviewUrl);

  const a = settings.announcement;
  site.announcement = a?.enabled && a.text?.trim()
    ? { text: a.text.trim(), linkText: a.linkText?.trim() || undefined, linkUrl: a.linkUrl?.trim() || undefined, endsOn: a.endsOn || undefined }
    : null;

  const presets = (settings.gift_cards?.presets ?? []).map(Number).filter((n) => Number.isInteger(n) && n >= 25 && n <= 2000);
  if (presets.length) GIFT_CARD_PRESETS.splice(0, GIFT_CARD_PRESETS.length, ...presets);

  setEmailCopy(settings.emails);

  for (const tier of TIERS) {
    if (tier.zone === "exception") continue;
    const minutes = Number(settings.service_area?.[tier.zone]);
    if (Number.isFinite(minutes) && minutes > 0) tier.maxMinutes = minutes;
  }
  settingsAppliedAt = settings.updatedAt ?? new Date().toISOString();
}

const PAINT_IDS: PaintServiceId[] = ["enhancement", "correction", "ceramic2yr"];
const isVehicle = (v: string): v is VehicleId => vehicles.some((x) => x.id === v);
const isWebService = (s: string): s is ServiceId => (serviceIds as readonly string[]).includes(s);
const isWebAddon = (a: string): a is AddonId => (addonIds as readonly string[]).includes(a);

let appliedAt: string | null = null;

/** Copy live values over the site's catalog. Safe to call repeatedly. */
export function applyCatalog(data: LiveCatalog | null | undefined) {
  applySettings(data?.settings);
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
