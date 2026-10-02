import Link from "next/link";
import { FaqList } from "@/components/FaqList";
import { Photo } from "@/components/Photo";
import { HomeBookingFlow } from "@/components/HomeBookingFlow";
import { GoogleMapsAttribution, LiveReviewCount } from "@/components/GoogleReviewStats";
import { Stars } from "@/components/Stars";
import { TrackedLink } from "@/components/TrackedLink";
import { homeFaqs } from "@/data/faqs";
import { reviews } from "@/data/reviews";
import { reviewCountLabel, site } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Book Mobile Car Detailing in Decatur, GA | Every Detail",
  description: `Professional mobile detailing at your driveway in Decatur + Atlanta. We bring power and water. ${reviewCountLabel} five-star reviews. See pricing and book online.`,
  path: "/",
  image: "og-default",
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
            <p className="hero-lede">Professional detailing at your driveway.<br />We bring the power and water.</p>
            <div className="mt-7 flex flex-wrap gap-4">
              <TrackedLink href="/book" event="book_click" params={{ location: "hero" }} className="btn btn-primary">Book a detail ↗</TrackedLink>
              <Link href="/get-a-quote" className="btn btn-quote">Get a quote</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="proof-row" aria-label="Why people choose Every Detail">
        <div className="container-ed grid gap-3 py-5 text-center sm:grid-cols-2 lg:grid-cols-4">
          <span className="proof-stars">★★★★★ <strong><LiveReviewCount /></strong> five-star reviews</span>
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

      <section className="home-work home-work-v157" aria-labelledby="work-heading">
        <div className="work-v157-shell">
          <div className="work-v157-head">
            <p className="eyebrow">Real cars. Real driveways. Real crew.</p>
            <h2 id="work-heading" className="home-display">The work speaks <span>for itself.</span></h2>
          </div>

          <figure className="work-v157-lead">
            <Photo id="work-mateo-0670" sizes="(min-width: 1500px) 1480px, 94vw" ratio="21/9" />
            <figcaption><span>01 / ON THE JOB</span><strong>Mateo · Foam wash</strong></figcaption>
          </figure>

          <div className="work-v157-grid">
            <figure>
              <Photo id="work-rex-0467" sizes="(min-width: 900px) 46vw, 94vw" ratio="4/3" />
              <figcaption><span>02 / EXTERIOR</span><strong>Rex · Foam wash</strong></figcaption>
            </figure>
            <figure>
              <Photo id="work-davis-0909" sizes="(min-width: 900px) 46vw, 94vw" ratio="4/3" />
              <figcaption><span>03 / THE DETAILS</span><strong>Davis · Floor mat detail</strong></figcaption>
            </figure>
            <figure>
              <Photo id="work-will-0920" sizes="(min-width: 900px) 46vw, 94vw" ratio="4/3" />
              <figcaption><span>04 / THE RIG</span><strong>Will · Running the job</strong></figcaption>
            </figure>
            <figure>
              <Photo id="work-finished-0771" sizes="(min-width: 900px) 46vw, 94vw" ratio="4/3" />
              <figcaption><span>05 / FINISHED</span><strong>The result</strong></figcaption>
            </figure>
          </div>

          <div className="work-instagram-cta">
            <div>
              <span className="work-instagram-label">MORE OF THE WORK</span>
              <strong>Follow the crew on Instagram.</strong>
              <p>Fresh details, before-and-afters, and what the team is working on around Atlanta.</p>
            </div>
            <a
              href="https://www.instagram.com/everydetail.atl/"
              target="_blank"
              rel="noopener noreferrer"
              className="work-instagram-link"
              aria-label="Follow Every Detail on Instagram at @everydetail.atl"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" className="instagram-dot" />
              </svg>
              <span>Follow @everydetail.atl</span>
              <b>↗</b>
            </a>
          </div>
        </div>
      </section>

      <section className="home-story">
        <div className="container-ed story-grid">
          <div className="story-copy">
            <p className="eyebrow">The people behind the polish</p>
            <h2 className="home-display">Built by students.<br /><span>Driven by detail.</span></h2>
            <p>Every Detail started with one student, a set of supplies, and a driveway in Decatur. Today, our trained crew runs equipped mobile rigs across Atlanta without losing the thing that made the company work in the first place: caring about every part of the job.</p>
            <div className="story-stats"><div><strong>3</strong><span>training tiers</span></div><div><strong>2</strong><span>equipped rigs</span></div><div><strong><LiveReviewCount /></strong><span>five-star reviews · <GoogleMapsAttribution /></span></div></div>
            <Link href="/about-us" className="btn btn-secondary">Meet Every Detail ↗</Link>
          </div>
          <div className="story-photo"><Photo id="home-team" sizes="(min-width: 1024px) 52vw, 100vw" ratio="4/5" /></div>
        </div>
      </section>

      <section className="home-next home-next-v158">
        <div className="container-ed next-v158-wrap">
          <div className="next-v158-heading">
            <p className="eyebrow">More than a detail</p>
            <h2 className="home-display">Take it <span>further.</span></h2>
            <p>Two ways to go beyond a one-time detail: improve and protect the paint, or put keeping the whole car clean on repeat.</p>
          </div>

          <div className="upgrade-board upgrade-board-paint">
            <div className="upgrade-index">01 / PAINT</div>
            <div className="upgrade-main">
              <p className="upgrade-label">Paint correction + ceramic coating</p>
              <h3>Make the paint<br />look better.<br /><span>Keep it that way.</span></h3>
            </div>
            <div className="upgrade-side">
              <p>Machine polishing removes or reduces swirls and haze to bring back gloss. Ceramic coating adds durable protection and makes maintenance easier.</p>
              <div className="upgrade-chips"><span>SWIRL + HAZE CORRECTION</span><span>GLOSS RESTORATION</span><span>LONG-TERM PROTECTION</span></div>
              <div className="upgrade-actions">
                <Link href="/ceramic" className="tactile-link">Explore paint + ceramic <b>↗</b></Link>
              </div>
            </div>
            <div className="upgrade-stamp">PAINT<br />CARE</div>
          </div>

          <div className="upgrade-board upgrade-board-plus">
            <div className="upgrade-index">02 / RECURRING CARE</div>
            <div className="upgrade-main">
              <p className="upgrade-label">Detail+</p>
              <h3>Your car stays clean.<br /><span>Automatically.</span></h3>
            </div>
            <div className="upgrade-side">
              <p>Choose how often we come back. Same driveway, same standard, and a car that never has to get far behind again.</p>
              <div className="plus-steps">
                <div><b>01</b><span>Book once</span></div>
                <div><b>02</b><span>We come back</span></div>
                <div><b>03</b><span>Stay clean</span></div>
              </div>
              <div className="upgrade-actions"><Link href="/detailplus" className="tactile-link tactile-link-light">See Detail+ <b>↗</b></Link></div>
            </div>
            <div className="upgrade-stamp upgrade-stamp-light">REPEAT<br />CARE</div>
          </div>
        </div>
      </section>

      <section className="home-review">
        <div className="container-ed review-stage">
          <div className="review-label"><Stars className="h-5 w-5" /><span>Google review · <GoogleMapsAttribution /></span></div>
          <blockquote>&ldquo;{featuredReview.text}&rdquo;</blockquote>
          <div className="review-bottom"><strong>{featuredReview.author}</strong><a href={site.reviews.googleUrl} target="_blank" rel="noopener" className="link">Read <LiveReviewCount plus={false} /> reviews ↗</a></div>
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
