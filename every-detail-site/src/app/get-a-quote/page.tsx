import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { TrackedLink } from "@/components/TrackedLink";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { reviewCountLabel, site } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Get a Detailing Quote | Every Detail, Decatur GA",
  description:
    "Tell us about your vehicle and we'll recommend the right service and price. Paint correction, ceramic coating, heavily soiled vehicles and specialty work.",
  path: "/get-a-quote",
});

export default async function QuotePage({ searchParams }: { searchParams: Promise<{ interest?: string }> }) {
  const { interest } = await searchParams;
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Get a Quote", path: "/get-a-quote" }]}
        title="Get a quote"
        lede={
          <p>
            Best for paint correction, ceramic coating, cars in rough shape, or when you&rsquo;re not sure what to book.
            Tell us about the vehicle and we&rsquo;ll recommend a service and price.
          </p>
        }
      />
      <section className="container-ed grid gap-12 pb-20 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <QuoteForm defaultInterest={interest} />
        </div>
        <aside className="space-y-8 lg:col-span-4 lg:col-start-9">
          <div className="border-t-2 border-ink pt-5">
            <h2 className="font-display text-lg font-semibold">Just need a regular detail?</h2>
            <p className="mt-2 text-ink/80">
              Maintenance, Premium and Factory Reset are priced by vehicle size. You can see your price and book without
              a quote.
            </p>
            <TrackedLink href="/book" event="book_click" params={{ location: "quote_aside" }} className="btn btn-secondary btn-sm mt-4">
              See prices and book
            </TrackedLink>
          </div>
          <div className="border-t-2 border-ink pt-5">
            <h2 className="font-display text-lg font-semibold">Rather talk it through?</h2>
            <p className="mt-2 text-ink/80">
              Call or text{" "}
              <TrackedLink href={site.phone.href} event="phone_click" params={{ location: "quote_aside" }} className="link">
                {site.phone.display}
              </TrackedLink>{" "}
              or email{" "}
              <a href={`mailto:${site.email}`} className="link">
                {site.email}
              </a>
              .
            </p>
          </div>
          <p className="text-sm text-muted">
            {reviewCountLabel} five-star Google reviews · {site.award.title} ·{" "}
            <Link href="/about-us" className="underline">
              About us
            </Link>
          </p>
        </aside>
      </section>
    </>
  );
}
