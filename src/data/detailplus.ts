import type { VehicleId } from "@/data/services";

/**
 * Detail+ price sheet. Edit numbers here and the plan builder, the server
 * check and the emails all follow.
 *
 * Tasks are priced per vehicle (sedan, smallSUV, smallTruck, largeSUV, minivan, largeTruck).
 * The "maintenance", "premium" and "reset" groups are the three packages split into their parts,
 * so ticking a whole group lands on the same price as booking that package.
 * Tasks marked extra are not in any package yet: confirm the prices before launch.
 */
export type DetailPlusTaskGroup = "exterior" | "interior" | "reset" | "extras";

export type DetailPlusTask = {
  id: string;
  label: string;
  note: string;
  group: DetailPlusTaskGroup;
  /** Prices in USD for: sedan, smallSUV, smallTruck, largeSUV, minivan, largeTruck. */
  prices: [number, number, number, number, number, number];
};

export const detailPlusVehicleOrder: VehicleId[] = ["sedan", "smallSUV", "smallTruck", "largeSUV", "minivan", "largeTruck"];

export const detailPlusTasks: DetailPlusTask[] = [
  { id: "wash", label: "Hand wash and dry", note: "Full exterior wash, hand dried.", group: "exterior", prices: [50, 57, 60, 63, 67, 70] },
  { id: "wheels", label: "Wheels and tires", note: "Wheels, tires and wheel wells cleaned.", group: "exterior", prices: [25, 28, 30, 32, 33, 35] },
  { id: "windows", label: "Windows", note: "Inside and outside glass.", group: "exterior", prices: [20, 23, 24, 25, 27, 28] },
  { id: "sealant", label: "Spray sealant protection", note: "Paint protection that keeps the shine and makes the next wash easier.", group: "exterior", prices: [40, 39, 39, 40, 44, 44] },
  { id: "jambs", label: "Door jambs", note: "Jambs and sills wiped clean. Extra: confirm price.", group: "extras", prices: [15, 15, 20, 20, 20, 20] },
  { id: "vacuum", label: "Interior vacuum", note: "Seats, carpets and floors.", group: "interior", prices: [30, 34, 36, 38, 40, 42] },
  { id: "wipe", label: "Interior wipe-down", note: "Dash, console and door panels wiped.", group: "interior", prices: [25, 28, 30, 32, 33, 35] },
  { id: "seats", label: "Seat and upholstery clean", note: "Deeper clean of seats and upholstery.", group: "interior", prices: [35, 33, 33, 35, 38, 38] },
  { id: "mats", label: "Floor mats", note: "Mats pulled out and cleaned.", group: "interior", prices: [15, 14, 14, 15, 16, 16] },
  { id: "deepdash", label: "Dash, console and cupholder detail", note: "Detail brushwork on dash, console, doors and cupholders.", group: "interior", prices: [20, 19, 19, 20, 22, 22] },
  { id: "trunk", label: "Trunk and cargo area", note: "Vacuumed and wiped. Extra: confirm price.", group: "extras", prices: [15, 15, 20, 20, 20, 20] },
  { id: "petHair", label: "Pet hair removal", note: "Extra time on embedded hair. Extra: confirm price.", group: "extras", prices: [30, 35, 35, 40, 40, 40] },
  { id: "extract", label: "Carpet and upholstery extraction", note: "Hot-water extraction for stains and buildup.", group: "reset", prices: [60, 64, 66, 73, 73, 73] },
  { id: "clay", label: "Paint decontamination and clay", note: "Removes bonded grime the wash leaves behind.", group: "reset", prices: [50, 54, 55, 61, 61, 61] },
  { id: "crevices", label: "Every crevice, seam and vent", note: "The slow, detailed work.", group: "reset", prices: [30, 32, 34, 36, 36, 36] },
];

export const detailPlusGroups: { id: DetailPlusTaskGroup; label: string }[] = [
  { id: "exterior", label: "Exterior" },
  { id: "interior", label: "Interior" },
  { id: "reset", label: "Deep clean" },
  { id: "extras", label: "Extras" },
];

/** One-tap starting points for the task checklist. */
export const detailPlusPresets = [
  { id: "maintenance", label: "Maintenance set", tasks: ["wash", "wheels", "windows", "vacuum", "wipe"] },
  { id: "premium", label: "Premium set", tasks: ["wash", "wheels", "windows", "vacuum", "wipe", "seats", "mats", "deepdash", "sealant"] },
  { id: "inside", label: "Inside only", tasks: ["vacuum", "wipe", "seats", "mats", "deepdash", "windows"] },
  { id: "outside", label: "Outside only", tasks: ["wash", "wheels", "windows", "sealant"] },
] as const;

/** Lowest price for any one visit. Covers travel and setup. */
export const detailPlusMinimum = 100;

/**
 * Weekly through every three months. discount is the share taken off the visit total:
 * cars visited more often arrive cleaner, so the visit takes less work.
 */
export const frequencies = [
  { id: "weekly", label: "Every week", short: "Weekly", weeks: 1, discount: 0.2, hint: "Always fresh" },
  { id: "biweekly", label: "Every 2 weeks", short: "2 weeks", weeks: 2, discount: 0.15, hint: "Highest-frequency care" },
  { id: "3weeks", label: "Every 3 weeks", short: "3 weeks", weeks: 3, discount: 0.12, hint: "Steady upkeep" },
  { id: "monthly", label: "Every 4 weeks", short: "Monthly", weeks: 4, discount: 0.1, hint: "Most popular rhythm" },
  { id: "6weeks", label: "Every 6 weeks", short: "6 weeks", weeks: 6, discount: 0.07, hint: "Lower-frequency upkeep" },
  { id: "2months", label: "Every 2 months", short: "2 months", weeks: 8, discount: 0.05, hint: "Seasonal reset" },
  { id: "quarterly", label: "Every 3 months", short: "3 months", weeks: 13, discount: 0.03, hint: "Quarterly refresh" },
] as const;

export type DetailPlusFrequencyId = (typeof frequencies)[number]["id"];

export const detailPlusBenefits = [
  {
    title: "One flat rate, every visit",
    body: "Your price is set when you join and stays the same visit to visit, whatever the car looks like that day.",
  },
  {
    title: "Extra messes are covered",
    body: "A spill, a muddy week, a dog that shed everywhere. If it's in your plan, we handle it on that visit with no add-on charge.",
  },
  {
    title: "Scheduling runs itself",
    body: "Visits recur on your schedule and you get a reminder before each one. No texting back and forth to rebook.",
  },
  {
    title: "No contracts",
    body: "Change your frequency, pause, or cancel whenever you need to.",
  },
  {
    title: "The same trained crew",
    body: "Every visit is done by Every Detail's own trained technicians.",
  },
];

export const detailPlusSteps = [
  { title: "Choose your rhythm", body: "Pick a cadence from weekly to quarterly and choose what gets cleaned." },
  { title: "Get your flat rate", body: "We quote a price for your car and plan. That's what you pay every visit." },
  { title: "Stay on the schedule", body: "Visits recur with a reminder beforehand, so the car gets handled before it falls behind." },
];

export const detailPlusGuarantee = "Your visit follows the plan you chose, so included messes do not turn into surprise add-on charges.";
