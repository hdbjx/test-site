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

      <section className="v30-ribbon v35-ribbon" data-v30-ribbon aria-label="Every Detail promise">
        <div className="v30-ribbon-window" aria-hidden="true">
          <div className="v30-ribbon-track v35-ribbon-track" data-v30-ribbon-track>
            <svg className="v30-ribbon-svg v35-ribbon-svg" viewBox="0 0 4800 220" preserveAspectRatio="none">
              <path className="v35-ribbon-fill" d="M -100 48 C 320 2 760 10 1200 62 S 2070 116 2400 58 S 3340 4 3820 58 S 4480 112 4900 50 L 4900 174 C 4440 214 4040 204 3590 162 S 2760 118 2390 166 S 1430 214 980 164 S 290 116 -100 168 Z" />
              <path id="v35-ribbon-path" d="M -20 110 C 360 56 790 58 1210 108 S 2050 158 2410 108 S 3330 56 3810 108 S 4470 158 4820 108" fill="none" />
              <text>
                <textPath href="#v35-ribbon-path" startOffset="0%">
                  WE BRING THE DETAIL SHOP TO YOUR DRIVEWAY • REAL CREW • POWER + WATER INCLUDED • 100% ELECTRIC RIGS • WE BRING THE DETAIL SHOP TO YOUR DRIVEWAY • REAL CREW • POWER + WATER INCLUDED • 100% ELECTRIC RIGS •
                </textPath>
              </text>
            </svg>
          </div>
        </div>
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

      <section className="v29-story v33-story" data-v29-story data-v29-scene="story" aria-labelledby="v29-story-title">
        <div className="v29-story-field" aria-hidden="true" />
        <div className="v29-shell v29-story-inner v33-story-inner">
          <div className="v33-story-grid">
            <div className="v33-story-copy">
              <p className="v29-kicker">Since eighth grade</p>
              <h2 id="v29-story-title" className="v33-story-title">
                <span>BUILT BY STUDENTS.</span>
                <span>RUN LIKE A COMPANY.</span>
              </h2>
              <div className="v29-story-foot v33-story-foot">
                <p>What started with one student and a driveway became trained technicians, purpose-built electric rigs, real operating systems, and a standard every job has to meet.</p>
                <Link href="/about-us">Meet the team ↗</Link>
              </div>
            </div>
            <div className="v33-story-photos" aria-hidden="true">
              <span className="v33-story-photo v33-story-photo-a" data-v29-fly="a"><Photo id="about-team" sizes="(max-width: 900px) 78vw, 24vw" fill /></span>
              <span className="v33-story-photo v33-story-photo-b" data-v29-fly="b"><Photo id="hq-branded-van-side" sizes="(max-width: 900px) 72vw, 22vw" fill /></span>
              <span className="v33-story-photo v33-story-photo-c" data-v29-fly="c"><Photo id="team-tablet" sizes="(max-width: 900px) 56vw, 17vw" fill /></span>
            </div>
          </div>
        </div>
      </section>

      <section className="v35-proof" data-v29-scene="proof" aria-labelledby="v35-proof-title">
        <div className="v29-shell v35-proof-inner">
          <div className="v35-proof-number">
            <strong><LiveReviewCount /></strong>
            <span>five-star reviews</span>
          </div>
          <div className="v35-proof-copy">
            <p className="v29-kicker v29-kicker-light">The proof</p>
            <h2 id="v35-proof-title">PEOPLE NOTICE THE DIFFERENCE.</h2>
            <div className="v35-review-reel">
              {proofReviews.map((review) => (
                <article key={review.author} className="v35-review-line" data-v29-review>
                  <p>“{review.quote}”</p>
                  <footer>{review.author} / Google review</footer>
                </article>
              ))}
            </div>
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
