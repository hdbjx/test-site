import Link from "next/link";
import { FaqList } from "@/components/FaqList";
import { JsonLd } from "@/components/JsonLd";
import { Photo } from "@/components/Photo";
import { ReviewGrid } from "@/components/ReviewGrid";
import { DetailPlusForm } from "@/components/forms/DetailPlusForm";
import { detailPlusBenefits, detailPlusGuarantee, frequencies } from "@/data/detailplus";
import { detailPlusFaqs } from "@/data/faqs";
import { pageMetadata, serviceSchema } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Detail+ Recurring Car Detailing Membership | Every Detail",
  description: "Recurring mobile detailing in Decatur and Atlanta. Choose every 2 weeks to quarterly, interior, exterior or both, for one flat rate per visit. No contracts.",
  path: "/detailplus",
});

const loopSteps = [
  {
    n: "01",
    eyebrow: "START CLEAN",
    title: "Reset the baseline.",
    body: "Detail+ works best once the car is where you want it. Start with a full detail if needed, then recurring care keeps it from sliding backward.",
    image: "finished-white-car",
    note: "ONE GOOD RESET",
  },
  {
    n: "02",
    eyebrow: "PICK THE RHYTHM",
    title: "Your schedule, already handled.",
    body: "Every two weeks, monthly, every six weeks, every two months or quarterly. Pick the cadence that matches how you actually use the car.",
    image: "classic-car-cockpit",
    note: "2 WEEKS → QUARTERLY",
  },
  {
    n: "03",
    eyebrow: "WE COME BACK",
    title: "No rebooking ritual.",
    body: "Your visits recur automatically and we remind you before each one. The mobile setup comes back to you, so staying clean does not become another errand.",
    image: "branded-rig-driveway",
    note: "YOUR DRIVEWAY / OUR RIG",
  },
  {
    n: "04",
    eyebrow: "STAY AHEAD",
    title: "The mess never gets a head start.",
    body: "Crumbs, spills, muddy weeks and pet hair get handled as part of the coverage you chose. The point is not another rescue detail. It is avoiding one.",
    image: "rear-seat-detail",
    note: "IF IT'S IN THE PLAN, IT'S COVERED",
  },
] as const;

