import { CurvedTape } from "@/components/CurvedTape";
import { Photo } from "@/components/Photo";
import { QuoteRecommender } from "@/components/QuoteRecommender";
import { QuoteTopBar } from "@/components/QuoteTopBar";
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
    <div className="q51-page q52-page">
      <QuoteTopBar />

      <section className="q52-hero" aria-labelledby="q52-title">
        <div className="q52-hero-grain" aria-hidden="true" />
        <div className="q52-hero-copy">
          <p className="q52-kicker">PERSONALIZED RECOMMENDATION · REAL PRICE</p>
          <h1 id="q52-title"><span>FIND THE</span><span>RIGHT DETAIL.</span></h1>
          <p className="q52-lede">Tell us what you drive and what is going on with it. We&rsquo;ll figure out the level of work, show the price for your car, and explain why it fits.</p>
          <div className="q52-facts" aria-label="Quote tool facts">
            <span>03 QUESTIONS</span><span>NO GUESSWORK</span><span>NO PAYMENT</span>
          </div>
        </div>

        <div className="q52-hero-collage" aria-hidden="true">
          <figure className="q52-shot q52-shot-a"><Photo id="two-tech-interior-detail" sizes="(max-width: 800px) 80vw, 35vw" fill /></figure>
          <figure className="q52-shot q52-shot-b"><Photo id="hq-branded-van-side" sizes="(max-width: 800px) 48vw, 20vw" fill /></figure>
          <figure className="q52-shot q52-shot-c"><Photo id="work-mateo-0670" sizes="(max-width: 800px) 44vw, 18vw" fill /></figure>
          <span className="q52-collage-note">REAL CARS.<br />REAL CREW.</span>
          <span className="q52-collage-stamp">WE&rsquo;LL<br />FIGURE<br />IT OUT</span>
        </div>
      </section>

      <div className="q52-tape-wrap">
        <CurvedTape
          text="TELL US WHAT'S GOING ON • WE'LL MATCH THE RIGHT DETAIL • REAL PRICE FOR YOUR CAR • NO GUESSWORK • "
          speed={48}
          boost={0.55}
          label="Every Detail quote process"
        />
      </div>

      <section id="quote-tool" className="q51-tool q52-tool" tabIndex={-1}>
        <div className="q52-tool-heading" aria-hidden="true">
          <span>THE DIAGNOSTIC</span>
          <b>01 → 03</b>
        </div>
        <QuoteRecommender defaultInterest={interest} />
      </section>
    </div>
  );
}
