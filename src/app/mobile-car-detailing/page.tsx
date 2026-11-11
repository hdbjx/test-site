import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CtaBand } from "@/components/CtaBand";
import { CurvedTape } from "@/components/CurvedTape";
import { FaqList } from "@/components/FaqList";
import { LiveReviewCount } from "@/components/GoogleReviewStats";
import { JsonLd } from "@/components/JsonLd";
import { Photo } from "@/components/Photo";
import { TrackedLink } from "@/components/TrackedLink";
import { CrewStrip } from "@/components/ed/CrewStrip";
import { ServicesBoard } from "@/components/services/ServicesBoard";
import { areas } from "@/data/areas";
import { homeFaqs, visible } from "@/data/faqs";
import { startingPrice } from "@/data/services";
import { usd } from "@/lib/format";
import { breadcrumbSchema, pageMetadata, serviceSchema } from "@/lib/seo";
import styles from "@/styles/servicePage.module.css";

// The crew strip reads the live roster; refresh it every five minutes like About.
export const revalidate = 300;

export const metadata = pageMetadata({
  title: "Mobile Car Detailing in Decatur & Atlanta, GA | Every Detail",
  description: "Inside-and-out mobile car detailing in Decatur and nearby Atlanta areas with electric rigs that bring their own power and water.",
  path: "/mobile-car-detailing",
  image: "hq-branded-van-side",
});

const covers = [
  {
    name: "Interior",
    detail: "Vacuuming, seats, mats, dash, console, cupholders, doors, panels, glass and cargo areas, with deeper work when the service calls for it.",
  },
  {
    name: "Exterior",
    detail: "Hand washing, wheels and tires, exterior glass and finishing work, with paint protection or decontamination depending on the service.",
  },
  {
    name: "Your driveway",
    detail: "Our electric rigs carry their own water and battery power. No generator running, no outlet needed. You provide the car and room to work around it.",
  },
];

const straight = [
  { name: "First visit", detail: "Premium fits most cars we haven't seen before. It sets the clean baseline everything else builds on." },
  { name: "Heavy buildup", detail: "Pet hair, stains, spills, odor or years of use: Factory Reset adds the time and extraction that takes." },
  { name: "Already clean", detail: "Maintenance is for cars that already have a clean baseline and need to stay that way." },
];

export default function MobileCarDetailingPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} data-header-tone="light" aria-labelledby="mcd-hero-title">
        <div className={styles.heroPhoto}><Photo id="hq-mobile-rig-fleet" sizes="(max-width: 900px) 100vw, 50vw" fill priority /></div>
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={styles.crumbs}>
            <Breadcrumbs items={[{ name: "Services", path: "/our-services" }, { name: "Mobile Car Detailing", path: "/mobile-car-detailing" }]} />
          </div>
          <p className={styles.kicker}>Every Detail / Mobile car detailing</p>
          <h1 id="mcd-hero-title" className={styles.heroTitle}>
            <span>The detail shop</span>
            <span>comes to you.</span>
          </h1>
          <p className={styles.heroLede}>Full inside-and-out car detailing in Decatur and nearby Atlanta. We bring the crew, the water, the power and the products to your driveway.</p>
          <div className={styles.heroActions}>
            <TrackedLink href="/book" event="book_click" params={{ location: "mobile_detailing_hero" }} className={styles.heroCta}>BOOK YOUR DETAIL <span aria-hidden="true">↗</span></TrackedLink>
            <TrackedLink href="/get-a-quote" event="quote_start" params={{ location: "mobile_detailing_hero" }} className={styles.heroLink}>NOT SURE? FIND MY DETAIL <span aria-hidden="true">↗</span></TrackedLink>
          </div>
          <dl className={styles.heroFacts}>
            <div><dt>Details from</dt><dd>{usd(startingPrice("maintenance"))}</dd></div>
            <div><dt>Five-star reviews</dt><dd><LiveReviewCount /></dd></div>
            <div><dt>Power + water</dt><dd>Included</dd></div>
          </dl>
        </div>
      </section>

      <CurvedTape text="INSIDE + OUT • ELECTRIC RIGS • POWER + WATER INCLUDED • WE COME TO YOU • " label="Every Detail mobile detailing" surface="ink" />

      <section className={styles.fixes} data-header-tone="light" aria-labelledby="mcd-whole-title">
        <div className={styles.shell}>
          <div className={styles.sectionHead}>
            <p className={styles.kickerLight}>What mobile means here</p>
            <h2 id="mcd-whole-title" className={styles.sectionTitle}>
              <span>One appointment.</span>
              <span>The whole car.</span>
            </h2>
          </div>
          <div className={styles.proofGrid}>
            <figure className={styles.proof}>
              <div className={styles.proofPhoto}><Photo id="two-tech-interior-detail" fill sizes="(max-width: 900px) 92vw, 46vw" /></div>
            </figure>
            <div>
              <p className={styles.listLabel}>Every core detail covers</p>
              <ul className={styles.defects}>
                {covers.map((item, index) => (
                  <li key={item.name}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div><strong>{item.name}</strong><p>{item.detail}</p></div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className={styles.limitsCol}>
            <p className={styles.listLabel}>Where to start</p>
            <ul className={styles.limits}>
              {straight.map((item) => (
                <li key={item.name}><strong>{item.name}</strong><p>{item.detail}</p></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <ServicesBoard anchorId="mobile-detailing-pricing" />

      <section className={styles.quote} data-header-tone="light" aria-labelledby="mcd-area-title">
        <div className={`${styles.shell} ${styles.quoteGrid}`}>
          <div className={styles.quoteAside}>
            <p className={styles.kickerLight}>Service area</p>
            <h2 id="mcd-area-title" className={styles.sectionTitle}>
              <span>Based in Decatur.</span>
              <span>Out across Atlanta.</span>
            </h2>
            <p className={styles.note}>
              Two electric rigs, booked by where the crew can actually get to. Outside the list? <Link href="/service-areas">Check your address ↗</Link>
            </p>
            <CrewStrip />
          </div>
          <ol className="mcd-areas">
            {areas.map((area, index) => (
              <li key={area.slug}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {area.page ? <Link href={`/service-areas/${area.slug}`}>{area.name}</Link> : area.name}
                {area.primary && <small>Home base</small>}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.faq} data-header-tone="ink" aria-labelledby="mcd-faq-title">
        <div className={`${styles.shell} ${styles.faqGrid}`}>
          <h2 id="mcd-faq-title" className={styles.sectionTitle}>
            <span>Before</span>
            <span>we pull up.</span>
          </h2>
          <FaqList faqs={visible(homeFaqs).slice(0, 6)} />
        </div>
      </section>

      <CtaBand location="mobile_detailing_final" />
      <JsonLd data={serviceSchema({ name: "Mobile Car Detailing", description: "Full inside-and-out mobile car detailing in Decatur and nearby Atlanta communities, using electric mobile rigs with power and water supplied by Every Detail.", path: "/mobile-car-detailing" })} />
      <JsonLd data={breadcrumbSchema([{ name: "Services", path: "/our-services" }, { name: "Mobile Car Detailing", path: "/mobile-car-detailing" }])} />
    </main>
  );
}
