import Image from "next/image";
import Link from "next/link";
import { PaintInspectionLight } from "@/components/PaintInspectionLight";
import { PaintPlanBuilder } from "@/components/PaintPlanBuilder";
import { PaintLabStatus } from "@/components/PaintLabStatus";
import { PaintLeadForm } from "@/components/PaintLeadForm";
import { FaqList } from "@/components/FaqList";
import { JsonLd } from "@/components/JsonLd";
import { LiveReviewCount } from "@/components/GoogleReviewStats";
import { paintFaqs } from "@/data/faqs";
import { ceramicDoes, ceramicDoesNot, paintServices } from "@/data/paint";
import { site } from "@/data/site";
import { usd } from "@/lib/format";
import { pageMetadata, serviceSchema } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Paint Correction & Ceramic Coating in Decatur & Atlanta | Every Detail",
  description: "Premium paint correction, enhancement polishing and 2-year ceramic coating in Decatur and Atlanta. Build a paint plan around the actual condition of your finish.",
  path: "/ceramic",
});

const PROCESS = [
  ["01", "DECONTAMINATE", "Get the surface honestly clean.", "A careful wash, chemical decontamination and clay as needed remove bonded material before any polishing begins."],
  ["02", "CORRECT", "Remove defects instead of covering them.", "Machine polishing is matched to the actual finish. Light haze may need one stage. Heavier swirls can require multiple stages."],
  ["03", "REFINE", "Build clarity and reflection.", "The final polishing work is about more than shine. It sharpens the reflection and leaves the finish looking deep, even and clean in real light."],
  ["04", "PROTECT", "Preserve the finish underneath.", "Protection goes on after the paint is ready. For long-term care, ceramic bonds to the prepared clear coat and makes routine washing easier."],
] as const;

const TRUST = [
  ["01", "LIGHT", "We inspect paint in direct light, because normal shade can hide wash marring, haze and fine defects."],
  ["02", "PROCESS", "Pad, polish and machine choice change with the paint. We do not force every finish into the same correction process."],
  ["03", "PREP", "The coating bottle is not the expensive part. Preparation and correction create the finish the coating is asked to preserve."],
  ["04", "FOLLOW-UP", "Our 2-year coating includes a complimentary follow-up detail so the finish is cleaned properly after installation."],
] as const;

