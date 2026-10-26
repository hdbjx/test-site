import { QuoteRecommender } from "@/components/QuoteRecommender";
import { QuoteTopBar } from "@/components/QuoteTopBar";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Find the Right Detail | Every Detail, Decatur GA",
  description:
    "Tell us what you drive and what condition it is in. Every Detail will recommend the right mobile detailing service, show your personalized price, and make booking easy.",
  path: "/get-a-quote",
  noindex: true,
});

export default async function QuotePage({ searchParams }: { searchParams: Promise<{ interest?: string }> }) {
  const { interest } = await searchParams;
  return (
    <div className="q51-page q53-page">
      <QuoteTopBar />
      <main id="quote-tool" className="q53-tool" data-header-tone="ink" tabIndex={-1}>
        <div className="q53-intro">
          <div>
            <p>FIND MY DETAIL</p>
            <h1>WHAT DOES YOUR CAR NEED?</h1>
          </div>
          <span>4 QUICK STEPS</span>
        </div>
        <QuoteRecommender defaultInterest={interest} />
      </main>
    </div>
  );
}
