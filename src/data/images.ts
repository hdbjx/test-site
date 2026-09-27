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
  // Uses the existing hero image so no duplicate file is required.
  {
    id: "og-default",
    file: "/images/hero.jpg",
    alt: "Every Detail mobile auto detailing in Decatur, Georgia",
    w: 3,
    h: 2,
    category: "brand",
  },

  // ------------------------------------------------------------
  // CURATED WORK
  // ------------------------------------------------------------

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
