import Image from "next/image";
import Link from "next/link";
import { CeramicOffer } from "@/components/CeramicOffer";
import { FaqList } from "@/components/FaqList";
import { GoogleMapsAttribution, LiveReviewCount } from "@/components/GoogleReviewStats";
import { JsonLd } from "@/components/JsonLd";
import { PaintLeadForm } from "@/components/PaintLeadForm";
import { paintFaqs } from "@/data/faqs";
import { ceramicDoes, ceramicDoesNot, paintServices } from "@/data/paint";
import { pageMetadata, serviceSchema } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "2-Year Ceramic Coating in Decatur & Atlanta | Every Detail",
  description: "Professional 2-year ceramic coating with paint correction, decontamination and a complimentary follow-up detail from Every Detail.",
  path: "/ceramic",
});

const ceramic = paintServices.find((service) => service.id === "ceramic2yr")!;

const included = [
  ["01", "DECONTAMINATE", "Remove bonded contamination so the paint is clean before polishing."],
  ["02", "CORRECT", "Reduce visible swirls and haze before the finish is protected."],
  ["03", "COAT", "Apply the two-year ceramic coating panel by panel to prepared paint."],
  ["04", "FOLLOW UP", "Return for the complimentary follow-up detail included with the package."],
] as const;

export default function CeramicPage() {
  return (
    <div className="cer70">
      <section className="cer70-hero">
        <Image src="/images/mercedes-paint.webp" alt="Corrected Mercedes paint with deep gloss" fill priority sizes="100vw" />
        <div className="cer70-hero-shade" />
        <div className="cer70-reflection" aria-hidden="true" />
        <div className="cer70-shell cer70-hero-inner">
          <div className="cer70-hero-copy">
            <p className="cer70-kicker">2-YEAR CERAMIC COATING</p>
            <h1>KEEP THE<br />FINISH <span>RIGHT.</span></h1>
            <p>Paint correction, professional ceramic protection and a complimentary follow-up detail in one package.</p>
            <a href="#coating-quote" className="cer70-primary">GET MY COATING PLAN ↗</a>
          </div>
          <div className="cer70-hero-note">
            <span>EVERY DETAIL PAINT CARE</span>
            <strong>2 YEAR</strong>
            <small>CERAMIC PROTECTION</small>
          </div>
        </div>
      </section>

      <section className="cer70-offer-section">
        <div className="cer70-shell"><CeramicOffer /></div>
      </section>

      <section className="cer70-surface">
        <div className="cer70-shell cer70-surface-grid">
          <div className="cer70-surface-copy">
            <p className="cer70-kicker">WHY PREP MATTERS</p>
            <h2>THE COATING<br />PROTECTS <span>WHAT'S THERE.</span></h2>
            <p className="cer70-lede">That is why our ceramic package includes paint correction first. We improve the finish before we protect it.</p>
            <Link href="/paint-correction" className="cer70-text-link">ABOUT PAINT CORRECTION ↗</Link>
          </div>
          <figure className="cer70-surface-photo">
            <Image src="/images/red-paint-detail.webp" alt="Every Detail working on corrected automotive paint" fill sizes="(max-width: 900px) 92vw, 48vw" />
            <div className="cer70-surface-line" aria-hidden="true" />
            <figcaption><span>PREP</span><span>POLISH</span><span>PROTECT</span></figcaption>
          </figure>
        </div>
      </section>

      <section className="cer70-truth">
        <div className="cer70-shell cer70-truth-grid">
          <div>
            <p className="cer70-kicker">CERAMIC, CLEARLY</p>
            <h2>LESS STICKS.<br /><span>MORE STAYS.</span></h2>
          </div>
          <div className="cer70-does-grid">
            <div><h3>IT DOES</h3>{ceramicDoes.slice(0, 3).map((item) => <p key={item}>{item}</p>)}</div>
            <div><h3>IT DOES NOT</h3>{ceramicDoesNot.slice(0, 3).map((item) => <p key={item}>{item}</p>)}</div>
          </div>
        </div>
      </section>

      <section className="cer70-included">
        <div className="cer70-shell">
          <div className="cer70-section-head">
            <div><p className="cer70-kicker">THE PACKAGE</p><h2>FOUR STEPS.<br /><span>ONE FINISH.</span></h2></div>
            <p>{ceramic.bestFor}</p>
          </div>
          <div className="cer70-included-grid">
            {included.map(([number, title, body]) => (
              <article key={title}><span>{number}</span><h3>{title}</h3><p>{body}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="cer70-result">
        <div className="cer70-shell cer70-result-grid">
          <figure>
            <Image src="/images/black-truck-finished.jpg" alt="Black vehicle with a deep finished gloss after Every Detail paint care" fill sizes="(max-width: 900px) 100vw, 60vw" />
          </figure>
          <div className="cer70-result-copy">
            <p className="cer70-kicker">THE RESULT</p>
            <h2>DEEPER GLOSS.<br /><span>EASIER WASHES.</span></h2>
            <p>A coated car still needs to be washed. The difference is that water, dirt and contamination release more easily while the corrected finish stays protected.</p>
            <div className="cer70-review-proof"><strong><LiveReviewCount /></strong><span>FIVE-STAR REVIEWS · <GoogleMapsAttribution /></span></div>
          </div>
        </div>
      </section>

      <section id="coating-quote" className="cer70-quote">
        <div className="cer70-shell">
          <div className="cer70-section-head cer70-section-head-quote">
            <div><p className="cer70-kicker">YOUR CAR</p><h2>LET'S LOOK AT<br /><span>THE PAINT.</span></h2></div>
            <p>Tell us what you drive and what shape the paint is in. We will confirm the right preparation before coating.</p>
          </div>
          <PaintLeadForm kind="ceramic" />
        </div>
      </section>

      <section className="cer70-faq">
        <div className="cer70-shell cer70-faq-grid">
          <div><p className="cer70-kicker">QUICK ANSWERS</p><h2>BEFORE<br />YOU COAT.</h2></div>
          <FaqList faqs={paintFaqs.slice(1, 5)} />
        </div>
      </section>

      <JsonLd data={serviceSchema({ name: ceramic.name, description: ceramic.summary, path: "/ceramic", lowPrice: ceramic.startingAt })} />
    </div>
  );
}
