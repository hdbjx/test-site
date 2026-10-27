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

/**
 * One review per detail tier on /our-services. Each comes from a customer who named
 * that service in their Google review; the quote is an exact sentence from it.
 * Kept separate from `reviews` so ReviewGrid and the homepage are unaffected.
 */
export const serviceReviews: Record<"maintenance" | "premium" | "factoryReset", { author: string; quote: string }> = {
  maintenance: {
    author: "Caroline O.",
    quote: "My Mini Cooper looks spotless, and they got all the small areas that usually get missed.",
  },
  premium: {
    author: "Steve W.",
    quote: "The price was reasonable, and both cars have never looked better since they were new.",
  },
  factoryReset: {
    author: "Andrea B.",
    quote: "They completed the factory reset package on our 9 year old truck, and the results are impressive. It looks and smells brand new again.",
  },
};
