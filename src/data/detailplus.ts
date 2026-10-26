/**
 * Detail+ recurring membership.
 * Member rates are custom per vehicle, cadence, and coverage.
 */

export const frequencies = [
  { id: "biweekly", label: "Every 2 weeks", hint: "Highest-frequency care", weeks: 2 },
  { id: "monthly", label: "Every 4 weeks", hint: "Most popular rhythm", weeks: 4 },
  { id: "6weeks", label: "Every 6 weeks", hint: "Lower-frequency upkeep", weeks: 6 },
  { id: "custom", label: "Custom rhythm", hint: "Choose 1 to 13 weeks", weeks: null },
] as const;

export const coverages = [
  { id: "full", label: "Inside and out" },
  { id: "interior", label: "Interior only" },
  { id: "exterior", label: "Exterior only" },
] as const;

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
