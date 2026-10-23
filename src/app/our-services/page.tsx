import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CtaBand } from "@/components/CtaBand";
import { FaqList } from "@/components/FaqList";
import { JsonLd } from "@/components/JsonLd";
import { LiveReviewCount } from "@/components/GoogleReviewStats";
import { Photo } from "@/components/Photo";
import { ServicesCatalogCompare } from "@/components/ServicesCatalogCompare";
import { TrackedLink } from "@/components/TrackedLink";
import { homeFaqs } from "@/data/faqs";
import { PRICING, serviceList, startingPrice, vehicles } from "@/data/services";
import { PAINT_PRICING, paintServices } from "@/data/paint";
import { usd } from "@/lib/format";
import { pageMetadata, serviceSchema } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Car Detailing Services & Prices in Decatur, GA | Every Detail",
  description:
    "Compare Every Detail mobile detailing services, see exact pricing for your vehicle, and choose between Maintenance, Premium, Factory Reset, Paint Care, and Detail+.",
  path: "/our-services",
});

const core = [
  {
    id: "maintenance",
    number: "01",
    condition: "ALREADY PRETTY CLEAN",
    name: "Maintenance Detail",
    statement: "Keep the baseline.",
    body: "Routine inside-and-out care for a car that is already in good shape and does not need restoration-level labor.",
    fit: "Best for regularly detailed vehicles and returning clients.",
    href: "/book?service=maintenance",
    image: "tesla-foam-wash",
    featured: false,
  },
  {
    id: "premium",
    number: "02",
    condition: "NEEDS A REAL DETAIL",
    name: "Premium Detail",
    statement: "Bring the whole car back.",
    body: "Our most booked service. A thorough inside-and-out detail for normal daily wear, buildup, and first-time clients.",
    fit: "Best for most daily drivers that have fallen behind.",
    href: "/book?service=premium",
    image: "two-tech-interior-detail",
    featured: true,
  },
  {
    id: "factoryReset",
    number: "03",
    condition: "HEAVY BUILDUP OR NEGLECT",
    name: "Factory Reset",
    statement: "Start over.",
    body: "Our deepest clean, with extraction, decontamination, pet-hair work, and the time needed for heavily used vehicles.",
    fit: "Best for stains, pets, spills, odor concerns, or years of buildup.",
    href: "/book?service=factoryReset",
    image: "interior-detail-team",
    featured: false,
  },
] as const;

