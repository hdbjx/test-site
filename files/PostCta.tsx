import { TrackedLink } from "./TrackedLink";
import type { PostMeta } from "@/lib/blog";

const CTAS: Record<NonNullable<PostMeta["cta"]>, { title: string; body: string; href: string; label: string }> = {
  premium: { title: "Want it done for you?", body: "A Premium Detail is our most booked service and the right first visit for most cars.", href: "/book?service=premium", label: "Book a Premium Detail" },
  factoryReset: { title: "Car past the point of a normal clean?", body: "Factory Reset is built for pet hair, stains, odor and years of buildup.", href: "/book?service=factoryReset", label: "Book a Factory Reset" },
  maintenance: { title: "Keep it this way", body: "A Maintenance Detail every few weeks keeps a clean car clean.", href: "/book?service=maintenance", label: "Book a Maintenance Detail" },
  ceramic: { title: "Thinking about protecting your paint?", body: "Paint correction plus a 2-year ceramic coating, from $895.", href: "/ceramic", label: "Paint correction & ceramic" },
  detailplus: { title: "Rather never think about it?", body: "Detail+ keeps your car clean on a schedule for one flat rate.", href: "/detailplus", label: "Explore Detail+" },
  quote: { title: "Not sure what your car needs?", body: "Tell us about it and we'll recommend a service and price.", href: "/get-a-quote", label: "Get a quote" },
};

export function PostCta({ cta = "premium" }: { cta?: PostMeta["cta"] }) {
  const c = CTAS[cta ?? "premium"];
  return (
    <aside className="panel panel-red my-12 p-6 md:p-8">
      <p className="font-display text-xl font-semibold">{c.title}</p>
      <p className="mt-2 text-ink/80">{c.body}</p>
      <TrackedLink href={c.href} event="book_click" params={{ location: "blog_cta" }} className="btn btn-primary mt-5">
        {c.label}
      </TrackedLink>
    </aside>
  );
}
