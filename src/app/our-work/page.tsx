import Link from "next/link";
import { TrackedLink } from "@/components/TrackedLink";
import Image from "next/image";
import { Photo } from "@/components/Photo";
import { LiveReviewCount } from "@/components/GoogleReviewStats";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Our Work | Mobile Detailing Results | Every Detail",
  description: "See real Every Detail jobs around Decatur and Atlanta, including interiors, exterior details, paint care, our mobile rigs, and the crew behind the work.",
  path: "/our-work",
});

const jobs = [
  {
    n: "01",
    tag: "PREMIUM DETAIL / DAILY DRIVER",
    title: "The reset most cars actually need.",
    body: "A full inside-and-out detail for a daily driver that had moved past maintenance-clean territory. Two technicians worked through the cabin, touch points, wheels, wash, and final finish as one complete service.",
    meta: ["Interior + exterior", "Two-person crew", "Mobile driveway service"],
    image: "hq-interior-team-front-seats",
    detail: "hq-white-suv-finished",
  },
  {
    n: "02",
    tag: "INTERIOR / DEEP CLEAN",
    title: "Clean all the way through, not just where you can see.",
    body: "The difference in a real interior detail is the process. Seats, seams, floor areas, cargo space, plastics, glass, and the small surfaces that quick cleans tend to leave behind all get worked through deliberately.",
    meta: ["Seat-by-seat cleaning", "Cargo area included", "Glass + touch points"],
    image: "rear-seat-detail",
    detail: "clean-white-interior",
  },
  {
    n: "03",
    tag: "EXTERIOR / FINISH",
    title: "A finish that looks finished.",
    body: "Wheels, tires, bodywork, trim, glass, and the final presentation matter together. The goal is not a fast wash. It is returning the entire exterior in a condition that feels complete.",
    meta: ["Tesla exterior", "Hand wash", "Wheel + tire detail", "Final finish check"],
    image: "tesla-foam-wash",
    detail: "hq-white-ioniq-wheel",
  },
  {
    n: "04",
    tag: "MOBILE SETUP / ATLANTA",
    title: "The shop comes to the driveway.",
    body: "Our rigs carry their own water, battery power, tools, products, and organization. That means the customer gets a professional setup without turning detailing into another errand or listening to a generator run all afternoon.",
    meta: ["Power included", "Water included", "100% electric rigs"],
    image: "mobile-rig-open-driveway",
    detail: "hq-mobile-rig-fleet",
  },
] as const;

export default function OurWorkPage() {
  return (
    <div className="work-page-v18">
      <section className="work-page-hero" data-header-tone="light">
        <div className="container-ed work-page-hero-grid">
          <div>
            <p className="eyebrow">REAL CARS / REAL DRIVEWAYS / REAL CREW</p>
            <h1>The work should<br/><span>speak for itself.</span></h1>
          </div>
          <div className="work-page-hero-copy">
            <p>These are real Every Detail jobs around Decatur and Atlanta. No stock photos, no staged shop, and no mystery about who is doing the work.</p>
            <div className="work-page-proof"><strong>★★★★★ <LiveReviewCount /> five-star reviews</strong><span>Student-run. Professionally detailed.</span></div>
          </div>
        </div>
        <figure className="container-ed work-audit-hero-photo">
          <Photo id="work-finished-0771" priority sizes="100vw" ratio="16/7" />
          <figcaption><span>REAL CUSTOMER CAR</span><span>DECATUR + ATLANTA</span><span>EVERY DETAIL CREW</span></figcaption>
        </figure>
      </section>

      <section className="work-page-jobs" data-header-tone="light">
        <div className="container-ed">
          {jobs.map((job, index) => (
            <article className={`work-case ${index % 2 ? "is-reverse" : ""} ${index === 3 ? "work86-featured-case" : ""}`} key={job.n}>
              <div className="work-case-media">
                <Photo id={job.image} sizes="(min-width: 900px) 56vw, 100vw" ratio="4/3" />
                <div className="work-case-inset"><Photo id={job.detail} sizes="(min-width: 900px) 22vw, 42vw" ratio="4/3" /></div>
              </div>
              <div className="work-case-copy">
                <p className="eyebrow">{job.n} / {job.tag}</p>
                <h2>{job.title}</h2>
                <p>{job.body}</p>
                <div className="work-case-meta">{job.meta.map((m) => <span key={m}>{m}</span>)}</div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="work-audit-before-after" data-header-tone="ink" aria-labelledby="work-before-after-title">
        <div className="container-ed work-audit-before-after-grid">
          <div>
            <p className="eyebrow">BEFORE / AFTER PROOF</p>
            <h2 id="work-before-after-title">Same panel.<br/><span>Different finish.</span></h2>
            <p>This is a real 50/50 paint-correction test spot under an inspection light. The corrected side is on the left; the as-arrived side is on the right.</p>
            <TrackedLink href="/paint-correction" event="paint_inquiry" params={{ location: "work_before_after" }} className="btn btn-secondary">See paint correction ↗</TrackedLink>
          </div>
          <figure>
            <Image src="/images/paint-5050-single.jpg" alt="Real 50/50 paint correction test spot, corrected on the left and uncorrected on the right" fill sizes="(min-width: 900px) 58vw, 92vw" />
            <figcaption><span>CORRECTED</span><span>AS ARRIVED</span></figcaption>
          </figure>
        </div>
      </section>

      <section className="work-page-crew" data-header-tone="ink">
        <div className="container-ed work-page-crew-grid">
          <figure><Photo id="about-ops-05" sizes="(min-width: 900px) 50vw, 100vw" ratio="3/2" /></figure>
          <div><p className="eyebrow">WHO SHOWS UP</p><h2>A real local team, not an anonymous contractor.</h2><p>Every Detail is built and run by students who take the work seriously. The same team you see here is the team working in customers’ driveways.</p><Link href="/about-us" className="btn btn-secondary">Meet the team ↗</Link></div>
        </div>
      </section>

      <section className="work-page-final" data-header-tone="light">
        <div className="container-ed work-page-final-grid">
          <div><p className="eyebrow">YOUR CAR NEXT</p><h2>Know what you need?</h2><p>Book it now. If you are not sure, answer a few questions and we will point you to the right detail.</p></div>
          <div className="work-page-final-actions"><TrackedLink href="/get-a-quote" event="quote_start" params={{ location: "work_final" }} className="btn btn-secondary">Find my detail</TrackedLink><TrackedLink href="/book" event="book_click" params={{ location: "work_final" }} className="btn btn-primary">Book now ↗</TrackedLink></div>
        </div>
      </section>
    </div>
  );
}