export default function ServicesPage() {
  const schemas = [
    ...serviceList.map((service) => {
      const prices = vehicles.map((vehicle) => PRICING[vehicle.id][service.id].price);
      return serviceSchema({
        name: service.name,
        description: service.summary,
        path: `/our-services#${service.slug}`,
        lowPrice: Math.min(...prices),
        highPrice: Math.max(...prices),
      });
    }),
    ...paintServices.map((service) => {
      const prices = vehicles.map((vehicle) => PAINT_PRICING[vehicle.id][service.id]);
      return serviceSchema({
        name: service.name,
        description: service.summary,
        path: "/ceramic#packages",
        lowPrice: Math.min(...prices),
        highPrice: Math.max(...prices),
      });
    }),
  ];

  return (
    <>
      <main className="services-v61">
        <section className="svc61-hero">
          <div className="svc61-shell">
            <div className="svc61-crumbs"><Breadcrumbs items={[{ name: "Detailing Services", path: "/our-services" }]} /></div>
            <div className="svc61-hero-grid">
              <div className="svc61-hero-copy">
                <p className="svc61-kicker">MOBILE DETAILING / DECATUR, GA</p>
                <h1>THE RIGHT DETAIL.<br /><span>WITHOUT THE GUESSWORK.</span></h1>
                <p className="svc61-lede">Three core details cover almost every car we see. Start with the condition of yours, then see the exact price for your vehicle.</p>
                <div className="svc61-hero-actions">
                  <TrackedLink href="/get-a-quote" event="quote_start" params={{ location: "services_hero" }} className="svc61-btn svc61-btn-primary">Find my detail <span>↗</span></TrackedLink>
                  <TrackedLink href="/book" event="book_click" params={{ location: "services_hero" }} className="svc61-btn svc61-btn-secondary">Book now <span>↗</span></TrackedLink>
                </div>
                <div className="svc61-proof" aria-label="Every Detail service facts">
                  <span><strong><LiveReviewCount /></strong> five-star reviews</span>
                  <span><strong>POWER + WATER</strong> included</span>
                  <span><strong>MOBILE</strong> at your driveway</span>
                </div>
              </div>

              <div className="svc61-hero-media" aria-label="Every Detail technicians at work">
                <div className="svc61-photo-main"><Photo id="two-tech-interior-detail" sizes="(max-width: 900px) 100vw, 45vw" fill priority /></div>
                <div className="svc61-photo-small"><Photo id="hq-branded-van-side" sizes="(max-width: 900px) 44vw, 18vw" fill /></div>
                <div className="svc61-photo-label"><span>REAL CREW</span><b>REAL CARS.</b></div>
              </div>
            </div>
          </div>
        </section>

        <section className="svc61-core" aria-labelledby="svc61-core-title">
          <div className="svc61-shell">
            <div className="svc61-section-head">
              <div>
                <p className="svc61-kicker">START WITH THE CONDITION</p>
                <h2 id="svc61-core-title">HOW FAR BEHIND<br /><span>IS THE CAR?</span></h2>
              </div>
              <p>You do not need to understand detailing terminology. Pick the description that sounds closest. If you are between two, the quote tool will narrow it down.</p>
            </div>

            <div className="svc61-core-grid">
              {core.map((service) => (
                <article key={service.id} id={service.id === "factoryReset" ? "factory-reset" : `${service.id}-detail`} className={`svc61-core-card ${service.featured ? "is-featured" : ""}`}>
                  <div className="svc61-core-image"><Photo id={service.image} sizes="(max-width: 760px) 100vw, 33vw" fill /></div>
                  <div className="svc61-core-body">
                    <div className="svc61-card-top"><span>{service.number}</span>{service.featured ? <b>MOST BOOKED</b> : null}</div>
                    <p className="svc61-condition">{service.condition}</p>
                    <h3>{service.name}</h3>
                    <strong>{service.statement}</strong>
                    <p>{service.body}</p>
                    <p className="svc61-fit">{service.fit}</p>
                    <div className="svc61-card-bottom">
                      <span>from <b>{usd(startingPrice(service.id))}</b></span>
                      <TrackedLink href={service.href} event="book_click" params={{ location: "services_core", service: service.id }} className="svc61-card-link">Book <span>↗</span></TrackedLink>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="svc61-unsure">
              <div><span>NOT SURE?</span><strong>Tell us what the car is like. We will pick the level.</strong></div>
              <TrackedLink href="/get-a-quote" event="quote_start" params={{ location: "services_core_unsure" }} className="svc61-inline-link">Find my detail <span>↗</span></TrackedLink>
            </div>
          </div>
        </section>

        <section className="svc62-catalog" id="all-services" aria-labelledby="svc62-catalog-title">
          <div className="svc61-shell">
            <div className="svc61-section-head svc62-section-head">
              <div>
                <p className="svc61-kicker">THE FULL LINEUP</p>
                <h2 id="svc62-catalog-title">EVERY SERVICE.
                  <br /><span>ONE PLACE.</span>
                </h2>
              </div>
              <p>Choose your vehicle once, see the listed price across the lineup, then compare any two services below. Detail+ uses a plan-based rate because cadence and coverage are built around the car.</p>
            </div>
            <ServicesCatalogCompare />
          </div>
        </section>

        <section className="svc61-day" aria-labelledby="svc61-day-title">
          <div className="svc61-shell">
            <div className="svc61-day-grid">
              <div className="svc61-day-intro">
                <p className="svc61-kicker">DETAIL DAY</p>
                <h2 id="svc61-day-title">YOUR DRIVEWAY.<br /><span>OUR SETUP.</span></h2>
                <p>Once you choose the service, the rest is simple. We arrive with the equipment, power, and water needed to do the work where the vehicle is parked.</p>
              </div>
              <ol className="svc61-day-steps">
                <li><b>01</b><div><strong>Choose the service and time.</strong><p>Book directly, or use Find My Detail if the condition is not obvious.</p></div></li>
                <li><b>02</b><div><strong>We bring the setup.</strong><p>Power, water, products, tools, and the crew required for the selected service.</p></div></li>
                <li><b>03</b><div><strong>We work the process.</strong><p>The job follows the service level you chose, then the vehicle is checked before we pack up.</p></div></li>
              </ol>
            </div>
          </div>
        </section>

        <section className="svc61-faq">
          <div className="svc61-shell svc61-faq-grid">
            <div>
              <p className="svc61-kicker">QUICK ANSWERS</p>
              <h2>SERVICE<br />QUESTIONS.</h2>
              <p>The things people usually need to know before choosing a detail.</p>
            </div>
            <FaqList faqs={homeFaqs.slice(0, 6)} />
          </div>
        </section>
      </main>

      <CtaBand
        location="services_final"
        title="Know what your car needs?"
        body="Book it directly. If you are still between services, answer three quick questions and we will point you to the right one."
        quoteLabel="Find my detail"
      />
      <JsonLd data={schemas} />
    </>
  );
}
