import type { Metadata } from "next";
import { site } from "@/data/site";
import { areas } from "@/data/areas";
import { imageById } from "@/data/images";

type PageMeta = {
  title: string; // full <title>; keep under ~60 chars
  description: string; // under ~155 chars
  path: string; // e.g. "/our-services"
  image?: string; // image id
  noindex?: boolean;
  type?: "website" | "article";
};

export function pageMetadata({ title, description, path, image = "og-default", noindex, type = "website" }: PageMeta): Metadata {
  const img = imageById(image);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type,
      url: path,
      siteName: site.name,
      title,
      description,
      images: [{ url: img.file, alt: img.alt }],
      locale: "en_US",
    },
    twitter: { card: "summary_large_image", title, description, images: [img.file] },
  };
}

const abs = (p: string) => `${site.url}${p}`;
const businessId = abs("/#business");

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "AutoWash",
    "@id": businessId,
    name: site.name,
    description: site.description,
    url: site.url,
    telephone: "+1-404-855-0672",
    email: site.email,
    image: abs(imageById("og-default").file),
    logo: abs("/brand/every-detail-logo.png"),
    priceRange: "$$",
    paymentAccepted: site.paymentMethods.join(", "),
    address: { "@type": "PostalAddress", addressLocality: site.city, addressRegion: site.region, addressCountry: site.country },
    areaServed: areas.map((a) => ({ "@type": "Place", name: `${a.name}, GA` })),
    award: site.award.title,
    sameAs: [site.googleBusinessProfile, ...site.social.map((s) => s.href)].filter(Boolean),
  };
}

export function serviceSchema(s: { name: string; description: string; path: string; lowPrice?: number; highPrice?: number }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.name,
    description: s.description,
    serviceType: s.name,
    url: abs(s.path),
    provider: { "@id": businessId },
    areaServed: areas.map((a) => `${a.name}, GA`),
    ...(s.lowPrice
      ? {
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "USD",
            lowPrice: s.lowPrice,
            ...(s.highPrice ? { highPrice: s.highPrice } : {}),
          },
        }
      : {}),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
  };
}

export function articleSchema(p: { title: string; description: string; path: string; date: string; image?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.title,
    description: p.description,
    datePublished: p.date,
    url: abs(p.path),
    mainEntityOfPage: abs(p.path),
    image: p.image ? abs(p.image) : abs(imageById("og-default").file),
    author: { "@type": "Organization", name: site.name, url: site.url },
    publisher: { "@id": businessId },
  };
}
