import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { FaqList } from "@/components/FaqList";
import { JsonLd } from "@/components/JsonLd";
import { ServicesDecisionTool } from "@/components/ServicesDecisionTool";
import { TrackedLink } from "@/components/TrackedLink";
import { bookingHref } from "@/data/booking";
import { homeFaqs } from "@/data/faqs";
import { paintServices } from "@/data/paint";
import { PRICING, serviceList, startingPrice, vehicles } from "@/data/services";
import { usd } from "@/lib/format";
import { pageMetadata, serviceSchema } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Car Detailing Services & Prices in Decatur, GA | Every Detail",
  description: "Compare Maintenance, Premium and Factory Reset mobile detailing, see exact vehicle pricing, and learn what each level is built to handle.",
  path: "/our-services",
});

const compareRows = [
  ["Exterior hand wash", "Included", "Included", "Included"],
  ["Wheels + windows", "Included", "Included", "Included"],
  ["Interior", "Refresh", "Deep clean", "Intensive clean"],
  ["Carpet + upholstery extraction", "—", "As needed", "Included"],
  ["Trim, leather + surfaces", "Cleaned", "Conditioned", "Conditioned"],
  ["Paint protection", "—", "Spray sealant", "Spray sealant"],
  ["Paint decontamination + clay", "—", "—", "Included"],
  ["Seams, vents + tight areas", "Standard", "Detailed", "Extensive"],
];

