import Link from "next/link";
import { HomeArtMotion } from "@/components/HomeArtMotion";
import { HomeBookingFlow } from "@/components/HomeBookingFlow";
import { AnimatedReviewCount } from "@/components/GoogleReviewStats";
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
        <div className="v29-shell v29-hero-inner">
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
          <path className="v36-tape-shape" d="M-80,54 C280,-4 640,4 1010,66 C1370,128 1700,138 2080,54 L2080,204 C1700,278 1360,254 995,198 C630,142 260,132 -80,194 Z" />
          <path id="v36-tape-path" d="M-30,122 C310,56 660,62 1010,126 C1360,190 1690,196 2030,120" fill="none" />
          <text className="v36-tape-text">
            <textPath href="#v36-tape-path" data-v36-tape-text startOffset="0%">
              WE BRING THE DETAIL SHOP TO YOUR DRIVEWAY • REAL CREW • POWER + WATER INCLUDED • WE COME TO YOU • 
            </textPath>
          </text>
        </svg>
      </section>

      <section className="v29-choice" id="pricing" data-v29-scene="choice" aria-labelledby="v29-choice-title">
        <div className="v29-shell">
          <div className="v29-choice-intro v38-choice-intro">
            <h2 id="v29-choice-title"><span>ONE CAR.</span><span>THREE WAYS BACK.</span></h2>
          </div>
          <div className="v29-booking" data-v29-services><HomeBookingFlow /></div>
        </div>
      </section>

      <section className="v29-work" data-v29-work data-v29-scene="work" aria-labelledby="v29-work-title">
        <div className="v29-work-sticky">
          <div className="v29-work-heading v29-shell">
            <h2 id="v29-work-title"><span>NO STOCK CARS.</span><span>NO MYSTERY SHOP.</span></h2>
          </div>
          <div className="v29-work-track" data-v29-work-track>
            <figure className="v29-shot v29-shot-a" data-v29-tilt><Photo id="work-mateo-0670" sizes="70vw" fill /></figure>
            <figure className="v29-shot v29-shot-b" data-v29-tilt><Photo id="two-tech-interior-detail" sizes="46vw" fill /></figure>
            <figure className="v29-shot v29-shot-c" data-v29-tilt><Photo id="work-finished-0771" sizes="64vw" fill /></figure>
            <figure className="v29-shot v29-shot-d" data-v29-tilt><Photo id="hq-mobile-rig-fleet" sizes="52vw" fill /></figure>
            <div className="v29-work-end">
              <p>REAL DRIVEWAYS.</p><p>REAL CREW.</p><strong>EVERY DETAIL.</strong>
              <Link href="/our-work">See the full archive ↗</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="v37-story" data-v29-story data-v29-scene="story" aria-labelledby="v37-story-title">
        <div className="v29-shell v37-story-inner">
          <h2 id="v37-story-title" className="v37-story-title">
            <span>BUILT BY STUDENTS.</span>
            <span>RUN LIKE A COMPANY.</span>
          </h2>

          <div className="v37-story-collage" aria-hidden="true">
            <span className="v37-story-photo v37-story-photo-a" data-v29-fly="a"><Photo id="about-team" sizes="(max-width: 900px) 86vw, 34vw" fill /></span>
            <span className="v37-story-photo v37-story-photo-b" data-v29-fly="b"><Photo id="hq-branded-van-side" sizes="(max-width: 900px) 70vw, 26vw" fill /></span>
            <span className="v37-story-photo v37-story-photo-c" data-v29-fly="c"><Photo id="team-tablet" sizes="(max-width: 900px) 52vw, 18vw" fill /></span>
          </div>

        </div>
      </section>

      <section className="v38-proof" data-v36-proof data-v29-scene="proof" aria-label="Customer reviews">
        <div className="v38-proof-sticky">
          <div className="v29-shell v38-proof-stage">
            <div className="v38-proof-count">
              <strong><AnimatedReviewCount /></strong>
              <span>FIVE-STAR REVIEWS</span>
            </div>

            <div className="v38-proof-reviews" aria-live="polite">
              {proofReviews.map((review, index) => (
                <article key={review.author} className={`v38-proof-review v38-proof-review-${index + 1}`}>
                  <p>“{review.quote}”</p>
                  <footer>{review.author}</footer>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="v38-care-flow" data-v29-scene="beyond" aria-label="Paint care and recurring maintenance">
        <Link href="/ceramic" className="v38-care-panel v38-care-paint">
          <div className="v38-care-image"><Photo id="hq-black-suv-finished" sizes="100vw" fill /></div>
          <div className="v38-care-overlay" />
          <div className="v38-care-copy">
            <strong>BRING BACK<br />THE GLOSS.</strong>
            <b>Explore paint care ↗</b>
          </div>
        </Link>

        <Link href="/detailplus" className="v38-care-panel v38-care-maintain">
          <div className="v38-care-image"><Photo id="hq-technician-window-detail" sizes="100vw" fill /></div>
          <div className="v38-maintain-wipe" aria-hidden="true" />
          <div className="v38-care-overlay" />
          <div className="v38-care-copy">
            <strong>STAY CLEAN.<br />WITHOUT THE RESET.</strong>
            <b>Explore Detail+ ↗</b>
          </div>
          <div className="v38-maintain-cadence" aria-hidden="true">MONTHLY&nbsp;&nbsp;•&nbsp;&nbsp;BI-WEEKLY&nbsp;&nbsp;•&nbsp;&nbsp;CUSTOM</div>
        </Link>
      </section>

      <section className="v29-close" data-v29-scene="close" aria-labelledby="v29-close-title">
        <div className="v29-close-photo"><Photo id="hq-van-through-flowers" sizes="100vw" fill /></div>
        <div className="v29-close-shade" />
        <div className="v29-shell v29-close-inner">
          <h2 id="v29-close-title">YOUR DRIVEWAY.<br /><span>OUR DETAIL SHOP.</span></h2>
          <TrackedLink href="/book" event="book_click" params={{ location: "home_v29_close" }} className="v29-close-cta" data-v29-magnetic>Book a detail <span>↗</span></TrackedLink>
        </div>
      </section>
    </>
  );
}
