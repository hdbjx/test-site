import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CtaBand } from "@/components/CtaBand";
import { CurvedTape } from "@/components/CurvedTape";
import { FaqList } from "@/components/FaqList";
import { LiveReviewCount } from "@/components/GoogleReviewStats";
import { JsonLd } from "@/components/JsonLd";
import { Photo } from "@/components/Photo";
import { ServicesBoard } from "@/components/services/ServicesBoard";
import { TrackedLink } from "@/components/TrackedLink";
import { homeFaqs } from "@/data/faqs";
import { PAINT_PRICING, paintServices } from "@/data/paint";
import { PRICING, serviceList, startingPrice, vehicles } from "@/data/services";
import { usd } from "@/lib/format";
import { pageMetadata, serviceSchema } from "@/lib/seo";
import styles from "./services.module.css";

export const metadata = pageMetadata({
  title: "Car Detailing Services & Pricing | Every Detail Decatur",
  description: "Compare Every Detail services, see pricing for your vehicle, and choose Maintenance, Premium, Factory Reset, paint correction, ceramic coating, or Detail+.",
  path: "/our-services",
  image: "two-tech-interior-detail",
});

// Anchors other pages link to (nav, journey drawer). The board renders each tier with its service slug.
const serviceAnchors = {
  menu: { anchor: "all-services" },
  maintenance: { anchor: "maintenance-detail" },
  premium: { anchor: "premium-detail" },
  factoryReset: { anchor: "factory-reset" },
} as const;

const STEPS = [
  { title: "Pick the detail", body: "Choose the level and your vehicle size. You see your exact price before you book." },
  { title: "Choose an open time", body: "The calendar shows real open times for your service and vehicle." },
  { title: "We bring the shop", body: "The crew arrives with power, water and every product. You just need the car parked with room around it." },
] as const;

const DETAIL_PLUS_TERMS = [
  ["Rhythm", "Every 2, 4 or 6 wks"],
  ["Rate", "Flat per visit"],
  ["Contract", "None"],
] as const;

