import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { CurvedTape } from "@/components/CurvedTape";
import { GoogleMapsAttribution, LiveReviewCount } from "@/components/GoogleReviewStats";
import { Photo } from "@/components/Photo";
import { TrackedLink } from "@/components/TrackedLink";
import { areas } from "@/data/areas";
import { site } from "@/data/site";
import { pageMetadata } from "@/lib/seo";
import styles from "@/styles/servicePage.module.css";
import areaStyles from "./areas.module.css";

export const metadata = pageMetadata({
  title: "Mobile Detailing Service Areas Near Decatur | Every Detail",
  description: `Mobile detailing from Decatur to nearby Atlanta neighborhoods. Our electric rigs bring their own power and water, with pricing available online.`,
  path: "/service-areas",
  image: "hq-branded-van-side",
});

const setup = [
  { n: "01", title: "Room to work", body: "A driveway or parking spot with space to walk around the car." },
  { n: "02", title: "Access to the car", body: "The car available and unlocked, or keys handy, at the appointment time." },
  { n: "03", title: "That's it", body: "Our rigs bring the water, power, products and equipment." },
];

export default function ServiceAreas() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} data-header-tone="light" aria-labelledby="sa-hero-title">
        <div className={styles.heroPhoto}><Photo id="branded-rig-driveway" sizes="(max-width: 900px) 100vw, 50vw" fill priority /></div>
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.heroInner}>
          <p className={styles.kicker}>Every Detail / Service areas</p>
          <h1 id="sa-hero-title" className={styles.heroTitle}>
            <span>We come to</span>
            <span>your driveway.</span>
          </h1>
          <p className={styles.heroLede}>Based in Decatur and serving nearby Atlanta neighborhoods with two fully loaded electric rigs.</p>
          <div className={styles.heroActions}>
            <TrackedLink href="/book" event="book_click" params={{ location: "areas_hero" }} className={styles.heroCta}>CHECK AVAILABILITY <span aria-hidden="true">↗</span></TrackedLink>
            <TrackedLink href={site.phone.sms} event="text_click" params={{ location: "areas_hero" }} className={styles.heroLink}>NOT LISTED? TEXT YOUR ADDRESS <span aria-hidden="true">↗</span></TrackedLink>
          </div>
          <dl className={styles.heroFacts}>
            <div><dt>Five-star reviews</dt><dd><LiveReviewCount /></dd></div>
            <div><dt>Power + water</dt><dd>Included</dd></div>
            <div><dt>Home base</dt><dd>Decatur</dd></div>
          </dl>
        </div>
      </section>

      <CurvedTape text="DECATUR • BROOKHAVEN • AVONDALE ESTATES • CHAMBLEE • NORTH DRUID HILLS • " label="Every Detail service areas" />

      <section className={areaStyles.list} data-header-tone="ink" aria-labelledby="sa-list-title">
        <div className={styles.shell}>
          <div className={styles.pricingHead}>
            <div>
              <p className={styles.kickerDark}>Regular service area</p>
              <h2 id="sa-list-title" className={styles.sectionTitle}>
                <span>Where we&apos;re</span>
                <span>usually working.</span>
              </h2>
            </div>
            <p className={styles.note}>Pick your area for the local details. Nearby but not listed? Send us the address and we&apos;ll tell you if the schedule can support it.</p>
          </div>

          <div className={areaStyles.board}>
            <ol className={areaStyles.areas}>
              {areas.map((area, index) => (
                <li key={area.slug}>
                  <Link href={`/service-areas/${area.slug}`}>
                    <span className={areaStyles.num}>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{area.name}</strong>
                    <em>{area.primary ? "Home base" : "Mobile service"}</em>
                    <i aria-hidden="true">↗</i>
                  </Link>
                </li>
              ))}
            </ol>

            <div className={areaStyles.map} role="img" aria-label="Coverage overview centered on Decatur and nearby Atlanta neighborhoods, not to scale">
              <span className={areaStyles.ring} />
              <span className={`${areaStyles.ring} ${areaStyles.ringTwo}`} />
              <span className={areaStyles.home}>Decatur<b>Home base</b></span>
              <span className={areaStyles.pin} style={{ left: "24%", top: "54%" }}>Atlanta</span>
              <span className={areaStyles.pin} style={{ left: "38%", top: "18%" }}>Brookhaven</span>
              <span className={areaStyles.pin} style={{ left: "58%", top: "12%" }}>Chamblee</span>
              <span className={areaStyles.pin} style={{ left: "40%", top: "36%" }}>N. Druid Hills</span>
              <span className={areaStyles.pin} style={{ left: "72%", top: "62%" }}>Avondale</span>
              <span className={areaStyles.pin} style={{ left: "16%", top: "26%" }}>N. Buckhead</span>
              <small>Coverage overview / not to scale</small>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.process} data-header-tone="light" aria-labelledby="sa-setup-title">
        <div className={styles.shell}>
          <div className={styles.sectionHead}>
            <p className={styles.kickerLight}>Detail day</p>
            <h2 id="sa-setup-title" className={styles.sectionTitle}>
              <span>You bring the car.</span>
              <span>We bring the shop.</span>
            </h2>
          </div>
          <ol className={`${styles.ruledSteps} ${areaStyles.threeSteps}`}>
            {setup.map((step) => (
              <li key={step.n}><span>{step.n}</span><h3>{step.title}</h3><p>{step.body}</p></li>
            ))}
          </ol>
          <p className={areaStyles.outside}>
            Outside the regular area? Call <a href={site.phone.href}>{site.phone.display}</a> or text us the address and we&apos;ll confirm whether the route can support it. <span><LiveReviewCount /> five-star reviews · <GoogleMapsAttribution /></span>
          </p>
        </div>
      </section>

      <CtaBand location="areas_final" />
    </main>
  );
}
