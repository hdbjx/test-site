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

export const metadata = pageMetadata({ title:"Ceramic Coating in Decatur & Atlanta, GA | Every Detail", description:"Professional 2-year ceramic coating with paint correction included, from $895. Mobile ceramic coating service in Decatur and Atlanta.", path:"/ceramic" });
const quote="#paint-quote";

export default function CeramicPage(){
  const ceramic=paintServices[2];
  return <main className="paint-v38">
    <section className="pv38-hero pv38-hero-ceramic"><div className="container-ed pv38-hero-inner"><Breadcrumbs items={[{name:"Ceramic Coating",path:"/ceramic"}]}/><div className="pv38-hero-copy"><p className="pv38-kicker">2-year ceramic coating · Decatur + Atlanta</p><h1>Correct it first.<br/><em>Protect it next.</em></h1><p className="pv38-lede">A coating is only as good as the finish underneath it. We prepare and correct the paint first, then apply durable protection over the finished surface.</p><div className="pv38-actions"><TrackedLink href={quote} event="paint_inquiry" params={{location:"ceramic_hero"}} className="btn btn-primary">Get my coating quote ↗</TrackedLink><a href="#coating-process" className="pv38-text-link">See the process ↓</a></div><div className="pv38-proof"><span><b><LiveReviewCount/></b> five-star reviews</span><span>2-year protection</span><span>Correction included</span></div></div></div></section>

    <section id="coating-process" className="pv38-section pv38-paper"><div className="container-ed pv38-split-head"><div><p className="pv38-kicker dark">The important part</p><h2>The coating is step three.</h2></div><p>The gloss does not come from pouring ceramic onto imperfect paint. Most of the finished look is created during preparation and correction.</p></div><div className="container-ed pv38-horizontal-process"><article><span>01</span><h3>Prepare</h3><p>Wash and decontaminate the surface so we are working with clean paint.</p></article><article><span>02</span><h3>Correct</h3><p>Refine the paint before protection so swirls and haze are not locked underneath.</p></article><article><span>03</span><h3>Coat</h3><p>Apply the professional coating to the prepared clear coat and allow it to cure properly.</p></article></div></section>

    <section className="pv38-proof-section"><div className="container-ed pv38-proof-layout"><div className="pv38-photo"><Image src="/images/black-truck-finished.jpg" alt="Glossy black vehicle after professional ceramic protection" fill sizes="(max-width: 800px) 100vw, 46vw"/></div><div className="pv38-proof-copy"><p className="pv38-kicker">Why ceramic</p><h2>Keep a corrected finish easier to care for.</h2><p>The coating adds a durable, slick layer over the clear coat. Water and contamination release more easily, while the gloss created underneath stays protected.</p></div></div></section>

    <section className="pv38-section pv38-white"><div className="container-ed pv38-split-head"><div><p className="pv38-kicker dark">Know what you are buying</p><h2>Protection, without the myths.</h2></div><p>Ceramic is excellent at the job it is designed to do. It is not armor, and we do not sell it like it is.</p></div><div className="container-ed pv38-truth"><div><h3>What it does</h3>{ceramicDoes.map(x=><p key={x}>{x}</p>)}</div><div><h3>What it does not do</h3>{ceramicDoesNot.map(x=><p key={x}>{x}</p>)}</div></div></section>

    <section className="pv38-section pv38-paper" id="coating-package"><div className="container-ed pv38-package"><div className="pv38-package-copy"><p className="pv38-kicker dark">The package</p><h2>One complete coating service.</h2><p>{ceramic.summary}</p><Link href="/paint-correction" className="pv38-arrow-link">Only need correction? See Paint Correction →</Link></div><article className="pv38-ticket"><div className="pv38-ticket-head"><span>EVERY DETAIL PAINT CARE</span><span>02 YEAR</span></div><h3>{ceramic.name}</h3><div className="pv38-ticket-price"><small>starting at</small><strong>{usd(ceramic.startingAt)}</strong></div><ul>{ceramic.includes.map((x,i)=><li key={x}><span>0{i+1}</span>{x}</li>)}</ul><TrackedLink href={quote} event="paint_inquiry" params={{location:"ceramic_package"}} className="btn btn-primary">Get my coating quote</TrackedLink><p className="pv38-ticket-note">Final price is confirmed after we see the vehicle and paint condition.</p></article></div></section>

    <section className="pv38-maintenance"><div className="container-ed pv38-maintenance-grid"><div><p className="pv38-kicker dark">After coating</p><h2>Easier to maintain.<br/>Not maintenance-free.</h2></div><div><p>A coated car still needs proper washing. Use pH-neutral soap and clean microfiber, and avoid automatic brush washes that can mar any clear coat.</p><p>Your 2-year coating includes a free follow-up detail. After that, our Maintenance Detail or Detail+ can keep the finish cared for.</p><Link href="/detailplus" className="pv38-arrow-link">See Detail+ maintenance →</Link></div></div></section>

    <section id="paint-quote" className="pv38-form"><div className="container-ed"><PaintLeadForm kind="ceramic"/></div></section>
    <section className="pv38-faq"><div className="container-ed pv38-faq-grid"><div><p className="pv38-kicker dark">Before you book</p><h2>Ceramic coating questions.</h2></div><FaqList faqs={paintFaqs}/></div></section>
    <JsonLd data={serviceSchema({name:"2-Year Ceramic Coating",description:ceramic.summary,path:"/ceramic",lowPrice:ceramic.startingAt})}/>
  </main>;
}
