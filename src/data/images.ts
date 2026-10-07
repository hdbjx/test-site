/**
 * Image registry. Every photo on the site is referenced by id.
 *
 * `file`  → path under /public.
 * `wix`   → legacy Wix media id, if still needed during migration.
 * `alt`   → accessible description of the image.
 * `w`,`h` → aspect ratio used to reserve space and prevent layout shift.
 *
 * To add a photo:
 * 1. Drop it in /public/images.
 * 2. Add an entry here.
 * 3. Reference it elsewhere on the site using its id.
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
  // ------------------------------------------------------------
  // HERO + BRAND
  // ------------------------------------------------------------

  // Homepage hero is intentionally locked to _DSC0553.
  {
    id: "hero",
    file: "/images/hero.jpg",
    alt: "Red Volvo being foam washed by Every Detail in a residential driveway",
    w: 3,
    h: 2,
    category: "hero",
  },

  // Default Open Graph / social sharing image.
  {
    id: "og-default",
    file: "/images/every-detail-social.png",
    alt: "Every Detail mobile car detailing in Decatur, Georgia",
    w: 1230,
    h: 630,
    category: "brand",
  },

  // ------------------------------------------------------------
  // CURATED WORK
  // ------------------------------------------------------------

  // Additional real-job photography added October 2026. Kept as individual
  // registry entries so pages can use the crop that best fits each photo.
  { id: "crew-shirt-van", file: "/images/crew-shirt-van.jpg", alt: "Every Detail technician beside the branded mobile detailing van", w: 2, h: 3, category: "team" },
  { id: "mobile-rig-open-job", file: "/images/mobile-rig-open-job.jpg", alt: "Open Every Detail mobile detailing van set up beside a customer vehicle", w: 2, h: 3, category: "rig" },
  { id: "black-car-pressure-wash", file: "/images/black-car-pressure-wash.jpg", alt: "Every Detail technician pressure washing a black vehicle beside the mobile rig", w: 2, h: 3, category: "work" },
  { id: "clean-white-interior", file: "/images/clean-white-interior.jpg", alt: "Clean white vehicle interior after detailing", w: 2, h: 3, category: "interior" },
  { id: "clean-white-cabin", file: "/images/clean-white-cabin.jpg", alt: "Clean light-colored vehicle cabin viewed from the rear seats", w: 2, h: 3, category: "interior" },
  { id: "mobile-rig-open-driveway", file: "/images/mobile-rig-open-driveway.jpg", alt: "Every Detail mobile detailing van open and fully set up in a residential driveway", w: 2, h: 3, category: "rig" },
  { id: "classic-red-wheel", file: "/images/classic-red-wheel.jpg", alt: "Glossy red classic car wheel and fender after detailing", w: 2, h: 3, category: "exterior" },
  { id: "classic-car-cockpit", file: "/images/classic-car-cockpit.jpg", alt: "Clean classic car cockpit with the Every Detail van visible outside", w: 3, h: 2, category: "interior" },
  { id: "technician-branded-van", file: "/images/technician-branded-van.jpg", alt: "Every Detail technician walking beside the branded mobile detailing van", w: 2, h: 3, category: "team" },
  { id: "two-tech-interior-detail", file: "/images/two-tech-interior-detail.jpg", alt: "Two Every Detail technicians working together inside a customer vehicle", w: 3, h: 2, category: "team" },
  { id: "rear-seat-detail", file: "/images/rear-seat-detail.jpg", alt: "Every Detail technician wiping down a vehicle rear seat", w: 3, h: 2, category: "interior" },
  { id: "finished-lexus-front", file: "/images/finished-lexus-front.jpg", alt: "Clean gray Lexus front end after detailing", w: 2, h: 3, category: "exterior" },
  { id: "tesla-foam-wash", file: "/images/tesla-foam-wash.jpg", alt: "Every Detail technician foam washing a Tesla in a residential driveway", w: 1365, h: 2048, category: "work" },

  // Detail+ recurring-care photography. These aliases intentionally
  // use descriptive IDs so the Detail+ story can reference the exact
  // local assets through the shared <Photo> registry.
  {
    id: "finished-white-car",
    file: "/images/finished-white-car.jpg",
    alt: "Finished white vehicle after an Every Detail service",
    w: 2,
    h: 3,
    category: "exterior",
  },
  {
    id: "team-tablet",
    file: "/images/team-tablet.jpg",
    alt: "Every Detail team using a tablet during a mobile detailing job",
    w: 2,
    h: 3,
    category: "team",
  },
  {
    id: "branded-rig-driveway",
    file: "/images/branded-rig-driveway.jpg",
    alt: "Every Detail branded mobile detailing rig at a residential driveway",
    w: 2,
    h: 3,
    category: "rig",
  },
  {
    id: "interior-detail-team",
    file: "/images/interior-detail-team.jpg",
    alt: "Every Detail technicians working together on a vehicle interior",
    w: 3,
    h: 2,
    category: "interior",
  },

  {
    id: "work-01",
    file: "/images/black-truck-finished.jpg",
    alt: "Finished black truck after an Every Detail mobile detail",
    w: 2,
    h: 3,
    category: "exterior",
  },
  {
    id: "work-02",
    file: "/images/foam-wash.jpg",
    alt: "Every Detail technician foam washing a black SUV in a residential driveway",
    w: 2,
    h: 3,
    category: "work",
  },
  {
    id: "work-03",
    file: "/images/interior-detail.jpg",
    alt: "Every Detail technician detailing the front interior of a vehicle",
    w: 2,
    h: 3,
    category: "interior",
  },
  {
    id: "work-04",
    file: "/images/red-audi-finished.jpg",
    alt: "Finished red Audi after an Every Detail service",
    w: 2,
    h: 3,
    category: "exterior",
  },
  {
    id: "work-05",
    file: "/images/finished-sedan-rig.jpg",
    alt: "Finished sedan beside the Every Detail mobile detailing rig",
    w: 3,
    h: 2,
    category: "exterior",
  },
  {
    id: "work-06",
    file: "/images/exterior-hand-wash.jpg",
    alt: "Every Detail technician hand washing a black SUV",
    w: 2,
    h: 3,
    category: "work",
  },
  {
    id: "work-07",
    file: "/images/wheel-detail-team.jpg",
    alt: "Two Every Detail technicians working together on a vehicle exterior",
    w: 2,
    h: 3,
    category: "team",
  },
  {
    id: "work-08",
    file: "/images/clean-interior.jpg",
    alt: "Clean vehicle interior after an Every Detail detailing service",
    w: 3,
    h: 2,
    category: "interior",
  },

  {
    id: "work-mateo-0670",
    file: "/images/work-mateo-0670.jpg",
    alt: "Every Detail technician Mateo foam washing a vehicle",
    w: 3, h: 2, category: "work",
  },
  {
    id: "work-rex-0467",
    file: "/images/work-rex-0467.jpg",
    alt: "Every Detail technician Rex foam washing a vehicle",
    w: 2, h: 3, category: "work",
  },
  {
    id: "work-davis-0909",
    file: "/images/work-davis-0909.jpg",
    alt: "Every Detail technician Davis detailing a floor mat",
    w: 2, h: 3, category: "work",
  },
  {
    id: "work-will-0920",
    file: "/images/work-will-0920.jpg",
    alt: "Every Detail technician Will using the job iPad inside the mobile detailing van",
    w: 2, h: 3, category: "team",
  },
  {
    id: "work-finished-0771",
    file: "/images/work-finished-0771.jpg",
    alt: "Finished vehicle after an Every Detail mobile detailing service",
    w: 2, h: 3, category: "exterior",
  },

  // ------------------------------------------------------------
  // TEAM + ABOUT
  // ------------------------------------------------------------

  // Primary team photograph used on the About page.
  {
    id: "about-team",
    file: "/images/full-team.jpg",
    alt: "Every Detail team gathered with the company mobile detailing rigs",
    w: 3,
    h: 2,
    category: "team",
  },

  {
    id: "about-founder",
    file: "/images/team-tablet.jpg",
    alt: "Every Detail team member managing a mobile detailing job on site",
    w: 2,
    h: 3,
    category: "team",
  },

  // Compatibility IDs retained for components/pages that still
  // reference the older team image naming system.
  {
    id: "team-01",
    file: "/images/full-team.jpg",
    alt: "Every Detail team gathered with the company mobile detailing rigs",
    w: 3,
    h: 2,
    category: "team",
  },

  {
    id: "team-02",
    file: "/images/full-team.jpg",
    alt: "Every Detail student-run mobile detailing team in Decatur, Georgia",
    w: 3,
    h: 2,
    category: "team",
  },

  // ------------------------------------------------------------
  // RIG + OPERATIONS
  // ------------------------------------------------------------

  {
    id: "rig-01",
    file: "/images/organized-rig.jpg",
    alt: "Every Detail technicians accessing equipment in the organized mobile detailing rig",
    w: 2,
    h: 3,
    category: "rig",
  },

  {
    id: "rig-02",
    file: "/images/rig-access.jpg",
    alt: "Every Detail technician working from the mobile detailing rig",
    w: 2,
    h: 3,
    category: "rig",
  },

  {
    id: "rig-03",
    file: "/images/branded-trailer-van.jpg",
    alt: "Every Detail branded mobile detailing van and trailer",
    w: 3,
    h: 2,
    category: "rig",
  },

  {
  id: "rig-04",
  file: "/images/branded-trailer-van.jpg",
  alt: "Every Detail mobile detailing van and trailer in Decatur, Georgia",
  w: 3,
  h: 2,
  category: "rig",
},
  
  // Additional unique photography for editorial galleries.
  { id: "about-ops-01", file: "/images/team-rig-setup.jpg", alt: "Every Detail team setting up a mobile detailing rig", w: 3, h: 2, category: "team" },
  { id: "about-ops-02", file: "/images/technician-rig.jpg", alt: "Every Detail technician working from a mobile detailing rig", w: 2, h: 3, category: "rig" },
  { id: "about-ops-03", file: "/images/every-detail-flag.jpg", alt: "Every Detail flag beside a mobile detailing setup", w: 2, h: 3, category: "brand" },
  { id: "about-ops-04", file: "/images/mobile-rig-work.jpg", alt: "Every Detail mobile rig set up for a driveway detail", w: 3, h: 2, category: "rig" },
  { id: "about-ops-05", file: "/images/exterior-wash-team.jpg", alt: "Every Detail technicians washing a vehicle together", w: 3, h: 2, category: "team" },
  { id: "about-ops-06", file: "/images/team-driveway-detail.jpg", alt: "Every Detail technicians detailing a vehicle in a residential driveway", w: 3, h: 2, category: "team" },
  { id: "home-team", file: "/images/branded-rig-home.jpg", alt: "Every Detail mobile detailing rig at a residential job", w: 3, h: 2, category: "rig" },
  { id: "ceramic-01", file: "/images/red-car-rig.jpg", alt: "Glossy red vehicle beside the Every Detail mobile rig", w: 3, h: 2, category: "paint" },
  { id: "ceramic-02", file: "/images/exterior-hand-detail.jpg", alt: "Hand detailing a vehicle exterior finish", w: 3, h: 2, category: "paint" },
  { id: "ceramic-03", file: "/images/driveway-detail.jpg", alt: "Vehicle being detailed in a residential driveway", w: 3, h: 2, category: "work" },

  // ------------------------------------------------------------
  // PAINT + CERAMIC
  // ------------------------------------------------------------

  {
    id: "paint-01",
    file: "/images/mercedes-paint.jpg",
    alt: "Water beading on glossy black Mercedes paint",
    w: 2,
    h: 3,
    category: "paint",
  },

  {
    id: "paint-02",
    file: "/images/red-paint-detail.jpg",
    alt: "Glossy red vehicle paint after detailing",
    w: 2,
    h: 3,
    category: "paint",
  },

  {
    id: "paint-03",
    file: "/images/classic-red-car.jpg",
    alt: "Glossy red classic car paint finish",
    w: 2,
    h: 3,
    category: "paint",
  },
];

/**
 * Before/after pairs used by the site's comparison sliders.
 *
 * Leave this empty until genuine matching before/after photographs exist.
 * Both photographs should ideally use the same:
 * - angle
 * - framing
 * - focal length
 * - lighting
 *
 * This avoids presenting misleading comparisons.
 */
export const beforeAfterPairs: {
  id: string;
  before: string;
  after: string;
  caption: string;
  category: "interior" | "exterior" | "paint";
}[] = [
  /*
  Example:

  {
    id: "minivan-seats",
    before: "ba-minivan-before",
    after: "ba-minivan-after",
    caption: "Minivan second row, Factory Reset",
    category: "interior",
  },
  */
];

/**
 * Retrieve an image from the central registry.
 *
 * Intentionally throws during development/build if an unknown image
 * ID is referenced. This prevents broken photography from silently
 * reaching production.
 */
export const imageById = (id: string): SiteImage => {
  const img = images.find((image) => image.id === id);

  if (!img) {
    throw new Error(`Unknown image id: ${id}`);
  }

  return img;
};

/**
 * Return all registered images belonging to one or more categories.
 */
export const imagesIn = (...categories: ImageCategory[]): SiteImage[] =>
  images.filter((image) => categories.includes(image.category));

/**
 * Every Detail brand assets.
 *
 * These files live in /public/brand.
 */
export const logo = {
  mark: {
    file: "/brand/every-detail-mark.png",
    w: 520,
    h: 424,
  },

  full: {
    file: "/brand/every-detail-logo.png",
    w: 420,
    h: 500,
  },
};
