import Link from "next/link";
import { FaqList } from "@/components/FaqList";
import { Photo } from "@/components/Photo";
import { HomeBookingFlow } from "@/components/HomeBookingFlow";
import { LiveReviewCount } from "@/components/GoogleReviewStats";
import { TrackedLink } from "@/components/TrackedLink";
import { HomeCinematicMotion } from "@/components/HomeCinematicMotion";
import { homeFaqs } from "@/data/faqs";
import { reviewCountLabel, site } from "@/data/site";
import { reviews } from "@/data/reviews";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Book Mobile Car Detailing in Decatur, GA | Every Detail",
  description: `Professional mobile detailing at your driveway in Decatur + Atlanta. We bring power and water in 100% electric mobile rigs. ${reviewCountLabel} five-star reviews. See pricing and book online.`,
  path: "/",
  image: "og-default",
});

const processStages = [
  {
    no: "01",
    label: "Interior",
    title: "Reset the cabin.",
    body: "Vacuuming, surfaces, glass, seats, mats, cupholders, cargo space. The places you touch and notice every day get handled first.",
    image: "two-tech-interior-detail",
  },
  {
    no: "02",
    label: "Exterior",
    title: "Work the outside.",
    body: "Wheels, tires, foam, hand wash, details, drying. Our rigs arrive with the power, water, tools, and products already onboard.",
    image: "work-mateo-0670",
  },
  {
    no: "03",
    label: "Finish",
    title: "Hand it back right.",
    body: "Final checks happen before we call it done. The goal is simple: the car should feel meaningfully better the second you get back in.",
    image: "work-finished-0771",
  },
];