export default function ServicesPage() {
  const schemas = serviceList.map((s) => {
    const prices = vehicles.map((v) => PRICING[v.id][s.id].price);
    return serviceSchema({ name: s.name, description: s.summary, path: `/our-services#${s.slug}`, lowPrice: Math.min(...prices), highPrice: Math.max(...prices) });
  });

  return (
    <>
      <main className="services-v160">
        <section className="svc-hero">
          <div className="svc-shell">
            <p className="svc-eyebrow">MOBILE DETAILING / DECATUR, GA</p>
            <div className="svc-hero-grid">
              <h1>Pick the clean<br/><span>your car needs.</span></h1>
              <div className="svc-hero-copy">
                <p>Three levels of mobile detailing, from routine upkeep to a complete reset. We come to your driveway with our own power, water and equipment.</p>
                <div className="svc-scale"><span>MAINTAIN</span><b>→</b><span>DEEP CLEAN</span><b>→</b><span>RESET</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="svc-ladder" id="choose">
          <div className="svc-shell">
            <div className="svc-section-head"><p className="svc-eyebrow">01 / CHOOSE YOUR LEVEL</p><h2>What does your car <span>actually need?</span></h2><p>More expensive does not automatically mean better. Start with the condition of the car and how long it has been since its last thorough detail.</p></div>
            <div className="svc-levels">
              <article className="svc-level maintenance" id="maintenance-detail">
                <div className="svc-level-no">01</div><div className="svc-level-main"><p className="svc-tag">ROUTINE UPKEEP</p><h3>Already pretty clean?<br/><span>Keep it that way.</span></h3><p>Maintenance is a thorough inside-and-out refresh for vehicles that are already in good shape. It is designed to preserve a clean baseline, not rescue a neglected interior.</p></div>
                <div className="svc-level-side"><p><b>Best for</b> Cars detailed regularly or kept clean between deeper services.</p><ul><li>Exterior hand wash + dry</li><li>Interior vacuum + wipe-down</li><li>Windows + wheels cleaned</li></ul><p className="svc-cadence">WORKS BEST EVERY 3–4 WEEKS</p><strong className="svc-from">From {usd(startingPrice("maintenance"))}</strong></div>
              </article>
              <article className="svc-level premium" id="premium-detail">
                <div className="svc-level-no">02</div><div className="svc-level-main"><p className="svc-tag">MOST BOOKED / FIRST VISITS</p><h3>Needs a proper detail?<br/><span>Start here.</span></h3><p>Premium is the full inside-and-out detail most vehicles need. It adds a true interior deep clean and paint protection without stepping up to the restoration-level work of Factory Reset.</p></div>
                <div className="svc-level-side"><p><b>Best for</b> Most first-time clients and cars that have not been professionally detailed in a while.</p><ul><li>Everything in Maintenance</li><li>Full interior deep clean</li><li>Spray sealant paint protection</li><li>Trim, leather + surface conditioning</li></ul><p className="svc-cadence">WORKS BEST EVERY 6–8 WEEKS</p><strong className="svc-from">From {usd(startingPrice("premium"))}</strong></div>
              </article>
              <article className="svc-level reset" id="factory-reset">
                <div className="svc-level-no">03</div><div className="svc-level-main"><p className="svc-tag">DEEPEST CLEAN</p><h3>Needs serious attention?<br/><span>Reset it.</span></h3><p>Factory Reset is for buildup a normal detail is not designed to solve. We add extraction, paint decontamination and significantly more time in seams, vents and tight areas.</p></div>
                <div className="svc-level-side"><p><b>Best for</b> Heavily used or neglected vehicles with kids, pets, spills, stains, odor or years of buildup.</p><ul><li>Everything in Premium</li><li>Carpet + upholstery extraction</li><li>Paint decontamination + clay</li><li>Extensive crevice work</li></ul><p className="svc-cadence">USUALLY ONCE OR TWICE A YEAR</p><strong className="svc-from">From {usd(startingPrice("factoryReset"))}</strong></div>
              </article>
            </div>
          </div>
        </section>

        <section className="svc-pricing">
          <div className="svc-shell">
            <div className="svc-section-head compact"><p className="svc-eyebrow">02 / YOUR EXACT PRICE</p><h2>What do you <span>drive?</span></h2><p>Choose your vehicle once. We will show all three service prices side by side so you can compare the actual options for your car.</p></div>
            <ServicesDecisionTool />
          </div>
        </section>

        <section className="svc-compare">
          <div className="svc-shell">
            <div className="svc-section-head"><p className="svc-eyebrow">03 / WHAT CHANGES</p><h2>Same car. <span>Different depth.</span></h2><p>The difference is not just “more cleaning.” Each level changes how deeply we work and what problems the service is intended to handle.</p></div>
            <div className="svc-compare-wrap">
              <div className="svc-compare-grid svc-compare-head"><div>WHAT WE DO</div><div>MAINTENANCE</div><div>PREMIUM</div><div>FACTORY RESET</div></div>
              {compareRows.map((r) => <div className="svc-compare-grid" key={r[0]}>{r.map((c,i) => <div key={i} className={i===0 ? "row-label" : c==="Included" ? "included" : ""}>{c}</div>)}</div>)}
            </div>
            <div className="svc-guidance"><div><p className="svc-eyebrow">THE SIMPLE ANSWER</p><h3>If you are unsure, Premium is where most cars should start.</h3></div><p>Maintenance assumes the car already has a clean baseline. Factory Reset is for vehicles with heavier buildup or specific deep-cleaning needs. Premium sits between them and is our most common first service.</p><TrackedLink href={bookingHref(undefined,"premium")} event="book_click" params={{location:"services_guidance",service:"premium"}} className="svc-tactile-btn">Book Premium <span>↗</span></TrackedLink></div>
          </div>
        </section>

        <section className="svc-single"><div className="svc-shell svc-single-inner"><div><p className="svc-eyebrow">ONLY NEED HALF?</p><h2>Interior-only or exterior-only.</h2></div><p>Our core details cover the whole vehicle. Detail+ members can choose interior-only or exterior-only plans. For a one-time standalone job, send us what you need and we will quote it.</p><Link href="/get-a-quote" className="svc-outline-btn">Get a quote <span>↗</span></Link></div></section>

        <section className="svc-paint" id="paint"><div className="svc-shell"><div className="svc-paint-grid"><div><p className="svc-eyebrow">04 / BEYOND CLEANING</p><h2>Detailing cleans it.<br/><span>Paint care changes it.</span></h2><p>Paint correction and ceramic coating solve a different problem than detailing. Correction machine-polishes defects from the finish. Ceramic coating adds durable protection to the corrected or already-healthy paint.</p><Link href="/ceramic" className="svc-light-btn">Explore paint care <span>↗</span></Link></div><div className="svc-paint-list">{paintServices.map((p,i)=><div key={p.id}><b>0{i+1}</b><div><h3>{p.name}</h3><p>{p.bestFor}</p></div><strong>from {usd(p.startingAt)}</strong></div>)}</div></div></div></section>

        <section className="svc-plus" id="detail-plus"><div className="svc-shell"><div className="svc-plus-grid"><div><p className="svc-eyebrow">05 / RECURRING CARE</p><h2>Get it clean once.<br/><span>Keep it clean.</span></h2><p>Detail+ is for people who would rather maintain the car than wait for it to get bad again. Choose a schedule from every two weeks to quarterly, choose interior, exterior or both, and pay the same flat rate each visit. No contracts.</p><Link href="/detailplus" className="svc-light-btn">How Detail+ works <span>↗</span></Link></div><div className="svc-plus-steps"><div><b>01</b><h3>Pick a schedule</h3><p>Choose the frequency that fits how you use the car.</p></div><div><b>02</b><h3>We come back</h3><p>Your recurring service happens at your driveway.</p></div><div><b>03</b><h3>Stay clean</h3><p>Routine care prevents the big reset cycle.</p></div></div></div></div></section>

        <section className="svc-process"><div className="svc-shell"><div className="svc-section-head compact"><p className="svc-eyebrow">06 / MOBILE MEANS MOBILE</p><h2>Your driveway.<br/><span>Our setup.</span></h2><p>You do not need to drive to a shop or provide a hose and outlet. We arrive prepared to do the job where the car is parked.</p></div><ol><li><b>01</b><h3>Book your service.</h3><p>Choose the vehicle, level of detail and a time that works.</p></li><li><b>02</b><h3>We come to you.</h3><p>Our team arrives with its own power, water, products and equipment.</p></li><li><b>03</b><h3>Get your car back.</h3><p>We complete the service in your driveway and walk through the finished vehicle.</p></li></ol><div className="svc-mobile-proof"><strong>POWER</strong><span>+</span><strong>WATER</strong><span>+</span><strong>EQUIPMENT</strong><em>ALL INCLUDED</em></div></div></section>

        <section className="svc-faq"><div className="svc-shell svc-faq-grid"><div><p className="svc-eyebrow">07 / BEFORE YOU BOOK</p><h2>Service questions.</h2><p>Still deciding? These are the things people most often want to know before we arrive.</p></div><FaqList faqs={homeFaqs.slice(0,8)} /></div></section>
      </main>
      <CtaBand location="services_final" />
      <JsonLd data={schemas} />
    </>
  );
}
