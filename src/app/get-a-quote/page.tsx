import { PageHeader } from "@/components/PageHeader";
import { QuoteRecommender } from "@/components/QuoteRecommender";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Find the Right Detail | Every Detail, Decatur GA",
  description:
    "Tell us what you drive and what condition it is in. Every Detail will recommend the right mobile detailing service, show your price, save your quote, and make booking easy.",
  path: "/get-a-quote",
});

export default async function QuotePage({ searchParams }: { searchParams: Promise<{ interest?: string }> }) {
  const { interest } = await searchParams;
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Get a Quote", path: "/get-a-quote" }]}
        title={<>What does your<br />car need?</>}
        lede={<p>Answer three quick questions. We&rsquo;ll match your vehicle to the right service, show your price, and save the recommendation so you can book when you&rsquo;re ready.</p>}
      />
      <section className="container-ed pb-24">
        <QuoteRecommender defaultInterest={interest} />
      </section>
    </>
  );
}
