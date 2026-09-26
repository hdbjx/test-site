/**
 * Business facts. Change a fact here once and it updates everywhere.
 * Anything marked CONFIRM is unverified — confirm before launch.
 */

export const site = {
  name: "Every Detail",
  legalName: "Every Detail", // CONFIRM: registered business name (LLC?) for footer + schema
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.everydetail.co",
  tagline: "Student-run. Professionally detailed.",
  description:
    "Mobile car detailing in Decatur, GA and nearby Atlanta neighborhoods. A trained, student-run team that brings its own power and water to your driveway.",

  phone: {
    display: "(404) 855-0672",
    href: "tel:+14048550672",
    sms: "sms:+14048550672",
  },
  email: "hello@everydetail.co",

  // Service-area business: no public street address.
  city: "Decatur",
  region: "GA",
  country: "US",

  reviews: {
    count: 170, // shown as "170+"
    rating: 5,
    googleUrl:
      "https://www.google.com/search?q=Every+Detail+Mobile+Detailing#lrd=0x8e30f21fe0cce555:0x394893f8064359ae,1,,,,",
  },

  award: {
    title: "Best of Decaturish 2025",
    short: "Best of Decaturish",
    year: 2025,
  },

  paymentMethods: ["Cash", "Check", "Venmo", "Zelle"],

  // Links to tools that live outside this site. null = hidden from nav/footer.
  external: {
    clientPortal: null as string | null, // e.g. "https://portal.everydetail.co"
    giftCards: null as string | null, // e.g. a Square/Stripe gift card page
  },

  // Add real profile URLs, e.g. { label: "Instagram", href: "https://www.instagram.com/<handle>" }
  social: [] as { label: string; href: string }[],

  // Google Business Profile URL for schema sameAs (CONFIRM).
  googleBusinessProfile: null as string | null,
};

export const reviewCountLabel = `${site.reviews.count}+`;