export default function DetailPlusPage() {
  return (
    <main className="plus-brand plus-v177">
      <section className="plus-brand-hero plus-v177-hero">
        <div className="plus-v177-ghost" aria-hidden="true">DETAIL+</div>
        <div className="plus-brand-shell">
          <div className="plus-brand-hero-grid">
            <div className="plus-brand-hero-copy">
              <p className="plus-brand-kicker">DETAIL+ / RECURRING CARE</p>
              <h1>Clean once.<br/><span>Stay clean.</span></h1>
              <p className="plus-brand-lede">Detail+ turns car care into a system. Choose the schedule once, then we keep coming back before the mess gets ahead of you.</p>
              <div className="plus-brand-actions">
                <a href="#build" className="plus-brand-btn plus-brand-btn-light">Build my plan ↗</a>
                <a href="#loop" className="plus-brand-text-link">See the loop ↓</a>
              </div>
              <div className="plus-v177-hero-proof" aria-label="Detail Plus plan highlights">
                <span><b>01</b> NO CONTRACT</span>
                <span><b>02</b> FLAT RATE / VISIT</span>
                <span><b>03</b> WE COME TO YOU</span>
              </div>
            </div>
            <figure className="plus-brand-photo plus-v177-hero-photo">
              <Photo id="tesla-foam-wash" priority sizes="(min-width: 900px) 42vw, 94vw"/>
              <div className="plus-v177-photo-wash" aria-hidden="true" />
              <div className="plus-brand-stamp plus-brand-hero-stamp">DETAIL+<br/>ON REPEAT</div>
              <figcaption>YOUR DRIVEWAY / OUR STANDARD / ON REPEAT</figcaption>
            </figure>
          </div>
        </div>
        <div className="plus-v177-cadence-rail" aria-label="Available Detail Plus frequencies">
          <span>YOUR CADENCE</span>
          {frequencies.map((f, i) => <b key={f.id}>{f.label}{i < frequencies.length - 1 ? <i>•</i> : null}</b>)}
        </div>
      </section>

      <section className="plus-v177-manifesto">
        <div className="plus-brand-shell">
          <p className="plus-brand-kicker">THE IDEA IS SIMPLE</p>
          <h2>A clean car should be a <span>default state,</span><br/>not a once-in-a-while event.</h2>
          <div className="plus-v177-manifesto-grid">
            <p>Most cars do not get destroyed overnight. They slowly fall behind. Detail+ changes the timing. We return while the car is still manageable, which means less buildup, fewer rescue cleans, and a car that feels consistently taken care of.</p>
            <div className="plus-v177-loopmark" aria-hidden="true"><span>DETAIL+</span><b>↻</b><small>CLEAN / RETURN / REPEAT</small></div>
          </div>
        </div>
      </section>

      <section id="loop" className="plus-v177-loop">
        <div className="plus-brand-shell plus-v177-loop-grid">
          <aside className="plus-v177-loop-sticky">
            <p className="plus-brand-kicker">HOW DETAIL+ WORKS</p>
            <h2>One loop.<br/><span>That keeps working.</span></h2>
            <div className="plus-v177-orbit" aria-hidden="true">
              <div className="plus-v177-orbit-ring"><b>+</b></div>
              <span className="p1">RESET</span><span className="p2">SCHEDULE</span><span className="p3">RETURN</span><span className="p4">REPEAT</span>
            </div>
            <p className="plus-v177-loop-sub">Scroll through one Detail+ cycle. Nothing is locked in place. The page keeps moving, just like the plan.</p>
          </aside>
          <div className="plus-v177-loop-steps">
            {loopSteps.map((s) => (
              <article className="plus-v177-loop-step" key={s.n}>
                <figure>
                  <Photo id={s.image} sizes="(min-width: 900px) 46vw, 94vw" />
                  <figcaption>{s.note}</figcaption>
                </figure>
                <div className="plus-v177-step-copy">
                  <div className="plus-v177-step-top"><b>{s.n}</b><span>{s.eyebrow}</span></div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="plus-v177-covered">
        <div className="plus-brand-shell">
          <div className="plus-v177-covered-head">
            <div><p className="plus-brand-kicker">THE DETAIL+ RULE</p><h2>Life happens.<br/><span>Your price doesn’t.</span></h2></div>
            <blockquote>“{detailPlusGuarantee}”</blockquote>
          </div>
          <div className="plus-v177-benefit-grid">
            {detailPlusBenefits.map((b, i) => <article key={b.title}><span>{String(i + 1).padStart(2, "0")}</span><h3>{b.title}</h3><p>{b.body}</p></article>)}
          </div>
        </div>
      </section>

      <section id="build" className="plus-brand-build plus-v177-build">
        <div className="plus-brand-shell plus-brand-build-grid">
          <div className="plus-brand-build-copy">
            <p className="plus-brand-kicker">BUILD YOUR PLAN</p>
            <h2>Set the rhythm.<br/><span>We’ll handle the rest.</span></h2>
            <p>Choose your vehicle, frequency and coverage. We’ll put together the flat per-visit rate and reach out to get the first visit on the calendar.</p>
            <div className="plus-v177-build-notes">
              <span>NO CONTRACT</span><span>PAUSE OR CHANGE ANYTIME</span><span>REMINDER BEFORE EACH VISIT</span>
            </div>
            <div className="plus-brand-mini"><b>NOT READY FOR RECURRING?</b><p>Start with one detail. Move into Detail+ once you know the work.</p><Link href="/book">Book one detail first ↗</Link></div>
          </div>
          <div className="plus-brand-form-wrap"><div className="plus-brand-form-label"><span>YOUR DETAIL+ PLAN</span><b>BUILD IT ↓</b></div><DetailPlusForm /></div>
        </div>
      </section>

      <section className="plus-brand-reviews plus-v177-reviews"><div className="plus-brand-shell"><div className="plus-brand-section-head compact"><p className="plus-brand-kicker">WHY PEOPLE COME BACK</p><h2>The standard stays.<br/><span>So do they.</span></h2></div><ReviewGrid /></div></section>

      <section className="plus-brand-faq"><div className="plus-brand-shell plus-brand-faq-grid"><div><p className="plus-brand-kicker">BEFORE YOU PUT IT ON REPEAT</p><h2>Good questions.<br/><span>Clear answers.</span></h2></div><FaqList faqs={detailPlusFaqs}/></div></section>

      <section className="plus-brand-final plus-v177-final"><div className="plus-brand-shell"><div className="plus-v177-final-loop" aria-hidden="true">↻</div><p className="plus-brand-kicker">DETAIL+ / READY WHEN YOU ARE</p><h2>Stop re-deciding<br/><span>to clean the car.</span></h2><p>Set the plan once. We’ll keep showing up.</p><a href="#build" className="plus-brand-btn plus-brand-btn-light">Build my Detail+ plan ↗</a></div></section>
      <JsonLd data={serviceSchema({name:"Detail+ recurring detailing membership",description:"Recurring mobile car detailing on a set schedule for one flat rate per visit.",path:"/detailplus"})}/>
    </main>
  );
}
