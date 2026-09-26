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
  { id: "hero", file: "/images/hero.jpg", wix: "01523f_394ab7a5ffea4645ac01f7a216c2fd4c~mv2.jpg", alt: "Every Detail mobile detailing", w: 16, h: 9, category: "hero", altReview: true },

  { id: "work-01", file: "/images/work-01.jpg", wix: "01523f_e6c4dff117b94dd98e5261067a42dfe7~mv2.jpg", alt: "Vehicle detailed by Every Detail", w: 3, h: 2, category: "work", altReview: true },
  { id: "work-02", file: "/images/work-02.jpg", wix: "01523f_ab554e5d4d3a4db88c2324c4e83d6b4b~mv2.jpg", alt: "Vehicle detailed by Every Detail", w: 2, h: 3, category: "work", altReview: true },
  { id: "work-03", file: "/images/work-03.jpg", wix: "01523f_b8376dd356414c69b5cf48d1189ad162~mv2.jpg", alt: "Vehicle detailed by Every Detail", w: 16, h: 9, category: "work", altReview: true },
  { id: "work-04", file: "/images/work-04.jpg", wix: "01523f_afc1e4a64ccd4f7888feb0a88b80def5~mv2.jpg", alt: "Vehicle detailed by Every Detail", w: 2, h: 3, category: "work", altReview: true },
  { id: "work-05", file: "/images/work-05.jpg", wix: "01523f_f7960b1efc584bad944a61303f608f22~mv2.jpg", alt: "Vehicle detailed by Every Detail", w: 3, h: 2, category: "work", altReview: true },
  { id: "work-06", file: "/images/work-06.jpg", wix: "01523f_eff45b13a4af413592a62a47db1515a2~mv2.jpg", alt: "Vehicle detailed by Every Detail", w: 2, h: 3, category: "work", altReview: true },
  { id: "work-07", file: "/images/work-07.jpg", wix: "01523f_74fccebb228c439d9251a411e495f1dc~mv2.jpg", alt: "Vehicle detailed by Every Detail", w: 1, h: 1, category: "work", altReview: true },
  { id: "work-08", file: "/images/work-08.jpg", wix: "01523f_d24036bd515e4d85be16aca080abdaab~mv2.jpg", alt: "Vehicle detailed by Every Detail", w: 3, h: 2, category: "work", altReview: true },
  { id: "work-09", file: "/images/work-09.jpg", wix: "01523f_bee470a0582a43bc885a23990cb5df32~mv2.jpg", alt: "Vehicle detailed by Every Detail", w: 1, h: 1, category: "work", altReview: true },
  { id: "work-10", file: "/images/work-10.jpg", wix: "01523f_92257539ff514bfe98de895143c94634~mv2.jpg", alt: "Vehicle detailed by Every Detail", w: 2, h: 3, category: "work", altReview: true },

  { id: "about-founder", file: "/images/about-founder.jpg", wix: "01523f_3c67d0a50d43472fbf53902b7a7a6783~mv2.jpg", alt: "Wiley, founder of Every Detail", w: 2, h: 3, category: "team", altReview: true },
  { id: "about-team", file: "/images/about-team.jpg", wix: "01523f_ef75c6ecce31429e895787d48855c053~mv2.jpg", alt: "Every Detail at work", w: 3, h: 2, category: "team", altReview: true },

  { id: "og-default", file: "/images/og-default.png", wix: "01523f_a52c50d56d6240fdb4f26fbabdae1fcf~mv2.png", alt: "Every Detail mobile car detailing", w: 1230, h: 630, category: "brand" },
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
