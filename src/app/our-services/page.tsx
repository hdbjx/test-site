import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { FaqList } from "@/components/FaqList";
import { JsonLd } from "@/components/JsonLd";
import { ServicesDecisionTool } from "@/components/ServicesDecisionTool";
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

const detailAreas = [
  ["01", "Interior", "Vacuuming, seats, carpets and mats, dash, console, cupholders, doors, panels, glass, trunk or cargo area, and the small spaces that quick cleans skip."],
  ["02", "Exterior", "A careful hand wash, wheels and tires, exterior glass, door jambs, and the exterior surfaces that collect road film, brake dust, bugs and grime."],
  ["03", "The details", "The difference is time and attention. We work methodically around the whole vehicle instead of only cleaning the easiest, most visible surfaces."],
];

const serviceEducation = [
  {
    no: "01", id: "maintenance-detail", tone: "maintenance", kicker: "MAINTENANCE DETAIL / ROUTINE CARE",
    title: <>Keep a clean car <span>clean.</span></>,
    intro: "Maintenance is not a shortcut version of a deep detail. It is a service built for a different starting point: a vehicle that is already clean and cared for.",
    why: "Because we are not spending the visit reversing months of buildup, one technician can move efficiently through the entire vehicle and preserve the clean baseline you already have.",
    best: "Vehicles detailed regularly, cars kept in good condition, and returning clients who do not want the vehicle to slide backward between deeper services.",
    includes: ["Hand wash of the exterior", "Wheels and tires cleaned", "Interior vacuum and surface cleaning", "Windows, door jambs and cargo area", "Routine attention throughout the cabin"],
    notFor: "A vehicle with significant stains, embedded grime, heavy pet hair or long-term buildup. Those problems require more time than Maintenance is designed to provide.",
    time: "About 2–3 hours depending on vehicle size", price: "From $150",
  },
  {
    no: "02", id: "premium-detail", tone: "premium", kicker: "PREMIUM DETAIL / FULL DETAIL",
    title: <>The full <span>inside-and-out detail.</span></>,
    intro: "Premium is the service most people picture when they hear professional detailing. We thoroughly work through the interior and exterior instead of simply refreshing the surfaces you can see first.",
    why: "This is where the extra labor becomes visible. Two technicians can spend hours moving through the cabin, mats, seats, trim, glass, jambs, wheels and exterior so the vehicle feels consistently clean, not partially cleaned.",
    best: "Most first-time clients, daily-driven vehicles, and cars that need a real detail but do not have the heavy buildup that calls for a Factory Reset.",
    includes: ["Thorough interior vacuum and cleaning", "Seats, mats, dash, console, doors and cupholders", "Interior and exterior glass", "Hand wash, wheels and tires", "Door jambs and cargo area", "Exterior paint protection"],
    notFor: "Severe stains, major embedded buildup or vehicles that need restoration-level cleaning. Premium is comprehensive, but it is not unlimited labor.",
    time: "About 2.5–3.5 hours depending on vehicle size", price: "From $260",
  },
  {
    no: "03", id: "factory-reset", tone: "reset", kicker: "FACTORY RESET / DEEPEST CLEAN",
    title: <>When a normal detail <span>isn’t enough.</span></>,
    intro: "Factory Reset exists for vehicles where simply doing the Premium process would leave too much behind. The difference is not a fancier name. It is substantially more labor directed at buildup and problem areas.",
    why: "We add the time-intensive work needed for neglected interiors and exteriors: extraction where needed, deeper work in seams and tight areas, and exterior decontamination. That added labor is why the price steps up significantly.",
    best: "Heavily used or neglected vehicles, family cars with years of buildup, spills and stains, pet-heavy vehicles, and cars that need a genuine reset before they can be maintained normally.",
    includes: ["Everything covered by a full detail", "Carpet and upholstery extraction where needed", "More intensive stain and buildup work", "Extensive seams, vents and tight-area cleaning", "Paint decontamination and clay treatment", "More technician time devoted to the vehicle"],
    notFor: "A car that is already in decent condition. If the vehicle does not need the extra labor, we would rather put it in the service level that actually fits.",
    time: "About 4+ hours depending on condition and size", price: "From $400",
  },
];

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

        <section className="edu-anatomy">
          <div className="svc-shell">
            <div className="edu-section-intro">
              <p className="svc-eyebrow">WHAT YOU ARE ACTUALLY PAYING FOR</p>
              <h2>We work through the <span>whole car.</span></h2>
              <p>A professional detail costs more than a drive-through wash because it is a hands-on service measured in technician hours, not minutes on a conveyor.</p>
            </div>
            <div className="edu-area-grid">
              {detailAreas.map(([no,title,copy]) => <article key={no}><b>{no}</b><h3>{title}</h3><p>{copy}</p></article>)}
            </div>
            <div className="edu-value-statement">
              <p>You’re not paying for a wash.</p>
              <h3>You’re paying for the <span>time, equipment and attention</span> required to clean the vehicle properly.</h3>
            </div>
            <div className="edu-mobile-strip"><strong>WE BRING THE SHOP TO YOUR DRIVEWAY.</strong><span>POWER</span><i>+</i><span>WATER</span><i>+</i><span>EQUIPMENT</span><i>+</i><span>PRODUCTS</span></div>
          </div>
        </section>

        <section className="edu-level-intro">
          <div className="svc-shell edu-level-intro-grid">
            <div><p className="svc-eyebrow">WHY THREE SERVICE LEVELS?</p><h2>Not every car needs the <span>same amount of work.</span></h2></div>
            <div><p>A regularly detailed sedan and a family SUV that has gone years without a deep clean should not receive the same process or carry the same price.</p><p>Our three detailing levels are based on the vehicle’s starting condition and the amount of labor needed to get the right result.</p></div>
          </div>
        </section>

        <section className="edu-services">
          <div className="svc-shell">
            {serviceEducation.map((s) => (
              <article className={`edu-service ${s.tone}`} id={s.id} key={s.id}>
                <header><b className="edu-service-no">{s.no}</b><div><p className="svc-eyebrow">{s.kicker}</p><h2>{s.title}</h2></div></header>
                <div className="edu-service-body">
                  <div className="edu-service-explain"><p className="edu-service-intro">{s.intro}</p><p>{s.why}</p><div className="edu-best"><span>BEST FOR</span><p>{s.best}</p></div></div>
                  <div className="edu-service-includes"><p className="edu-mini-label">WHAT THE VISIT COVERS</p><ul>{s.includes.map(x=><li key={x}>{x}</li>)}</ul></div>
                  <div className="edu-service-limit"><p className="edu-mini-label">WHEN TO STEP UP OR DOWN</p><p>{s.notFor}</p><div className="edu-service-meta"><span>{s.time}</span><strong>{s.price}</strong></div></div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="edu-booking" id="pricing">
          <div className="svc-shell">
            <div className="edu-booking-head"><div><p className="svc-eyebrow">NOW THAT YOU KNOW THE DIFFERENCE</p><h2>Find the right price<br/><span>for your car.</span></h2></div><p>Choose your vehicle once to compare all three services. This is where the page shifts from learning to choosing.</p></div>
            <ServicesDecisionTool />
          </div>
        </section>

        <section className="svc-single"><div className="svc-shell svc-single-inner"><div><p className="svc-eyebrow">ONLY NEED ONE SIDE?</p><h2>Interior-only or exterior-only.</h2></div><p>Our core details cover the whole vehicle. Detail+ members can choose interior-only or exterior-only plans. For a one-time standalone job, send us what you need and we will quote it.</p><Link href="/get-a-quote" className="svc-outline-btn">Get a quote <span>↗</span></Link></div></section>

        <section className="svc-paint" id="paint"><div className="svc-shell"><div className="svc-paint-grid"><div><p className="svc-eyebrow">BEYOND DETAILING</p><h2>Cleaning and paint correction are <span>different jobs.</span></h2><p>Detailing removes dirt and contamination from the vehicle. Paint correction goes a step further by machine-polishing the clear coat to reduce visible swirls, haze and defects. Ceramic coating is protection applied after the paint is properly prepared.</p><Link href="/ceramic" className="svc-light-btn">Learn about paint care <span>↗</span></Link></div><div className="svc-paint-list">{paintServices.map((p,i)=><div key={p.id}><b>0{i+1}</b><div><h3>{p.name}</h3><p>{p.bestFor}</p></div><strong>from {usd(p.startingAt)}</strong></div>)}</div></div></div></section>

        <section className="svc-plus" id="detail-plus"><div className="svc-shell"><div className="svc-plus-grid"><div><p className="svc-eyebrow">AFTER THE FIRST DETAIL</p><h2>Getting clean is one job.<br/><span>Staying clean is another.</span></h2><p>Detail+ is recurring care for vehicles that already have a clean baseline. Instead of waiting for the car to build up again, we return on a schedule and maintain it.</p><Link href="/detailplus" className="svc-light-btn">Learn how Detail+ works <span>↗</span></Link></div><div className="svc-plus-steps"><div><b>01</b><h3>Establish the baseline</h3><p>Start with the vehicle at the right level of clean.</p></div><div><b>02</b><h3>Choose a schedule</h3><p>Pick a frequency that fits how the vehicle is used.</p></div><div><b>03</b><h3>Maintain it</h3><p>We return before the car needs another major reset.</p></div></div></div></div></section>

        <section className="svc-process"><div className="svc-shell"><div className="svc-section-head compact"><p className="svc-eyebrow">WHAT HAPPENS ON DETAIL DAY</p><h2>Your driveway.<br/><span>Our setup.</span></h2><p>You do not need to drive to a shop or provide a hose and outlet. We arrive prepared to do the job where the car is parked.</p></div><ol><li><b>01</b><h3>We arrive prepared.</h3><p>Our team brings the power, water, products and equipment needed for the service.</p></li><li><b>02</b><h3>We work through the car.</h3><p>The technicians follow the process for the service level you selected rather than rushing the most visible areas.</p></li><li><b>03</b><h3>We finish and check it.</h3><p>The vehicle is inspected, packed up and returned ready to drive.</p></li></ol></div></section>

        <section className="svc-faq"><div className="svc-shell svc-faq-grid"><div><p className="svc-eyebrow">STILL LEARNING?</p><h2>Service questions.</h2><p>Common questions about what we do, what you need to provide and how the service works.</p></div><FaqList faqs={homeFaqs.slice(0,8)} /></div></section>
      </main>
      <CtaBand location="services_final" />
      <JsonLd data={schemas} />
    </>
  );
}
