import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqList } from "@/components/FaqList";
import { LiveReviewCount } from "@/components/GoogleReviewStats";
import { JsonLd } from "@/components/JsonLd";
import { PaintAssessmentTicket } from "@/components/paint/PaintAssessmentTicket";
import { PaintDefectFieldGuide } from "@/components/paint/PaintDefectFieldGuide";
import { PaintFiftyFifty } from "@/components/paint/PaintFiftyFifty";
import { PaintInspectionLight } from "@/components/paint/PaintInspectionLight";
import { PaintProcessChapters } from "@/components/paint/PaintProcessChapters";
import { PaintResultBridge } from "@/components/paint/PaintResultBridge";
import { PaintStagePricing } from "@/components/paint/PaintStagePricing";
import { paintCorrectionFaqs } from "@/data/faqs";
import { PAINT_PRICING, paintServices } from "@/data/paint";
import { breadcrumbSchema, pageMetadata, serviceSchema } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Paint Correction in Decatur & Atlanta, GA | Every Detail",
  description: "Mobile paint correction in Decatur and Atlanta. Enhancement polishing and full correction with exact pricing by vehicle and an in-person paint assessment.",
  path: "/paint-correction",
  image: "paint-02",
});

const enhancement = paintServices.find((service) => service.id === "enhancement")!;
const correction = paintServices.find((service) => service.id === "correction")!;
const maxEnhancement = Math.max(...Object.values(PAINT_PRICING).map((price) => price.enhancement));
const maxCorrection = Math.max(...Object.values(PAINT_PRICING).map((price) => price.correction));

export default function PaintCorrectionPage() {
  return (
    <main className="pc90-page">
      <section className="pc90-hero" data-header-tone="light" aria-labelledby="pc90-hero-title">
        <PaintInspectionLight />
        <div className="pc90-shell pc90-hero-inner">
          <div className="pc90-hero-crumbs">
            <Breadcrumbs items={[{ name: "Services", path: "/our-services" }, { name: "Paint Correction", path: "/paint-correction" }]} />
          </div>
          <p className="pc90-hero-figure">FIG. 01 - CLEAR COAT UNDER DIRECT LIGHT</p>
          <div className="pc90-hero-copy">
            <h1 id="pc90-hero-title">BRING THE<br />REFLECTION<br /><span>BACK.</span></h1>
            <p>Swirls, haze and dull clear coat, corrected to the level your paint actually needs.</p>
            <a href="#paint-options" className="ed90-button ed90-button-paper">SEE PRICING <span>↓</span></a>
          </div>
          <div className="pc90-hero-proof" aria-label="Every Detail paint care proof">
            <span><strong><LiveReviewCount /></strong> FIVE-STAR REVIEWS</span>
            <span>MOBILE PAINT CARE</span>
            <span>ASSESSED BEFORE WE POLISH</span>
          </div>
        </div>
      </section>

      <section id="paint-options" className="pc90-pricing" data-header-tone="ink" aria-labelledby="pc90-pricing-title">
        <div className="pc90-shell pc90-pricing-intro">
          <h2 id="pc90-pricing-title" className="ed90-heading">TWO LEVELS.<br /><span>ONE HONEST CALL.</span></h2>
          <p>You don't need to diagnose your own paint. We confirm the level in person before any polishing starts.</p>
        </div>
        <PaintStagePricing />
      </section>

      <PaintFiftyFifty />

      <section className="pc90-defects" data-header-tone="ink" aria-labelledby="pc90-defects-title">
        <div className="pc90-shell pc90-defects-heading">
          <h2 id="pc90-defects-title" className="ed90-heading">WHAT THE LIGHT<br /><span>GIVES AWAY.</span></h2>
          <p>Direct light exposes what flat shade hides. These are the kinds of finish problems we assess before choosing a correction level.</p>
        </div>
        <PaintDefectFieldGuide />
      </section>

      <section className="pc90-process ed90-halftone-dark" data-header-tone="light" aria-label="Paint correction process">
        <PaintProcessChapters />
      </section>

      <PaintResultBridge />

      <section id="paint-quote" className="pc90-quote" data-header-tone="light" aria-labelledby="pc90-quote-title">
        <div className="pc90-shell pc90-quote-inner">
          <div className="pc90-quote-heading">
            <h2 id="pc90-quote-title" className="ed90-heading">LET'S SEE WHAT<br /><span>IT ACTUALLY NEEDS.</span></h2>
            <p>Tell us what you drive and what bothers you most. We review the paint condition and confirm the right path before work starts.</p>
          </div>
          <PaintAssessmentTicket />
        </div>
      </section>

      <section className="pc90-faq" data-header-tone="ink" aria-labelledby="pc90-faq-title">
        <div className="pc90-shell pc90-faq-grid">
          <div className="pc90-faq-heading">
            <h2 id="pc90-faq-title" className="ed90-heading">BEFORE<br /><span>WE POLISH.</span></h2>
          </div>
          <FaqList faqs={paintCorrectionFaqs} />
        </div>
      </section>

      <JsonLd data={[
        serviceSchema({ name: enhancement.name, description: enhancement.summary, path: "/paint-correction", lowPrice: enhancement.startingAt, highPrice: maxEnhancement }),
        serviceSchema({ name: correction.name, description: correction.summary, path: "/paint-correction", lowPrice: correction.startingAt, highPrice: maxCorrection }),
        breadcrumbSchema([{ name: "Services", path: "/our-services" }, { name: "Paint Correction", path: "/paint-correction" }]),
      ]} />
    </main>
  );
}
