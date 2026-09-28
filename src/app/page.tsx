import Link from "next/link";
import { BeforeAfter } from "@/components/BeforeAfter";
import { CtaBand } from "@/components/CtaBand";
import { FaqList } from "@/components/FaqList";
import { Photo } from "@/components/Photo";
import { ReviewGrid } from "@/components/ReviewGrid";
import { ServicePicker } from "@/components/ServicePicker";
import { TrackedLink } from "@/components/TrackedLink";
import { WorkGallery } from "@/components/WorkGallery";
import { coverages, detailPlusGuarantee, frequencies } from "@/data/detailplus";
import { homeFaqs } from "@/data/faqs";
import { beforeAfterPairs } from "@/data/images";
import { paintServices } from "@/data/paint";
import { reviewCountLabel, site } from "@/data/site";
import { roleLabels, team } from "@/data/team";
import { usd } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Mobile Car Detailing in Decatur, GA | Every Detail",
  description: `Professional mobile car detailing in Decatur and nearby Atlanta. We bring our own power and water. ${reviewCountLabel} five-star reviews. See prices for your vehicle and book online.`,
  path: "/",
  image: "hero",
});

const listJoin = (xs: string[]) => {
  const t = xs.slice(0, -1).join(", ") + " or " + xs.at(-1);
  return t.charAt(0).toUpperCase() + t.slice(1);
};

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="container-ed pt-10 md:pt-16">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-9">
            <p className="section-label rise">Decatur, Georgia · Mobile auto detailing</p>
            <h1 className="display-refined rise rise-2 mt-5">Your car, <em>reset.</em><br />Right in your driveway.</h1>
          </div>
          <div className="rise rise-3 lg:col-span-3 lg:pb-2">
            <p className="text-lg leading-relaxed text-ink/75">Professional detailing brought to you with our own power, water, equipment and trained crew.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <TrackedLink href="/book" event="book_click" params={{ location: "hero" }} className="btn btn-primary">Book a detail</TrackedLink>
              <Link href="#pricing" className="btn btn-secondary">See pricing</Link>
            </div>
          </div>
        </div>

        <div className="hero-frame rise rise-4 mt-10 md:mt-14">
          <Photo id="hero" priority fill sizes="(min-width: 1216px) 1152px, 100vw" objectPosition="center 52%" />
          <span className="hero-caption">Every Detail · Decatur, GA</span>
        </div>

        <div className="metric-strip mt-8">
          <a href={site.reviews.googleUrl} target="_blank" rel="noopener" className="group">
            <div className="metric-value">{reviewCountLabel} five-star reviews</div>
            <div className="metric-label group-hover:underline">Verified on Google</div>
          </a>
          <div>
            <div className="metric-value">We bring everything</div>
            <div className="metric-label">Power, water and professional equipment</div>
          </div>
          <div>
            <div className="metric-value">{site.award.title}</div>
            <div className="metric-label">Local, student-run and Decatur-built</div>
          </div>
        </div>
      </section>

      {/* 3–4. VEHICLE SELECTOR + SERVICES */}
      <section id="pricing" className="container-ed section-shell">
        <div className="grid gap-4 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7"><p className="section-label">Straightforward pricing</p><h2 id="vehicle-heading" className="t-h2 mt-4">Start with your vehicle.</h2></div>
          <p className="text-lg text-ink/80 md:col-span-5">
            Choose your vehicle and pricing updates instantly. If it is your first visit, Premium is the place to start.
          </p>
        </div>
        <div className="mt-10">
          <ServicePicker location="home" headingId="vehicle-heading" />
        </div>
        <p className="mt-12 text-[0.9375rem] text-ink/80">
          <Link href="/our-services" className="link">
            Full service breakdown
          </Link>
          <span className="mx-3 text-ink/30">/</span>
          <Link href="/get-a-quote" className="link">
            Something specific? Get a quote
          </Link>
        </p>
      </section>

      {/* 5. RESULTS */}
      <section aria-labelledby="work-heading" className="border-t-2 border-ink bg-paper2 py-16 md:py-24">
        <div className="container-ed">
          <div className="grid gap-4 md:grid-cols-12 md:items-end"><div className="md:col-span-7"><p className="section-label">Recent work</p><h2 id="work-heading" className="t-h2 mt-4">The work should speak for itself.</h2></div><p className="text-lg text-ink/70 md:col-span-4 md:col-start-9">Real cars, real driveways, photographed by our team around Decatur.</p></div>
          {beforeAfterPairs.length > 0 && (
            <div className="mt-10 grid gap-8 md:grid-cols-2">
              {beforeAfterPairs.slice(0, 2).map((p) => (
                <BeforeAfter key={p.id} before={p.before} after={p.after} caption={p.caption} />
              ))}
            </div>
          )}
          <div className="mt-10">
            <WorkGallery ids={["work-01", "work-02", "work-03", "work-04", "work-05", "work-06"]} />
          </div>
        </div>
      </section>

      {/* 6. STUDENT-RUN — the actual roster, not adjectives */}
      <section className="container-ed py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="section-label">The Every Detail difference</p><h2 className="t-h2 mt-4">Student-run.<br />Professionally detailed.</h2>
            <p className="mt-6 text-lg text-ink/80">
              Every Detail started as one student with a set of supplies in Decatur. It&rsquo;s now {team.length} people,
              two equipped rigs, and a training program with three technician tiers.
            </p>
            <p className="mt-4 text-lg text-ink/80">Young crew. Same standard on every car.</p>
            <Link href="/about-us" className="btn btn-secondary mt-8">
              About us
            </Link>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <Photo id="home-team" ratio="4/3" sizes="(min-width: 1024px) 40vw, 100vw" className="feature-photo" />
            <ul className="mt-6 columns-2 gap-6 text-[0.9375rem]">
              {team.map((m) => (
                <li key={m.name} className="break-inside-avoid border-b border-ink/15 py-2">
                  <span className="font-display font-semibold">{m.name}</span>{" "}
                  <span className="text-muted">{roleLabels[m.role].replace(" Technician", "")}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 7. PAINT CORRECTION + CERAMIC */}
      <section aria-labelledby="paint-heading" className="border-y-2 border-ink bg-ink py-16 text-paper md:py-24">
        <div className="container-ed grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="paint-heading" className="t-h2">
              Looking for more than a clean car?
            </h2>
            <p className="mt-6 text-lg text-paper/75">
              Detailing cleans the paint. Correction fixes it: machine polishing that takes out swirls and haze. A ceramic
              coating then keeps that finish protected for about two years.
            </p>
            <TrackedLink href="/ceramic" event="paint_inquiry" params={{ location: "home_paint" }} className="btn btn-on-dark mt-8">
              Paint correction &amp; ceramic
            </TrackedLink>
          </div>
          <div className="lg:col-span-6 lg:col-start-7"><Photo id="ceramic-01" ratio="16/10" sizes="(min-width: 1024px) 48vw, 100vw" className="mb-8" /><ul>
            {paintServices.map((p) => (
              <li key={p.id} className="border-b border-paper/20 py-6 first:pt-0">
                <p className="flex items-baseline gap-3">
                  <span className="font-display text-xl font-semibold">{p.name}</span>
                  <span className="flex-1 -translate-y-1 border-b-2 border-dotted border-paper/30" aria-hidden="true" />
                  <span className="t-numeral text-4xl text-sand">
                    <span className="sr-only">starting at </span>
                    {usd(p.startingAt)}+
                  </span>
                </p>
                <p className="mt-2 max-w-md text-[0.9375rem] text-paper/70">{p.summary}</p>
              </li>
            ))}
          </ul></div>
        </div>
      </section>

      {/* 8. DETAIL+ — the real plan options, stated plainly */}
      <section className="container-ed py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="t-h2">
              Detail<span className="text-red">+</span>
            </h2>
            <p className="mt-5 text-lg text-ink/80">
              Our recurring membership. We come on a set schedule for the same flat rate every visit, so the car never gets
              back to needing a rescue.
            </p>
            <Link href="/detailplus" className="btn btn-secondary mt-8">
              How Detail+ works
            </Link>
          </div>
          <div className="membership-card lg:col-span-6 lg:col-start-7">
            <dl className="space-y-5">
              <div>
                <dt className="text-sm text-muted">How often</dt>
                <dd className="mt-1 font-display text-lg font-semibold">{listJoin(frequencies.map((f) => f.label.toLowerCase()))}</dd>
              </div>
              <div className="border-t border-ink/15 pt-5">
                <dt className="text-sm text-muted">What we clean</dt>
                <dd className="mt-1 font-display text-lg font-semibold">{listJoin(coverages.map((c) => c.label.toLowerCase()))}</dd>
              </div>
              <div className="border-t border-ink/15 pt-5">
                <dt className="text-sm text-muted">What you pay</dt>
                <dd className="mt-1 font-display text-lg font-semibold">One flat rate per visit. No contract.</dd>
              </div>
            </dl>
            <p className="mt-7 border-t-2 border-ink pt-5 font-numeral text-3xl tracking-wide">&ldquo;{detailPlusGuarantee}&rdquo;</p>
          </div>
        </div>
      </section>

      {/* 9. REVIEWS */}
      <section className="border-t-2 border-ink bg-paper2 py-16 md:py-24">
        <div className="container-ed">
          <ReviewGrid />
        </div>
      </section>

      {/* 10. FAQ */}
      <section className="container-ed grid gap-10 py-16 md:py-24 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 className="t-h2">Questions</h2>
          <p className="mt-4 text-ink/80">
            Something else? Call or text{" "}
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
