import { site } from "./site";

export type NavItem = { label: string; href: string; external?: boolean };

export const primaryNav: NavItem[] = [
  { label: "Services", href: "/our-services" },
  { label: "Detail+", href: "/detailplus" },
  { label: "About", href: "/about-us" },
];

export const serviceNav: NavItem[] = [
  { label: "Detailing Services", href: "/our-services" },
  { label: "Paint Correction", href: "/ceramic#paint-correction" },
  { label: "Ceramic Coatings", href: "/ceramic#ceramic-coating" },
];

export const moreNav: NavItem[] = [
  { label: "Get a Quote", href: "/get-a-quote" },
  { label: "Service Areas", href: "/service-areas" },
  { label: "Shine On blog", href: "/blog" },
  ...(site.external.giftCards ? [{ label: "Gift Cards", href: site.external.giftCards, external: true }] : []),
  ...(site.external.clientPortal ? [{ label: "Client Portal", href: site.external.clientPortal, external: true }] : []),
];

export const footerServiceLinks: NavItem[] = [
  { label: "Maintenance Detail", href: "/our-services#maintenance-detail" },
  { label: "Premium Detail", href: "/our-services#premium-detail" },
  { label: "Factory Reset", href: "/our-services#factory-reset" },
  { label: "Paint Correction", href: "/ceramic#paint-correction" },
  { label: "Ceramic Coating", href: "/ceramic#ceramic-coating" },
  { label: "Detail+ Membership", href: "/detailplus" },
];
