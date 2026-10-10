/**
 * Real Google reviews, quoted exactly (including original spelling).
 * Add more here — keep them verbatim and attributed as they appear on Google.
 * `topics` drives which reviews appear where.
 */

export type Review = { author: string; text: string; topics: string[] };

export const reviews: Review[] = [
  {
    author: "Mazie G.",
    text: "I feel so lucky to have found this young entrepreneurial crew! They went out of their way to accommodate my schedule, and my car was pristine when they finished. It was no small feet for that to be true of my three-row, multi-child toting vehicle.",
    topics: ["family", "scheduling", "student-run", "quality"],
  },
  {
    author: "Allison R.",
    text: "Wiley was very easy to work with in scheduling the wash. He and his team arrived right on time and were very professional. They did an excellent job cleaning the dirt and dog hair from the interior. Very pleased with their work and will use them again!",
    topics: ["pet-hair", "communication", "professional", "repeat"],
  },
  {
    author: "Rutledge H.",
    text: "Wiley did a fabulous job!! Terrific attention to detail!! My 11 year-old car looks brand new. Very professional!! From scheduling to finish (with mints left on the seat) it was a great experience. I cannot recommend him highly enough!!",
    topics: ["quality", "professional"],
  },
];
