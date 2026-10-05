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

export const metadata=pageMetadata({title:"Paint Correction in Decatur & Atlanta, GA | Every Detail",description:"Professional mobile paint correction in Decatur and Atlanta. Enhancement polishing from $395 and full multi-stage correction from $695.",path:"/paint-correction"});
const quote="#paint-quote";

export default function PaintCorrectionPage(){
  const [enhancement,correction]=paintServices;
  return <>
    <section className="paint-simple-hero paint-simple-correction text-paper">
      <div className="container-ed paint-simple-hero-inner">
        <Breadcrumbs items={[{name:"Paint Correction",path:"/paint-correction"}]}/>
        <div className="paint-simple-hero-copy">
          <p className="eyebrow">Paint correction · Decatur + Atlanta</p>
          <h1>Fix the finish.<br/><span>Bring back the gloss.</span></h1>
          <p>Paint correction removes the swirls, haze and light scratches that a normal detail cannot. We inspect the paint, correct what makes sense, then protect the result.</p>
          <div className="paint-hero-actions"><TrackedLink href={quote} event="paint_inquiry" params={{location:"correction_hero"}} className="btn btn-primary">Get my correction quote ↗</TrackedLink><a href="#how-it-works" className="btn btn-outline-on-dark">How it works</a></div>
          <div className="paint-hero-proof"><span><strong><LiveReviewCount/></strong> five-star reviews</span><span>Mobile service</span><span>From {usd(enhancement.startingAt)}</span></div>
        </div>
      </div>
    </section>

    <section className="paint-problem-section"><div className="container-ed"><div className="paint-section-head"><p className="eyebrow">Does your car need it?</p><h2>Look for these in direct light.</h2></div><div className="paint-problem-grid">{paintDefects.map((d,i)=><article key={d.name}><span>0{i+1}</span><h3>{d.name}</h3><p>{d.detail}</p></article>)}</div></div></section>

    <section id="how-it-works" className="paint-sequence">
      <div className="container-ed">
        <div className="paint-sequence-intro"><p className="eyebrow">What happens</p><h2>Three steps.<br/>One clearer finish.</h2><p>Correction is easier to understand when you separate the problem from the process.</p></div>
        <div className="paint-steps">
          <article><span>01</span><div><p className="eyebrow">INSPECT</p><h3>See what the paint actually needs.</h3><p>We look at the finish in proper light and identify swirls, haze, oxidation and scratches. Then we recommend the least aggressive correction that gets the result you want.</p></div></article>
          <article><span>02</span><div><p className="eyebrow">CORRECT</p><h3>Remove defects from the clear coat.</h3><p>Machine polishing levels microscopic imperfections instead of filling or hiding them. An enhancement uses one polishing stage. Full correction uses multiple stages for more serious defects.</p></div></article>
          <article><span>03</span><div><p className="eyebrow">FINISH</p><h3>Get the clarity and gloss back.</h3><p>Once the defects are reduced, reflections look sharper and the paint reads deeper and cleaner. From there, you can protect it with ceramic or keep it simple.</p></div></article>
        </div>
      </div>
    </section>

    <section className="paint-single-proof"><div className="container-ed paint-single-proof-grid"><div className="paint-proof-image"><Image src="/images/red-audi-finished.jpg" alt="Red Audi with a clear glossy finish after paint correction" fill sizes="(max-width: 800px) 100vw, 48vw"/></div><div><p className="eyebrow">The result</p><h2>Correction changes the paint itself.</h2><p>A wash makes clean paint. Correction makes damaged-looking paint look clear again. That distinction is why this service starts with an inspection, not a one-size-fits-all package.</p></div></div></section>

    <section id="correction-options" className="paint-options-simple"><div className="container-ed"><div className="paint-section-head"><p className="eyebrow">Choose the level</p><h2>Start with the condition of your paint.</h2><p>Most cars fall into one of these two correction levels. We confirm the right one before work begins.</p></div><div className="paint-option-list">{[enhancement,correction].map((p,i)=><article key={p.id}><div className="paint-option-main"><span className="paint-option-num">0{i+1}</span><div><p className="eyebrow">{i===0?"LIGHT DEFECTS":"VISIBLE / HEAVIER DEFECTS"}</p><h3>{p.name}</h3><p>{p.summary}</p></div></div><div className="paint-option-detail"><p className="paint-option-price">from <strong>{usd(p.startingAt)}</strong></p><p><b>Best for:</b> {p.bestFor}</p><ul>{p.includes.map(x=><li key={x}>{x}</li>)}</ul><TrackedLink href={quote} event="paint_inquiry" params={{location:`correction_${p.id}`}} className="btn btn-secondary">Get a quote</TrackedLink></div></article>)}</div></div></section>

    <section className="paint-next-step"><div className="container-ed paint-next-step-grid"><div><p className="eyebrow">Optional next step</p><h2>Want to keep the corrected finish protected?</h2><p>Ceramic coating goes on after the paint is properly prepared. If long-term protection is already your goal, our coating package includes the necessary correction.</p></div><Link href="/ceramic" className="btn btn-on-dark">See ceramic coating ↗</Link></div></section>

    <section id="paint-quote" className="paint-lead-section"><div className="container-ed"><PaintLeadForm kind="paint-correction"/></div></section>

    <section className="container-ed py-16 md:py-24"><div className="grid gap-10 lg:grid-cols-12"><h2 className="t-h2 lg:col-span-4">Paint correction questions</h2><div className="lg:col-span-8"><FaqList faqs={paintFaqs}/></div></div></section>
    <section className="bg-oxblood text-paper"><div className="container-ed paint-final-cta"><div><p className="eyebrow">Not sure which level?</p><h2>Show us the paint.</h2><p>Tell us what you drive and what you are seeing. We will recommend the right correction instead of automatically selling the biggest package.</p></div><TrackedLink href={quote} event="paint_inquiry" params={{location:"correction_final"}} className="btn btn-on-dark">Get my paint quote</TrackedLink></div></section>
    <JsonLd data={[enhancement,correction].map(p=>serviceSchema({name:p.name,description:p.summary,path:"/paint-correction",lowPrice:p.startingAt}))}/>
  </>;
}
