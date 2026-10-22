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

      <section className="v27-hero" data-v27-hero data-v28-scene="hero" aria-labelledby="v27-hero-title">
        <div className="v27-hero-photo" data-v28-depth="hero-photo"><Photo id="hero" sizes="100vw" fill priority /></div>
        <div className="v27-hero-shade" aria-hidden="true" />
        <div className="v27-shell v27-hero-inner">
          <p className="v27-location">Mobile detailing / Decatur + Atlanta</p>
          <h1 id="v27-hero-title" className="v27-hero-title">
            <span className="line-a">Your car.</span>
            <span className="line-b">Back to</span>
            <span className="line-c">its best.</span>
          </h1>
          <div className="v27-hero-bottom">
            <p>We bring the crew, water, power, tools, and time. You hand us the keys.</p>
            <TrackedLink href="/book" event="book_click" params={{ location: "home_v27_hero" }} className="v27-main-cta" data-v28-magnetic data-v28-cursor="BOOK">Book a detail <span>↗</span></TrackedLink>
          </div>
        </div>
        <div className="v27-sweep" aria-hidden="true" />
      </section>

      <section className="v27-choice" id="pricing" data-v28-scene="choice" aria-labelledby="v27-choice-title">
        <div className="v27-shell">
          <div className="v27-choice-intro" data-v27-reveal>
            <p className="v27-kicker">Choose the clean</p>
            <h2 id="v27-choice-title"><span>One car.</span><span>Three ways back.</span></h2>
            <p>Pick how far you want us to take it. Then tell us what you drive and we’ll show the exact price.</p>
          </div>
          <div className="v27-booking" data-v28-services><HomeBookingFlow /></div>
          <div className="v27-inline-links"><Link href="/our-services">See every service ↗</Link><Link href="/get-a-quote">Help me choose ↗</Link></div>
        </div>
      </section>

      <section className="v27-work" data-v27-work data-v28-scene="work" aria-labelledby="v27-work-title">
        <div className="v27-work-sticky">
          <div className="v27-work-title-wrap v27-shell">
            <p className="v27-kicker v27-kicker-light">The work</p>
            <h2 id="v27-work-title">No stock cars.<br /><span>No mystery shop.</span></h2>
          </div>
          <div className="v27-work-track">
            <figure className="v27-shot v27-shot-a" data-v28-tilt data-v28-cursor="VIEW"><Photo id="work-mateo-0670" sizes="72vw" fill /><figcaption><b>01</b><span>Foam wash / Decatur</span></figcaption></figure>
            <figure className="v27-shot v27-shot-b" data-v28-tilt data-v28-cursor="VIEW"><Photo id="two-tech-interior-detail" sizes="42vw" fill /><figcaption><b>02</b><span>Two-tech interior</span></figcaption></figure>
            <figure className="v27-shot v27-shot-c" data-v28-tilt data-v28-cursor="VIEW"><Photo id="work-finished-0771" sizes="66vw" fill /><figcaption><b>03</b><span>Finished / handoff</span></figcaption></figure>
            <figure className="v27-shot v27-shot-d" data-v28-tilt data-v28-cursor="VIEW"><Photo id="hq-mobile-rig-fleet" sizes="48vw" fill /><figcaption><b>04</b><span>Our rigs / our crew</span></figcaption></figure>
            <div className="v27-work-end"><strong>Real driveways.<br />Real crew.<br /><span>Every detail.</span></strong><Link href="/our-work">See the full archive ↗</Link></div>
          </div>
        </div>
      </section>

      <section className="v27-story" data-v27-story data-v28-scene="story" aria-labelledby="v27-story-title">
        <div className="v27-shell">
          <p className="v27-kicker">Since eighth grade</p>
          <h2 id="v27-story-title" className="v27-story-title">
            <span>Built by</span>
            <span className="v27-inline-photo" data-v28-float><Photo id="about-team" sizes="26vw" fill /></span>
            <span>students.</span>
            <span>Run like</span>
            <span className="v27-inline-photo v27-inline-rig" data-v28-float><Photo id="hq-branded-van-side" sizes="26vw" fill /></span>
            <span>a company.</span>
          </h2>
          <div className="v27-story-foot" data-v27-reveal>
            <p>What started with one student and a driveway turned into trained technicians, purpose-built electric rigs, real operating systems, and a standard every job has to meet.</p>
            <Link href="/about-us">Meet the team ↗</Link>
          </div>
        </div>
      </section>

      <section className="v27-proof" data-v28-scene="proof" aria-labelledby="v27-proof-title">
        <div className="v27-shell v27-proof-grid">
          <div className="v27-proof-number" data-v27-reveal><span><LiveReviewCount /></span><small>five-star<br />reviews</small></div>
          <blockquote data-v27-reveal data-v28-float>
            “{leadReview.text}”
            <footer>{leadReview.author} / Google review</footer>
          </blockquote>
          <div className="v27-proof-facts" data-v27-reveal>
            <div><b>100%</b><span>electric mobile rigs</span></div>
            <div><b>0</b><span>power or water hookups needed</span></div>
            <div><b>1</b><span>trained local crew at your driveway</span></div>
          </div>
        </div>
      </section>

      <section className="v27-beyond" data-v28-scene="beyond" aria-labelledby="v27-beyond-title">
        <div className="v27-shell">
          <div className="v27-beyond-head" data-v27-reveal><p className="v27-kicker">Beyond the reset</p><h2 id="v27-beyond-title">Keep going.</h2></div>
          <div className="v27-beyond-grid">
            <Link href="/ceramic" className="v27-feature v27-feature-paint" data-v28-tilt data-v28-cursor="OPEN">
              <div className="v27-feature-photo"><Photo id="hq-black-suv-finished" sizes="58vw" fill /></div>
              <div className="v27-feature-shade" />
              <span>Paint correction + ceramic</span>
              <strong>Bring back gloss.<br />Keep it protected.</strong>
              <b>Explore paint care ↗</b>
            </Link>
            <Link href="/detailplus" className="v27-feature v27-feature-plus" data-v28-tilt data-v28-cursor="OPEN">
              <span>Detail+</span>
              <strong>Stay clean.<br />Automatically.</strong>
              <p>Choose how often we come back. Same driveway. Same standard.</p>
              <b>Explore Detail+ ↗</b>
            </Link>
          </div>
        </div>
      </section>

      <section className="v27-close" data-v28-scene="close" aria-labelledby="v27-close-title">
        <div className="v27-close-photo" data-v28-depth="close-photo"><Photo id="hq-van-through-flowers" sizes="100vw" fill /></div>
        <div className="v27-close-shade" />
        <div className="v27-shell v27-close-inner" data-v27-reveal>
          <p className="v27-kicker v27-kicker-light">Decatur + Atlanta / We come to you</p>
          <h2 id="v27-close-title">Your driveway.<br /><span>Our detail shop.</span></h2>
          <TrackedLink href="/book" event="book_click" params={{ location: "home_v27_close" }} className="v27-main-cta v27-main-cta-light" data-v28-magnetic data-v28-cursor="BOOK">Book a detail <span>↗</span></TrackedLink>
        </div>
      </section>
    </>
  );
}
