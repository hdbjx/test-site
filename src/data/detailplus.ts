/**
 * Detail+ recurring membership. Pulled from the current Detail+ page.
 * Pricing is a custom flat rate quoted per plan, so no prices are published.
 */

export const frequencies = [
  { id: "biweekly", label: "Every 2 weeks" },
  { id: "monthly", label: "Monthly" },
  { id: "6weeks", label: "Every 6 weeks" },
  { id: "bimonthly", label: "Every 2 months" },
  { id: "quarterly", label: "Quarterly" },
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
  { title: "Build your plan", body: "Pick how often and what gets cleaned: interior, exterior, or both." },
  { title: "Get your flat rate", body: "We quote a price for your car and plan. That's what you pay every visit." },
  { title: "We keep it clean", body: "Visits land on your schedule with a reminder beforehand. You don't have to think about it." },
];

export const detailPlusGuarantee = "If it's in your plan, it's covered.";
