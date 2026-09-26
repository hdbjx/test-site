/**
 * Paint correction + ceramic coating. Prices from the current Every Detail
 * ceramic page (Sept 2026). All are "starting at" — final price after inspection.
 */

export type PaintService = {
  id: "enhancement" | "correction" | "ceramic2yr";
  name: string;
  startingAt: number;
  summary: string;
  bestFor: string;
  includes: string[];
};

export const paintServices: PaintService[] = [
  {
    id: "enhancement",
    name: "Enhancement Polish",
    startingAt: 395,
    summary: "A single-stage polish that brings back gloss and cuts down light swirls and haze.",
    bestFor: "Newer paint, or paint in decent shape that has lost its shine.",
    includes: ["Wash and full decontamination", "Single-stage machine polish", "Noticeable gloss improvement"],
  },
  {
    id: "correction",
    name: "Full Paint Correction",
    startingAt: 695,
    summary: "Multi-stage correction for visible swirls, scratches and neglected paint.",
    bestFor: "Paint with obvious swirl marks in sunlight, wash marring, or oxidation.",
    includes: [
      "Wash and full decontamination",
      "Multi-stage compound and polish",
      "Significant defect removal and a deep, even gloss",
    ],
  },
  {
    id: "ceramic2yr",
    name: "2-Year Ceramic Coating",
    startingAt: 895,
    summary:
      "Paint correction and a professional two-year coating in one package, plus a free follow-up detail after it cures.",
    bestFor: "Owners who want the paint corrected once and protected for the long run.",
    includes: [
      "Full decontamination",
      "Paint correction so the coating bonds to clean, refined paint",
      "Professional 2-year ceramic coating",
      "Free follow-up detail",
    ],
  },
];

export const paintDefects = [
  { name: "Swirl marks", detail: "The spider-web pattern you see around a light source, usually from washing and drying." },
  { name: "Light to moderate scratches", detail: "Marks that sit in the clear coat. Deep scratches through the clear can be improved, not always removed." },
  { name: "Oxidation and haze", detail: "Dull, cloudy paint from sun exposure." },
  { name: "Uneven or faded gloss", detail: "Paint that looks flat even right after a wash." },
];

export const ceramicDoes = [
  "Bonds to the clear coat and lasts years, not weeks like wax",
  "Adds protection against UV, oxidation and environmental fallout",
  "Makes paint slick and hydrophobic, so water beads and dirt releases more easily",
  "Keeps the gloss from the correction underneath it",
];

export const ceramicDoesNot = [
  "It does not make paint scratch-proof. Improper washing can still mar a coated car.",
  "It does not stop rock chips or door dings. That's paint protection film.",
  "It does not replace washing. It makes washing faster and easier.",
  "It does not fix defects. Whatever is under the coating gets locked in, which is why we correct first.",
];

export const paintProcess = [
  {
    title: "Inspect",
    body: "We look at the paint in person and tell you which service fits before any work starts.",
  },
  {
    title: "Wash and decontaminate",
    body: "A full wash and decontamination, including clay, so we're polishing clean paint instead of grinding dirt into it.",
  },
  {
    title: "Correct",
    body: "Machine polishing matched to the car: one stage for an enhancement, multiple stages for full correction.",
  },
  {
    title: "Coat",
    body: "For ceramic packages, the corrected paint is prepped and the coating is applied panel by panel.",
  },
  {
    title: "Cure and follow up",
    body: "A coating needs time to cure. We'll tell you how to care for it, then come back for the free follow-up detail.",
  },
];
