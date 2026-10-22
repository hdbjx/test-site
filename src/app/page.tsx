import Link from "next/link";
import { HomeArtMotion } from "@/components/HomeArtMotion";
import { HomeBookingFlow } from "@/components/HomeBookingFlow";
import { LiveReviewCount } from "@/components/GoogleReviewStats";
import { Photo } from "@/components/Photo";
import { TrackedLink } from "@/components/TrackedLink";
import { reviews } from "@/data/reviews";
import { reviewCountLabel } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Book Mobile Car Detailing in Decatur, GA | Every Detail",
  description: `Professional mobile detailing at your driveway in Decatur + Atlanta. We bring power and water in 100% electric mobile rigs. ${reviewCountLabel} five-star reviews. See pricing and book online.`,
  path: "/",
  image: "og-default",
});

const proofReviews = [
  {
    quote: "They went out of their way to accommodate my schedule, and my car was pristine when they finished.",
    author: reviews[0]?.author ?? "Google Review",
  },
  {
    quote: "He and his team arrived right on time and were very professional.",
    author: reviews[1]?.author ?? "Google Review",
  },
  {
    quote: "My 11 year-old car looks brand new.",
    author: reviews[2]?.author ?? "Google Review",
  },
];

export default function Home() {
  return (
    <>
      <HomeArtMotion />

      <section className="v29-hero" data-v29-scene="hero" aria-labelledby="v29-hero-title">
        <div className="v29-hero-photo" data-v29-depth><Photo id="hero" sizes="100vw" fill priority /></div>
        <div className="v29-hero-shade" aria-hidden="true" />
        <div className="v30-hero-focus" aria-hidden="true" />
        <div className="v29-hero-orbit v29-orbit-left" aria-hidden="true">DETAILING / DECATUR + ATLANTA / MOBILE / ELECTRIC RIGS</div>
        <div className="v29-hero-orbit v29-orbit-right" aria-hidden="true">POWER + WATER INCLUDED / REAL CREW / REAL DRIVEWAYS</div>
        <div className="v29-shell v29-hero-inner">
          <p className="v29-hero-kicker">Mobile car detailing, brought to you.</p>
          <h1 id="v29-hero-title" className="v29-hero-title" data-v29-hero-type>
            <span>YOUR CAR.</span>
            <span>BACK TO</span>
            <span>ITS BEST.</span>
          </h1>
          <TrackedLink href="/book" event="book_click" params={{ location: "home_v29_hero" }} className="v29-hero-cta" data-v29-magnetic>Book a detail <span>↗</span></TrackedLink>
        </div>
        <div className="v29-sweep" aria-hidden="true" />
      </section>

      <section className="v36-tape" data-v36-tape aria-label="Every Detail promise">
        <svg className="v36-tape-svg" viewBox="0 0 2000 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path className="v36-tape-shape" d="M-60,66 C330,6 670,18 1010,72 C1350,126 1620,126 2060,52 L2060,194 C1640,244 1325,230 995,182 C665,134 330,132 -60,190 Z" />
          <path id="v36-tape-path" d="M-20,126 C330,67 670,76 1010,126 C1350,176 1650,176 2020,116" fill="none" />
          <text className="v36-tape-text">
            <textPath href="#v36-tape-path" data-v36-tape-text startOffset="0%">
              WE BRING THE DETAIL SHOP TO YOUR DRIVEWAY • REAL CREW • POWER + WATER INCLUDED • 100% ELECTRIC RIGS • WE BRING THE DETAIL SHOP TO YOUR DRIVEWAY •
            </textPath>
          </text>
        </svg>
      </section>

      <section className="v29-choice" id="pricing" data-v29-scene="choice" aria-labelledby="v29-choice-title">
        <div className="v29-shell">
          <div className="v29-choice-intro">
            <p className="v29-kicker">Choose the clean</p>
            <h2 id="v29-choice-title"><span>ONE CAR.</span><span>THREE WAYS BACK.</span></h2>
            <p>Pick the level. Tell us what you drive. We show the exact price.</p>
          </div>
          <div className="v29-booking" data-v29-services><HomeBookingFlow /></div>
          <div className="v29-inline-links"><Link href="/our-services">See every service ↗</Link><Link href="/get-a-quote">Help me choose ↗</Link></div>
        </div>
      </section>

      <section className="v29-work" data-v29-work data-v29-scene="work" aria-labelledby="v29-work-title">
        <div className="v29-work-sticky">
          <div className="v29-work-heading v29-shell">
            <p className="v29-kicker v29-kicker-light">The work</p>
            <h2 id="v29-work-title"><span>NO STOCK CARS.</span><span>NO MYSTERY SHOP.</span></h2>
          </div>
          <div className="v29-work-track" data-v29-work-track>
            <figure className="v29-shot v29-shot-a" data-v29-tilt><Photo id="work-mateo-0670" sizes="70vw" fill /><figcaption><b>01</b><span>Foam wash / Decatur</span></figcaption></figure>
            <figure className="v29-shot v29-shot-b" data-v29-tilt><Photo id="two-tech-interior-detail" sizes="46vw" fill /><figcaption><b>02</b><span>Two-tech interior</span></figcaption></figure>
            <figure className="v29-shot v29-shot-c" data-v29-tilt><Photo id="work-finished-0771" sizes="64vw" fill /><figcaption><b>03</b><span>Finished / handoff</span></figcaption></figure>
            <figure className="v29-shot v29-shot-d" data-v29-tilt><Photo id="hq-mobile-rig-fleet" sizes="52vw" fill /><figcaption><b>04</b><span>Our rigs / our crew</span></figcaption></figure>
            <div className="v29-work-end">
              <p>REAL DRIVEWAYS.</p><p>REAL CREW.</p><strong>EVERY DETAIL.</strong>
              <Link href="/our-work">See the full archive ↗</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="v36-story" data-v29-story data-v29-scene="story" aria-labelledby="v36-story-title">
        <div className="v29-shell v36-story-inner">
          <p className="v29-kicker">Since eighth grade</p>
          <h2 id="v36-story-title" className="v36-story-title">
            <span>BUILT BY</span>
            <span>STUDENTS.</span>
            <span>RUN LIKE</span>
            <span>A COMPANY.</span>
          </h2>

          <div className="v36-story-collage" aria-hidden="true">
            <span className="v36-story-photo v36-story-photo-a" data-v29-fly="a"><Photo id="about-team" sizes="(max-width: 900px) 82vw, 34vw" fill /></span>
            <span className="v36-story-photo v36-story-photo-b" data-v29-fly="b"><Photo id="hq-branded-van-side" sizes="(max-width: 900px) 68vw, 25vw" fill /></span>
            <span className="v36-story-photo v36-story-photo-c" data-v29-fly="c"><Photo id="team-tablet" sizes="(max-width: 900px) 48vw, 18vw" fill /></span>
          </div>

          <div className="v36-story-foot">
            <p>What started with one student and a driveway became trained technicians, purpose-built electric rigs, real operating systems, and a standard every job has to meet.</p>
            <Link href="/about-us">Meet the team ↗</Link>
          </div>
        </div>
      </section>

      <section className="v36-proof" data-v36-proof data-v29-scene="proof" aria-labelledby="v36-proof-title">
        <div className="v36-proof-sticky">
          <div className="v29-shell v36-proof-stage">
            <div className="v36-proof-count">
              <p className="v29-kicker v29-kicker-light">Five-star reviews</p>
              <strong><LiveReviewCount /></strong>
              <span>people noticed.</span>
            </div>

            <div className="v36-proof-reviews" aria-live="polite">
              <h2 id="v36-proof-title" className="sr-only">Customer reviews</h2>
              {proofReviews.map((review, index) => (
                <article key={review.author} className={`v36-proof-review v36-proof-review-${index + 1}`}>
                  <span className="v36-proof-index">0{index + 1} / 03</span>
                  <p>“{review.quote}”</p>
                  <footer>{review.author} / Google review</footer>
                </article>
              ))}
            </div>

            <div className="v36-proof-progress" aria-hidden="true"><span /></div>
          </div>
        </div>
      </section>

      <section className="v29-beyond v32-beyond" data-v29-scene="beyond" aria-labelledby="v29-beyond-title">
        <div className="v29-beyond-marquee" aria-hidden="true"><span>RESTORE IT / PROTECT IT / KEEP IT CLEAN / RESTORE IT / PROTECT IT /</span></div>
        <div className="v29-shell v32-beyond-shell">
          <div className="v29-beyond-head v32-beyond-head">
            <p className="v29-kicker">After the reset</p>
            <h2 id="v29-beyond-title"><span>RESTORE.</span><span>THEN MAINTAIN.</span></h2>
          </div>

          <Link href="/ceramic" className="v32-care-scene v32-care-restore" data-v29-tilt>
            <div className="v32-care-photo"><Photo id="hq-black-suv-finished" sizes="100vw" fill /></div>
            <div className="v32-care-shade" />
            <div className="v32-care-copy">
              <span>01 / PAINT CORRECTION + CERAMIC</span>
              <strong>BRING BACK<br />THE GLOSS.</strong>
              <p>Correct the finish. Lock in the result. Protect the work you just paid for.</p>
              <b>Explore paint care ↗</b>
            </div>
          </Link>

          <Link href="/detailplus" className="v32-care-scene v35-care-maintain" data-v29-tilt>
            <div className="v35-maintain-lines" aria-hidden="true"><span /><span /><span /><span /></div>
            <div className="v32-care-copy v35-maintain-copy">
              <span>02 / DETAIL+</span>
              <strong>STAY CLEAN.<br />WITHOUT THE RESET.</strong>
              <p>Choose how often we come back. Same driveway. Same standard. No reset required.</p>
              <b>Explore Detail+ ↗</b>
            </div>
            <div className="v35-maintain-cadence" aria-hidden="true">
              <span>MONTHLY</span><span>BI-WEEKLY</span><span>CUSTOM</span>
            </div>
            <div className="v35-maintain-ghost" aria-hidden="true">KEEP IT CLEAN / KEEP IT CLEAN / KEEP IT CLEAN</div>
          </Link>
        </div>
      </section>

      <section className="v29-close" data-v29-scene="close" aria-labelledby="v29-close-title">
        <div className="v29-close-photo"><Photo id="hq-van-through-flowers" sizes="100vw" fill /></div>
        <div className="v29-close-shade" />
        <div className="v29-shell v29-close-inner">
          <p className="v29-kicker v29-kicker-light">Decatur + Atlanta / We come to you</p>
          <h2 id="v29-close-title">YOUR DRIVEWAY.<br /><span>OUR DETAIL SHOP.</span></h2>
          <TrackedLink href="/book" event="book_click" params={{ location: "home_v29_close" }} className="v29-close-cta" data-v29-magnetic>Book a detail <span>↗</span></TrackedLink>
        </div>
      </section>
    </>
  );
}
