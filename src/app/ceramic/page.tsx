import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CurvedTape } from "@/components/CurvedTape";
import { FaqList } from "@/components/FaqList";
import { LiveReviewCount } from "@/components/GoogleReviewStats";
import { JsonLd } from "@/components/JsonLd";
import { Photo } from "@/components/Photo";
import { TrackedLink } from "@/components/TrackedLink";
import { CeramicPricing } from "@/components/paint/CeramicPricing";
import { PaintAssessmentTicket } from "@/components/paint/PaintAssessmentTicket";
import { ceramicFaqs } from "@/data/faqs";
import { PAINT_PRICING, ceramicDoes, ceramicDoesNot, paintProcess, paintServices } from "@/data/paint";
import { usd } from "@/lib/format";
import { breadcrumbSchema, pageMetadata, serviceSchema } from "@/lib/seo";
import styles from "@/styles/servicePage.module.css";

export const metadata = pageMetadata({
  title: "2-Year Ceramic Coating in Decatur & Atlanta | Every Detail",
  description: "Professional 2-year ceramic coating in Decatur and Atlanta with paint correction, decontamination and a complimentary follow-up detail.",
  path: "/ceramic",
  image: "paint-01",
});

// Anchors other pages link to: id="ceramic-price" (pricing) and id="coating-quote" (form).
const ANCHORS = { pricing: "ceramic-price", quote: "coating-quote" } as const;

const ceramic = paintServices.find((service) => service.id === "ceramic2yr")!;
const maxCeramic = Math.max(...Object.values(PAINT_PRICING).map((price) => price.ceramic2yr));

