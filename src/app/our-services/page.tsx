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
  title: "Car Detailing Services & Pricing | Every Detail Decatur",
  description: "Compare Every Detail services, see pricing for your vehicle, and choose Maintenance, Premium, Factory Reset, Paint Care, or Detail+.",
  path: "/our-services",
  image: "two-tech-interior-detail",
});

const core = [
  { id: "maintenance", anchor: "maintenance-detail", number: "01", condition: "ALREADY PRETTY CLEAN", name: "Maintenance Detail", body: "Routine inside-and-out care for a car that is already in good shape.", fit: "Best for regularly detailed vehicles and returning clients.", href: "/book?service=maintenance", image: "tesla-foam-wash", featured: false },
  { id: "premium", anchor: "premium-detail", number: "02", condition: "NORMAL DAILY BUILDUP", name: "Premium Detail", body: "Our most booked inside-and-out detail for normal wear, buildup, and first-time clients.", fit: "Best for most daily drivers that have fallen behind.", href: "/book?service=premium", image: "two-tech-interior-detail", featured: true },
  { id: "factoryReset", anchor: "factory-reset", number: "03", condition: "HEAVY BUILDUP OR NEGLECT", name: "Factory Reset", body: "Our deepest clean for stains, pet hair, spills, odor concerns, and long-term buildup.", fit: "Best when the car needs restoration-level cleaning.", href: "/book?service=factoryReset", image: "interior-detail-team", featured: false },
] as const;

export default function ServicesPage() {
  const schemas = [
    ...serviceList.map((service) => {
      const prices = vehicles.map((vehicle) => PRICING[vehicle.id][service.id].price);
      return serviceSchema({ name: service.name, description: service.summary, path: `/our-services#${service.slug}`, lowPrice: Math.min(...prices), highPrice: Math.max(...prices) });
    }),
    ...paintServices.map((service) => {
      const prices = vehicles.map((vehicle) => PAINT_PRICING[vehicle.id][service.id]);
      return serviceSchema({ name: service.name, description: service.summary, path: "/ceramic", lowPrice: Math.min(...prices), highPrice: Math.max(...prices) });
    }),
  ];

  return (
    <>
      <main className="services-v61 info80-page service85" data-header-tone="ink">
        <section className="svc61-hero info80-hero" data-header-tone="ink">
          <div className="svc61-shell">
            <div className="svc61-crumbs"><Breadcrumbs items={[{ name: "Detailing Services", path: "/our-services" }]} /></div>
            <div className="svc61-hero-grid">
              <div className="svc61-hero-copy">
                <p className="svc61-kicker">MOBILE DETAILING / DECATUR, GA</p>
                <h1>THE RIGHT DETAIL.<br /><span>WITHOUT THE GUESSWORK.</span></h1>
                <p className="svc61-lede">Choose by condition, see the exact price for your vehicle, then book the time that works.</p>
                <div className="svc61-hero-actions">
                  <TrackedLink href="/get-a-quote" event="quote_start" params={{ location: "services_hero" }} className="svc61-btn svc61-btn-primary">Find my detail <span>↗</span></TrackedLink>
                  <TrackedLink href="/book" event="book_click" params={{ location: "services_hero" }} className="svc61-btn svc61-btn-secondary">Book directly <span>↗</span></TrackedLink>
                </div>
                <div className="info80-facts" aria-label="Every Detail service facts">
                  <span><strong><LiveReviewCount /></strong> five-star reviews</span>
                  <span>Power + water included</span>
                  <span>Mobile to your driveway</span>
                </div>
              </div>
              <div className="svc61-hero-media" aria-label="Every Detail technicians at work">
                <div className="svc61-photo-main"><Photo id="two-tech-interior-detail" sizes="(max-width: 900px) 100vw, 45vw" fill priority /></div>
                <div className="svc61-photo-small"><Photo id="hq-branded-van-side" sizes="(max-width: 900px) 44vw, 18vw" fill /></div>
              </div>
            </div>
          </div>
        </section>

        <section className="svc61-core info80-section" data-header-tone="ink" aria-labelledby="svc61-core-title">
          <div className="svc61-shell">
            <div className="info80-heading-row">
              <div><p className="svc61-kicker">START WITH THE CAR</p><h2 id="svc61-core-title">WHAT SHAPE IS IT IN?</h2></div>
              <TrackedLink href="/get-a-quote" event="quote_start" params={{ location: "services_core_unsure" }} className="info80-text-link">Not sure? Find my detail ↗</TrackedLink>
            </div>
            <div className="svc61-core-grid info80-service-cards">
              {core.map((service) => (
                <article key={service.id} id={service.anchor} className={`svc61-core-card ${service.featured ? "is-featured" : ""}`}>
                  <div className="svc61-core-image"><Photo id={service.image} sizes="(max-width: 760px) 100vw, 33vw" fill /></div>
                  <div className="svc61-core-body">
                    <div className="svc61-card-top"><span>{service.number}</span>{service.featured ? <b>MOST BOOKED</b> : null}</div>
                    <p className="svc61-condition">{service.condition}</p>
                    <h3>{service.name}</h3>
                    <p>{service.body}</p>
                    <p className="svc61-fit">{service.fit}</p>
                    <div className="svc61-card-bottom"><span>from <b>{usd(startingPrice(service.id))}</b></span><TrackedLink href={service.href} event="book_click" params={{ location: "services_core", service: service.id }} className="svc61-card-link">Book <span>↗</span></TrackedLink></div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="svc62-catalog info80-section" data-header-tone="ink" id="all-services" aria-labelledby="svc62-catalog-title">
          <div className="svc61-shell">
            <div className="info80-heading-row">
              <div><p className="svc61-kicker">ALL SERVICES</p><h2 id="svc62-catalog-title">SEE THE FULL LINEUP.</h2></div>
              <p>Exact pricing follows the vehicle you selected.</p>
            </div>
            <ServicesCatalogCompare />
          </div>
        </section>

        <section className="svc86-mobile-section" data-header-tone="light">
          <div className="svc61-shell svc86-mobile-grid">
            <figure><Photo id="mobile-rig-open-driveway" ratio="4/3" sizes="(min-width: 900px) 46vw, 92vw" /></figure>
            <div>
              <p className="svc61-kicker">MOBILE BY DESIGN</p>
              <h2>WE COME TO YOU.</h2>
              <p>Power, water, products, and equipment arrive with the crew. You provide the vehicle and a safe place for us to work around it.</p>
              <TrackedLink href="/book" event="book_click" params={{ location: "services_mobile_strip" }} className="svc61-btn svc61-btn-primary">Choose a time <span>↗</span></TrackedLink>
            </div>
          </div>
        </section>

        <section className="svc61-faq info80-section" data-header-tone="ink">
          <div className="svc61-shell svc61-faq-grid"><div><p className="svc61-kicker">QUICK ANSWERS</p><h2>BEFORE YOU BOOK.</h2></div><FaqList faqs={homeFaqs.slice(0, 5)} /></div>
        </section>
      </main>
      <CtaBand location="services_final" title="Ready when you are." body="Choose the service, vehicle, and time." quoteLabel="Find my detail" />
      <JsonLd data={schemas} />
    </>
  );
}
