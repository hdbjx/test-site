import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LiveReviewCount } from "@/components/GoogleReviewStats";
import { TrackedLink } from "@/components/TrackedLink";
import { FaqList } from "@/components/FaqList";
import { JsonLd } from "@/components/JsonLd";
import { PaintLeadForm } from "@/components/PaintLeadForm";
import { paintFaqs } from "@/data/faqs";
import { ceramicDoes, ceramicDoesNot, paintServices } from "@/data/paint";
import { usd } from "@/lib/format";
import { pageMetadata, serviceSchema } from "@/lib/seo";

export const metadata=pageMetadata({title:"Ceramic Coating in Decatur & Atlanta, GA | Every Detail",description:"Professional 2-year ceramic coating with paint correction included, from $895. Mobile ceramic coating service in Decatur and Atlanta.",path:"/ceramic"});
const quote="#paint-quote";

export default function CeramicPage(){
  const ceramic=paintServices[2];
  return <>
    <section className="paint-simple-hero paint-simple-ceramic text-paper"><div className="container-ed paint-simple-hero-inner"><Breadcrumbs items={[{name:"Ceramic Coating",path:"/ceramic"}]}/><div className="paint-simple-hero-copy"><p className="eyebrow">2-year ceramic coating · Decatur + Atlanta</p><h1>Correct it once.<br/><span>Protect it for years.</span></h1><p>Our ceramic service starts by preparing and correcting the paint, then adds a professional coating that keeps the finish slick, glossy and easier to maintain.</p><div className="paint-hero-actions"><TrackedLink href={quote} event="paint_inquiry" params={{location:"ceramic_hero"}} className="btn btn-primary">Get my coating quote ↗</TrackedLink><a href="#coating-process" className="btn btn-outline-on-dark">How it works</a></div><div className="paint-hero-proof"><span><strong><LiveReviewCount/></strong> five-star reviews</span><span>2-year protection</span><span>Correction included</span></div></div></div></section>

    <section id="coating-process" className="paint-sequence ceramic-sequence"><div className="container-ed"><div className="paint-sequence-intro"><p className="eyebrow">The coating process</p><h2>The coating is<br/>the last step.</h2><p>The quality of a ceramic job depends on everything that happens before the bottle is opened.</p></div><div className="paint-steps"><article><span>01</span><div><p className="eyebrow">PREPARE</p><h3>Clean the surface completely.</h3><p>We wash and decontaminate the vehicle so bonded contamination is removed and the paint is ready to be evaluated and polished.</p></div></article><article><span>02</span><div><p className="eyebrow">CORRECT</p><h3>Fix the finish before locking it in.</h3><p>We correct the paint as needed before coating. Ceramic does not hide swirls or scratches, so this is where the final gloss is actually created.</p></div></article><article><span>03</span><div><p className="eyebrow">COAT</p><h3>Protect the finished surface.</h3><p>The coating bonds to the prepared clear coat, adding durable hydrophobic protection and making routine washing easier.</p></div></article></div></div></section>

    <section className="paint-single-proof ceramic-proof"><div className="container-ed paint-single-proof-grid"><div className="paint-proof-image"><Image src="/images/mercedes-paint.jpg" alt="Water beading on glossy black Mercedes paint" fill sizes="(max-width: 800px) 100vw, 48vw"/></div><div><p className="eyebrow">Why ceramic</p><h2>Less effort to keep a great finish looking great.</h2><p>Ceramic is not about making a car invincible. It is about adding a durable sacrificial layer that sheds water and contamination more easily while preserving the gloss underneath.</p></div></div></section>

    <section className="ceramic-explainer"><div className="container-ed"><div className="paint-section-head"><p className="eyebrow">Set the expectation</p><h2>What ceramic does. What it does not.</h2></div><div className="ceramic-simple-grid"><div><h3>It does</h3>{ceramicDoes.map(x=><p key={x}>{x}</p>)}</div><div><h3>It does not</h3>{ceramicDoesNot.map(x=><p key={x}>{x}</p>)}</div></div></div></section>

    <section id="coating-package" className="ceramic-package-simple"><div className="container-ed"><div className="paint-section-head"><p className="eyebrow">The package</p><h2>One coating service.<br/>Everything in the right order.</h2><p>No confusing coating menu. We built one complete package around the preparation the finish actually needs.</p></div><article className="ceramic-package-row"><div><p className="eyebrow">EVERY DETAIL PAINT CARE</p><h3>{ceramic.name}</h3><p>{ceramic.summary}</p><Link href="/paint-correction" className="link">Only need correction? See Paint Correction ↗</Link></div><div className="ceramic-package-price"><small>starting at</small><strong>{usd(ceramic.startingAt)}</strong></div><div><ul>{ceramic.includes.map((x,i)=><li key={x}><span>0{i+1}</span>{x}</li>)}</ul><TrackedLink href={quote} event="paint_inquiry" params={{location:"ceramic_package"}} className="btn btn-primary">Get my coating quote</TrackedLink><p className="ceramic-note">Final price is confirmed after we see the vehicle and paint condition.</p></div></article></div></section>

    <section className="coating-maintenance"><div className="container-ed coating-maintenance-grid"><div><p className="eyebrow">After the coating</p><h2>Easier to maintain.<br/>Not maintenance-free.</h2></div><div><p>A coated car still needs proper washing. Use pH-neutral soap and clean microfiber, and avoid automatic brush washes that can mar any clear coat.</p><p>Your 2-year coating includes a free follow-up detail. After that, our Maintenance Detail or Detail+ can keep the finish cared for without turning ownership into a project.</p><Link href="/detailplus" className="link">See Detail+ maintenance ↗</Link></div></div></section>

    <section id="paint-quote" className="paint-lead-section"><div className="container-ed"><PaintLeadForm kind="ceramic"/></div></section>

    <section className="border-t border-line bg-paper2 py-16 md:py-24"><div className="container-ed grid gap-10 lg:grid-cols-12"><h2 className="t-h2 lg:col-span-4">Ceramic coating questions</h2><div className="lg:col-span-8"><FaqList faqs={paintFaqs}/></div></div></section>
    <section className="bg-oxblood text-paper"><div className="container-ed paint-final-cta"><div><p className="eyebrow">Correct. Coat. Maintain.</p><h2>Start with the paint you have.</h2><p>Tell us what you drive and what you want from the finish. We will confirm whether coating makes sense and what preparation the paint needs first.</p></div><TrackedLink href={quote} event="paint_inquiry" params={{location:"ceramic_final"}} className="btn btn-on-dark">Get my coating quote</TrackedLink></div></section>
    <JsonLd data={serviceSchema({name:"2-Year Ceramic Coating",description:ceramic.summary,path:"/ceramic",lowPrice:ceramic.startingAt})}/>
  </>;
}
