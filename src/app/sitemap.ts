import type { MetadataRoute } from "next";
import { areasWithPages } from "@/data/areas";
import { site } from "@/data/site";
import { getAllPosts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: [string, number][] = [
    ["/", 1],
    ["/our-services", 0.9],
    ["/mobile-car-detailing", 0.9],
    ["/paint-correction", 0.9],
    ["/ceramic", 0.9],
    ["/detailplus", 0.8],
    ["/book", 0.8],
    ["/get-a-quote", 0.7],
    ["/about-us", 0.6],
    ["/service-areas", 0.6],
    ["/blog", 0.5],
  ];
  return [
    ...pages.map(([p, priority]) => ({ url: `${site.url}${p}`, priority })),
    ...areasWithPages.map((a) => ({ url: `${site.url}/service-areas/${a.slug}`, priority: 0.6 })),
    ...getAllPosts().map((p) => ({ url: `${site.url}/post/${p.slug}`, lastModified: new Date(p.date + "T12:00:00"), priority: 0.4 })),
  ];
}