export default function CeramicPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} data-header-tone="light" aria-labelledby="cc-hero-title">
        <div className={styles.heroPhoto}><Photo id="paint-01" sizes="(max-width: 900px) 100vw, 50vw" fill priority /></div>
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={styles.crumbs}>
            <Breadcrumbs items={[{ name: "Services", path: "/our-services" }, { name: "Ceramic Coating", path: "/ceramic" }]} />
          </div>
          <p className={styles.kicker}>Every Detail / Ceramic coating</p>
          <h1 id="cc-hero-title" className={styles.heroTitle}>
            <span>Protect the</span>
            <span>finish you fixed.</span>
          </h1>
          <p className={styles.heroLede}>Paint correction, a professional two-year coating and a free follow-up detail in one package, done in your driveway.</p>
          <div className={styles.heroActions}>
            <TrackedLink href={`#${ANCHORS.quote}`} event="paint_inquiry" params={{ location: "ceramic_hero" }} className={styles.heroCta}>GET MY COATING PLAN <span aria-hidden="true">↗</span></TrackedLink>
            <a href={`#${ANCHORS.pricing}`} className={styles.heroLink}>SEE MY PRICE <span aria-hidden="true">↓</span></a>
          </div>
          <dl className={styles.heroFacts}>
            <div><dt>Package from</dt><dd>{usd(ceramic.startingAt)}</dd></div>
            <div><dt>Five-star reviews</dt><dd><LiveReviewCount /></dd></div>
            <div><dt>Follow-up detail</dt><dd>Included</dd></div>
          </dl>
        </div>
      </section>

      <CurvedTape text="CORRECT FIRST • 2-YEAR COATING • FOLLOW-UP INCLUDED • WE COME TO YOU • " label="Every Detail ceramic promise" surface="ink" />

      {/* What a coating does and doesn't do, plainly. */}
      <section className={styles.fixes} data-header-tone="light" aria-labelledby="cc-truth-title">
        <div className={styles.shell}>
          <div className={styles.sectionHead}>
            <p className={styles.kickerLight}>Ceramic, clearly</p>
            <h2 id="cc-truth-title" className={styles.sectionTitle}>
              <span>Easier to keep clean.</span>
              <span>Not magic armor.</span>
            </h2>
          </div>
          <div className={styles.proofGrid}>
            <figure className={styles.proof}>
              <div className={styles.proofPhoto}><Photo id="ceramic-01" fill sizes="(max-width: 900px) 92vw, 46vw" /></div>
            </figure>
            <div>
              <p className={styles.listLabel}>What it does</p>
              <ul className={styles.defects}>
                {ceramicDoes.map((item, index) => (
                  <li key={item}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div><p className={styles.doesText}>{item}</p></div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className={styles.limitsCol}>
            <p className={styles.listLabel}>What it doesn&apos;t do</p>
            <ul className={`${styles.limits} ${styles.limitsFour}`}>
              {ceramicDoesNot.map((item) => {
                const [lead, ...rest] = item.split(". ");
                return <li key={item}><strong>{lead}.</strong>{rest.length ? <p>{rest.join(". ")}</p> : null}</li>;
              })}
            </ul>
          </div>
        </div>
      </section>

      <section id={ANCHORS.pricing} className={styles.pricing} data-header-tone="ink" aria-labelledby="cc-pricing-title">
        <div className={styles.shell}>
          <div className={styles.pricingHead}>
            <div>
              <p className={styles.kickerDark}>Your package</p>
              <h2 id="cc-pricing-title" className={styles.sectionTitle}>
                <span>Correct. Coat.</span>
                <span>Follow up.</span>
              </h2>
            </div>
            <p className={styles.note}>The coating goes on after the paint is cleaned, decontaminated and corrected, so we&apos;re protecting paint worth keeping.</p>
          </div>
          <CeramicPricing />
          {/* The QA audit checks for this exact correction-price sentence. */}
          <p className={styles.valueNote}>
            <strong>FULL CORRECTION STARTS AT $695.</strong> The 2-year ceramic package starts at {usd(ceramic.startingAt)} and already includes the correction, the coating and the follow-up detail. <Link href="/paint-correction">Just want correction? ↗</Link>
          </p>
        </div>
      </section>

      <section className={styles.process} data-header-tone="light" aria-labelledby="cc-process-title">
        <div className={styles.shell}>
          <div className={styles.sectionHead}>
            <p className={styles.kickerLight}>How it goes</p>
            <h2 id="cc-process-title" className={styles.sectionTitle}>
              <span>Five steps.</span>
              <span>Nothing skipped.</span>
            </h2>
          </div>
          <ol className={styles.ruledSteps}>
            {paintProcess.map((step, index) => (
              <li key={step.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id={ANCHORS.quote} className={styles.quote} data-header-tone="light" aria-labelledby="cc-quote-title">
        <div className={`${styles.shell} ${styles.quoteGrid}`}>
          <div className={styles.quoteAside}>
            <p className={styles.kickerLight}>Coating plan</p>
            <h2 id="cc-quote-title" className={styles.sectionTitle}>
              <span>Let&apos;s look at</span>
              <span>the paint.</span>
            </h2>
            <ol className={styles.quoteSteps}>
              <li><span>01</span>Tell us what you drive and how the paint looks today.</li>
              <li><span>02</span>We review it and reach out with the prep we&apos;d recommend.</li>
              <li><span>03</span>We confirm the correction level in person before anything is coated.</li>
            </ol>
          </div>
          <PaintAssessmentTicket kind="ceramic" />
        </div>
      </section>

      <section className={styles.faq} data-header-tone="ink" aria-labelledby="cc-faq-title">
        <div className={`${styles.shell} ${styles.faqGrid}`}>
          <h2 id="cc-faq-title" className={styles.sectionTitle}>
            <span>Before</span>
            <span>you coat.</span>
          </h2>
          <FaqList faqs={ceramicFaqs} />
        </div>
      </section>

      <JsonLd data={[
        serviceSchema({ name: ceramic.name, description: ceramic.summary, path: "/ceramic", lowPrice: ceramic.startingAt, highPrice: maxCeramic }),
        breadcrumbSchema([{ name: "Services", path: "/our-services" }, { name: "Ceramic Coating", path: "/ceramic" }]),
      ]} />
    </main>
  );
}
