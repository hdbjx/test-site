import { PageHeader } from "@/components/PageHeader";
import { QuoteRecommender } from "@/components/QuoteRecommender";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Find the Right Detail | Every Detail, Decatur GA",
  description:
    "Tell us what you drive and what condition it is in. Every Detail will recommend the right mobile detailing service, show your personalized price, and make booking easy.",
  path: "/get-a-quote",
});

export default async function QuotePage({ searchParams }: { searchParams: Promise<{ interest?: string }> }) {
  const { interest } = await searchParams;
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Find My Detail", path: "/get-a-quote" }]}
        title={<>What does your<br />car need?</>}
        lede={<p>Answer a few quick questions. We&rsquo;ll recommend the right service for your exact vehicle, show the price, and let you book when you&rsquo;re ready.</p>}
      />
      <section className="container-ed pb-24">
        <QuoteRecommender defaultInterest={interest} />
      </section>
    </>
  );
}
