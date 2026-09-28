import Link from "next/link";
import { Photo } from "@/components/Photo";
import { ServicePicker } from "@/components/ServicePicker";
import { Stars } from "@/components/Stars";
import { TrackedLink } from "@/components/TrackedLink";
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

      <section id="pricing" className="v13-services">
        <div className="container-ed">
          <div className="v13-services-intro">
            <div><p className="eyebrow">Detailing, simplified</p><h2>Three levels.<br />Pick your reset.</h2></div>
            <p>Choose your vehicle and see the exact price. Premium is where most first-time clients should start.</p>
          </div>
          <div className="v13-picker"><ServicePicker location="home" headingId="pricing-heading" /></div>
          <div className="v13-service-foot"><Link href="/our-services" className="link">Compare every service ↗</Link><Link href="/get-a-quote" className="link">Not sure? Get a quote</Link></div>
        </div>
      </section>

      <section className="v13-photo-break v13-photo-break-first" aria-label="Every Detail recent work">
        <div className="v13-photo-frame">
          <Photo id="work-05" sizes="100vw" ratio="16/9" />
          <div className="v13-photo-caption"><span>Decatur, GA</span><span>Premium detail</span></div>
        </div>
      </section>

      <section className="v13-story">
        <div className="container-ed v13-story-grid">
          <div className="v13-story-copy">
            <p className="eyebrow">Our story</p>
            <h2>Built by<br />students.<br /><span>Driven by detail.</span></h2>
            <p>Every Detail started in a Decatur driveway. Today, a trained student team runs equipped mobile rigs across the area while keeping the same standard that built the company in the first place: care about every part of the job.</p>
            <Link href="/about-us" className="link">Meet the team ↗</Link>
          </div>
          <figure className="v13-story-photo">
            <Photo id="about-team" sizes="(min-width: 900px) 48vw, 100vw" ratio="3/2" />
            <figcaption><span>Every Detail</span><span>Decatur, Georgia</span></figcaption>
          </figure>
        </div>
      </section>

      <section className="v13-photo-pause" aria-label="Every Detail at work">
        <div className="container-ed v13-photo-pause-grid">
          <figure className="v13-photo-tall"><Photo id="work-06" sizes="(min-width: 900px) 44vw, 90vw" ratio="2/3" /></figure>
          <div className="v13-photo-note"><span>Power + water included.</span><p>We bring the setup. You keep your day.</p></div>
        </div>
      </section>

      <section className="v13-paths">
        <div className="container-ed">
          <p className="eyebrow">Go further</p>
          <div className="v13-path-row">
            <Link href="/ceramic" className="v13-path-copy"><span className="v13-path-num">01 / Protect</span><h3>Paint correction<br />+ ceramic</h3><p>Restore clarity and gloss, then protect the finish for the long run.</p><span className="v13-path-link">Explore paint care ↗</span></Link>
            <div className="v13-path-image"><Photo id="ceramic-01" sizes="(min-width: 900px) 42vw, 100vw" ratio="3/2" /></div>
          </div>
          <div className="v13-path-row v13-path-row-reverse">
            <Link href="/detailplus" className="v13-path-copy"><span className="v13-path-num">02 / Maintain</span><h3>Detail+</h3><p>Recurring mobile detailing for cars that should never have to start over.</p><span className="v13-path-link">Explore membership ↗</span></Link>
            <div className="v13-path-image"><Photo id="work-08" sizes="(min-width: 900px) 42vw, 100vw" ratio="3/2" /></div>
          </div>
        </div>
      </section>

      <section className="v13-review">
        <div className="container-ed v13-review-inner">
          <div className="v13-review-stars"><Stars className="h-7 w-7" /><span>Google review</span></div>
          <blockquote>&ldquo;{featuredReview.text}&rdquo;</blockquote>
          <div className="v13-review-meta"><strong>{featuredReview.author}</strong><a href={site.reviews.googleUrl} target="_blank" rel="noopener">Read {reviewCountLabel}+ reviews ↗</a></div>
        </div>
      </section>

      <section className="v13-final">
        <div className="container-ed v13-final-inner">
          <p className="eyebrow">Ready when you are</p>
          <h2>Your driveway.<br /><span>Our detail shop.</span></h2>
          <div className="v13-final-actions"><TrackedLink href="/book" event="book_click" params={{ location: "home_final" }} className="btn btn-primary">Book a detail ↗</TrackedLink><Link href="/get-a-quote" className="v13-final-link">Get a quote</Link></div>
        </div>
      </section>
    </>
  );
}
