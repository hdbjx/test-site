import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CtaBand } from "@/components/CtaBand";
import { CurvedTape } from "@/components/CurvedTape";
import { LiveReviewCount } from "@/components/GoogleReviewStats";
import { JsonLd } from "@/components/JsonLd";
import { Photo } from "@/components/Photo";
import { ServicesBoard } from "@/components/services/ServicesBoard";
import { TrackedLink } from "@/components/TrackedLink";
import { areaPhotos, areas, areasWithPages } from "@/data/areas";
import { startingPrice } from "@/data/services";
import { workWall, type WorkReview } from "@/data/work";
import { usd } from "@/lib/format";
import { breadcrumbSchema, pageMetadata, serviceSchema } from "@/lib/seo";
import styles from "@/styles/servicePage.module.css";
import areaStyles from "../areas.module.css";

type Params = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return areasWithPages.map((a) => ({ slug: a.slug })); }

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const area = areasWithPages.find((a) => a.slug === slug);
  if (!area) return {};
  return pageMetadata({ title: `${area.page.title} | Every Detail`, description: area.page.description, path: `/service-areas/${slug}`, noindex: area.indexable !== true });
}

export default async function AreaPage({ params }: Params) {
  const { slug } = await params;
  const area = areasWithPages.find((a) => a.slug === slug);
  if (!area) notFound();
  const { page } = area;
  const nearby = areas.filter((other) => other.slug !== slug);
  // Three real Google reviews, rotated per page so each area page reads differently.
  // These are not tied to the neighborhood, so the page never claims they are local.
  const pool = workWall.filter((item): item is WorkReview => item.kind === "review");
  const start = (areas.findIndex((a) => a.slug === slug) * 3) % pool.length;
  const areaReviews = [0, 1, 2].map((i) => pool[(start + i) % pool.length]);

  return (
    <main className={styles.page}>
      <section className={styles.hero} data-header-tone="light" aria-labelledby="ar-hero-title">
        <div className={styles.heroPhoto}><Photo id={areaPhotos[slug] ?? "branded-rig-driveway"} sizes="(max-width: 900px) 100vw, 50vw" fill priority /></div>
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={styles.crumbs}><Breadcrumbs items={[{ name: "Service Areas", path: "/service-areas" }, { name: area.name, path: `/service-areas/${slug}` }]} /></div>
          <p className={styles.kicker}>Mobile detailing / {area.name}</p>
          <h1 id="ar-hero-title" className={styles.heroTitle}>
            <span>Car detailing</span>
            <span>{area.name}.</span>
          </h1>
          <p className={styles.heroLede}>{page.intro}</p>
          <div className={styles.heroActions}>
            <TrackedLink href="/book" event="book_click" params={{ location: `area_${slug}_hero` }} className={styles.heroCta}>BOOK YOUR DETAIL <span aria-hidden="true">↗</span></TrackedLink>
            <TrackedLink href="/get-a-quote" event="quote_start" params={{ location: `area_${slug}_hero` }} className={styles.heroLink}>FIND MY DETAIL <span aria-hidden="true">↗</span></TrackedLink>
          </div>
          <dl className={styles.heroFacts}>
            <div><dt>Details from</dt><dd>{usd(startingPrice("maintenance"))}</dd></div>
            <div><dt>Five-star reviews</dt><dd><LiveReviewCount /></dd></div>
            <div><dt>Power + water</dt><dd>Included</dd></div>
          </dl>
        </div>
      </section>

      <CurvedTape text={`${area.name.toUpperCase()} • WE COME TO YOU • POWER + WATER INCLUDED • REAL CREW • `} label={`Every Detail in ${area.name}`} surface="ink" />

      <section className={`${areaStyles.list} ${areaStyles.dark}`} data-header-tone="light" aria-labelledby="ar-local-title">
        <div className={`${styles.shell} ${areaStyles.localGrid}`}>
          <div>
            <p className={styles.kickerLight}>Detailing in {area.name}</p>
            <h2 id="ar-local-title" className={styles.sectionTitle}>
              <span>Your parking spot.</span>
              <span>Our setup.</span>
            </h2>
          </div>
          <ol className={areaStyles.notes}>
            {page.localNotes.map((note, index) => (
              <li key={note}><span>{String(index + 1).padStart(2, "0")}</span><p>{note}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <ServicesBoard anchorId="area-pricing" />

      <section className={areaStyles.reviews} data-header-tone="ink" aria-labelledby="ar-reviews-title">
        <div className={styles.shell}>
          <div className={areaStyles.reviewsHead}>
            <p className={styles.kickerDark}>What customers say</p>
            <h2 id="ar-reviews-title" className={areaStyles.reviewsTitle}><LiveReviewCount /> five-star Google reviews</h2>
          </div>
          <ul className={areaStyles.reviewCards}>
            {areaReviews.map((review) => (
              <li key={review.author}>
                <p className={areaStyles.stars} aria-label="5 out of 5 stars">★★★★★</p>
                <blockquote>“{review.quote}”</blockquote>
                <p className={areaStyles.reviewer}>{review.author}<span>Google review</span></p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={areaStyles.nearby} data-header-tone="light" aria-labelledby="ar-nearby-title">
        <div className={styles.shell}>
          <h2 id="ar-nearby-title" className={areaStyles.nearbyTitle}>Also serving</h2>
          <ul className={areaStyles.nearbyList}>
            {nearby.map((other) => (
              <li key={other.slug}><Link href={`/service-areas/${other.slug}`}>{other.name} <span aria-hidden="true">↗</span></Link></li>
            ))}
            <li><Link href="/service-areas">All service areas <span aria-hidden="true">↗</span></Link></li>
          </ul>
        </div>
      </section>

      <CtaBand location={`area_${slug}_final`} />
      <JsonLd data={[serviceSchema({ name: `Mobile Car Detailing in ${area.name}, GA`, description: page.description, path: `/service-areas/${slug}`, areaServed: [`${area.name}, GA`] }), breadcrumbSchema([{ name: "Service Areas", path: "/service-areas" }, { name: area.name, path: `/service-areas/${slug}` }])]} />
    </main>
  );
}
