import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CurvedTape } from "@/components/CurvedTape";
import { FaqList } from "@/components/FaqList";
import { LiveReviewCount } from "@/components/GoogleReviewStats";
import { JsonLd } from "@/components/JsonLd";
import { Photo } from "@/components/Photo";
import { TrackedLink } from "@/components/TrackedLink";
import { PaintAssessmentTicket } from "@/components/paint/PaintAssessmentTicket";
import { PaintInspectionLight } from "@/components/paint/PaintInspectionLight";
import { PaintStagePricing } from "@/components/paint/PaintStagePricing";
import { paintCorrectionFaqs } from "@/data/faqs";
import { PAINT_PRICING, paintDefects, paintProcess, paintServices } from "@/data/paint";
import { usd } from "@/lib/format";
import { breadcrumbSchema, pageMetadata, serviceSchema } from "@/lib/seo";
import styles from "./paint.module.css";

export const metadata = pageMetadata({
  title: "Paint Correction in Decatur & Atlanta, GA | Every Detail",
  description: "Mobile paint correction in Decatur and Atlanta. Enhancement polishing and full correction with exact pricing by vehicle and an in-person paint assessment.",
  path: "/paint-correction",
  image: "paint-02",
});

// Anchors other pages link to: id="paint-options" (pricing) and id="paint-quote" (assessment form).
const ANCHORS = { pricing: "paint-options", quote: "paint-quote" } as const;

const enhancement = paintServices.find((service) => service.id === "enhancement")!;
const correction = paintServices.find((service) => service.id === "correction")!;
const maxEnhancement = Math.max(...Object.values(PAINT_PRICING).map((price) => price.enhancement));
const maxCorrection = Math.max(...Object.values(PAINT_PRICING).map((price) => price.correction));

const limits = [
  { name: "Deep scratches", detail: "Scratches through the clear coat can be improved, not always removed. We'll tell you up front." },
  { name: "Rock chips + dings", detail: "Missing paint and dents aren't a polishing problem. That's touch-up, PPF or body work." },
  { name: "Future swirls", detail: "Correction is a real change to the clear coat, but poor washing can put swirls back. Careful washing keeps it." },
];

const steps = paintProcess.filter((step) => step.title !== "Cure and follow up");
const stepPhotos = ["hq-black-suv-grille", "black-car-pressure-wash", "ceramic-02", "paint-01"];
const gallery = ["paint-02", "hq-black-suv-finished", "hq-white-ioniq-front", "classic-red-wheel", "hq-white-suv-finished"];

