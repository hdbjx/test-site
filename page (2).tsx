import Link from "next/link";
import { FaqList } from "@/components/FaqList";
import { JsonLd } from "@/components/JsonLd";
import { Photo } from "@/components/Photo";
import { ReviewGrid } from "@/components/ReviewGrid";
import { DetailPlusForm } from "@/components/forms/DetailPlusForm";
import { detailPlusBenefits, detailPlusGuarantee, detailPlusSteps, frequencies } from "@/data/detailplus";
import { detailPlusFaqs } from "@/data/faqs";
import { pageMetadata, serviceSchema } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Detail+ Recurring Car Detailing Membership | Every Detail",
  description: "Recurring mobile detailing in Decatur and Atlanta. Choose every 2 weeks to quarterly, interior, exterior or both, for one flat rate per visit. No contracts.",
  path: "/detailplus",
});

export default function DetailPlusPage() {
  return (
    <main className="plus-brand">
      <section className="plus-brand-hero">
        <div className="plus-brand-shell">
          <div className="plus-brand-hero-grid">
            <div className="plus-brand-hero-copy">
              <p className="plus-brand-kicker">DETAIL+ / RECURRING CARE</p>
              <h1>Your car stays clean.<br/><span>Automatically.</span></h1>
              <p className="plus-brand-lede">Book once. We come back on your schedule, with the same mobile service and the same standard every time.</p>
              <div className="plus-brand-actions"><a href="#build" className="plus-brand-btn plus-brand-btn-light">Build my plan ↗</a><a href="#how" className="plus-brand-text-link">How it works ↓</a></div>
            </div>
            <figure className="plus-brand-photo">
              <Photo id="work-davis-0909" priority sizes="(min-width: 900px) 34vw, 94vw"/>
              <div className="plus-brand-stamp plus-brand-hero-stamp">DETAIL+<br/>REPEAT CARE</div>
              <figcaption>YOUR DRIVEWAY / OUR STANDARD / ON REPEAT</figcaption>
            </figure>
          </div>
          <div className="plus-brand-rule" aria-label="How Detail Plus works"><span>01 / BOOK ONCE</span><span>02 / WE COME BACK</span><span>03 / STAY CLEAN</span></div>
        </div>
      </section>

      <section className="plus-brand-ticker"><div><span>NO CONTRACT</span><span>FLAT RATE PER VISIT</span><span>RECURRING SCHEDULING</span><span>EXTRA MESSES COVERED</span></div></section>

      <section className="plus-brand-why">
        <div className="plus-brand-shell">
          <div className="plus-brand-section-head"><p className="plus-brand-kicker">02 / WHY RECURRING CARE</p><h2>Clean is easier to keep<br/><span>than recover.</span></h2><p>Detail+ starts after the reset. Instead of letting weeks of dirt, spills, crumbs and pet hair stack up again, we return before the car gets far behind.</p></div>
          <div className="plus-brand-benefits">{detailPlusBenefits.map((b,i)=><article key={b.title}><span>{String(i+1).padStart(2,"0")}</span><div><h3>{b.title}</h3><p>{b.body}</p></div></article>)}</div>
        </div>
      </section>

      <section id="how" className="plus-brand-how">
        <div className="plus-brand-shell">
          <div className="plus-brand-how-intro"><div className="plus-brand-stamp plus-brand-stamp-coral">SET IT<br/>ON REPEAT</div><div><p className="plus-brand-kicker">03 / HOW IT WORKS</p><h2>Three decisions.<br/><span>Then it runs itself.</span></h2></div></div>
          <ol>{detailPlusSteps.map((s,i)=><li key={s.title}><b>{String(i+1).padStart(2,"0")}</b><div><small>STEP {String(i+1).padStart(2,"0")}</small><h3>{s.title}</h3><p>{s.body}</p></div></li>)}</ol>
          <div className="plus-brand-cadence"><span>AVAILABLE CADENCES</span><p>{frequencies.map((f)=>f.label).join("  /  ")}</p></div>
        </div>
      </section>

      <section className="plus-brand-rule-section"><div className="plus-brand-shell"><p className="plus-brand-kicker">04 / THE SIMPLE RULE</p><blockquote>“{detailPlusGuarantee}”</blockquote><p>Whatever coverage your plan includes gets handled on that visit. Spills, stains, crumbs and pet hair do not turn into surprise add-on charges.</p></div></section>

      <section id="build" className="plus-brand-build">
        <div className="plus-brand-shell plus-brand-build-grid">
          <div className="plus-brand-build-copy"><p className="plus-brand-kicker">05 / BUILD YOUR PLAN</p><h2>Make clean<br/><span>the default.</span></h2><p>Choose your vehicle, frequency and coverage. We’ll put together the flat per-visit rate and reach out to get the first visit on the calendar.</p><div className="plus-brand-mini"><b>NOT READY FOR RECURRING?</b><p>Start with one detail. Move into Detail+ once you know the work.</p><Link href="/book">Book one detail first ↗</Link></div></div>
          <div className="plus-brand-form-wrap"><div className="plus-brand-form-label"><span>YOUR DETAIL+ PLAN</span><b>BUILD IT ↓</b></div><DetailPlusForm /></div>
        </div>
      </section>

      <section className="plus-brand-reviews"><div className="plus-brand-shell"><div className="plus-brand-section-head compact"><p className="plus-brand-kicker">06 / WHY PEOPLE COME BACK</p><h2>The standard stays.<br/><span>So do they.</span></h2></div><ReviewGrid /></div></section>

      <section className="plus-brand-faq"><div className="plus-brand-shell plus-brand-faq-grid"><div><p className="plus-brand-kicker">07 / BEFORE YOU PUT IT ON REPEAT</p><h2>Good questions.<br/><span>Clear answers.</span></h2></div><FaqList faqs={detailPlusFaqs}/></div></section>

      <section className="plus-brand-final"><div className="plus-brand-shell"><div className="plus-brand-stamp plus-brand-stamp-coral">REPEAT<br/>CARE</div><p className="plus-brand-kicker">DETAIL+ / READY WHEN YOU ARE</p><h2>Your car stays clean.<br/><span>That’s the point.</span></h2><a href="#build" className="plus-brand-btn plus-brand-btn-light">Build my Detail+ plan ↗</a></div></section>
      <JsonLd data={serviceSchema({name:"Detail+ recurring detailing membership",description:"Recurring mobile car detailing on a set schedule for one flat rate per visit.",path:"/detailplus"})}/>
    </main>
  );
}
