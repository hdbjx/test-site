import Link from "next/link";
import { HomeArtMotion } from "@/components/HomeArtMotion";
import { HomeBookingFlow } from "@/components/HomeBookingFlow";
import { DraggableStoryPhoto } from "@/components/DraggableStoryPhoto";
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
        <svg className="v36-tape-svg" viewBox="0 0 2200 220" preserveAspectRatio="none" aria-hidden="true">
          <path className="v36-tape-shape" d="M-80,60 C420,34 830,42 1180,76 C1540,112 1870,116 2280,82 L2280,196 C1880,220 1530,216 1160,184 C780,150 380,142 -80,170 Z" />
          <path id="v36-tape-path" d="M-40,116 C430,88 835,94 1180,126 C1540,160 1880,164 2240,132" fill="none" />
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

          <div className="v37-story-collage v42-story-collage">
            <DraggableStoryPhoto id="team" photoId="about-team" label="Every Detail team photo" className="v37-story-photo v37-story-photo-a v42-story-photo" sizes="(max-width: 900px) 86vw, 34vw" />
            <DraggableStoryPhoto id="van" photoId="hq-branded-van-side" label="Every Detail branded van" className="v37-story-photo v37-story-photo-b v42-story-photo" sizes="(max-width: 900px) 70vw, 26vw" />
            <DraggableStoryPhoto id="tablet" photoId="team-tablet" label="Every Detail technician with tablet" className="v37-story-photo v37-story-photo-c v42-story-photo" sizes="(max-width: 900px) 52vw, 18vw" />
            <span className="v42-drag-hint" aria-hidden="true">DRAG THE PHOTOS AROUND</span>
          </div>

        </div>
      </section>

      <section className="v42-proof" data-v36-proof data-v29-scene="proof" aria-label="Customer reviews">
        <div className="v42-proof-sticky">
          <div className="v42-proof-track" data-v42-proof-track>
            <article className="v42-proof-panel v42-proof-count-panel">
              <div className="v42-proof-count">
                <strong><AnimatedReviewCount /></strong>
                <span>FIVE-STAR REVIEWS</span>
              </div>
            </article>
            {proofReviews.map((review, index) => (
              <article key={review.author} className={`v42-proof-panel v42-proof-review-panel v42-proof-review-${index + 1}`}>
                <span className="v42-proof-index">0{index + 1}</span>
                <blockquote>“{review.quote}”</blockquote>
                <footer>{review.author} / Google Review</footer>
              </article>
            ))}
            <article className="v42-proof-panel v42-proof-outro">
              <p>REAL PEOPLE.<br /><span>REAL DRIVEWAYS.</span></p>
            </article>
          </div>
        </div>
      </section>

      <section className="v42-care" data-v29-scene="beyond" aria-label="Paint care and recurring maintenance">
        <div className="v42-care-intro">
          <p>THE RESET IS ONLY THE START.</p>
          <h2>RESTORE IT.<br /><span>KEEP IT THAT WAY.</span></h2>
        </div>

        <div className="v42-care-stage">
          <Link href="/ceramic" className="v42-care-card v42-care-restore" data-v29-tilt>
            <div className="v42-care-media"><Photo id="hq-black-suv-finished" sizes="(max-width: 900px) 100vw, 58vw" fill /></div>
            <div className="v42-care-glass" />
            <div className="v42-care-copy">
              <span>01 / PAINT CARE</span>
              <strong>BRING BACK<br />THE GLOSS.</strong>
              <b>Paint correction + ceramic ↗</b>
            </div>
          </Link>

          <Link href="/detailplus" className="v42-care-card v42-care-keep" data-v29-tilt>
            <div className="v42-care-media"><Photo id="hq-technician-window-detail" sizes="(max-width: 900px) 100vw, 58vw" fill /></div>
            <div className="v42-care-redwash" aria-hidden="true" />
            <div className="v42-care-copy">
              <span>02 / DETAIL+</span>
              <strong>KEEP THE<br />GOOD PART.</strong>
              <b>Recurring maintenance ↗</b>
            </div>
            <div className="v42-care-loop" aria-hidden="true">
              <span>MONTHLY</span><span>BI-WEEKLY</span><span>CUSTOM</span><span>MONTHLY</span><span>BI-WEEKLY</span><span>CUSTOM</span>
            </div>
          </Link>
        </div>
      </section>

      <section className="v39-clean-life" data-v39-life aria-labelledby="v39-clean-life-title">
        <div className="v39-clean-life-grain" aria-hidden="true" />
        <div className="v39-clean-life-inner">
          <h2 id="v39-clean-life-title" className="v39-clean-life-title">
            <span className="v39-life-word v39-life-a">LIFE’S</span>
            <span className="v39-life-word v39-life-b">BETTER</span>
            <span className="v39-life-word v39-life-c">IN A</span>
            <span className="v39-life-word v39-life-d">CLEAN CAR.</span>
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