export default function PaintCorrectionPage() {
  return (
    <main className={styles.page}>
      {/* Hero: a technician machine polishing; the 50/50 proof sits in the next section. */}
      <section className={styles.hero} data-header-tone="light" aria-labelledby="pc-hero-title">
        <div className={styles.heroPhoto}><Photo id="paint-polisher" sizes="(max-width: 900px) 100vw, 50vw" fill priority /></div>
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={styles.crumbs}>
            <Breadcrumbs items={[{ name: "Services", path: "/our-services" }, { name: "Paint Correction", path: "/paint-correction" }]} />
          </div>
          <p className={styles.kicker}>Every Detail / Paint correction</p>
          <h1 id="pc-hero-title" className={styles.heroTitle}>
            <span>Bring the</span>
            <span>reflection back.</span>
          </h1>
          <p className={styles.heroLede}>Swirls, haze and dull clear coat, polished out in your driveway. We look at the paint in person and tell you which level it actually needs.</p>
          <div className={styles.heroActions}>
            <TrackedLink href={`#${ANCHORS.quote}`} event="paint_inquiry" params={{ location: "paint_hero" }} className={styles.heroCta}>GET MY PAINT ASSESSMENT <span aria-hidden="true">↗</span></TrackedLink>
            <a href={`#${ANCHORS.pricing}`} className={styles.heroLink}>SEE PRICING <span aria-hidden="true">↓</span></a>
          </div>
          <dl className={styles.heroFacts}>
            <div><dt>Polish from</dt><dd>{usd(enhancement.startingAt)}</dd></div>
            <div><dt>Five-star reviews</dt><dd><LiveReviewCount /></dd></div>
            <div><dt>Before we polish</dt><dd>Assessed</dd></div>
          </dl>
        </div>
      </section>

      <CurvedTape text="ASSESSED IN PERSON • PRICED BY VEHICLE • WE COME TO YOU • REAL 50/50 • " label="Every Detail paint promise" surface="ink" />

      {/* What correction fixes, and what it honestly can't. */}
      <section className={styles.fixes} data-header-tone="light" aria-labelledby="pc-fixes-title">
        <div className={styles.shell}>
          <div className={styles.sectionHead}>
            <p className={styles.kickerLight}>What it fixes</p>
            <h2 id="pc-fixes-title" className={styles.sectionTitle}>
              <span>Remove defects.</span>
              <span>Don&apos;t cover them.</span>
            </h2>
          </div>
          <div className={styles.proofGrid}>
            <figure className={styles.proof}>
              <PaintInspectionLight className={styles.proofPhoto} />
              <figcaption><span>← Corrected</span><span>As arrived →</span></figcaption>
            </figure>
            <div>
              <p className={styles.listLabel}>Correction takes out</p>
              <ul className={styles.defects}>
                {paintDefects.map((defect, index) => (
                  <li key={defect.name}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div><strong>{defect.name}</strong><p>{defect.detail}</p></div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className={styles.limitsCol}>
            <p className={styles.listLabel}>Straight answers</p>
            <ul className={styles.limits}>
              {limits.map((limit) => (
                <li key={limit.name}><strong>{limit.name}</strong><p>{limit.detail}</p></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id={ANCHORS.pricing} className={styles.pricing} data-header-tone="ink" aria-labelledby="pc-pricing-title">
        <div className={styles.shell}>
          <div className={styles.pricingHead}>
            <div>
              <p className={styles.kickerDark}>Pricing</p>
              <h2 id="pc-pricing-title" className={styles.sectionTitle}>
                <span>Two levels.</span>
                <span>One honest call.</span>
              </h2>
            </div>
            <p className={styles.note}>You don&apos;t need to diagnose your own paint. Pick a size to see the price, and we confirm the level in person before any polishing starts.</p>
          </div>
          <PaintStagePricing />
        </div>
      </section>

      <section className={styles.process} data-header-tone="light" aria-labelledby="pc-process-title">
        <div className={styles.shell}>
          <div className={styles.sectionHead}>
            <p className={styles.kickerLight}>How it goes</p>
            <h2 id="pc-process-title" className={styles.sectionTitle}>
              <span>Inspect. Wash.</span>
              <span>Correct. Protect.</span>
            </h2>
          </div>
          <ol className={styles.steps}>
            {steps.map((step, index) => (
              <li key={step.title} className={styles.step}>
                <div className={styles.stepPhoto}><Photo id={stepPhotos[index]} fill sizes="(max-width: 900px) 80vw, 24vw" /></div>
                <span className={styles.stepNum}>{String(index + 1).padStart(2, "0")}</span>
                <h3>{step.title === "Coat" ? "Protect (optional)" : step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.gallery} data-header-tone="ink" aria-label="Finished paint from Every Detail jobs">
        <div className={styles.galleryTrack}>
          {gallery.map((id) => (
            <div key={id} className={styles.galleryItem}><Photo id={id} fill sizes="(max-width: 640px) 70vw, 26vw" /></div>
          ))}
        </div>
        <p className={styles.galleryNote}>Finished paint, real Every Detail jobs. <TrackedLink href="/our-work#paint" event="paint_inquiry" params={{ location: "paint_gallery" }}>See more work ↗</TrackedLink></p>
      </section>

      <section id={ANCHORS.quote} className={styles.quote} data-header-tone="light" aria-labelledby="pc-quote-title">
        <div className={`${styles.shell} ${styles.quoteGrid}`}>
          <div className={styles.quoteAside}>
            <p className={styles.kickerLight}>Paint assessment</p>
            <h2 id="pc-quote-title" className={styles.sectionTitle}>
              <span>Let&apos;s see what</span>
              <span>it needs.</span>
            </h2>
            <ol className={styles.quoteSteps}>
              <li><span>01</span>Tell us the car and what bothers you about the paint.</li>
              <li><span>02</span>We review it and reach out with what we&apos;d recommend.</li>
              <li><span>03</span>We confirm the level in person before any polishing starts.</li>
            </ol>
          </div>
          <PaintAssessmentTicket />
        </div>
      </section>

      <section className={styles.faq} data-header-tone="ink" aria-labelledby="pc-faq-title">
        <div className={`${styles.shell} ${styles.faqGrid}`}>
          <h2 id="pc-faq-title" className={styles.sectionTitle}>
            <span>Before</span>
            <span>we polish.</span>
          </h2>
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
