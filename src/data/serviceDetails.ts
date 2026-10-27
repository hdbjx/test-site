import type { ServiceId } from "./services";

/**
 * Full "what's included" checklists for the services detail popup on /our-services.
 * Inclusions follow the booking data (services.ts + quoteExtras.ts); process wording
 * comes from the Every Detail recommender/handbook copy. Add-on prices are pulled live
 * from quoteExtras.ts, so they never drift from booking.
 */

export type ServiceDetail = {
  intro: string;
  exterior: string[];
  interior: string[];
  finish: string;
};

export const serviceDetails: Record<ServiceId, ServiceDetail> = {
  maintenance: {
    intro: "Upkeep for a car that's already in good shape: a full inside-and-out refresh so it never slides back into needing a reset.",
    exterior: [
      "Hand wash and dry",
      "Wheels and tires cleaned",
      "Exterior windows cleaned",
      "Bead Maker spray protection to finish",
    ],
    interior: [
      "Vacuum of seats, carpets and floor mats",
      "Wipe-down of dash, console and door panels",
      "Interior windows cleaned",
    ],
    finish: "Bead Maker spray protection. Upgrade to our protective sealant when you book.",
  },
  premium: {
    intro: "The full inside-and-out detail most first-time clients need. More technician time means more depth and fewer untouched areas.",
    exterior: [
      "Two-bucket contact hand wash and dry",
      "Wheels and tires cleaned",
      "Door jambs wiped down",
      "Exterior windows cleaned",
      "Protective spray sealant in place of Bead Maker",
    ],
    interior: [
      "Multi-pass vacuum with drill-brush agitation on floor mats",
      "All-purpose cleaner on every interior panel",
      "Seats, mats, dash, console, doors and cupholders cleaned",
      "Trim and tight areas worked through by hand",
      "Interior windows cleaned",
    ],
    finish: "Protective spray sealant, included.",
  },
  factoryReset: {
    intro: "Our deepest clean, for cars that need more than a detail. It includes nearly every add-on we offer, so there's nothing to stack on top.",
    exterior: [
      "Green Star pre-wash, then a two-bucket contact hand wash",
      "Paint decontamination and clay bar",
      "Trim and plastic restoration",
      "Wheels, tires, door jambs and windows",
      "Protective spray sealant",
    ],
    interior: [
      "Hot water extraction on carpets and floor mats",
      "Hot water extraction on cloth seats",
      "Pet hair removal",
      "Stain treatment on fabric surfaces",
      "All-purpose cleaner and drill-brush agitation on every panel",
      "Every crevice, seam and vent",
    ],
    finish: "Protective spray sealant, included.",
  },
};
