import type { VehicleId } from "./services";

export const addonIds = [
  "Sealant",
  "Pet Hair Removal",
  "Clay Bar",
  "Plastic Restoration",
  "Headlight Restoration",
  "Engine Bay",
  "Carpet Extraction",
  "Seat Extraction",
  "Odor Removal",
] as const;
export type AddonId = (typeof addonIds)[number];

export const ADDON_PRICES: Record<AddonId, number | null> = {
  Sealant: 60,
  "Pet Hair Removal": 40,
  "Clay Bar": 95,
  "Plastic Restoration": 40,
  "Headlight Restoration": 70,
  "Engine Bay": 70,
  "Carpet Extraction": 90,
  "Seat Extraction": 60,
  "Odor Removal": 60,
};

export const ADDON_LABELS: Record<AddonId, string> = {
  Sealant: "Protective Sealant",
  "Pet Hair Removal": "Pet Hair Removal",
  "Clay Bar": "Clay Bar Decontamination",
  "Plastic Restoration": "Trim & Plastic Restoration",
  "Headlight Restoration": "Headlight Restoration",
  "Engine Bay": "Engine Bay",
  "Carpet Extraction": "Floor Carpet Extraction",
  "Seat Extraction": "Seat Extraction",
  "Odor Removal": "Odor Removal",
};

export const paintUpgradeIds = ["polish", "ceramic"] as const;
export type PaintUpgradeId = (typeof paintUpgradeIds)[number];

export const PAINT_UPGRADES: Record<PaintUpgradeId, { name: string; tag: string; why: string; prices: Record<VehicleId, number> }> = {
  polish: {
    name: "Enhancement Polish",
    tag: "Paint correction",
    why: "A single-stage machine polish removes light swirl marks and water spot etching, restoring gloss and optical clarity. Scheduled as a separate appointment after your detail.",
    prices: { sedan: 395, smallSUV: 445, smallTruck: 445, largeSUV: 525, largeTruck: 525, minivan: 495 },
  },
  ceramic: {
    name: "2-Year Ceramic Coating",
    tag: "Long-term protection",
    why: "A nano-ceramic coating bonds to the clear coat to create a durable hydrophobic layer rated for two years. It pairs with the Enhancement Polish for maximum results.",
    prices: { sedan: 895, smallSUV: 995, smallTruck: 995, largeSUV: 1095, largeTruck: 1095, minivan: 1020 },
  },
};

export function isAddonId(value: unknown): value is AddonId {
  return typeof value === "string" && (addonIds as readonly string[]).includes(value);
}

export function isPaintUpgradeId(value: unknown): value is PaintUpgradeId {
  return typeof value === "string" && (paintUpgradeIds as readonly string[]).includes(value);
}
