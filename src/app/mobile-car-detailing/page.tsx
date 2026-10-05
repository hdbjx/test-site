import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CtaBand } from "@/components/CtaBand";
import { JsonLd } from "@/components/JsonLd";
import { ServicePicker } from "@/components/ServicePicker";
import { areas } from "@/data/areas";
import { pageMetadata, serviceSchema } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Mobile Car Detailing in Decatur & Atlanta, GA | Every Detail",
  description: "Full inside-and-out mobile car detailing in Decatur and nearby Atlanta areas. First-time clients usually start with Premium or Factory Reset. See pricing online.",
  path: "/mobile-car-detailing",
});

export default function MobileCarDetailingPage() {
  return (
    <main className="services-v161 mobile-detailing-page">
      <section className="edu-hero"><div className="svc-shell">
        <div className="mb-6"><Breadcrumbs items={[{ name: "Mobile Car Detailing", path: "/mobile-car-detailing" }]} /></div>
        <p className="svc-eyebrow">MOBILE CAR DETAILING / DECATUR + ATLANTA</p>
        <div className="edu-hero-grid">
          <h1>Full mobile car detailing,<br/><span>right in your driveway.</span></h1>
          <div className="edu-hero-copy">
            <p className="edu-lede">Every Detail brings the crew, water, power, products and equipment to you. Our core detailing services clean the vehicle inside and out rather than treating the first visit like a quick interior-only or exterior-only clean.</p>
            <p>For most first-time clients, Premium is the starting point. If the vehicle has heavy stains, pet hair, spills, odor or long-term buildup, Factory Reset adds the labor needed for a deeper recovery. Maintenance is designed mainly for vehicles that are already clean and being kept that way.</p>
            <div className="mt-7 flex flex-wrap gap-3"><Link href="/book" className="btn btn-primary">Book your detail ↗</Link><Link href="/get-a-quote" className="btn btn-secondary">Get a recommendation</Link></div>
          </div>
        </div>
      </div></section>

      <section className="edu-anatomy"><div className="svc-shell">
        <div className="edu-section-intro"><p className="svc-eyebrow">WHAT MOBILE DETAILING MEANS HERE</p><h2>One appointment.<br/><span>The whole vehicle.</span></h2><p>Our standard first-visit approach is comprehensive. We work through the interior and exterior so the car leaves with a consistent baseline instead of one half being cleaned while the other is left behind.</p></div>
        <div className="grid gap-6 md:grid-cols-3 mt-10">
          <article><b>01</b><h3 className="mt-3 text-xl font-semibold">Interior</h3><p className="mt-2">Vacuuming, seats, mats, dash, console, cupholders, doors, panels, glass and cargo areas, with deeper work when the selected service calls for it.</p></article>
          <article><b>02</b><h3 className="mt-3 text-xl font-semibold">Exterior</h3><p className="mt-2">Hand washing, wheels and tires, exterior glass, door jambs and finishing work, with paint protection or decontamination depending on the service.</p></article>
          <article><b>03</b><h3 className="mt-3 text-xl font-semibold">Your driveway</h3><p className="mt-2">Our mobile rigs carry their own power and water. You provide the vehicle and an accessible place for the crew to work safely around it.</p></article>
        </div>
      </div></section>

      <section className="area-v2-pricing"><div className="area-v2-shell">
        <div className="area-v2-pricing-head"><div><p className="area-v2-kicker">CHOOSE THE RIGHT STARTING POINT</p><h2>First visit?<br/><span>Start with condition.</span></h2></div><p>Premium fits most first-time vehicles. Factory Reset is for heavier buildup. Maintenance makes the most sense once the vehicle already has a clean baseline.</p></div>
        <ServicePicker location="mobile_detailing_seo" headingId="mobile-detailing-pricing" />
        <p className="mt-6"><Link href="/our-services" className="link">Compare exactly what each service includes ↗</Link></p>
      </div></section>

      <section className="areas-v2-list"><div className="areas-v2-shell">
        <div className="areas-v2-head"><div><p className="areas-v2-kicker">SERVICE AREA</p><h2>Based in Decatur.<br/><span>Mobile across nearby Atlanta.</span></h2></div><p>We serve Decatur and nearby communities with appointment availability based on where our crews can actually travel and work.</p></div>
        <div className="areas-v2-grid">{areas.map((area, i) => <Link key={area.slug} href={`/service-areas/${area.slug}`} className="areas-v2-card"><span className="areas-v2-index">{String(i+1).padStart(2,"0")}</span><div><h3>{area.name}</h3><p>{area.primary ? "Home base" : "Mobile service area"}</p></div><b>↗</b></Link>)}</div>
      </div></section>

      <CtaBand location="mobile_detailing_final" />
      <JsonLd data={serviceSchema({ name: "Mobile Car Detailing", description: "Full inside-and-out mobile car detailing in Decatur and nearby Atlanta communities, with power and water supplied by Every Detail.", path: "/mobile-car-detailing" })} />
    </main>
  );
}
