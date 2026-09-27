import type { NextConfig } from "next";
import { legacyWixCategories } from "./src/data/booking";
import { site } from "./src/data/site";

type R = { source: string; destination: string; statusCode: 301 | 302; has?: { type: "query"; key: string; value?: string }[] };

/**
 * Redirect map from the old Wix site. Every URL that had traffic lands somewhere useful.
 * Unchanged URLs (/, /our-services, /ceramic, /detailplus, /about-us, /get-a-quote, /blog, /post/*)
 * are served directly and need no redirect.
 */
const legacyRedirects = (): R[] => [
  // Wix Bookings vehicle categories → on-site booking with that vehicle preselected
  ...Object.entries(legacyWixCategories).map(([id, vehicle]) => ({
    source: "/book-online",
    has: [{ type: "query" as const, key: "category", value: id }],
    destination: `/book?vehicle=${vehicle}`,
    statusCode: 301 as const,
  })),
  { source: "/book-online", destination: "/book", statusCode: 301 },
  { source: "/booking-calendar/2-year-ceramic-coating", destination: "/get-a-quote?interest=ceramic", statusCode: 301 },
  { source: "/booking-calendar/:path*", destination: "/book", statusCode: 301 },
  { source: "/service-page/:path*", destination: "/book", statusCode: 301 },
  { source: "/book-your-paint-work", destination: "/get-a-quote?interest=paint-correction", statusCode: 301 },

  // Duplicate / legacy pages
  { source: "/services-3", destination: "/ceramic", statusCode: 301 },
  { source: "/join-detail", destination: "/detailplus/join", statusCode: 301 },
  { source: "/home", destination: "/", statusCode: 301 },

  // Wix blog archive URLs
  { source: "/blog/categories/:path*", destination: "/blog", statusCode: 301 },
  { source: "/blog/tags/:path*", destination: "/blog", statusCode: 301 },
  { source: "/blog/hashtags/:path*", destination: "/blog", statusCode: 301 },
  { source: "/blog/page/:path*", destination: "/blog", statusCode: 301 },

  // Wix account/store pages with no equivalent (302: may point somewhere real later)
  { source: "/cart-page", destination: "/", statusCode: 302 },
  { source: "/my-addresses", destination: "/", statusCode: 302 },
  { source: "/members-area/:path*", destination: "/", statusCode: 302 },
  { source: "/client-portal", destination: site.external.clientPortal ?? "/", statusCode: 302 },
  { source: "/gift-cards", destination: site.external.giftCards ?? "/", statusCode: 302 },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 640, 828, 1080, 1280, 1600, 1920],
  },
  async redirects() {
    return legacyRedirects().map(({ statusCode, ...r }) => ({ ...r, statusCode }));
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/(images|brand)/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
    ];
  },
};

export default nextConfig;
