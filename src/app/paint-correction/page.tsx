import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LiveReviewCount } from "@/components/GoogleReviewStats";
import { TrackedLink } from "@/components/TrackedLink";
import { FaqList } from "@/components/FaqList";
import { JsonLd } from "@/components/JsonLd";
import { PaintLeadForm } from "@/components/PaintLeadForm";
import { paintFaqs } from "@/data/faqs";
import { paintDefects, paintServices } from "@/data/paint";
import { usd } from "@/lib/format";
import { pageMetadata, serviceSchema } from "@/lib/seo";

export const metadata = pageMetadata({ title:"Paint Correction in Decatur & Atlanta, GA | Every Detail", description:"Professional mobile paint correction in Decatur and Atlanta. Enhancement polishing from $395 and full multi-stage correction from $695.", path:"/paint-correction" });
const quote = "#paint-quote";

export default function PaintCorrectionPage() {
  const [enhancement, correction] = paintServices;
  return <div className="paint-v38 info80-page">
    <section className="pv38-hero pv38-hero-correction info80-hero">
      <div className="container-ed pv38-hero-inner">
        <Breadcrumbs items={[{name:"Paint Correction",path:"/paint-correction"}]}/>
        <div className="pv38-hero-copy">
          <p className="pv38-kicker">PAINT CORRECTION / DECATUR + ATLANTA</p>
          <h1>MAKE THE PAINT<br/><em>LOOK RIGHT AGAIN.</em></h1>
          <p className="pv38-lede">We reduce swirls, haze, and light clear-coat defects to bring back clarity and depth.</p>
          <div className="pv38-actions"><TrackedLink href={quote} event="paint_inquiry" params={{location:"correction_hero"}} className="btn btn-primary">Get my paint assessment ↗</TrackedLink></div>
          <div className="info80-facts"><span><b><LiveReviewCount/></b> five-star reviews</span><span>Mobile service</span><span>Correction from {usd(enhancement.startingAt)}</span></div>
        </div>
      </div>
    </section>

    <section id="understand" className="pv38-section pv38-paper info80-section">
      <div className="container-ed info80-heading-row"><div><p className="pv38-kicker dark">WHAT WE CORRECT</p><h2>DEFECTS THAT INTERRUPT THE REFLECTION.</h2></div><p>The amount of correction depends on what is actually in the clear coat.</p></div>
      <div className="container-ed pv38-defects info80-defects">{paintDefects.slice(0,4).map((d,i)=><article key={d.name}><span>0{i+1}</span><div><h3>{d.name}</h3><p>{d.detail}</p></div></article>)}</div>
    </section>

    <section className="pv38-proof-section info80-section">
      <div className="container-ed pv38-proof-layout"><div className="pv38-photo"><Image src="/images/red-audi-finished.jpg" alt="Red Audi with a clear glossy finish after paint correction" fill sizes="(max-width: 800px) 100vw, 46vw"/></div><div className="pv38-proof-copy"><p className="pv38-kicker">THE RESULT</p><h2>CLEARER PAINT, NOT A TEMPORARY COVER-UP.</h2><p>Correction changes the surface underneath the gloss. Wax can add shine, but it does not remove the defects causing haze and swirls.</p></div></div>
    </section>

    <section className="pv38-section pv38-paper info80-section" id="correction-options">
      <div className="container-ed info80-heading-row"><div><p className="pv38-kicker dark">THE TWO LEVELS</p><h2>WE'LL CONFIRM WHICH ONE FITS.</h2></div><p>You do not need to diagnose the paint yourself.</p></div>
      <div className="container-ed pv38-options info80-options">{[enhancement, correction].map((p,i)=><article key={p.id} className={i===1?"is-featured":""}><div className="pv38-option-top"><span>0{i+1}</span><p>{i===0?"LIGHT SWIRLS + HAZE":"VISIBLE / HEAVIER DEFECTS"}</p></div><h3>{p.name}</h3><p className="pv38-option-summary">{p.summary}</p><div className="pv38-price"><small>starting at</small><strong>{usd(p.startingAt)}</strong></div><p className="pv38-best"><b>Best for:</b> {p.bestFor}</p><TrackedLink href={quote} event="paint_inquiry" params={{location:`correction_${p.id}`}} className={i===1?"btn btn-primary":"btn btn-secondary"}>Ask about this level</TrackedLink></article>)}</div>
      <div className="container-ed pv38-bridge"><div><p className="pv38-kicker dark">AFTER CORRECTION</p><h3>Want to protect the finish?</h3></div><Link href="/ceramic" className="pv38-arrow-link">See 2-Year Ceramic →</Link></div>
    </section>

    <section id="paint-quote" className="pv38-form info80-section"><div className="container-ed"><div className="info80-heading-row"><div><p className="pv38-kicker dark">YOUR PAINT</p><h2>GET A PAINT ASSESSMENT.</h2></div><p>Tell us what you drive and what you are seeing.</p></div><PaintLeadForm kind="paint-correction"/></div></section>
    <section className="pv38-faq info80-section"><div className="container-ed pv38-faq-grid"><div><p className="pv38-kicker dark">QUICK ANSWERS</p><h2>BEFORE CORRECTION.</h2></div><FaqList faqs={paintFaqs.slice(0,5)}/></div></section>
    <JsonLd data={[enhancement,correction].map(p=>serviceSchema({name:p.name,description:p.summary,path:"/paint-correction",lowPrice:p.startingAt}))}/>
  </div>;
}
