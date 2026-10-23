import { PRICING, services, type ServiceId, type VehicleId } from "./services";
import { PAINT_PRICING, paintServices, type PaintServiceId } from "./paint";

export type CatalogServiceId = ServiceId | PaintServiceId | "detailplus";
export type CatalogCategory = "Detail" | "Paint Care" | "Recurring";

export type CatalogService = {
  id: CatalogServiceId;
  name: string;
  category: CatalogCategory;
  categoryLabel: string;
  short: string;
  bestFor: string;
  href: string;
  compare: {
    goal: string;
    interior: string;
    exterior: string;
    correction: string;
    protection: string;
    cadence: string;
  };
};

const paint = Object.fromEntries(paintServices.map((service) => [service.id, service])) as Record<PaintServiceId, (typeof paintServices)[number]>;

export const catalogServices: CatalogService[] = [
  {
    id: "maintenance",
    name: services.maintenance.name,
    category: "Detail",
    categoryLabel: "DETAIL / ROUTINE",
    short: "Keep a clean car clean.",
    bestFor: services.maintenance.whoFor,
    href: "/book?service=maintenance",
    compare: {
      goal: "Routine inside-and-out upkeep",
      interior: "Vacuum + maintenance wipe-down",
      exterior: "Hand wash, wheels + windows",
      correction: "Not included",
      protection: "Maintenance-focused finish care",
      cadence: "Best every 3–4 weeks",
    },
  },
  {
    id: "premium",
    name: services.premium.name,
    category: "Detail",
    categoryLabel: "DETAIL / MOST BOOKED",
    short: "Bring the whole car back.",
    bestFor: services.premium.whoFor,
    href: "/book?service=premium",
    compare: {
      goal: "Full inside-and-out detail",
      interior: "Full interior deep clean",
      exterior: "Hand wash + spray sealant",
      correction: "Not included",
      protection: "Spray sealant included",
      cadence: "Best every 6–8 weeks",
    },
  },
  {
    id: "factoryReset",
    name: services.factoryReset.name,
    category: "Detail",
    categoryLabel: "DETAIL / DEEPEST CLEAN",
    short: "Reset a heavily used car.",
    bestFor: services.factoryReset.whoFor,
    href: "/book?service=factoryReset",
    compare: {
      goal: "Deep restoration-level cleaning",
      interior: "Deep clean + carpet/upholstery extraction",
      exterior: "Wash + paint decontamination + clay",
      correction: "Not included",
      protection: "Detail finish, paint correction separate",
      cadence: "Usually once or twice a year",
    },
  },
  {
    id: "enhancement",
    name: paint.enhancement.name,
    category: "Paint Care",
    categoryLabel: "PAINT CARE / ENHANCE",
    short: "Restore gloss and reduce light defects.",
    bestFor: paint.enhancement.bestFor,
    href: "/paint-correction#paint-options",
    compare: {
      goal: "Restore gloss + reduce light haze/swirl marks",
      interior: "Not included",
      exterior: "Wash + full decontamination + machine polish",
      correction: "Single-stage enhancement polish",
      protection: "Ceramic coating not included",
      cadence: "As needed based on paint condition",
    },
  },
  {
    id: "correction",
    name: paint.correction.name,
    category: "Paint Care",
    categoryLabel: "PAINT CARE / CORRECT",
    short: "Correct visible swirls, haze and defects.",
    bestFor: paint.correction.bestFor,
    href: "/paint-correction#paint-options",
    compare: {
      goal: "Significant paint defect removal",
      interior: "Not included",
      exterior: "Wash + decontamination + multi-stage correction",
      correction: "Multi-stage compound + polish",
      protection: "Ceramic coating separate unless selected",
      cadence: "Condition-based, not routine maintenance",
    },
  },
  {
    id: "ceramic2yr",
    name: paint.ceramic2yr.name,
    category: "Paint Care",
    categoryLabel: "PAINT CARE / PROTECT",
    short: "Correct the finish, then protect it.",
    bestFor: paint.ceramic2yr.bestFor,
    href: "/ceramic#ceramic-price",
    compare: {
      goal: "Correction + long-term paint protection",
      interior: "Not included",
      exterior: "Decontamination + correction + coating prep",
      correction: "Paint correction included",
      protection: "Professional 2-year ceramic coating",
      cadence: "One-time service + proper maintenance",
    },
  },
  {
    id: "detailplus",
    name: "Detail+",
    category: "Recurring",
    categoryLabel: "RECURRING / SERVICE CLUB",
    short: "Keep the car on a clean cycle.",
    bestFor: "Cars that are already in good shape and should stay that way without waiting for another reset.",
    href: "/detailplus#club-builder",
    compare: {
      goal: "Scheduled recurring upkeep",
      interior: "Recurring interior maintenance",
      exterior: "Recurring exterior maintenance",
      correction: "Not included",
      protection: "Maintenance-focused, not a correction service",
      cadence: "Choose 1–13 week intervals",
    },
  },
];

export function catalogService(id: CatalogServiceId) {
  return catalogServices.find((service) => service.id === id)!;
}

export function catalogPrice(id: CatalogServiceId, vehicle: VehicleId): number | null {
  if (id === "detailplus") return null;
  if (id === "enhancement" || id === "correction" || id === "ceramic2yr") {
    return PAINT_PRICING[vehicle][id];
  }
  return PRICING[vehicle][id].price;
}

export function catalogStartingPrice(id: CatalogServiceId): number | null {
  if (id === "detailplus") return null;
  const vehicleIds: VehicleId[] = ["sedan", "smallSUV", "smallTruck", "largeSUV", "minivan", "largeTruck"];
  return Math.min(...vehicleIds.map((vehicle) => catalogPrice(id, vehicle)!).filter((price) => price != null));
}
