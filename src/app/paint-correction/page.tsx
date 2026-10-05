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
  return <main className="paint-v38">
    <section className="pv38-hero pv38-hero-correction">
      <div className="container-ed pv38-hero-inner">
        <Breadcrumbs items={[{name:"Paint Correction",path:"/paint-correction"}]}/>
        <div className="pv38-hero-copy">
          <p className="pv38-kicker">Paint correction · Decatur + Atlanta</p>
          <h1>Make the paint<br/><em>look right again.</em></h1>
          <p className="pv38-lede">Swirls, haze and light scratches live in the clear coat. Paint correction removes or reduces those defects so the finish looks deep and clear again.</p>
          <div className="pv38-actions"><TrackedLink href={quote} event="paint_inquiry" params={{location:"correction_hero"}} className="btn btn-primary">Get my paint assessment ↗</TrackedLink><a href="#understand" className="pv38-text-link">See how correction works ↓</a></div>
          <div className="pv38-proof"><span><b><LiveReviewCount/></b> five-star reviews</span><span>Mobile service</span><span>Correction from {usd(enhancement.startingAt)}</span></div>
        </div>
      </div>
    </section>

    <section id="understand" className="pv38-section pv38-paper">
      <div className="container-ed pv38-split-head"><div><p className="pv38-kicker dark">Start here</p><h2>What are you actually seeing?</h2></div><p>Correction is not a generic shine treatment. The right service depends on what is interrupting the reflection in your paint.</p></div>
      <div className="container-ed pv38-defects">{paintDefects.map((d,i)=><article key={d.name}><span>0{i+1}</span><div><h3>{d.name}</h3><p>{d.detail}</p></div></article>)}</div>
    </section>

    <section className="pv38-section pv38-white">
      <div className="container-ed pv38-process">
        <div className="pv38-process-title"><p className="pv38-kicker dark">The process</p><h2>Inspect.<br/>Correct.<br/>Finish.</h2><p>Three steps, in that order. We do not choose the package first and force the paint into it.</p></div>
        <div className="pv38-process-list">
          <article><span>01</span><div><h3>Inspect the finish</h3><p>We evaluate the paint in direct light and determine how much correction makes sense for the condition and your goals.</p></div></article>
          <article><span>02</span><div><h3>Correct the defects</h3><p>Machine polishing carefully levels microscopic clear-coat imperfections. Light defects may need one stage. More visible damage can require multiple stages.</p></div></article>
          <article><span>03</span><div><h3>Refine the result</h3><p>The goal is not simply more shine. It is a cleaner reflection, better clarity and a finish that looks right in real light.</p></div></article>
        </div>
      </div>
    </section>

    <section className="pv38-proof-section">
      <div className="container-ed pv38-proof-layout"><div className="pv38-photo"><Image src="/images/red-audi-finished.jpg" alt="Red Audi with a clear glossy finish after paint correction" fill sizes="(max-width: 800px) 100vw, 46vw"/></div><div className="pv38-proof-copy"><p className="pv38-kicker">The result</p><h2>A cleaner reflection, not a temporary cover-up.</h2><p>Wax can add gloss. Correction changes the surface underneath that gloss. That is why the improvement remains after the first wash.</p></div></div>
    </section>

    <section className="pv38-section pv38-paper" id="correction-options">
      <div className="container-ed pv38-split-head"><div><p className="pv38-kicker dark">Choose the level</p><h2>Two correction levels.<br/>One simple decision.</h2></div><p>We confirm the right level after seeing the paint. You are not expected to diagnose it yourself.</p></div>
      <div className="container-ed pv38-options">
        {[enhancement, correction].map((p,i)=><article key={p.id} className={i===1?"is-featured":""}><div className="pv38-option-top"><span>0{i+1}</span><p>{i===0?"LIGHT SWIRLS + HAZE":"VISIBLE / HEAVIER DEFECTS"}</p></div><h3>{p.name}</h3><p className="pv38-option-summary">{p.summary}</p><div className="pv38-price"><small>starting at</small><strong>{usd(p.startingAt)}</strong></div><p className="pv38-best"><b>Best for:</b> {p.bestFor}</p><ul>{p.includes.map(x=><li key={x}>{x}</li>)}</ul><TrackedLink href={quote} event="paint_inquiry" params={{location:`correction_${p.id}`}} className={i===1?"btn btn-primary":"btn btn-secondary"}>Ask about this level</TrackedLink></article>)}
      </div>
      <div className="container-ed pv38-bridge"><div><p className="pv38-kicker dark">After correction</p><h3>Want to protect the finish for longer?</h3><p>Our ceramic coating service includes the paint preparation it needs before coating.</p></div><Link href="/ceramic" className="pv38-arrow-link">See Ceramic Coating →</Link></div>
    </section>

    <section id="paint-quote" className="pv38-form"><div className="container-ed"><PaintLeadForm kind="paint-correction"/></div></section>
    <section className="pv38-faq"><div className="container-ed pv38-faq-grid"><div><p className="pv38-kicker dark">Before you book</p><h2>Paint correction questions.</h2></div><FaqList faqs={paintFaqs}/></div></section>
    <JsonLd data={[enhancement,correction].map(p=>serviceSchema({name:p.name,description:p.summary,path:"/paint-correction",lowPrice:p.startingAt}))}/>
  </main>;
}
