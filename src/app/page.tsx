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

const leadReview = reviews[2];

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

      <section className="v30-ribbon" data-v30-ribbon aria-label="Every Detail promise">
        <div className="v30-ribbon-window" aria-hidden="true">
          <div className="v30-ribbon-track" data-v30-ribbon-track>
            {[0, 1].map((copy) => (
              <svg key={copy} className="v30-ribbon-svg" viewBox="0 0 2400 180" preserveAspectRatio="none">
                <path id={`v30-ribbon-path-${copy}`} d="M -120 112 C 360 18, 820 18, 1280 112 S 2140 206, 2520 96" fill="none" />
                <text>
                  <textPath href={`#v30-ribbon-path-${copy}`} startOffset="0%">
                    WE BRING THE DETAIL SHOP TO YOUR DRIVEWAY • REAL CREW • POWER + WATER INCLUDED • 100% ELECTRIC RIGS •
                  </textPath>
                </text>
              </svg>
            ))}
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

      <section className="v29-story v30-story" data-v29-story data-v29-scene="story" aria-labelledby="v29-story-title">
        <div className="v29-story-field" aria-hidden="true" />
        <div className="v29-shell v29-story-inner v30-story-inner">
          <p className="v29-kicker">Since eighth grade</p>
          <h2 id="v29-story-title" className="v30-story-title">
            <span className="v30-story-line v30-story-line-a">
              <span>BUILT BY</span>
              <span className="v30-story-slot v30-slot-a" data-v29-fly="a"><Photo id="about-team" sizes="28vw" fill /></span>
              <span>STUDENTS.</span>
            </span>
            <span className="v30-story-line v30-story-line-b">
              <span>RUN LIKE</span>
              <span className="v30-story-slot v30-slot-b" data-v29-fly="b"><Photo id="hq-branded-van-side" sizes="25vw" fill /></span>
              <span>A COMPANY.</span>
            </span>
          </h2>
          <span className="v30-story-float" data-v29-fly="c" aria-hidden="true"><Photo id="team-tablet" sizes="18vw" fill /></span>
          <div className="v29-story-foot">
            <p>What started with one student and a driveway became trained technicians, purpose-built electric rigs, real operating systems, and a standard every job has to meet.</p>
            <Link href="/about-us">Meet the team ↗</Link>
          </div>
        </div>
      </section>

      <section className="v29-proof v32-proof" data-v29-scene="proof" aria-labelledby="v29-proof-title">
        <div className="v29-proof-ring" aria-hidden="true">FIVE STAR / FIVE STAR / FIVE STAR / FIVE STAR /</div>
        <div className="v32-proof-fragments" aria-hidden="true">
          <span>“Absolutely spotless.”</span>
          <span>“On time. Professional.”</span>
          <span>“Looks brand new.”</span>
          <span>“Booking was effortless.”</span>
        </div>
        <div className="v29-shell v29-proof-grid">
          <div className="v29-proof-count"><span><LiveReviewCount /></span><small>FIVE-STAR<br />REVIEWS</small></div>
          <blockquote id="v29-proof-title" data-v29-review>
            <span className="v29-quote-mark">“</span>{leadReview.text}<span className="v29-quote-mark">”</span>
            <footer>{leadReview.author} / Google review</footer>
          </blockquote>
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
            <div className="v32-care-orbit" aria-hidden="true">CORRECT • PROTECT • GLOSS • CORRECT • PROTECT •</div>
          </Link>

          <Link href="/detailplus" className="v32-care-scene v32-care-maintain" data-v29-tilt>
            <div className="v32-maintain-word" aria-hidden="true">MAINTAIN</div>
            <div className="v32-care-copy">
              <span>02 / DETAIL+</span>
              <strong>DON’T LET IT<br />GET BAD AGAIN.</strong>
              <p>Choose how often we come back. Same driveway. Same standard. No reset required.</p>
              <b>Explore Detail+ ↗</b>
            </div>
            <div className="v32-maintain-disc" aria-hidden="true">DETAIL+<br />ON REPEAT</div>
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
