/**
 * Organizations Every Detail has worked with or sponsored, shown on /our-work.
 * With no `logo`, the name shows as text. Add a logo only with the organization's OK.
 * `note` is optional and kept short; leave it out rather than guess.
 */

export type CommunityEntry = {
  name: string;
  note?: string;
  href?: string;
  /** Optional logo in /public/community: cream (#f3eddf) on transparent, cropped tight. The name still shows under it. */
  logo?: string;
};

export const clients: CommunityEntry[] = [
  { name: "Emory University", logo: "/community/emory.png" },
  { name: "Cliff Valley School", logo: "/community/cliff-valley-school.png" },
];

export const sponsorships: CommunityEntry[] = [
  { name: "Love Run 5K", note: "Benefiting the Women's Resource Center", logo: "/community/love-run-5k.png" },
  { name: "Decatur Performs", logo: "/community/decatur-performs.png" },
];
