/**
 * Image registry. Every photo on the site is referenced by id.
 *
 * `file`  → path under /public. Run `npm run images:pull` once to download the
 *           originals from the old Wix media library into /public/images.
 * `wix`   → Wix media id the pull script downloads from (can be removed after migration).
 * `alt`   → describe what's in the photo. Items marked `altReview: true` have a
 *           generic alt because the photo couldn't be inspected — replace with a
 *           specific description (vehicle, what was done, where).
 * `w`,`h` → aspect ratio only (used to reserve space and prevent layout shift).
 *
 * To add a photo: drop it in /public/images, add an entry here, use its id.
 */

export type ImageCategory =
  | "hero"
  | "work"
  | "team"
  | "exterior"
  | "interior"
  | "before-after"
  | "paint"
  | "ceramic"
  | "rig"
  | "local"
  | "brand";

export type SiteImage = {
  id: string;
  file: string;
  wix?: string;
  alt: string;
  w: number;
  h: number;
  category: ImageCategory;
  altReview?: boolean;
};

export const images: SiteImage[] = [
  // Homepage hero is intentionally locked to _DSC0553 from the original photo set.
  { id: "hero", file: "/images/hero.jpg", alt: "Red Volvo being foam washed by Every Detail in a residential driveway", w: 3, h: 2, category: "hero" },

  // Curated work. Only the strongest, most distinct frames from both photo sets are used.
  { id: "work-01", file: "/images/black-truck-finished.jpg", alt: "Finished black truck after an Every Detail mobile detail", w: 2, h: 3, category: "exterior" },
  { id: "work-02", file: "/images/foam-wash.jpg", alt: "Every Detail technician foam washing a black SUV in a residential driveway", w: 2, h: 3, category: "work" },
  { id: "work-03", file: "/images/interior-detail.jpg", alt: "Every Detail technician detailing the front interior of a vehicle", w: 2, h: 3, category: "interior" },
  { id: "work-04", file: "/images/red-audi-finished.jpg", alt: "Finished red Audi after an Every Detail service", w: 2, h: 3, category: "exterior" },
  { id: "work-05", file: "/images/finished-sedan-rig.jpg", alt: "Finished sedan beside the Every Detail mobile rig", w: 3, h: 2, category: "exterior" },
  { id: "work-06", file: "/images/exterior-hand-wash.jpg", alt: "Every Detail technician hand washing a black SUV", w: 2, h: 3, category: "work" },
  { id: "work-07", file: "/images/wheel-detail-team.jpg", alt: "Two Every Detail technicians working together on a vehicle exterior", w: 2, h: 3, category: "team" },
  { id: "work-08", file: "/images/clean-interior.jpg", alt: "Clean vehicle interior after detailing", w: 3, h: 2, category: "interior" },

  // Team and operations.
  { id: "about-team", file: "/images/full-team.jpg", alt: "Every Detail team gathered with the company mobile detailing rigs", w: 3, h: 2, category: "team" },
  { id: "about-founder", file: "/images/team-tablet.jpg", alt: "Every Detail team member managing a job on site", w: 2, h: 3, category: "team" },
  { id: "team-01", file: "/images/full-team.jpg", alt: "Every Detail team gathered with the company mobile detailing rigs", w: 3, h: 2, category: "team" },
  { id: "rig-01", file: "/images/organized-rig.jpg", alt: "Every Detail technicians accessing equipment in the organized mobile detailing rig", w: 2, h: 3, category: "rig" },
  { id: "rig-02", file: "/images/rig-access.jpg", alt: "Every Detail technician working from the mobile detailing rig", w: 2, h: 3, category: "rig" },
  { id: "rig-03", file: "/images/branded-trailer-van.jpg", alt: "Every Detail branded van and detailing trailer", w: 3, h: 2, category: "rig" },

  // Paint and ceramic imagery.
  { id: "paint-01", file: "/images/mercedes-paint.jpg", alt: "Water beading on glossy black Mercedes paint", w: 2, h: 3, category: "paint" },
  { id: "paint-02", file: "/images/red-paint-detail.jpg", alt: "Glossy red paint finish after detailing", w: 2, h: 3, category: "paint" },
  { id: "paint-03", file: "/images/classic-red-car.jpg", alt: "Glossy red classic car finish", w: 2, h: 3, category: "paint" },
];

/**
 * Before/after pairs for the sliders. Leave empty until real pairs exist —
 * the slider only renders when there's at least one pair.
 * Shoot both frames from the same angle, same framing, same light if possible.
 */
export const beforeAfterPairs: { id: string; before: string; after: string; caption: string; category: "interior" | "exterior" | "paint" }[] = [
  // { id: "minivan-seats", before: "ba-minivan-before", after: "ba-minivan-after", caption: "Minivan second row, Factory Reset", category: "interior" },
];

export const imageById = (id: string) => {
  const img = images.find((i) => i.id === id);
  if (!img) throw new Error(`Unknown image id: ${id}`);
  return img;
};

export const imagesIn = (...cats: ImageCategory[]) => images.filter((i) => cats.includes(i.category));

/** Logo files (downloaded by `npm run images:pull`). */
export const logo = {
  mark: { file: "/brand/every-detail-mark.png", w: 520, h: 424 },
  full: { file: "/brand/every-detail-logo.png", w: 420, h: 500 },
};
