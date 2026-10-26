import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CtaBand } from "@/components/CtaBand";
import { CurvedTape } from "@/components/CurvedTape";
import { FaqList } from "@/components/FaqList";
import { LiveReviewCount } from "@/components/GoogleReviewStats";
import { JsonLd } from "@/components/JsonLd";
import { Photo } from "@/components/Photo";
import { ServiceConditionGauge } from "@/components/services/ServiceConditionGauge";
import { ServicesCompareSheet } from "@/components/services/ServicesCompareSheet";
import { ServicesHeroMedia } from "@/components/services/ServicesHeroMedia";
import { ServicesMenuBoard } from "@/components/services/ServicesMenuBoard";
import { TrackedLink } from "@/components/TrackedLink";
import { homeFaqs } from "@/data/faqs";
import { PAINT_PRICING, paintServices } from "@/data/paint";
import { PRICING, serviceList, vehicles } from "@/data/services";
import { pageMetadata, serviceSchema } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Car Detailing Services & Pricing | Every Detail Decatur",
  description: "Compare Every Detail services, see pricing for your vehicle, and choose Maintenance, Premium, Factory Reset, paint correction, ceramic coating, or Detail+.",
  path: "/our-services",
  image: "two-tech-interior-detail",
});


const serviceAnchors = {
  menu: { anchor: "all-services" },
  maintenance: { anchor: "maintenance-detail" },
  premium: { anchor: "premium-detail" },
  factoryReset: { anchor: "factory-reset" },
} as const;

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
      <main className="sv90-page">
        <section className="sv90-hero" data-header-tone="ink" aria-labelledby="sv90-hero-title">
          <div className="sv90-shell sv90-hero-inner">
            <div className="sv90-hero-crumbs"><Breadcrumbs items={[{ name: "Detailing Services", path: "/our-services" }]} /></div>
            <h1 id="sv90-hero-title">THE RIGHT DETAIL.<br /><span>NO GUESSWORK.</span></h1>
            <div className="sv90-hero-lower">
              <div>
                <p>Pick by condition. See the exact price for your vehicle. Book the time that works.</p>
                <div className="sv90-hero-actions">
                  <TrackedLink href="/book" event="book_click" params={{ location: "services_hero" }} className="ed90-button ed90-button-ink">BOOK DIRECTLY <span>↗</span></TrackedLink>
                  <TrackedLink href="/get-a-quote" event="quote_start" params={{ location: "services_hero" }} className="svc-audit-quiz-link">NOT SURE? FIND MY DETAIL <span>↗</span></TrackedLink>
                </div>
              </div>
              <div className="sv90-hero-facts" aria-label="Every Detail service facts">
                <span><strong><LiveReviewCount /></strong> five-star reviews</span>
                <span>Power + water included</span>
                <span>Mobile to your driveway</span>
              </div>
            </div>
          </div>
          <ServicesHeroMedia />
        </section>

        <CurvedTape text="PRICED BY VEHICLE • POWER + WATER INCLUDED • WE COME TO YOU • REAL CREW • " label="Every Detail service promise" />

        <section className="sv90-core" data-header-tone="ink" aria-labelledby="sv90-core-title">
          <div className="sv90-shell">
            <div className="sv90-core-heading">
              <h2 id="sv90-core-title" className="ed90-heading">WHAT SHAPE<br /><span>IS IT IN?</span></h2>
              <TrackedLink href="/get-a-quote" event="quote_start" params={{ location: "services_core_unsure" }}>Not sure? Find my detail ↗</TrackedLink>
            </div>
            <ServiceConditionGauge anchors={serviceAnchors} />
          </div>
        </section>

        <ServicesMenuBoard anchorId={serviceAnchors.menu.anchor} />
        <ServicesCompareSheet />

        <section className="sv90-mobile" data-header-tone="light" aria-labelledby="sv90-mobile-title">
          <div className="sv90-mobile-photo ed90-photo-grade"><Photo id="mobile-rig-open-driveway" sizes="100vw" fill /></div>
          <div className="sv90-mobile-shade" />
          <div className="sv90-shell sv90-mobile-copy">
            <h2 id="sv90-mobile-title" className="ed90-heading">YOUR DRIVEWAY.<br /><span>OUR DETAIL SHOP.</span></h2>
            <div className="sv90-mobile-checks" aria-label="What Every Detail brings">
              <span>POWER ✓</span>
              <span>WATER ✓</span>
              <span>PRODUCTS + EQUIPMENT ✓</span>
            </div>
            <TrackedLink href="/book" event="book_click" params={{ location: "services_mobile_strip" }} className="ed90-button ed90-button-paper">CHOOSE A TIME <span>↗</span></TrackedLink>
          </div>
        </section>

        <section className="sv90-faq" data-header-tone="ink" aria-labelledby="sv90-faq-title">
          <div className="sv90-shell sv90-faq-grid">
            <div className="sv90-faq-heading"><h2 id="sv90-faq-title" className="ed90-heading">BEFORE<br /><span>YOU BOOK.</span></h2></div>
            <FaqList faqs={homeFaqs.slice(0, 5)} />
          </div>
        </section>
      </main>
      <CtaBand location="services_final" title="Ready when you are." body="Choose the service, vehicle, and time." quoteLabel="Find my detail" />
      <JsonLd data={schemas} />
    </>
  );
}