export default function Home() {
  const featuredFaqs = [homeFaqs[2], homeFaqs[4], homeFaqs[7], homeFaqs[5]];
  const leadReview = reviews[2];

  return (
    <>
      <HomeCinematicMotion />

      <section className="ed26-hero" data-ed26-hero aria-labelledby="home-hero-title">
        <div className="ed26-hero-media"><Photo id="hero" sizes="100vw" fill priority /></div>
        <div className="ed26-hero-wash" aria-hidden="true" />
        <div className="ed26-shell ed26-hero-grid">
          <div className="ed26-hero-copy">
            <p className="ed26-meta">Mobile car detailing · Decatur + Atlanta</p>
            <h1 id="home-hero-title" className="ed26-hero-title">
              <span>Your car.</span>
              <span>Back to its best.</span>
            </h1>
            <p className="ed26-hero-lede">A trained local crew, fully equipped at your driveway. We bring the water, power, tools, and time.</p>
            <div className="ed26-hero-actions">
              <Link href="/get-a-quote" className="ed26-button ed26-button-red">Find My Detail</Link>
              <TrackedLink href="/book" event="book_click" params={{ location: "hero_v26" }} className="ed26-text-link">Book directly ↗</TrackedLink>
            </div>
          </div>
          <div className="ed26-hero-caption" aria-hidden="true">
            <span>Every Detail</span><span>Rig / 01</span><span>Decatur, GA</span>
          </div>
        </div>
        <div className="ed26-proof-rail" aria-label="Why people choose Every Detail">
          <div className="ed26-shell ed26-proof-grid">
            <span><b><LiveReviewCount /></b> five-star reviews</span>
            <span>{site.award.title}</span>
            <span>Power + water included</span>
            <span>100% electric rigs</span>
          </div>
        </div>
      </section>

      <section className="ed26-services" id="pricing" aria-labelledby="pricing-heading">
        <div className="ed26-shell">
          <div className="ed26-split-head" data-reveal>
            <p className="ed26-index">01 / Choose your clean</p>
            <div>
              <h2 id="pricing-heading">Three levels.<br />No package maze.</h2>
              <p>Pick how far you want us to take the car. Then tell us what you drive and we’ll show the exact price.</p>
            </div>
          </div>
          <div className="ed26-booking-wrap"><HomeBookingFlow /></div>
          <div className="ed26-section-links"><Link href="/our-services">Compare every service ↗</Link><Link href="/get-a-quote">Not sure? Find my detail ↗</Link></div>
        </div>
      </section>

      <section className="ed26-process" data-process-scene aria-labelledby="process-heading">
        <div className="ed26-process-sticky">
          <div className="ed26-shell ed26-process-layout">
            <div className="ed26-process-copy">
              <p className="ed26-index">02 / What happens at the driveway</p>
              <h2 id="process-heading">One car.<br /><span>Three passes.</span></h2>
              <div className="ed26-process-stages">
                {processStages.map((stage, index) => (
                  <article key={stage.no} className={`ed26-process-stage stage-${index}`}>
                    <div className="ed26-process-stage-head"><b>{stage.no}</b><span>{stage.label}</span></div>
                    <h3>{stage.title}</h3>
                    <p>{stage.body}</p>
                  </article>
                ))}
              </div>
              <Link href="/our-services" className="ed26-text-link ed26-text-link-light">See exactly what’s included ↗</Link>
            </div>
            <div className="ed26-process-visual" aria-hidden="true">
              {processStages.map((stage, index) => (
                <figure key={stage.image} className={`ed26-process-photo stage-${index}`}><Photo id={stage.image} sizes="(min-width: 900px) 48vw, 100vw" fill /></figure>
              ))}
              <div className="ed26-process-counter"><span>PASS</span><b>01</b><i>/03</i></div>
            </div>
          </div>
        </div>
      </section>

      <section className="ed26-archive" data-archive-scene aria-labelledby="archive-heading">
        <div className="ed26-archive-sticky">
          <div className="ed26-archive-head ed26-shell">
            <p className="ed26-index">03 / The work</p>
            <h2 id="archive-heading">Real jobs.<br />No stock photos.</h2>
            <Link href="/our-work" className="ed26-text-link">See all work ↗</Link>
          </div>
          <div className="ed26-archive-track">
            <figure className="ed26-archive-card ed26-archive-card-wide"><Photo id="hq-mobile-rig-fleet" sizes="70vw" fill /><figcaption><b>01</b><span>Mobile rigs / Decatur</span></figcaption></figure>
            <figure className="ed26-archive-card ed26-archive-card-tall"><Photo id="tesla-foam-wash" sizes="38vw" fill /><figcaption><b>02</b><span>Foam wash</span></figcaption></figure>
            <figure className="ed26-archive-card ed26-archive-card-wide"><Photo id="hq-interior-team-front-seats" sizes="64vw" fill /><figcaption><b>03</b><span>Two-tech interior</span></figcaption></figure>
            <figure className="ed26-archive-card ed26-archive-card-tall"><Photo id="hq-black-suv-finished" sizes="38vw" fill /><figcaption><b>04</b><span>Finished</span></figcaption></figure>
            <figure className="ed26-archive-card ed26-archive-card-wide"><Photo id="classic-car-cockpit" sizes="64vw" fill /><figcaption><b>05</b><span>Cabin detail</span></figcaption></figure>
          </div>
        </div>
      </section>

      <section className="ed26-story" data-story-scene aria-labelledby="story-heading">
        <div className="ed26-shell">
          <p className="ed26-index">04 / Since eighth grade</p>
          <h2 id="story-heading" className="ed26-story-line">
            <span>Built by</span>
            <span className="ed26-story-image"><Photo id="about-team" sizes="22vw" fill /></span>
            <span>students.</span>
            <span>Run like</span>
            <span className="ed26-story-image ed26-story-image-rig"><Photo id="hq-branded-van-side" sizes="22vw" fill /></span>
            <span>a company.</span>
          </h2>
          <div className="ed26-story-foot">
            <p>What started as one student detailing cars has grown into a trained team, purpose-built mobile rigs, custom booking systems, and a standard we expect every technician to hit.</p>
            <Link href="/about-us" className="ed26-text-link">Meet the team ↗</Link>
          </div>
        </div>
      </section>

      <section className="ed26-review" aria-label="Customer review">
        <div className="ed26-shell ed26-review-grid" data-reveal>
          <p className="ed26-index">05 / Word of mouth</p>
          <blockquote>
            “{leadReview.text}”
            <footer>{leadReview.author} · Google review</footer>
          </blockquote>
        </div>
      </section>

      <section className="ed26-beyond" aria-labelledby="beyond-heading">
        <div className="ed26-shell">
          <div className="ed26-split-head" data-reveal>
            <p className="ed26-index">06 / Go further</p>
            <div><h2 id="beyond-heading">Beyond the reset.</h2><p>Protect the paint or keep the whole car on a recurring schedule.</p></div>
          </div>
          <div className="ed26-beyond-grid">
            <Link href="/ceramic" className="ed26-beyond-panel ed26-beyond-paint">
              <span>Paint correction + ceramic</span>
              <strong>Bring back gloss.<br />Keep it protected.</strong>
              <b>Explore paint care ↗</b>
            </Link>
            <Link href="/detailplus" className="ed26-beyond-panel ed26-beyond-plus">
              <span>Detail+</span>
              <strong>Stay clean.<br />Automatically.</strong>
              <b>Explore Detail+ ↗</b>
            </Link>
          </div>
        </div>
      </section>

      <section className="ed26-faq" aria-labelledby="faq-heading">
        <div className="ed26-shell ed26-faq-grid">
          <div data-reveal><p className="ed26-index">07 / Before you book</p><h2 id="faq-heading">The questions<br />people actually ask.</h2><p>We’d rather answer it now than make you dig for it.</p></div>
          <div><FaqList faqs={featuredFaqs} /></div>
        </div>
      </section>

      <section className="ed26-final" aria-labelledby="final-heading">
        <div className="ed26-final-photo"><Photo id="hq-van-through-flowers" sizes="100vw" fill /></div>
        <div className="ed26-final-wash" aria-hidden="true" />
        <div className="ed26-shell ed26-final-inner" data-reveal>
          <p className="ed26-meta">Decatur + Atlanta · We come to you</p>
          <h2 id="final-heading">Your driveway.<br /><span>Our detail shop.</span></h2>
          <div className="ed26-final-actions"><Link href="/get-a-quote" className="ed26-button ed26-button-red">Find My Detail</Link><TrackedLink href="/book" event="book_click" params={{ location: "home_final_v26" }} className="ed26-text-link ed26-text-link-light">Book directly ↗</TrackedLink></div>
        </div>
      </section>
    </>
  );
}