export default function PaintCarePage() {
  return (
    <div className="pl57-page">
      <PaintLabStatus />

      <section className="pl57-hero" data-paint-lab="inspect">
        <div className="pl57-hero-photo" aria-hidden="true" />
        <div className="pl57-hero-shade" aria-hidden="true" />
        <div className="pl57-shell pl57-hero-grid">
          <div className="pl57-hero-copy">
            <p className="pl57-kicker">EVERY DETAIL / PAINT LAB</p>
            <h1>BRING THE<br />PAINT <span>BACK.</span></h1>
            <p className="pl57-hero-lede">Decontamination, paint correction and ceramic protection built around the actual condition of your finish.</p>
            <div className="pl57-hero-actions">
              <a href="#paint-plan" className="pl57-primary-btn">BUILD MY PAINT PLAN ↗</a>
              <a href="#inspection" className="pl57-hero-link">SEE THE PROCESS ↓</a>
            </div>
            <div className="pl57-hero-proof">
              <span><b><LiveReviewCount /></b> FIVE-STAR REVIEWS</span>
              <span>CORRECTION FROM {usd(paintServices[0].startingAt)}</span>
              <span>MOBILE PAINT CARE</span>
            </div>
          </div>

          <aside className="pl57-hero-report ed-paper ed-paper--crumpled">
            <span className="pl57-report-clip" aria-hidden="true" />
            <div className="pl57-report-head"><b>PAINT INSPECTION</b><span>ED / 01</span></div>
            <p>WE DO NOT START WITH THE PACKAGE.</p>
            <h2>We start with the finish.</h2>
            <dl>
              <div><dt>LOOK FOR</dt><dd>Swirls · haze · oxidation · scratches</dd></div>
              <div><dt>DECIDE</dt><dd>Enhance · correct · protect</dd></div>
              <div><dt>CONFIRM</dt><dd>In person before correction</dd></div>
            </dl>
            <span className="pl57-report-stamp">REAL PAINT / REAL PLAN</span>
          </aside>
        </div>
      </section>

      <section id="inspection" className="pl57-inspection" data-paint-lab="inspect">
        <div className="pl57-shell">
          <div className="pl57-section-head pl57-section-head-light">
            <p className="pl57-kicker">01 / INSPECT</p>
            <h2>SHINY DOESN’T<br />MEAN <span>HEALTHY.</span></h2>
            <p>Direct light tells the truth. It is how we judge clarity, wash marring, haze and the defects that interrupt reflection before choosing a polishing process.</p>
          </div>
          <PaintInspectionLight />
          <div className="pl57-defect-strip">
            <span>SWIRLS</span><span>HAZE</span><span>OXIDATION</span><span>LIGHT SCRATCHES</span><span>LOSS OF GLOSS</span>
          </div>
        </div>
      </section>

      <section id="paint-plan" className="pl57-plan ed-paper" data-paint-lab="plan">
        <div className="pl57-shell">
          <div className="pl57-section-head pl57-section-head-dark">
            <p className="pl57-kicker dark">02 / DIAGNOSE</p>
            <h2>WHAT DOES YOUR<br />PAINT <span>NEED?</span></h2>
            <p>Pick the description that sounds closest. We will show the likely starting point, then confirm the actual paint condition before any correction work starts.</p>
          </div>
          <PaintPlanBuilder />
        </div>
      </section>

      <section className="pl57-process" data-paint-lab="correct">
        <div className="pl57-shell">
          <div className="pl57-process-intro">
            <p className="pl57-kicker">03 / THE SEQUENCE</p>
            <h2>GOOD PAINT CARE<br />IS A <span>SEQUENCE.</span></h2>
            <p>High-ticket paint work should feel expensive because of the process, not because someone says “ceramic” enough times.</p>
          </div>
          <div className="pl57-process-stack">
            {PROCESS.map(([number, title, lead, body], index) => (
              <article key={title} className={`pl57-process-sheet ed-paper ${index % 2 ? "ed-paper--crumpled" : ""}`}>
                <span className="pl57-sheet-no">{number}</span>
                <div><p>{title}</p><h3>{lead}</h3><span>{body}</span></div>
                <b>PAINT LAB / {title}</b>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pl57-result" data-paint-lab="correct">
        <div className="pl57-result-photo"><Image src="/images/black-truck-finished.jpg" alt="Glossy black vehicle finish after professional paint care" fill sizes="100vw" /></div>
        <div className="pl57-result-shade" aria-hidden="true" />
        <div className="pl57-shell pl57-result-copy">
          <p className="pl57-kicker">THE RESULT</p>
          <h2>SAME PAINT.<br /><span>BETTER SURFACE.</span></h2>
          <p>Correction does not add a temporary shine over defects. It refines the clear coat so the reflection itself becomes cleaner, deeper and more even.</p>
          <p className="pl57-result-note">REAL EVERY DETAIL VEHICLE · NO STOCK CAR</p>
        </div>
      </section>

      <section className="pl57-ceramic ed-paper ed-paper--ink" data-paint-lab="protect">
        <div className="pl57-shell">
          <div className="pl57-ceramic-grid">
            <div className="pl57-ceramic-copy">
              <p className="pl57-kicker">04 / PROTECT</p>
              <h2>CERAMIC ISN’T MAGIC.<br /><span>IT’S PROTECTION.</span></h2>
              <p>A professional coating bonds to prepared clear coat. It keeps a corrected finish easier to wash and better protected from UV, oxidation and environmental fallout.</p>
              <div className="pl57-ceramic-traits"><span>GLOSS</span><span>EASIER MAINTENANCE</span><span>LONG-TERM PROTECTION</span></div>
            </div>
            <div className="pl57-gloss-panel">
              <div className="pl57-gloss-orb" aria-hidden="true" />
              <span className="pl57-gloss-label">CERAMIC / 02 YEAR</span>
              <strong>HYDROPHOBIC<br />≠ SCRATCH-PROOF</strong>
              <p>We would rather tell you what ceramic cannot do than sell you something you do not understand.</p>
            </div>
          </div>

          <div className="pl57-truth-grid">
            <div><p>WHAT IT DOES</p>{ceramicDoes.slice(0,3).map((item) => <span key={item}>{item}</span>)}</div>
            <div><p>WHAT IT DOESN’T</p>{ceramicDoesNot.slice(0,3).map((item) => <span key={item}>{item}</span>)}</div>
          </div>
        </div>
      </section>

      <section className="pl57-layers ed-paper ed-paper--crumpled" data-paint-lab="protect">
        <div className="pl57-shell pl57-layers-grid">
          <div>
            <p className="pl57-kicker dark">WHY CORRECTION COMES FIRST</p>
            <h2>A COATING PRESERVES<br /><span>WHAT’S UNDER IT.</span></h2>
            <p>Putting premium protection over neglected paint does not repair neglected paint. The finish is built underneath, then the protection is asked to preserve it.</p>
          </div>
          <div className="pl57-layer-diagram" aria-label="Paint protection layer diagram">
            <div className="is-coat"><span>03</span><strong>CERAMIC PROTECTION</strong><small>Durable bonded protection</small></div>
            <div className="is-finish"><span>02</span><strong>REFINED CLEAR COAT</strong><small>The clarity and gloss you actually see</small></div>
            <div className="is-paint"><span>01</span><strong>PAINT SYSTEM</strong><small>The finish we are protecting</small></div>
          </div>
        </div>
      </section>

      <section id="packages" className="pl57-tickets" data-paint-lab="protect">
        <div className="pl57-shell">
          <div className="pl57-section-head pl57-section-head-dark">
            <p className="pl57-kicker dark">WORK ORDERS</p>
            <h2>THREE WAYS<br />INTO THE <span>PAINT LAB.</span></h2>
            <p>The right choice comes from the finish and your goal, not from automatically buying the highest number.</p>
          </div>
          <div className="pl57-ticket-grid">
            {paintServices.map((service, index) => (
              <article key={service.id} className={`pl57-work-ticket ed-paper ed-paper--crumpled ${service.id === "ceramic2yr" ? "is-featured" : ""}`}>
                <div className="pl57-ticket-top"><span>WORK ORDER 0{index + 1}</span><b>{service.id === "ceramic2yr" ? "PROTECT" : service.id === "correction" ? "CORRECT" : "ENHANCE"}</b></div>
                <h3>{service.name}</h3>
                <p className="pl57-ticket-best">{service.bestFor}</p>
                <div className="pl57-ticket-price"><small>STARTING AT</small><strong>{usd(service.startingAt)}</strong></div>
                <ul>{service.includes.map((item) => <li key={item}>{item}</li>)}</ul>
                <a href="#paint-quote" className={service.id === "ceramic2yr" ? "pl57-primary-btn" : "pl57-ticket-btn"}>ASK ABOUT THIS WORK ORDER ↗</a>
                <p className="pl57-ticket-fine">Final price is confirmed after the vehicle and paint condition are reviewed.</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pl57-trust">
        <div className="pl57-shell">
          <div className="pl57-trust-head">
            <div><p className="pl57-kicker">THE PART YOU DON’T SEE</p><h2>THE WORK BEHIND<br />THE <span>GLOSS.</span></h2></div>
            <p>Paint care is where process matters most. The finish is the visible result of decisions made before the final wipe.</p>
          </div>
          <div className="pl57-trust-grid">
            <div className="pl57-trust-list">{TRUST.map(([number, title, body]) => <article key={title}><span>{number}</span><div><h3>{title}</h3><p>{body}</p></div></article>)}</div>
            <div className="pl57-photo-stack" aria-label="Real Every Detail paint care work">
              <figure className="pl57-photo-a"><Image src="/images/exterior-hand-detail.jpg" alt="Every Detail technician working carefully on a vehicle exterior" fill sizes="(max-width: 900px) 76vw, 34vw" /></figure>
              <figure className="pl57-photo-b"><Image src="/images/red-paint-detail.jpg" alt="Glossy red paint finish after detailing" fill sizes="(max-width: 900px) 66vw, 28vw" /></figure>
              <span>REAL CARS.<br />REAL CREW.</span>
            </div>
          </div>
        </div>
      </section>

      <section id="paint-quote" className="pl57-form ed-paper">
        <div className="pl57-shell">
          <div className="pl57-form-banner"><span>YOUR PAINT.</span><b>YOUR PLAN.</b></div>
          <PaintLeadForm kind="paint-care" />
        </div>
      </section>

      <section className="pl57-faq ed-paper">
        <div className="pl57-shell pl57-faq-grid">
          <div><p className="pl57-kicker dark">BEFORE THE WORK ORDER</p><h2>PAINT CARE<br />QUESTIONS.</h2></div>
          <FaqList faqs={paintFaqs} />
        </div>
      </section>

      <section className="pl57-final ed-paper ed-paper--coral ed-paper--crumpled">
        <div className="pl57-shell">
          <p>EVERY DETAIL / PAINT LAB</p>
          <h2>YOUR PAINT.<br /><span>YOUR PLAN.</span></h2>
          <div><a href="#paint-quote" className="pl57-final-btn">BUILD MY PAINT PLAN ↗</a><a href={site.phone.sms}>TEXT US ABOUT MY PAINT ↗</a></div>
        </div>
      </section>

      <JsonLd data={paintServices.map((service) => serviceSchema({ name: service.name, description: service.summary, path: "/ceramic", lowPrice: service.startingAt }))} />
    </div>
  );
}
