import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqList } from "@/components/FaqList";
import { GoogleMapsAttribution, LiveReviewCount } from "@/components/GoogleReviewStats";
import { JsonLd } from "@/components/JsonLd";
import { PaintLeadForm } from "@/components/PaintLeadForm";
import { PaintPricingPanel } from "@/components/PaintPricingPanel";
import { paintCorrectionFaqs } from "@/data/faqs";
import { PAINT_PRICING, paintDefects, paintServices } from "@/data/paint";
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
    <div className="paint85 paint85-correction service85">
      <section className="paint85-hero">
        <Image src="/images/red-paint-detail.webp" alt="Red automotive paint being polished by Every Detail" fill priority sizes="100vw" />
        <div className="paint85-hero-shade" />
        <div className="paint85-shell paint85-hero-inner">
          <Breadcrumbs items={[{ name: "Services", path: "/our-services" }, { name: "Paint Correction", path: "/paint-correction" }]} />
          <div className="paint85-hero-copy">
            <p className="paint85-kicker">PAINT CORRECTION / DECATUR + ATLANTA</p>
            <h1>BRING THE<br />REFLECTION <span>BACK.</span></h1>
            <p>Reduce swirls, haze and clear-coat defects with a correction level matched to the paint in front of us.</p>
            <a href="#paint-options" className="paint85-btn paint85-btn-light">SEE THE TWO LEVELS <span>↓</span></a>
          </div>
          <div className="paint85-hero-proof" aria-label="Every Detail paint care proof">
            <span><strong><LiveReviewCount /></strong> FIVE-STAR REVIEWS</span>
            <span>MOBILE PAINT CARE</span>
            <span>ASSESSMENT BEFORE WORK</span>
          </div>
        </div>
      </section>

      <section id="paint-options" className="paint85-price-section">
        <div className="paint85-shell">
          <div className="paint85-section-intro paint85-section-intro-tight">
            <div><p className="paint85-kicker dark">START WITH THE FINISH</p><h2>TWO LEVELS.<br /><span>ONE HONEST CALL.</span></h2></div>
            <p>You do not need to diagnose your own paint. We confirm the right level after seeing the finish in person.</p>
          </div>
          <PaintPricingPanel services={["enhancement", "correction"]} quoteHref="#paint-quote" quoteLabel="GET MY PAINT ASSESSMENT" />
        </div>
      </section>

      <section className="paint85-defects">
        <div className="paint85-shell">
          <div className="paint85-section-intro">
            <div><p className="paint85-kicker dark">WHAT WE ARE LOOKING AT</p><h2>DEFECTS THAT<br /><span>BREAK THE REFLECTION.</span></h2></div>
            <p>Correction works in the clear coat. Deep damage through the clear may improve without disappearing completely.</p>
          </div>
          <div className="paint86-defect-visuals" aria-label="Real paint finish examples">
            <figure><Image src="/images/red-paint-detail.webp" alt="Close view of red automotive paint during Every Detail paint care" fill sizes="(max-width: 700px) 92vw, 30vw" /></figure>
            <figure><Image src="/images/mercedes-paint.webp" alt="Glossy Mercedes paint showing a clean reflection" fill sizes="(max-width: 700px) 92vw, 30vw" /></figure>
            <figure><Image src="/images/classic-red-car.jpg" alt="Glossy classic red car finish after detailing" fill sizes="(max-width: 700px) 92vw, 30vw" /></figure>
          </div>
          <div className="paint85-defect-grid">
            {paintDefects.map((defect, index) => (
              <article key={defect.name}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{defect.name}</h3><p>{defect.detail}</p></div></article>
            ))}
          </div>
        </div>
      </section>

      <section className="paint85-proof-section">
        <div className="paint85-shell paint85-proof-grid">
          <figure className="paint85-proof-photo">
            <Image src="/images/red-audi-finished.jpg" alt="Red Audi with clear glossy paint after Every Detail paint care" fill sizes="(max-width: 900px) 100vw, 56vw" />
          </figure>
          <div className="paint85-proof-copy">
            <p className="paint85-kicker">THE GOAL</p>
            <h2>CLARITY YOU CAN<br /><span>SEE IN REAL LIGHT.</span></h2>
            <p>Wax can make paint look wetter for a while. Correction improves the surface underneath the protection, so the finish looks cleaner after the shine product is gone.</p>
            <div className="paint85-mini-process">
              <span><b>01</b> Inspect</span><span><b>02</b> Correct</span><span><b>03</b> Refine</span>
            </div>
          </div>
        </div>
      </section>

      <section className="paint85-compare">
        <div className="paint85-shell">
          <div className="paint85-option-grid">
            {[enhancement, correction].map((service) => (
              <article key={service.id} className={service.id === "correction" ? "is-featured" : ""}>
                <div className="paint85-option-head"><span>{service.id === "enhancement" ? "GLOSS + LIGHT DEFECTS" : "VISIBLE / HEAVIER DEFECTS"}</span><strong>{service.name}</strong></div>
                <p>{service.summary}</p>
                <ul>{service.includes.map((item) => <li key={item}>{item}</li>)}</ul>
                <a href="#paint-quote" className="paint85-text-link">START WITH AN ASSESSMENT ↗</a>
              </article>
            ))}
          </div>
          <div className="paint85-bridge">
            <div><p className="paint85-kicker dark">PROTECT THE RESULT</p><h3>Correct it once. Then keep it protected.</h3><p>Our 2-year ceramic package includes the prep and correction needed before coating.</p></div>
            <Link href="/ceramic" className="paint85-btn paint85-btn-dark">EXPLORE CERAMIC <span>↗</span></Link>
          </div>
        </div>
      </section>

      <section id="paint-quote" className="paint85-quote">
        <div className="paint85-shell">
          <div className="paint85-section-intro paint85-section-intro-tight"><div><p className="paint85-kicker dark">YOUR PAINT</p><h2>LET'S SEE WHAT<br /><span>IT ACTUALLY NEEDS.</span></h2></div><p>Tell us what you drive and what bothers you most. We will recommend the level that makes sense before work starts.</p></div>
          <PaintLeadForm kind="paint-correction" hideIntro />
        </div>
      </section>

      <section className="paint85-faq"><div className="paint85-shell paint85-faq-grid"><div><p className="paint85-kicker dark">QUICK ANSWERS</p><h2>BEFORE<br />WE POLISH.</h2></div><FaqList faqs={paintCorrectionFaqs} /></div></section>

      <JsonLd data={[
        serviceSchema({ name: enhancement.name, description: enhancement.summary, path: "/paint-correction", lowPrice: enhancement.startingAt, highPrice: maxEnhancement }),
        serviceSchema({ name: correction.name, description: correction.summary, path: "/paint-correction", lowPrice: correction.startingAt, highPrice: maxCorrection }),
        breadcrumbSchema([{ name: "Services", path: "/our-services" }, { name: "Paint Correction", path: "/paint-correction" }]),
      ]} />
    </div>
  );
}
