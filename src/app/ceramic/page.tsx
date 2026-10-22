import Image from "next/image";
import { PaintInspectionLight } from "@/components/PaintInspectionLight";
import { PaintPlanBuilder } from "@/components/PaintPlanBuilder";
import { PaintLabStatus } from "@/components/PaintLabStatus";
import { PaintLeadForm } from "@/components/PaintLeadForm";
import { FaqList } from "@/components/FaqList";
import { JsonLd } from "@/components/JsonLd";
import { LiveReviewCount } from "@/components/GoogleReviewStats";
import { paintFaqs } from "@/data/faqs";
import { ceramicDoes, ceramicDoesNot, paintServices } from "@/data/paint";
import { usd } from "@/lib/format";
import { pageMetadata, serviceSchema } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Paint Correction & Ceramic Coating in Decatur & Atlanta | Every Detail",
  description: "Premium paint correction, enhancement polishing and 2-year ceramic coating in Decatur and Atlanta. Build a paint plan around the actual condition of your finish.",
  path: "/ceramic",
});

const PROCESS = [
  ["01", "DECONTAMINATE", "Start with honestly clean paint.", "Wash and bonded contamination removal come before polishing."],
  ["02", "CORRECT", "Reduce the defects you actually see.", "Polishing is matched to the finish, from light haze to heavier swirls."],
  ["03", "REFINE", "Bring clarity back to the reflection.", "Final polishing sharpens gloss, depth and consistency in real light."],
  ["04", "PROTECT", "Preserve the finish underneath.", "Protection goes on only after the paint is ready for it."],
] as const;

const TRUST = [
  ["01", "DIRECT LIGHT", "We inspect in lighting that exposes wash marring, haze and fine defects instead of hiding them."],
  ["02", "PAINT-SPECIFIC PROCESS", "Pad, polish and machine choice change with the finish. Every vehicle does not get the same correction recipe."],
  ["03", "FOLLOW-UP", "Our 2-year coating includes a complimentary follow-up detail so the finish is cleaned properly after installation."],
] as const;

