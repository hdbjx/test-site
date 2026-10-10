import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CtaBand } from "@/components/CtaBand";
import { FaqList } from "@/components/FaqList";
import { JsonLd } from "@/components/JsonLd";
import { ServicesDecisionTool } from "@/components/ServicesDecisionTool";
import { ServiceDepthScroll } from "@/components/ServiceDepthScroll";
import { homeFaqs } from "@/data/faqs";
import { paintServices } from "@/data/paint";
import { PRICING, serviceList, vehicles } from "@/data/services";
import { usd } from "@/lib/format";
import { pageMetadata, serviceSchema } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Car Detailing Services & Prices in Decatur, GA | Every Detail",
  description: "Learn what professional mobile detailing includes, why different vehicles need different levels of cleaning, and compare Every Detail services and pricing.",
  path: "/our-services",
});

export default function ServicesPage() {
  const schemas = serviceList.map((s) => {
    const prices = vehicles.map((v) => PRICING[v.id][s.id].price);
    return serviceSchema({ name: s.name, description: s.summary, path: `/our-services#${s.slug}`, lowPrice: Math.min(...prices), highPrice: Math.max(...prices) });
  });

  return (
    <>
      <main className="services-v161">
        <section className="edu-hero">
          <div className="svc-shell">
            <div className="mb-6"><Breadcrumbs items={[{ name: "Detailing Services", path: "/our-services" }]} /></div>
            <p className="svc-eyebrow">MOBILE DETAILING / DECATUR, GA</p>
            <div className="edu-hero-grid">
              <h1>A detail is more than<br/><span>a car wash.</span></h1>
              <div className="edu-hero-copy">
                <p className="edu-lede">A wash cleans the obvious surfaces. Professional detailing is a methodical cleaning of the vehicle as a whole.</p>
                <p>We work through the interior and exterior area by area, including the places quick washes and basic interior cleanings tend to skip. The goal is not just to make the car look cleaner for the afternoon. It is to properly clean it, protect it where the service calls for it, and establish a condition that can actually be maintained.</p>
              </div>
            </div>
          </div>
        </section>

        <ServiceDepthScroll />

        <section className="edu-booking" id="pricing">
          <div className="svc-shell">
            <div className="edu-booking-head"><div><p className="svc-eyebrow">NOW THAT YOU KNOW THE DIFFERENCE</p><h2>Find the right price<br/><span>for your car.</span></h2></div><p>Choose your vehicle once to compare all three services. This is where the page shifts from learning to choosing.</p></div>
            <ServicesDecisionTool />
          </div>
        </section>

        <section className="svc-single"><div className="svc-shell svc-single-inner"><div><p className="svc-eyebrow">ONLY NEED ONE SIDE?</p><h2>Interior-only or exterior-only.</h2></div><p>Our core details cover the whole vehicle. Detail+ members can choose interior-only or exterior-only plans. For a one-time standalone job, send us what you need and we will quote it.</p><Link href="/get-a-quote" className="svc-outline-btn">Get a quote <span>↗</span></Link></div></section>

        <section className="svc-paint" id="paint"><div className="svc-shell"><div className="svc-paint-grid"><div><p className="svc-eyebrow">BEYOND DETAILING</p><h2>Cleaning and paint correction are <span>different jobs.</span></h2><p>Detailing removes dirt and contamination from the vehicle. Paint correction goes a step further by machine-polishing the clear coat to reduce visible swirls, haze and defects. Ceramic coating is protection applied after the paint is properly prepared.</p><Link href="/paint-correction" className="svc-light-btn">Learn about paint care <span>↗</span></Link></div><div className="svc-paint-list">{paintServices.map((p,i)=><div key={p.id}><b>0{i+1}</b><div><h3>{p.name}</h3><p>{p.bestFor}</p></div><strong>from {usd(p.startingAt)}</strong></div>)}</div></div></div></section>

        <section className="svc-plus" id="detail-plus"><div className="svc-shell"><div className="svc-plus-grid"><div><p className="svc-eyebrow">AFTER THE FIRST DETAIL</p><h2>Getting clean is one job.<br/><span>Staying clean is another.</span></h2><p>Detail+ is recurring care for vehicles that already have a clean baseline. Instead of waiting for the car to build up again, we return on a schedule and maintain it.</p><Link href="/detailplus" className="svc-light-btn">Learn how Detail+ works <span>↗</span></Link></div><div className="svc-plus-steps"><div><b>01</b><h3>Establish the baseline</h3><p>Start with the vehicle at the right level of clean.</p></div><div><b>02</b><h3>Choose a schedule</h3><p>Pick a frequency that fits how the vehicle is used.</p></div><div><b>03</b><h3>Maintain it</h3><p>We return before the car needs another major reset.</p></div></div></div></div></section>

        <section className="svc-process"><div className="svc-shell"><div className="svc-section-head compact"><p className="svc-eyebrow">WHAT HAPPENS ON DETAIL DAY</p><h2>Your driveway.<br/><span>Our setup.</span></h2><p>You do not need to drive to a shop or provide a hose and outlet. We arrive prepared to do the job where the car is parked.</p></div><ol><li><b>01</b><h3>We arrive prepared.</h3><p>Our team brings the power, water, products and equipment needed for the service.</p></li><li><b>02</b><h3>We work through the car.</h3><p>The technicians follow the process for the service level you selected rather than rushing the most visible areas.</p></li><li><b>03</b><h3>We finish and check it.</h3><p>The vehicle is inspected, packed up and returned ready to drive.</p></li></ol></div></section>

        <section className="svc-faq"><div className="svc-shell svc-faq-grid"><div><p className="svc-eyebrow">STILL LEARNING?</p><h2>Service questions.</h2><p>Common questions about what we do, what you need to provide and how the service works.</p></div><FaqList faqs={homeFaqs.slice(0,8)} /></div></section>
      </main>
      <CtaBand location="services_final" />
      <JsonLd data={schemas} />
    </>
  );
}
