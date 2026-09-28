import Link from "next/link";
import { FaqList } from "@/components/FaqList";
import { Photo } from "@/components/Photo";
import { HomeBookingFlow } from "@/components/HomeBookingFlow";
import { Stars } from "@/components/Stars";
import { TrackedLink } from "@/components/TrackedLink";
import { homeFaqs } from "@/data/faqs";
import { reviews } from "@/data/reviews";
import { reviewCountLabel, site } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Mobile Car Detailing in Decatur, GA | Every Detail",
  description: `Professional mobile car detailing in Decatur and nearby Atlanta. We bring our own power and water. ${reviewCountLabel} five-star reviews. See prices for your vehicle and book online.`,
  path: "/",
  image: "hero",
});

export default function Home() {
  const featuredFaqs = homeFaqs.slice(0, 3);
  const featuredReview = reviews[0];

  return (
    <>
      <section className="hero-full" aria-label="Every Detail mobile car detailing">
        <div className="hero-shade" />
        <div className="container-ed hero-inner">
          <div className="hero-copy rise">
            <p className="hero-kicker">Mobile detailing · Decatur + Atlanta</p>
            <h1 className="hero-title"><span>Your car.</span><span>Back to its best.</span></h1>
            <p className="hero-lede">Premium mobile detailing, brought to your driveway.<br />We bring the power and water.</p>
            <div className="mt-7 flex flex-wrap gap-4">
              <TrackedLink href="/book" event="book_click" params={{ location: "hero" }} className="btn btn-primary">Book a detail ↗</TrackedLink>
              <Link href="/get-a-quote" className="btn btn-quote">Get a quote</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="proof-row" aria-label="Why people choose Every Detail">
        <div className="container-ed grid gap-3 py-5 text-center sm:grid-cols-2 lg:grid-cols-4">
          <span className="proof-stars">★★★★★ <strong>{reviewCountLabel}</strong> five-star reviews</span>
          <span>{site.award.title}</span><span>Power + water included</span><span>100% mobile</span>
        </div>
      </section>

      <section id="pricing" className="home-services home-services-v14">
        <div className="container-ed">
          <div className="home-section-head v14-service-head">
            <div><p className="eyebrow">Start here</p><h2 id="pricing-heading" className="home-display">Choose what<br />your car needs.</h2></div>
            <p className="home-section-copy">Three details. No package maze. Pick the level of clean you want, then tell us what you drive.</p>
          </div>
          <HomeBookingFlow />
          <div className="home-text-links v14-service-links"><Link href="/our-services" className="link">Compare every service ↗</Link><Link href="/get-a-quote" className="link">Not sure what you need? Ask us</Link></div>
        </div>
      </section>

      <section className="home-work home-work-v154" aria-labelledby="work-heading">
        <div className="container-ed">
          <div className="work-v154-head">
            <div>
              <p className="eyebrow">Real cars. Real driveways.</p>
              <h2 id="work-heading" className="home-display">The work speaks<br /><span>for itself.</span></h2>
            </div>
            <div className="work-v154-note">
              <span>NO STOCK PHOTOS</span>
              <p>Everything here was detailed by our team around Decatur and Atlanta.</p>
            </div>
          </div>

          <div className="work-v154-main">
            <Photo id="work-02" sizes="(min-width: 1216px) 1280px, 100vw" ratio="16/8" />
            <div className="work-v154-caption"><span>01 / IN THE DRIVEWAY</span><strong>Foam wash · Decatur, GA</strong></div>
          </div>

          <div className="work-v154-pair">
            <figure className="work-v154-tall">
              <Photo id="work-01" sizes="(min-width: 900px) 42vw, 92vw" ratio="4/5" />
              <figcaption><span>02 / FINISHED</span><strong>Black truck · Exterior detail</strong></figcaption>
            </figure>
            <figure className="work-v154-wide">
              <Photo id="work-08" sizes="(min-width: 900px) 48vw, 92vw" ratio="4/3" />
              <figcaption><span>03 / INSIDE COUNTS</span><strong>Interior reset · Finished clean</strong></figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="home-story">
        <div className="container-ed story-grid">
          <div className="story-copy">
            <p className="eyebrow">The people behind the polish</p>
            <h2 className="home-display">Built by students.<br /><span>Driven by detail.</span></h2>
            <p>Every Detail started with one student, a set of supplies, and a driveway in Decatur. Today, our trained crew runs equipped mobile rigs across Atlanta without losing the thing that made the company work in the first place: caring about every part of the job.</p>
            <div className="story-stats"><div><strong>3</strong><span>training tiers</span></div><div><strong>2</strong><span>equipped rigs</span></div><div><strong>{reviewCountLabel}</strong><span>five-star reviews</span></div></div>
            <Link href="/about-us" className="btn btn-secondary">Meet Every Detail ↗</Link>
          </div>
          <div className="story-photo"><Photo id="home-team" sizes="(min-width: 1024px) 52vw, 100vw" ratio="4/5" /></div>
        </div>
      </section>

      <section className="home-next">
        <div className="container-ed">
          <div className="home-section-head home-section-head-tight"><div><p className="eyebrow">Beyond the detail</p><h2 className="home-display">Keep the finish.<br />Or make it better.</h2></div></div>
          <div className="next-grid">
            <Link href="/ceramic" className="next-card next-card-dark"><div className="next-card-top"><span>Paint correction + ceramic</span><span>↗</span></div><div><p className="next-kicker">For paint that needs more.</p><h3>Restore the gloss.<br />Protect the result.</h3><p>Machine polishing for swirls and haze, followed by professional ceramic protection.</p></div></Link>
            <Link href="/detailplus" className="next-card next-card-red"><div className="next-card-top"><span>Detail+</span><span>↗</span></div><div><p className="next-kicker">For cars that should stay clean.</p><h3>One schedule.<br />Never start over.</h3><p>Recurring mobile detailing at a predictable rate, built around how often you actually need us.</p></div></Link>
          </div>
        </div>
      </section>

      <section className="home-review">
        <div className="container-ed review-stage">
          <div className="review-label"><Stars className="h-5 w-5" /><span>Google review</span></div>
          <blockquote>&ldquo;{featuredReview.text}&rdquo;</blockquote>
          <div className="review-bottom"><strong>{featuredReview.author}</strong><a href={site.reviews.googleUrl} target="_blank" rel="noopener" className="link">Read {reviewCountLabel}+ reviews ↗</a></div>
        </div>
      </section>

      <section className="home-faq">
        <div className="container-ed faq-layout"><div className="faq-title"><p className="eyebrow">Before we pull up</p><h2 className="home-display">Three things<br />people ask.</h2><p>Still wondering about something? Call or text us and a real person will answer.</p></div><div className="faq-list-home"><FaqList faqs={featuredFaqs} /><Link href="/our-services" className="link">See all service details ↗</Link></div></div>
      </section>

      <section className="final-book final-book-v12">
        <div className="container-ed final-inner">
          <p className="eyebrow">We come to you</p>
          <h2 className="final-title">Your driveway.<br /><span>Our detail shop.</span></h2>
          <p>Pick your vehicle, choose a service, and we’ll bring everything else.</p>
          <div className="final-actions"><TrackedLink href="/book" event="book_click" params={{ location: "home_final" }} className="btn btn-primary">Book your detail ↗</TrackedLink><Link href="/get-a-quote" className="final-quote">Get a quote</Link></div>
        </div>
      </section>
    </>
  );
}
