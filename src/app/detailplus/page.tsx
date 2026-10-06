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
    <main className="plus-v2">
      <section className="plus-v2-hero"><div className="plus-v2-shell plus-v2-hero-grid">
        <div className="plus-v2-hero-copy"><p className="plus-v2-kicker">DETAIL+ / RECURRING CARE</p><h1>Get it clean.<br/><span>Keep it clean.</span></h1><p>Detail+ puts your car on a recurring detailing schedule. Pick how often we come and what gets cleaned. Your rate stays flat, your visits stay on the calendar, and the mess never gets a chance to become a reset.</p><div className="plus-v2-actions"><a href="#build" className="btn btn-primary">Build your plan ↗</a><a href="#how" className="plus-v2-inline">See how it works</a></div></div>
        <figure className="plus-v2-photo"><Photo id="work-davis-0909" priority ratio="4/5" sizes="(min-width: 900px) 40vw, 94vw"/><figcaption>RECURRING CARE / DONE BY OUR CREW</figcaption></figure>
      </div></section>

      <section className="plus-v2-strip"><div className="plus-v2-shell"><span>NO CONTRACT</span><span>FLAT RATE PER VISIT</span><span>RECURRING SCHEDULING</span><span>EXTRA MESSES COVERED</span></div></section>

      <section className="plus-v2-why"><div className="plus-v2-shell"><div className="plus-v2-head"><div><p className="plus-v2-kicker">WHY DETAIL+</p><h2>A clean car is easier<br/><span>to keep than recover.</span></h2></div><p>One-time details solve the buildup. Detail+ is what happens next. We return before the vehicle needs another major catch-up clean.</p></div><div className="plus-v2-benefits">{detailPlusBenefits.map((b,i)=><article key={b.title}><b>{String(i+1).padStart(2,"0")}</b><h3>{b.title}</h3><p>{b.body}</p></article>)}</div></div></section>

      <section id="how" className="plus-v2-how"><div className="plus-v2-shell"><p className="plus-v2-kicker">HOW IT WORKS</p><h2>Three decisions.<br/><span>Then it runs itself.</span></h2><ol>{detailPlusSteps.map((s,i)=><li key={s.title}><b>{String(i+1).padStart(2,"0")}</b><div><h3>{s.title}</h3><p>{s.body}</p></div></li>)}</ol><div className="plus-v2-frequency"><span>AVAILABLE CADENCES</span><p>{frequencies.map((f)=>f.label).join("  /  ")}</p></div></div></section>

      <section className="plus-v2-promise"><div className="plus-v2-shell"><p className="plus-v2-kicker">THE SIMPLE RULE</p><blockquote>“{detailPlusGuarantee}”</blockquote><p>Whatever coverage your plan includes gets handled on that visit. Spills, stains, crumbs and pet hair do not turn into surprise add-on charges.</p></div></section>

      <section id="build" className="plus-v2-build"><div className="plus-v2-shell plus-v2-build-grid"><div className="plus-v2-build-copy"><p className="plus-v2-kicker">BUILD YOUR PLAN</p><h2>Tell us what<br/><span>staying clean means.</span></h2><p>Choose the vehicle, frequency and whether you want the interior, exterior or both maintained. We will send the flat per-visit rate and get the first visit on the calendar.</p><div className="plus-v2-build-note"><b>NOT READY FOR RECURRING?</b><p>Start with a one-time detail. You can move into Detail+ after you know the work.</p><Link href="/book">Book one detail first ↗</Link></div></div><div className="plus-v2-form"><DetailPlusForm /></div></div></section>

      <section className="plus-v2-reviews"><div className="plus-v2-shell"><p className="plus-v2-kicker">WHY PEOPLE COME BACK</p><ReviewGrid /></div></section>
      <section className="plus-v2-faq"><div className="plus-v2-shell plus-v2-faq-grid"><div><p className="plus-v2-kicker">DETAIL+ QUESTIONS</p><h2>Before you<br/><span>put it on repeat.</span></h2></div><FaqList faqs={detailPlusFaqs}/></div></section>

      <section className="plus-v2-final"><div className="plus-v2-shell"><p className="plus-v2-kicker">READY WHEN YOU ARE</p><h2>Make clean<br/><span>the default.</span></h2><a href="#build" className="btn btn-on-dark">Build your Detail+ plan ↗</a></div></section>
      <JsonLd data={serviceSchema({name:"Detail+ recurring detailing membership",description:"Recurring mobile car detailing on a set schedule for one flat rate per visit.",path:"/detailplus"})}/>
    </main>
  );
}
