import Link from "next/link";
import { BeforeAfter } from "@/components/BeforeAfter";
import { CtaBand } from "@/components/CtaBand";
import { FaqList } from "@/components/FaqList";
import { Photo } from "@/components/Photo";
import { ReviewGrid } from "@/components/ReviewGrid";
import { ServicePicker } from "@/components/ServicePicker";
import { Stars } from "@/components/Stars";
import { TrackedLink } from "@/components/TrackedLink";
import { TrustStrip } from "@/components/TrustStrip";
import { WorkGallery } from "@/components/WorkGallery";
import { detailPlusBenefits } from "@/data/detailplus";
import { homeFaqs } from "@/data/faqs";
import { beforeAfterPairs } from "@/data/images";
import { paintServices } from "@/data/paint";
import { reviewCountLabel, site } from "@/data/site";
import { team } from "@/data/team";
import { usd } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Mobile Car Detailing in Decatur, GA | Every Detail",
  description: `Professional mobile car detailing in Decatur and nearby Atlanta. We bring our own power and water. ${reviewCountLabel} five-star reviews. See prices for your vehicle and book online.`,
  path: "/",
  image: "hero",
});

export default function Home() {
  return (
    <>
      {/* 1. HERO */}
      <section className="container-ed grid gap-8 pb-12 pt-8 md:pt-14 lg:grid-cols-12 lg:items-center lg:gap-12 lg:pb-16">
        <div className="lg:col-span-6">
          <h1>
            <span className="kicker rise block">Mobile car detailing in Decatur and Atlanta</span>
            <span className="t-display rise rise-2 mt-4 block">Mobile detailing, done right.</span>
          </h1>
          <p className="t-lede rise rise-3 mt-6 text-ink/80">
            We bring professional detailing to your driveway, with our own power and water. You don&rsquo;t move the car,
            and you don&rsquo;t lose your Saturday.
          </p>
          <div className="rise rise-4 mt-8 flex flex-col gap-3 sm:flex-row">
            <TrackedLink href="/book" event="book_click" params={{ location: "hero" }} className="btn btn-primary">
              Book your detail
            </TrackedLink>
            <TrackedLink href="/get-a-quote" event="quote_start" params={{ location: "hero" }} className="btn btn-secondary">
              Get a quote
            </TrackedLink>
          </div>
          <a
            href={site.reviews.googleUrl}
            target="_blank"
            rel="noopener"
            className="rise rise-4 mt-8 inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.9375rem]"
          >
            <Stars />
            <span>
              <strong className="font-semibold">{reviewCountLabel} five-star reviews</strong> on Google
            </span>
            <span className="text-muted">{site.award.title}</span>
          </a>
        </div>
        <div className="lg:col-span-6">
          <Photo
            id="hero"
            priority
            ratio="4/3"
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="rounded-[var(--radius-photo)]"
          />
        </div>
      </section>

      {/* 2. TRUST */}
      <TrustStrip />

      {/* 3–4. VEHICLE SELECTOR + SERVICES */}
      <section id="pricing" className="container-ed py-16 md:py-24">
        <div className="max-w-2xl">
          <h2 id="vehicle-heading" className="t-h2">
            What type of vehicle do you have?
          </h2>
          <p className="mt-4 text-lg text-ink/80">
            Pick yours to see exact prices. Not sure which service? Most first-time clients book Premium.
          </p>
        </div>
        <div className="mt-10">
          <ServicePicker location="home" headingId="vehicle-heading" />
        </div>
        <p className="mt-10 text-[0.9375rem] text-ink/80">
          <Link href="/our-services" className="link">
            See everything each service includes
          </Link>{" "}
          or{" "}
          <Link href="/get-a-quote" className="link">
            get a quote
          </Link>{" "}
          if your car needs something specific.
        </p>
      </section>

      {/* 5. RESULTS */}
      <section aria-labelledby="work-heading" className="bg-paper2 py-16 md:py-24">
        <div className="container-ed">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <h2 id="work-heading" className="t-h2">
              Recent work
            </h2>
            <p className="max-w-sm text-ink/80">Every photo is a real car we detailed. No stock images.</p>
          </div>
          {beforeAfterPairs.length > 0 && (
            <div className="mt-10 grid gap-8 md:grid-cols-2">
              {beforeAfterPairs.slice(0, 2).map((p) => (
                <BeforeAfter key={p.id} before={p.before} after={p.after} caption={p.caption} />
              ))}
            </div>
          )}
          <div className="mt-10">
            <WorkGallery ids={["work-01", "work-03", "work-07", "work-08", "work-09"]} />
          </div>
        </div>
      </section>

      {/* 6. STUDENT-RUN STORY */}
      <section className="container-ed grid gap-10 py-16 md:py-24 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6 lg:order-2">
          <Photo id="about-team" ratio="5/4" sizes="(min-width: 1024px) 45vw, 100vw" className="rounded-[var(--radius-photo)]" />
        </div>
        <div className="lg:col-span-6 lg:order-1 lg:self-center">
          <h2 className="t-h2">Student-run. Professionally detailed.</h2>
          <p className="mt-6 text-lg text-ink/80">
            Every Detail started as a student business in Decatur. Today it&rsquo;s a team of {team.length}: trained
            technicians, a business manager and a social media director, all working from the same standards on every
            car.
          </p>
          <dl className="mt-8 grid gap-6 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="border-t-2 border-ink pt-4">
              <dt className="font-display font-semibold">Trained in tiers</dt>
              <dd className="mt-1 text-[0.9375rem] text-ink/75">Technicians move up through three levels of training.</dd>
            </div>
            <div className="border-t-2 border-ink pt-4">
              <dt className="font-display font-semibold">Run on systems</dt>
              <dd className="mt-1 text-[0.9375rem] text-ink/75">Checklists, scheduling and follow-up on tools we built ourselves.</dd>
            </div>
            <div className="border-t-2 border-ink pt-4">
              <dt className="font-display font-semibold">Fully equipped</dt>
              <dd className="mt-1 text-[0.9375rem] text-ink/75">Two rigs carrying our own power, water and professional products.</dd>
            </div>
          </dl>
          <Link href="/about-us" className="link mt-8 inline-block font-display font-semibold">
            Meet the team
          </Link>
        </div>
      </section>

      {/* 7. PAINT CORRECTION + CERAMIC */}
      <section aria-labelledby="paint-heading" className="bg-ink py-16 text-paper md:py-24">
        <div className="container-ed grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="paint-heading" className="t-h2">
              Looking for more than a clean car?
            </h2>
            <p className="mt-6 text-lg text-paper/75">
              Detailing cleans the paint. Correction and coating change it. We polish out swirls and haze, then lock in
              the gloss with a ceramic coating built to last years instead of weeks.
            </p>
            <TrackedLink
              href="/ceramic"
              event="paint_inquiry"
              params={{ location: "home_paint" }}
              className="btn btn-on-dark mt-8"
            >
              Explore paint correction &amp; ceramic
            </TrackedLink>
          </div>
          <ul className="lg:col-span-6 lg:col-start-7">
            {paintServices.map((p) => (
              <li key={p.id} className="border-b border-paper/20 py-6 first:pt-0">
                <p className="flex items-baseline gap-3">
                  <span className="font-display text-xl font-semibold">{p.name}</span>
                  <span className="flex-1 -translate-y-1 border-b-2 border-dotted border-paper/30" aria-hidden="true" />
                  <span className="t-numeral text-4xl text-sand">
                    <span className="sr-only">starting at </span>
                    {usd(p.startingAt)}
                    <span className="text-2xl">+</span>
                  </span>
                </p>
                <p className="mt-2 max-w-md text-[0.9375rem] text-paper/70">{p.summary}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 8. DETAIL+ */}
      <section className="container-ed py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="kicker">Detail+ membership</p>
            <h2 className="t-h2 mt-3">Stay clean instead of getting clean.</h2>
            <p className="mt-5 text-lg text-ink/80">
              Pick how often and what gets cleaned. We show up on schedule for one flat rate, and you stop thinking about
              when the car needs a detail.
            </p>
            <Link href="/detailplus" className="btn btn-secondary mt-8">
              Explore Detail+
            </Link>
          </div>
          <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
            {detailPlusBenefits.slice(0, 4).map((b) => (
              <li key={b.title} className="border-t-2 border-ink pt-4">
                <h3 className="font-display text-lg font-semibold">{b.title}</h3>
                <p className="mt-1 text-[0.9375rem] text-ink/75">{b.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 9. REVIEWS */}
      <section className="border-t border-line bg-paper2 py-16 md:py-24">
        <div className="container-ed">
          <ReviewGrid />
        </div>
      </section>

      {/* 10. FAQ */}
      <section className="container-ed grid gap-10 py-16 md:py-24 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 className="t-h2">Questions</h2>
          <p className="mt-4 text-ink/80">
            Something we didn&rsquo;t cover? Call or text{" "}
            <TrackedLink href={site.phone.href} event="phone_click" params={{ location: "home_faq" }} className="link">
              {site.phone.display}
            </TrackedLink>
            .
          </p>
        </div>
        <div className="lg:col-span-8">
          <FaqList faqs={homeFaqs} />
        </div>
      </section>

      {/* 11. FINAL CTA */}
      <CtaBand location="home_final" />
    </>
  );
}
