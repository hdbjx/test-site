/**
 * Service areas. Every area is listed on /service-areas and in the footer.
 *
 * An area only gets its own page (/service-areas/<slug>) when `page` is filled in
 * with genuinely local content. Don't publish a page with a swapped-in town name.
 */

export type AreaPage = {
  title: string; // <title> and H1, e.g. "Mobile Car Detailing in Brookhaven, GA"
  description: string; // meta description
  intro: string; // 2–4 sentences specific to this area
  localNotes: string[]; // real local detail: neighborhoods served, common vehicles, parking realities, etc.
  photos?: string[]; // image ids from src/data/images.ts taken in this area
};

export type Area = { name: string; slug: string; primary?: boolean; page?: AreaPage };

export const areas: Area[] = [
  { name: "Decatur", slug: "decatur", primary: true },
  { name: "Brookhaven", slug: "brookhaven" },
  { name: "Avondale Estates", slug: "avondale-estates" },
  { name: "Chamblee", slug: "chamblee" },
  { name: "North Buckhead", slug: "north-buckhead" },
  { name: "North Druid Hills", slug: "north-druid-hills" },
  { name: "Sandy Springs", slug: "sandy-springs" },
  { name: "Dunwoody", slug: "dunwoody" },
  { name: "Briarcliff", slug: "briarcliff" },
  { name: "Atlanta", slug: "atlanta" },
];

export const areasWithPages = areas.filter((a): a is Area & { page: AreaPage } => !!a.page);