export default function PaintCarePage() {
  return (
    <div className="pl57-page pl60-page">
      <PaintLabStatus />

      <section className="pl57-hero pl60-hero" data-paint-lab="inspect">
        <div className="pl57-hero-photo" aria-hidden="true" />
        <div className="pl57-hero-shade" aria-hidden="true" />
        <div className="pl57-shell pl57-hero-grid">
          <div className="pl57-hero-copy">
            <p className="pl57-kicker">EVERY DETAIL / PAINT LAB</p>
            <h1>BRING THE<br />PAINT <span>BACK.</span></h1>
            <p className="pl57-hero-lede">Paint correction and ceramic protection built around the condition of your finish, not a one-size-fits-all package.</p>
            <div className="pl57-hero-actions">
              <a href="#paint-plan" className="pl57-primary-btn">BUILD MY PAINT PLAN ↗</a>
              <a href="#inspection" className="pl57-hero-link">SEE THE PROCESS ↓</a>
            </div>
            <div className="pl57-hero-proof">
              <span><b><LiveReviewCount /></b> FIVE-STAR REVIEWS</span>
              <span>PAINT CARE FROM {usd(paintServices[0].startingAt)}</span>
              <span>MOBILE SERVICE</span>
            </div>
          </div>

          <aside className="pl57-hero-report ed-paper">
            <div className="pl57-report-head"><b>PAINT ASSESSMENT</b><span>ED / 01</span></div>
            <h2>We start with the finish.</h2>
            <dl>
              <div><dt>INSPECT</dt><dd>Swirls, haze, oxidation and scratches</dd></div>
              <div><dt>PLAN</dt><dd>Enhance, correct or protect</dd></div>
              <div><dt>CONFIRM</dt><dd>Final process before correction begins</dd></div>
            </dl>
          </aside>
        </div>
      </section>

      <section id="inspection" className="pl57-inspection pl60-inspection" data-paint-lab="inspect">
        <div className="pl57-shell">
          <div className="pl60-section-intro pl60-section-intro-dark">
            <div>
              <p className="pl57-kicker">01 / INSPECT</p>
              <h2>SHINY DOESN’T MEAN <span>HEALTHY.</span></h2>
            </div>
            <p>Direct light exposes the defects normal shade can hide. Move the inspection light across the finish to see why we diagnose before we polish.</p>
          </div>
          <PaintInspectionLight />
          <div className="pl57-defect-strip">
            <span>SWIRLS</span><span>HAZE</span><span>OXIDATION</span><span>LIGHT SCRATCHES</span>
          </div>
        </div>
      </section>

      <section id="paint-plan" className="pl57-plan pl60-plan" data-paint-lab="diagnose">
        <div className="pl57-shell">
          <div className="pl60-section-intro">
            <div>
              <p className="pl57-kicker dark">02 / DIAGNOSE</p>
              <h2>WHAT DOES YOUR PAINT <span>NEED?</span></h2>
            </div>
            <p>Choose the description that sounds closest. We will show the likely starting point, then confirm the finish before any correction work begins.</p>
          </div>
          <PaintPlanBuilder />
        </div>
      </section>

      <section className="pl57-process pl60-process" data-paint-lab="process">
        <div className="pl57-shell">
          <div className="pl60-section-intro pl60-section-intro-dark">
            <div>
              <p className="pl57-kicker">03 / PROCESS</p>
              <h2>THE RESULT COMES FROM <span>THE PROCESS.</span></h2>
            </div>
            <p>Correction is a sequence. Each step prepares the finish for the next, so protection is preserving good paint instead of covering problems.</p>
          </div>

          <div className="pl60-process-grid">
            {PROCESS.map(([number, title, lead, body]) => (
              <article key={title} className="pl60-process-card ed-paper">
                <div className="pl60-process-number">{number}</div>
                <p>{title}</p>
                <h3>{lead}</h3>
                <span>{body}</span>
              </article>
            ))}
          </div>

          <div className="pl60-proof-photo">
            <Image src="/images/exterior-hand-detail.jpg" alt="Every Detail technician carefully working on a vehicle exterior" fill sizes="100vw" />
            <div className="pl60-proof-photo-shade" aria-hidden="true" />
            <div className="pl60-proof-photo-copy">
              <p>REAL WORK / REAL CREW</p>
              <strong>Paint care is hands-on, inspected, and adjusted to the car in front of us.</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="pl57-ceramic pl60-ceramic" data-paint-lab="protect">
        <div className="pl57-shell">
          <div className="pl60-section-intro pl60-section-intro-dark">
            <div>
              <p className="pl57-kicker">04 / PROTECT</p>
              <h2>CERAMIC ISN’T MAGIC. <span>IT’S PROTECTION.</span></h2>
            </div>
            <p>A professional coating bonds to prepared clear coat. It improves gloss, makes maintenance easier, and adds durable protection, but it does not make paint scratch-proof.</p>
          </div>

          <div className="pl60-ceramic-grid">
            <div className="pl60-truth-card is-do">
              <p>WHAT IT DOES</p>
              {ceramicDoes.slice(0,3).map((item) => <span key={item}>{item}</span>)}
            </div>
            <div className="pl60-truth-card is-not">
              <p>WHAT IT DOESN’T</p>
              {ceramicDoesNot.slice(0,3).map((item) => <span key={item}>{item}</span>)}
            </div>
          </div>

          <div className="pl60-prep-strip">
            <div>
              <p>WHY PREP COMES FIRST</p>
              <h3>A coating preserves what is underneath it.</h3>
            </div>
            <div className="pl60-layer-steps" aria-label="Paint protection layers">
              <span><b>01</b> PAINT SYSTEM</span>
              <i aria-hidden="true">→</i>
              <span><b>02</b> REFINED CLEAR COAT</span>
              <i aria-hidden="true">→</i>
              <span><b>03</b> CERAMIC PROTECTION</span>
            </div>
          </div>
        </div>
      </section>

      <section id="packages" className="pl57-tickets pl60-tickets" data-paint-lab="choose">
        <div className="pl57-shell">
          <div className="pl60-section-intro">
            <div>
              <p className="pl57-kicker dark">05 / CHOOSE</p>
              <h2>THREE LEVELS OF <span>PAINT CARE.</span></h2>
            </div>
            <p>Start with the result you want. We confirm the exact process after we understand the paint condition.</p>
          </div>

          <div className="pl57-ticket-grid pl60-ticket-grid">
            {paintServices.map((service, index) => (
              <article key={service.id} className={`pl57-work-ticket pl60-work-ticket ${service.id === "ceramic2yr" ? "is-featured" : ""}`}>
                <div className="pl57-ticket-top"><span>WORK ORDER 0{index + 1}</span><b>{service.id === "ceramic2yr" ? "PROTECT" : service.id === "correction" ? "CORRECT" : "ENHANCE"}</b></div>
                <h3>{service.name}</h3>
                <p className="pl57-ticket-best">{service.bestFor}</p>
                <div className="pl57-ticket-price"><small>STARTING AT</small><strong>{usd(service.startingAt)}</strong></div>
                <ul>{service.includes.map((item) => <li key={item}>{item}</li>)}</ul>
                <a href="#paint-quote" className={service.id === "ceramic2yr" ? "pl57-primary-btn" : "pl57-ticket-btn"}>ASK ABOUT THIS SERVICE ↗</a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pl60-trust" data-paint-lab="choose">
        <div className="pl57-shell pl60-trust-grid">
          <div className="pl60-trust-copy">
            <p className="pl57-kicker">WHY TRUST US WITH PAINT</p>
            <h2>THE WORK BEHIND THE <span>GLOSS.</span></h2>
            <div className="pl60-trust-list">
              {TRUST.map(([number, title, body]) => (
                <article key={title}>
                  <span>{number}</span>
                  <div><h3>{title}</h3><p>{body}</p></div>
                </article>
              ))}
            </div>
          </div>
          <figure className="pl60-trust-photo">
            <Image src="/images/black-truck-finished.jpg" alt="Glossy black vehicle after professional paint care by Every Detail" fill sizes="(max-width: 900px) 100vw, 46vw" />
            <figcaption>REAL EVERY DETAIL VEHICLE</figcaption>
          </figure>
        </div>
      </section>

      <section id="paint-quote" className="pl57-form pl60-form" data-paint-lab="plan">
        <div className="pl57-shell">
          <div className="pl60-section-intro">
            <div>
              <p className="pl57-kicker dark">06 / YOUR PLAN</p>
              <h2>LET’S LOOK AT <span>YOUR PAINT.</span></h2>
            </div>
            <p>Send us the vehicle and what you are seeing. We will review it and recommend the level of correction or protection that makes sense.</p>
          </div>
          <PaintLeadForm kind="paint-care" />
        </div>
      </section>

      <section className="pl57-faq pl60-faq">
        <div className="pl57-shell pl60-faq-grid">
          <div><p className="pl57-kicker dark">QUICK ANSWERS</p><h2>BEFORE YOU BOOK.</h2></div>
          <FaqList faqs={paintFaqs.slice(0, 4)} />
        </div>
      </section>

      <JsonLd data={paintServices.map((service) => serviceSchema({ name: service.name, description: service.summary, path: "/ceramic", lowPrice: service.startingAt }))} />
    </div>
  );
}
