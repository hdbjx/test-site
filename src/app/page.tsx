import Link from "next/link";
import { FaqList } from "@/components/FaqList";
import { Photo } from "@/components/Photo";
import { ReviewStoryScroll } from "@/components/ReviewStoryScroll";
import { HomeBookingFlow } from "@/components/HomeBookingFlow";
import { LiveReviewCount } from "@/components/GoogleReviewStats";
import { TrackedLink } from "@/components/TrackedLink";
import { homeFaqs } from "@/data/faqs";
import { reviewCountLabel, site } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Book Mobile Car Detailing in Decatur, GA | Every Detail",
  description: `Professional mobile detailing at your driveway in Decatur + Atlanta. We bring power and water. ${reviewCountLabel} five-star reviews. See pricing and book online.`,
  path: "/",
  image: "og-default",
});

export default function Home() {
  const featuredFaqs = [homeFaqs[2], homeFaqs[4], homeFaqs[7], homeFaqs[5], homeFaqs[8]];

  return (
    <>
      <section className="hero-full" aria-label="Every Detail mobile car detailing">
        <div className="hero-shade" />
        <div className="container-ed hero-inner">
          <div className="hero-copy rise">
            <p className="hero-kicker">Mobile detailing / Decatur + Atlanta</p>
            <h1 className="hero-title"><span>Your car.</span><span>Back to its best.</span></h1>
            <p className="hero-lede">Professional mobile car detailing in Decatur and Atlanta, right at your driveway.<br />We bring the power and water.</p>
            <div className="mt-7 flex flex-wrap gap-4">
              <Link href="/get-a-quote" className="btn btn-primary">Get my quote ↗</Link>
              <TrackedLink href="/book" event="book_click" params={{ location: "hero" }} className="btn btn-quote">Book a detail</TrackedLink>
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
            <h2 id="work-heading" className="home-display">This is what the work <span>actually looks like.</span></h2>
            <p className="work-proof-copy">No stock photos and no mystery shop. Just our crew, our rigs, and real jobs around Decatur and Atlanta.</p>
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

      <ReviewStoryScroll reviewCount={<LiveReviewCount />} />

      <section className="home-how" aria-labelledby="how-heading">
        <div className="container-ed">
          <div className="how-head"><p className="eyebrow">How it works</p><h2 id="how-heading" className="home-display">We make detailing<br /><span>the easy part.</span></h2></div>
          <div className="how-grid">
            <article><b>01</b><h3>Get your quote</h3><p>Tell us what you drive and what it needs. We’ll recommend the right detail and show you the price.</p></article>
            <article><b>02</b><h3>Pick a time</h3><p>Choose an available appointment that works for you. No back-and-forth required.</p></article>
            <article><b>03</b><h3>We come to you</h3><p>Our mobile rig arrives with its own water, power, tools, and products. You provide the driveway.</p></article>
            <article><b>04</b><h3>Get your car back</h3><p>We work through the detail and let you know when your car is ready to get back on the road.</p></article>
          </div>
          <Link href="/get-a-quote" className="btn btn-primary how-cta">Get my quote ↗</Link>
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

      <section className="home-faq">
        <div className="container-ed faq-layout"><div className="faq-title"><p className="eyebrow">Before you book</p><h2 className="home-display">The stuff you’re<br />probably wondering.</h2><p>We’d rather answer the question before it becomes a reason not to book. Still unsure about something? Call or text us and a real person will answer.</p></div><div className="faq-list-home"><FaqList faqs={featuredFaqs} /><Link href="/our-services" className="link">See all service details ↗</Link></div></div>
      </section>

      <section className="final-book final-book-v12">
        <div className="container-ed final-inner">
          <p className="eyebrow">We come to you</p>
          <h2 className="final-title">Your driveway.<br /><span>Our detail shop.</span></h2>
          <p>Tell us what you drive. We’ll recommend the right detail, show you the exact price, and bring everything else.</p>
          <div className="final-actions"><Link href="/get-a-quote" className="btn btn-primary">Get my quote ↗</Link><TrackedLink href="/book" event="book_click" params={{ location: "home_final" }} className="final-quote">Already know what you want? Book now</TrackedLink></div>
        </div>
      </section>
    </>
  );
}
