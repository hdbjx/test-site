import { PageHeader } from "@/components/PageHeader";
import { QuoteRecommender } from "@/components/QuoteRecommender";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Find the Right Detail | Every Detail, Decatur GA",
  description:
    "Tell us what you drive and what condition it is in. Every Detail will recommend the right mobile detailing service, recommend the right mobile detailing service, build a personalized quote, and make booking easy.",
  path: "/get-a-quote",
});

export default async function QuotePage({ searchParams }: { searchParams: Promise<{ interest?: string }> }) {
  const { interest } = await searchParams;
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Get a Quote", path: "/get-a-quote" }]}
        title={<>What does your<br />car need?</>}
        lede={<p>Tell us what you drive and what it needs. We&rsquo;ll match your exact vehicle to the right service, then build your personalized price so you can book when you&rsquo;re ready.</p>}
      />
      <section className="container-ed pb-24">
        <QuoteRecommender defaultInterest={interest} />
      </section>
    </>
  );
}
