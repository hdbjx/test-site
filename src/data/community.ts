/**
 * Organizations Every Detail has worked with or sponsored, shown on /our-work.
 * With no `logo`, the name shows as text. Add a logo only with the organization's OK.
 * `note` is optional and kept short; leave it out rather than guess.
 */

export type CommunityEntry = {
  name: string;
  note?: string;
  href?: string;
  /** Optional logo in /public/community (SVG or transparent PNG). Shown in one cream tone on the dark band; the name stays as alt text. */
  logo?: string;
};

export const clients: CommunityEntry[] = [
  { name: "Emory University" },
  { name: "Cliff Valley School" },
];

export const sponsorships: CommunityEntry[] = [
  { name: "Love Run 5K", note: "Benefiting the Women's Resource Center" },
  { name: "Decatur Performs" },
];
