import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqList } from "@/components/FaqList";
import { GoogleMapsAttribution, LiveReviewCount } from "@/components/GoogleReviewStats";
import { JsonLd } from "@/components/JsonLd";
import { PaintLeadForm } from "@/components/PaintLeadForm";
import { PaintPricingPanel } from "@/components/PaintPricingPanel";
import { ceramicFaqs } from "@/data/faqs";
import { PAINT_PRICING, ceramicDoes, ceramicDoesNot, paintServices } from "@/data/paint";
import { breadcrumbSchema, pageMetadata, serviceSchema } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "2-Year Ceramic Coating in Decatur & Atlanta | Every Detail",
  description: "Professional 2-year ceramic coating in Decatur and Atlanta with paint correction, decontamination and a complimentary follow-up detail.",
  path: "/ceramic",
  image: "paint-01",
});

const ceramic = paintServices.find((service) => service.id === "ceramic2yr")!;
const maxCeramic = Math.max(...Object.values(PAINT_PRICING).map((price) => price.ceramic2yr));

export default function CeramicPage() {
  return (
    <div className="paint85 paint85-ceramic service85">
      <section className="paint85-hero" data-header-tone="light">
        <Image src="/images/mercedes-paint.webp" alt="Corrected Mercedes paint with deep gloss" fill priority sizes="100vw" />
        <div className="paint85-hero-shade" />
        <div className="paint85-shell paint85-hero-inner">
          <Breadcrumbs items={[{ name: "Services", path: "/our-services" }, { name: "Ceramic Coating", path: "/ceramic" }]} />
          <div className="paint85-hero-copy">
            <p className="paint85-kicker">2-YEAR CERAMIC COATING</p>
            <h1>PROTECT THE<br />FINISH <span>YOU FIXED.</span></h1>
            <p>Paint correction, professional ceramic protection and a complimentary follow-up detail in one package.</p>
            <a href="#ceramic-price" className="paint85-btn paint85-btn-light">SEE MY CERAMIC PRICE <span>↓</span></a>
          </div>
          <div className="paint85-hero-proof" aria-label="Every Detail ceramic coating proof">
            <span><strong><LiveReviewCount /></strong> FIVE-STAR REVIEWS</span>
            <span>2-YEAR PROTECTION</span>
            <span>FOLLOW-UP DETAIL INCLUDED</span>
          </div>
        </div>
      </section>

      <section id="ceramic-price" className="paint85-price-section" data-header-tone="ink">
        <div className="paint85-shell">
          <div className="paint85-section-intro paint85-section-intro-tight">
            <div><p className="paint85-kicker dark">YOUR PACKAGE</p><h2>CORRECT.<br /><span>COAT. MAINTAIN.</span></h2></div>
            <p>The coating goes on after the finish is cleaned, decontaminated and corrected so we are protecting paint worth keeping.</p>
          </div>
          <PaintPricingPanel services={["ceramic2yr"]} primary="ceramic2yr" quoteHref="#coating-quote" quoteLabel="GET MY COATING PLAN" />
          <p className="cer-audit-value-note"><strong>FULL CORRECTION STARTS AT $695.</strong> The 2-year ceramic package starts at $895 and already includes paint correction, the coating, and the complimentary follow-up detail.</p>
        </div>
      </section>

      <section className="paint85-proof-section paint85-proof-section-light" data-header-tone="ink">
        <div className="paint85-shell paint85-proof-grid reverse">
          <figure className="paint85-proof-photo">
            <Image src="/images/red-paint-detail.webp" alt="Every Detail preparing automotive paint before ceramic coating" fill sizes="(max-width: 900px) 100vw, 56vw" />
          </figure>
          <div className="paint85-proof-copy">
            <p className="paint85-kicker dark">WHY PREP MATTERS</p>
            <h2>THE COATING<br /><span>PROTECTS WHAT'S THERE.</span></h2>
            <p>Coating does not hide swirls or haze. That is why correction is included before ceramic. We improve the finish first, then protect it.</p>
            <Link href="/paint-correction" className="paint85-text-link">ABOUT PAINT CORRECTION ↗</Link>
          </div>
        </div>
      </section>

      <section className="paint85-truth" data-header-tone="light">
        <div className="paint85-shell">
          <div className="paint85-section-intro"><div><p className="paint85-kicker">CERAMIC, CLEARLY</p><h2>EASIER TO KEEP CLEAN.<br /><span>NOT MAGIC ARMOR.</span></h2></div><p>A coating changes how the finish sheds water and contamination. It does not turn paint into an impact-resistant surface.</p></div>
          <div className="paint85-truth-grid">
            <div><h3>WHAT IT DOES</h3>{ceramicDoes.slice(0, 3).map((item) => <p key={item}>{item}</p>)}</div>
            <div><h3>WHAT IT DOES NOT DO</h3>{ceramicDoesNot.slice(0, 3).map((item) => <p key={item}>{item}</p>)}</div>
          </div>
        </div>
      </section>

      <section className="paint85-package" data-header-tone="ink">
        <div className="paint85-shell">
          <div className="paint85-section-intro paint85-section-intro-tight"><div><p className="paint85-kicker dark">INCLUDED</p><h2>ONE PACKAGE.<br /><span>THREE THINGS THAT MATTER.</span></h2></div><p>{ceramic.bestFor}</p></div>
          <div className="paint86-package-layout">
            <div className="paint85-package-grid">
              <article><span>01</span><h3>Paint preparation + correction</h3><p>Wash, decontamination and correction matched to the finish before coating.</p></article>
              <article><span>02</span><h3>2-year ceramic coating</h3><p>Professional ceramic protection applied panel by panel to prepared paint.</p></article>
              <article><span>03</span><h3>Complimentary follow-up detail</h3><p>We return after installation to clean the vehicle correctly and check the coating.</p></article>
            </div>
            <figure className="paint86-package-photo"><Image src="/images/red-audi-finished.jpg" alt="Finished red Audi with deep gloss after Every Detail paint care" fill sizes="(max-width: 900px) 92vw, 42vw" /></figure>
          </div>
        </div>
      </section>

      <section className="paint85-result" data-header-tone="light">
        <div className="paint85-shell paint85-result-grid">
          <figure><Image src="/images/black-truck-finished.jpg" alt="Black vehicle with a deep gloss after Every Detail paint care" fill sizes="(max-width: 900px) 100vw, 58vw" /></figure>
          <div><p className="paint85-kicker">THE RESULT</p><h2>DEEPER GLOSS.<br /><span>EASIER WASHES.</span></h2><p>A coated vehicle still needs washing. The difference is that water, dirt and contamination release more easily while the corrected finish stays protected.</p><div className="paint85-review-proof"><strong><LiveReviewCount /></strong><span>FIVE-STAR REVIEWS · <GoogleMapsAttribution /></span></div></div>
        </div>
      </section>

      <section id="coating-quote" className="paint85-quote" data-header-tone="ink">
        <div className="paint85-shell">
          <div className="paint85-section-intro paint85-section-intro-tight"><div><p className="paint85-kicker dark">YOUR CAR</p><h2>LET'S LOOK AT<br /><span>THE PAINT.</span></h2></div><p>Tell us what you drive and how the finish looks today. We will confirm the preparation before anything is booked.</p></div>
          <div className="paint86-quote-body">
            <PaintLeadForm kind="ceramic" hideIntro />
            <figure className="paint86-quote-photo"><Image src="/images/hq-black-suv-finished.webp" alt="Finished black SUV after Every Detail paint care" fill sizes="(max-width: 900px) 92vw, 38vw" /></figure>
          </div>
        </div>
      </section>

      <section className="paint85-faq" data-header-tone="ink"><div className="paint85-shell paint85-faq-grid"><div><p className="paint85-kicker dark">QUICK ANSWERS</p><h2>BEFORE<br />YOU COAT.</h2></div><FaqList faqs={ceramicFaqs} /></div></section>

      <JsonLd data={[serviceSchema({ name: ceramic.name, description: ceramic.summary, path: "/ceramic", lowPrice: ceramic.startingAt, highPrice: maxCeramic }), breadcrumbSchema([{ name: "Services", path: "/our-services" }, { name: "Ceramic Coating", path: "/ceramic" }])]} />
    </div>
  );
}
