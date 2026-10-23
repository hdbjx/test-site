import { TrackedLink } from "./TrackedLink";
import type { PostMeta } from "@/lib/blog";

const CTAS: Record<NonNullable<PostMeta["cta"]>, { title: string; body: string; href: string; label: string; event: "book_click" | "quote_start" | "paint_inquiry" | "detailplus_start" }> = {
  premium: { title: "Want us to handle it?", body: "Premium is the right first visit for most everyday cars that need a real catch-up.", href: "/book?service=premium", label: "Book Premium", event: "book_click" },
  factoryReset: { title: "Past the point of a normal clean?", body: "Factory Reset is built for pet hair, stains, odor and heavier buildup.", href: "/book?service=factoryReset", label: "Book Factory Reset", event: "book_click" },
  maintenance: { title: "Keep the baseline clean", body: "Maintenance is for vehicles that are already in good shape and need regular upkeep.", href: "/book?service=maintenance", label: "Book Maintenance", event: "book_click" },
  ceramic: { title: "Want to protect the finish?", body: "Our 2-year ceramic package includes the paint preparation it needs before coating.", href: "/ceramic", label: "Explore Ceramic", event: "paint_inquiry" },
  detailplus: { title: "Prefer to keep it on a schedule?", body: "Detail+ brings us back before the car needs another major reset.", href: "/detailplus", label: "Explore Detail+", event: "detailplus_start" },
  quote: { title: "Not sure which detail fits?", body: "Tell us about the car and we will recommend the service and show the price.", href: "/get-a-quote", label: "Find My Detail", event: "quote_start" },
};

export function PostCta({ cta = "premium" }: { cta?: PostMeta["cta"] }) {
  const c = CTAS[cta ?? "premium"];
  return (
    <aside className="post85-cta">
      <div><span>EVERY DETAIL</span><h2>{c.title}</h2><p>{c.body}</p></div>
      <TrackedLink href={c.href} event={c.event} params={{ location: "blog_cta" }} className="post85-cta-link">{c.label} <span>↗</span></TrackedLink>
    </aside>
  );
}