export default function ServicesPage() {
  const schemas = [
    ...serviceList.map((service) => {
      const prices = vehicles.map((vehicle) => PRICING[vehicle.id][service.id].price);
      return serviceSchema({ name: service.name, description: service.summary, path: `/our-services#${service.slug}`, lowPrice: Math.min(...prices), highPrice: Math.max(...prices) });
    }),
    ...paintServices.map((service) => {
      const prices = vehicles.map((vehicle) => PAINT_PRICING[vehicle.id][service.id]);
      return serviceSchema({ name: service.name, description: service.summary, path: "/ceramic", lowPrice: Math.min(...prices), highPrice: Math.max(...prices) });
    }),
  ];

  return (
    <>
      <main className={styles.page}>
        {/* Hero: homepage-style full-bleed photo, one headline, one decision. */}
        <section className={styles.hero} data-header-tone="light" aria-labelledby="sv-hero-title">
          <div className={styles.heroPhoto}><Photo id="classic-car-cockpit" sizes="100vw" fill priority /></div>
          <div className={styles.heroShade} aria-hidden="true" />
          <div className={styles.heroInner}>
            <div className={styles.crumbs}><Breadcrumbs items={[{ name: "Detailing Services", path: "/our-services" }]} /></div>
            <p className={styles.kicker}>Every Detail / Service menu</p>
            <h1 id="sv-hero-title" className={styles.heroTitle}>
              <span>Pick your detail.</span>
              <span>See your price.</span>
            </h1>
            <p className={styles.heroLede}>Three levels of clean, priced by vehicle and done in your driveway. We bring the power and the water.</p>
            <div className={styles.heroActions}>
              <TrackedLink href="/book" event="book_click" params={{ location: "services_hero" }} className={styles.heroCta}>BOOK DIRECTLY <span aria-hidden="true">↗</span></TrackedLink>
              <TrackedLink href="/get-a-quote" event="quote_start" params={{ location: "services_hero" }} className={`${styles.heroLink} svc-audit-quiz-link`}>NOT SURE? FIND MY DETAIL <span aria-hidden="true">↗</span></TrackedLink>
            </div>
            <dl className={styles.heroFacts}>
              <div><dt>Details from</dt><dd>{usd(startingPrice("maintenance"))}</dd></div>
              <div><dt>Five-star reviews</dt><dd><LiveReviewCount /></dd></div>
              <div><dt>Power + water</dt><dd>Included</dd></div>
            </dl>
          </div>
        </section>

        <CurvedTape text="PRICED BY VEHICLE • POWER + WATER INCLUDED • WE COME TO YOU • REAL CREW • " label="Every Detail service promise" />

        <ServicesBoard anchorId={serviceAnchors.menu.anchor} />

        {/* Beyond the core details: paint care and the recurring club, priced like the board. */}
        <section className={styles.beyond} data-header-tone="light" aria-labelledby="sv-beyond-title">
          <div className={styles.shell}>
            <div className={styles.sectionHead}>
              <p className={styles.kickerLight}>After the detail</p>
              <h2 id="sv-beyond-title" className={styles.sectionTitle}>
                <span>Protect the paint.</span>
                <span>Keep it clean.</span>
              </h2>
            </div>

            <div className={styles.beyondGrid}>
              <article className={styles.card}>
                <div className={styles.cardPhoto}><Photo id="classic-red-wheel" sizes="(max-width: 900px) 92vw, 46vw" fill /></div>
                <div className={styles.cardBody}>
                  <p className={styles.cardLabel}>01 / Paint care</p>
                  <h3 className={styles.cardTitle}>Bring back the gloss.</h3>
                  <ul className={styles.priceList}>
                    {paintServices.map((service) => (
                      <li key={service.id}>
                        <span>{service.name}</span>
                        <i aria-hidden="true" />
                        <strong><small>from</small> {usd(service.startingAt)}</strong>
                      </li>
                    ))}
                  </ul>
                  <div className={styles.cardActions}>
                    <TrackedLink href="/paint-correction" event="paint_inquiry" params={{ location: "services_beyond" }} className={styles.cardCta}>Paint correction <span aria-hidden="true">↗</span></TrackedLink>
                    <TrackedLink href="/ceramic" event="paint_inquiry" params={{ location: "services_beyond" }} className={styles.cardLink}>Ceramic coating ↗</TrackedLink>
                  </div>
                </div>
              </article>

              <article className={`${styles.card} ${styles.cardPlus}`}>
                <div className={styles.cardPhoto}><Photo id="crew-shirt-van" sizes="(max-width: 900px) 92vw, 46vw" fill /></div>
                <div className={styles.cardBody}>
                  <p className={styles.cardLabel}>02 / Detail+ service club</p>
                  <h3 className={styles.cardTitle}>Stay clean. Skip the reset.</h3>
                  <ul className={styles.priceList}>
                    {DETAIL_PLUS_TERMS.map(([term, value]) => (
                      <li key={term}>
                        <span>{term}</span>
                        <i aria-hidden="true" />
                        <strong>{value}</strong>
                      </li>
                    ))}
                  </ul>
                  <div className={styles.cardActions}>
                    <TrackedLink href="/detailplus#club-builder" event="detailplus_start" params={{ location: "services_beyond" }} className={styles.cardCta}>Build my plan <span aria-hidden="true">↗</span></TrackedLink>
                    <TrackedLink href="/detailplus" event="detailplus_start" params={{ location: "services_beyond_learn" }} className={styles.cardLink}>How Detail+ works ↗</TrackedLink>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* How booking works: a real sequence, so it is numbered. */}
        <section className={styles.steps} data-header-tone="ink" aria-labelledby="sv-steps-title">
          <div className={styles.shell}>
            <div className={styles.stepsHead}>
              <h2 id="sv-steps-title" className={styles.sectionTitle}>
                <span>Booked in</span>
                <span>three steps.</span>
              </h2>
              <TrackedLink href="/book" event="book_click" params={{ location: "services_steps" }} className={styles.stepsCta}>Choose a time <span aria-hidden="true">↗</span></TrackedLink>
            </div>
            <ol className={styles.stepList}>
              {STEPS.map((step, index) => (
                <li key={step.title} className={styles.step}>
                  <span className={styles.stepNumber}>0{index + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="sv90-faq" data-header-tone="ink" aria-labelledby="sv90-faq-title">
          <div className="sv90-shell sv90-faq-grid">
            <div className="sv90-faq-heading"><h2 id="sv90-faq-title" className="ed90-heading">BEFORE<br /><span>YOU BOOK.</span></h2></div>
            <FaqList faqs={homeFaqs.slice(0, 5)} />
          </div>
        </section>
      </main>
      <CtaBand location="services_final" title="Ready when you are." body="Choose the service, vehicle, and time." quoteLabel="Find my detail" />
      <JsonLd data={schemas} />
    </>
  );
}
