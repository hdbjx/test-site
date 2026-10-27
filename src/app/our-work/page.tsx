import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CtaBand } from "@/components/CtaBand";
import { CurvedTape } from "@/components/CurvedTape";
import { LiveReviewCount } from "@/components/GoogleReviewStats";
import { Photo } from "@/components/Photo";
import { TrackedLink } from "@/components/TrackedLink";
import { WorkWall } from "@/components/work/WorkWall";
import { site } from "@/data/site";
import { workWall } from "@/data/work";
import { pageMetadata } from "@/lib/seo";
import styles from "./work.module.css";

export const metadata = pageMetadata({
  title: "Our Work | Mobile Detailing Results | Every Detail",
  description: "Real Every Detail jobs around Decatur and Atlanta: interiors, exteriors, paint, and the crew and rigs behind them, next to real Google reviews.",
  path: "/our-work",
  image: "hq-black-suv-finished",
});

const WALL_ANCHOR = "the-wall";
// Filter deep links handled by WorkWall: id="interior" id="exterior" id="paint" id="crew"
const photoCount = workWall.filter((item) => item.kind === "photo").length;

export default function OurWorkPage() {
  return (
    <>
      <main className={styles.page}>
        <section className={styles.hero} data-header-tone="light" aria-labelledby="wk-hero-title">
          <div className={styles.heroPhoto}><Photo id="work-finished-0771" sizes="100vw" fill priority /></div>
          <div className={styles.heroShade} aria-hidden="true" />
          <div className={styles.heroInner}>
            <div className={styles.crumbs}><Breadcrumbs items={[{ name: "Our Work", path: "/our-work" }]} /></div>
            <p className={styles.kicker}>Every Detail / Our work</p>
            <h1 id="wk-hero-title" className={styles.heroTitle}>
              <span>Real cars.</span>
              <span>Real driveways.</span>
            </h1>
            <p className={styles.heroLede}>Every photo here is a customer&apos;s car and our crew. Every quote is a real Google review. No stock, no staging.</p>
            <div className={styles.heroActions}>
              <TrackedLink href="/book" event="book_click" params={{ location: "work_hero" }} className={styles.heroCta}>BOOK YOUR DETAIL <span aria-hidden="true">↗</span></TrackedLink>
              <a href={`#${WALL_ANCHOR}`} className={styles.heroLink}>SEE THE WORK <span aria-hidden="true">↓</span></a>
            </div>
            <dl className={styles.heroFacts}>
              <div><dt>Five-star reviews</dt><dd><LiveReviewCount /></dd></div>
              <div><dt>Google rating</dt><dd>{site.reviews.rating.toFixed(1)}</dd></div>
              <div><dt>Photos on the wall</dt><dd>{photoCount}</dd></div>
              <div><dt>{site.award.short}</dt><dd>{site.award.year}</dd></div>
            </dl>
          </div>
        </section>

        <CurvedTape text="REAL JOBS • REAL REVIEWS • YOUR DRIVEWAY • SAME CREW • " label="Every Detail work promise" />

        <WorkWall anchorId={WALL_ANCHOR} />

        {/* Static 50/50 proof spot. No slider: one honest photo of one panel. */}
        <section className="work-audit-before-after" data-header-tone="light" aria-labelledby="work-before-after-title">
          <div className="container-ed work-audit-before-after-grid">
            <div>
              <p className={styles.kickerLight}>Paint / Same panel, same light</p>
              <h2 id="work-before-after-title">Same panel.<br /><span>Different finish.</span></h2>
              <p>A real 50/50 paint-correction test spot under an inspection light. The corrected side is on the left. The side on the right is how it arrived.</p>
              <TrackedLink href="/paint-correction" event="paint_inquiry" params={{ location: "work_before_after" }} className={styles.proofCta}>See paint correction <span aria-hidden="true">↗</span></TrackedLink>
            </div>
            <figure>
              <Image src="/images/paint-5050-single.jpg" alt="Real 50/50 paint correction test spot, corrected on the left and uncorrected on the right" fill sizes="(min-width: 900px) 58vw, 92vw" />
              <figcaption><span>CORRECTED</span><span>AS ARRIVED</span></figcaption>
            </figure>
          </div>
        </section>

        <section className={styles.crew} data-header-tone="ink" aria-labelledby="wk-crew-title">
          <div className={`${styles.shell} ${styles.crewGrid}`}>
            <div className={styles.crewPhoto}><Photo id="about-team" sizes="(max-width: 860px) 92vw, 56vw" ratio="3/2" /></div>
            <div>
              <p className={styles.kicker}>Who shows up</p>
              <h2 id="wk-crew-title" className={styles.sectionTitle}>
                <span>The crew</span>
                <span>in the photos.</span>
              </h2>
              <p className={styles.body}>The people on this page are the people who come to your driveway. Students, trained in-house, running two fully loaded rigs.</p>
              <Link href="/about-us#team" className={styles.inkLink}>Meet the team <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
        </section>
      </main>
      <CtaBand location="work_final" title="Your car is next." body="Pick your vehicle and service. We bring the power, the water and the crew." quoteLabel="Find my detail" />
    </>
  );
}
