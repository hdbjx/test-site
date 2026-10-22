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
          <h1 id="v29-hero-title" className="v29-hero-title v43-hero-title" data-v29-hero-type>
            <span>YOUR CAR.</span>
            <span>BACK TO ITS BEST.</span>
          </h1>
          <TrackedLink href="/book" event="book_click" params={{ location: "home_v29_hero" }} className="v29-hero-cta" data-v29-magnetic>Book a detail <span>↗</span></TrackedLink>
        </div>
        <div className="v29-sweep" aria-hidden="true" />
      </section>

      <section className="v36-tape v41-tape" data-v36-tape aria-label="Every Detail promise">
        <div className="v41-tape-track" data-v41-tape-track aria-hidden="true">
          <span>WE BRING THE DETAIL SHOP TO YOUR DRIVEWAY • REAL CREW • POWER + WATER INCLUDED • WE COME TO YOU •</span>
          <span>WE BRING THE DETAIL SHOP TO YOUR DRIVEWAY • REAL CREW • POWER + WATER INCLUDED • WE COME TO YOU •</span>
        </div>
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

          <div className="v37-story-collage v41-story-collage" aria-label="Student-built Every Detail photo collage">
            <span className="v37-story-photo v37-story-photo-a" data-v29-fly="a" data-v41-drag><Photo id="about-team" sizes="(max-width: 900px) 86vw, 34vw" fill /></span>
            <span className="v37-story-photo v37-story-photo-b" data-v29-fly="b" data-v41-drag><Photo id="hq-branded-van-side" sizes="(max-width: 900px) 70vw, 26vw" fill /></span>
            <span className="v37-story-photo v37-story-photo-c" data-v29-fly="c" data-v41-drag><Photo id="team-tablet" sizes="(max-width: 900px) 52vw, 18vw" fill /></span>
            <span className="v41-drag-hint" aria-hidden="true">DRAG THE PHOTOS</span>
          </div>

        </div>
      </section>

      <section className="v38-proof" data-v36-proof data-v29-scene="proof" aria-label="Customer reviews">
        <div className="v38-proof-sticky">
          <div className="v38-proof-stage">
            <div className="v41-proof-rail" data-v41-proof-rail>
              <div className="v38-proof-count v41-proof-count">
                <strong><AnimatedReviewCount /></strong>
                <span>FIVE-STAR REVIEWS</span>
                <small>REAL CUSTOMERS. REAL CARS.</small>
              </div>

              <div className="v38-proof-reviews v41-proof-reviews" aria-label="Customer review highlights">
                {proofReviews.map((review, index) => (
                  <article key={review.author} className={`v38-proof-review v38-proof-review-${index + 1} v41-proof-review`}>
                    <span className="v41-proof-index">0{index + 1}</span>
                    <p>“{review.quote}”</p>
                    <footer>{review.author}</footer>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="v41-care" data-v29-scene="beyond" aria-labelledby="v41-care-title">
        <div className="v29-shell v41-care-inner">
          <div className="v41-care-heading">
            <span>AFTER THE RESET</span>
            <h2 id="v41-care-title">KEEP THE CAR<br /><em>FEELING RIGHT.</em></h2>
            <p>Protect the finish, or keep the whole car on a regular clean cycle. Two different jobs. One cleaner way to own a car.</p>
          </div>

          <div className="v41-care-grid">
            <Link href="/ceramic" className="v41-care-card v41-care-card-paint">
              <div className="v41-care-card-image"><Photo id="hq-black-suv-finished" sizes="(max-width: 900px) 100vw, 58vw" fill /></div>
              <div className="v41-care-card-shade" />
              <div className="v41-care-card-top"><span>01</span><b>PAINT CARE</b></div>
              <div className="v41-care-card-copy">
                <h3>BRING BACK<br />THE GLOSS.</h3>
                <p>Correction and protection for paint that deserves more than a wash.</p>
                <strong>Explore paint care ↗</strong>
              </div>
            </Link>

            <Link href="/detailplus" className="v41-care-card v41-care-card-plus">
              <div className="v41-care-card-image"><Photo id="hq-technician-window-detail" sizes="(max-width: 900px) 100vw, 42vw" fill /></div>
              <div className="v41-care-card-shade" />
              <div className="v41-care-card-top"><span>02</span><b>DETAIL+</b></div>
              <div className="v41-care-card-copy">
                <h3>STAY CLEAN.<br />SKIP THE RESET.</h3>
                <p>Recurring maintenance built around how often you actually drive.</p>
                <strong>Explore Detail+ ↗</strong>
              </div>
              <div className="v41-care-cadence">MONTHLY • BI-WEEKLY • CUSTOM</div>
            </Link>
          </div>
        </div>
      </section>

      <section className="v39-clean-life v41-clean-life" data-v39-life aria-labelledby="v39-clean-life-title">
        <div className="v39-clean-life-grain" aria-hidden="true" />
        <div className="v39-clean-life-inner v41-clean-life-inner">
          <h2 id="v39-clean-life-title" className="v39-clean-life-title v41-clean-life-title">
            <span className="v41-life-line v41-life-line-one">LIFE’S GOOD</span>
            <span className="v41-life-line v41-life-line-two">IN A CLEAN CAR.</span>
          </h2>
        </div>
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
