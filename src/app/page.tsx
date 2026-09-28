import Link from "next/link";
import { FaqList } from "@/components/FaqList";
import { Photo } from "@/components/Photo";
import { ServicePicker } from "@/components/ServicePicker";
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
      {/* Full-screen photographic opening. Uses a native CSS background intentionally,
          bypassing Next Image so the hero cannot disappear through image optimization. */}
      <section className="hero-full" aria-label="Every Detail mobile car detailing">
        <div className="hero-shade" />
        <div className="container-ed hero-inner">
          <div className="hero-copy rise">
            <p className="hero-kicker">Mobile detailing · Decatur + Atlanta</p>
            <h1 className="hero-title"><span>Your car.</span><span>Back to its best.</span></h1>
            <p className="hero-lede">
              Premium mobile detailing, brought to your driveway.<br />We bring the power and water.
            </p>
            <div className="mt-7 flex flex-wrap gap-4">
              <TrackedLink href="/book" event="book_click" params={{ location: "hero" }} className="btn btn-primary">
                Book a detail ↗
              </TrackedLink>
              <a href="#pricing" className="btn btn-glass">View services</a>
            </div>
          </div>
        </div>
      </section>

      {/* Quiet proof strip */}
      <section className="proof-row" aria-label="Why people choose Every Detail">
        <div className="container-ed grid gap-3 py-5 text-center sm:grid-cols-2 lg:grid-cols-4">
          <span className="proof-stars">★★★★★ <strong>{reviewCountLabel}</strong> five-star reviews</span>
          <span>{site.award.title}</span>
          <span>Power + water included</span>
          <span>100% mobile</span>
        </div>
      </section>

      {/* Services */}
      <section id="pricing" className="container-ed section-space">
        <div className="section-intro">
          <p className="eyebrow">Choose your detail</p>
          <h2 id="pricing-heading" className="clean-heading">Three ways to get your car back in shape.</h2>
          <p>Pick your vehicle and the prices update instantly. New here? Premium is the best place to start.</p>
        </div>
        <div className="mt-10">
          <ServicePicker location="home" headingId="pricing-heading" />
        </div>
        <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-[0.95rem]">
          <Link href="/our-services" className="link">Compare every service</Link>
          <Link href="/get-a-quote" className="link">Need something specific?</Link>
        </div>
      </section>

      {/* Photography, not a gallery grid */}
      <section className="work-story section-space" aria-labelledby="work-heading">
        <div className="container-ed">
          <div className="section-intro">
            <p className="eyebrow">Recent work</p>
            <h2 id="work-heading" className="clean-heading">The work speaks for itself.</h2>
          </div>
          <div className="mt-10">
            <Photo id="work-05" sizes="(min-width: 1216px) 1152px, 100vw" ratio="16/8" className="editorial-photo editorial-photo-wide" />
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Photo id="work-01" sizes="(min-width: 768px) 50vw, 100vw" ratio="4/3" className="editorial-photo" />
            <Photo id="work-08" sizes="(min-width: 768px) 50vw, 100vw" ratio="4/3" className="editorial-photo" />
          </div>
          <div className="mt-7"><Link href="/about-us" className="link">See more of our work</Link></div>
        </div>
      </section>

      {/* Student story */}
      <section className="container-ed section-space">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="eyebrow">Our story</p>
            <h2 className="clean-heading">Built by students.<br />Driven by detail.</h2>
            <p className="mt-6 max-w-xl text-lg text-ink/75">
              Every Detail started in a Decatur driveway. Today, a trained student team runs equipped mobile rigs across the area while keeping the same focus that started it all: doing every part of the job well.
            </p>
            <Link href="/about-us" className="btn btn-secondary mt-8">Our story ↗</Link>
          </div>
          <div className="lg:col-span-7">
            <Photo id="home-team" sizes="(min-width: 1024px) 58vw, 100vw" ratio="3/2" className="editorial-photo" />
          </div>
        </div>
      </section>

      {/* More, intentionally compact */}
      <section className="more-section section-space">
        <div className="container-ed">
          <div className="section-intro"><p className="eyebrow">Go further</p><h2 className="clean-heading">More from Every Detail.</h2></div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <Link href="/ceramic" className="feature-card group">
              <span className="feature-number">01</span>
              <div><h3>Paint + Ceramic</h3><p>Correction for swirls and haze, then long-term protection for the finish.</p></div>
              <span className="feature-arrow">↗</span>
            </Link>
            <Link href="/detailplus" className="feature-card group">
              <span className="feature-number">02</span>
              <div><h3>Detail<span className="text-red">+</span></h3><p>Recurring mobile detailing on a schedule, for one predictable rate per visit.</p></div>
              <span className="feature-arrow">↗</span>
            </Link>
          </div>
        </div>
      </section>

      {/* One review, not a wall of reviews */}
      <section className="container-ed section-space">
        <div className="review-feature">
          <div><Stars className="h-5 w-5" /><p className="mt-3 text-sm font-semibold uppercase tracking-[0.12em]">Google review</p></div>
          <blockquote>&ldquo;{featuredReview.text}&rdquo;</blockquote>
          <div className="review-meta"><strong>{featuredReview.author}</strong><a href={site.reviews.googleUrl} target="_blank" rel="noopener" className="link">Read more reviews</a></div>
        </div>
      </section>

      {/* Only the questions most likely to block a booking */}
      <section className="faq-home section-space">
        <div className="container-ed grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4"><p className="eyebrow">Good to know</p><h2 className="clean-heading">A few quick answers.</h2></div>
          <div className="lg:col-span-7 lg:col-start-6"><FaqList faqs={featuredFaqs} /><p className="mt-7"><Link href="/our-services" className="link">Explore services and details</Link></p></div>
        </div>
      </section>

      <section className="final-book">
        <div className="container-ed py-20 text-center md:py-28">
          <p className="eyebrow text-paper/70">Ready when you are</p>
          <h2 className="final-title">Your driveway.<br />Our detail shop.</h2>
          <div className="mt-8 flex justify-center"><TrackedLink href="/book" event="book_click" params={{ location: "home_final" }} className="btn btn-primary">Book your detail ↗</TrackedLink></div>
        </div>
      </section>
    </>
  );
}
