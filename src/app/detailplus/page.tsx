import Link from "next/link";
import { FaqList } from "@/components/FaqList";
import { JsonLd } from "@/components/JsonLd";
import { Photo } from "@/components/Photo";
import { DetailPlusForm } from "@/components/forms/DetailPlusForm";
import { detailPlusBenefits, detailPlusSteps } from "@/data/detailplus";
import { detailPlusFaqs } from "@/data/faqs";
import { pageMetadata, serviceSchema } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Detail+ Recurring Car Detailing Membership | Every Detail", description: "Recurring mobile detailing in Decatur and Atlanta. Choose bi-weekly, monthly, every six weeks, or a custom 1 to 13 week rhythm, with no contracts.", path: "/detailplus" });

export default function DetailPlusPage() {
  return (
    <div className="dp56-page info80-page">
      <section className="dp56-hero ed-paper ed-paper--ink ed-paper--crumpled info80-hero">
        <div className="dp56-shell dp56-hero-grid">
          <div className="dp56-hero-copy">
            <p className="dp56-kicker">DETAIL+ SERVICE CLUB</p>
            <h1>STAY CLEAN.<br/><span>SKIP THE RESET.</span></h1>
            <p className="dp56-hero-lede">Recurring mobile detailing for cars that are already in good shape. Pick the rhythm once, then we come back before the mess piles up.</p>
            <div className="dp56-hero-actions"><a href="#club-builder" className="dp56-btn dp56-btn-light">BUILD MY PLAN ↗</a></div>
            <div className="dp56-proof-row"><span>NO CONTRACT</span><span>FLAT RATE / VISIT</span><span>WE COME TO YOU</span></div>
          </div>
          <div className="dp56-hero-art" aria-label="Detail Plus service club preview">
            <figure className="dp56-polaroid dp56-polaroid-main"><Photo id="hq-black-suv-finished" priority sizes="(min-width: 900px) 34vw, 88vw" /><figcaption>STAYS CLEAN / STAYS READY</figcaption></figure>
            <div className="dp56-club-card ed-paper ed-paper--coral ed-paper--crumpled"><div><span>EVERY DETAIL</span><b>DETAIL+</b></div><p>SERVICE CLUB</p><dl><dt>MEMBER</dt><dd>YOUR CAR</dd><dt>STATUS</dt><dd>ON REPEAT</dd></dl><i>+</i></div>
          </div>
        </div>
      </section>

      <section id="club-builder" className="dp56-builder info80-section">
        <div className="dp56-shell"><div className="info80-heading-row"><div><p className="dp56-kicker dark">PICK YOUR RHYTHM</p><h2>HOW OFTEN SHOULD WE COME BACK?</h2></div><p>Bi-weekly, monthly, six weeks, or any 1 to 13 week interval.</p></div><DetailPlusForm /></div>
      </section>

      <section className="dp56-covered info80-section">
        <div className="dp56-shell">
          <div className="info80-heading-row"><div><p className="dp56-kicker dark">WHAT YOU GET</p><h2>KEEP THE BASELINE.</h2></div><p>Detail+ is built around staying ahead of buildup, not waiting for another reset.</p></div>
          <div className="dp56-benefit-grid info80-benefits">{detailPlusBenefits.slice(0, 3).map((benefit, index) => <article key={benefit.title} className="dp56-benefit-card"><span>{String(index + 1).padStart(2, "0")}</span><h3>{benefit.title}</h3><p>{benefit.body}</p></article>)}<figure className="dp56-benefit-photo"><Photo id="hq-interior-team-front-seats" sizes="(min-width: 900px) 31vw, 92vw" /></figure></div>
        </div>
      </section>

      <section id="how-it-works" className="dp56-how ed-paper ed-paper--coral ed-paper--crumpled info80-section">
        <div className="dp56-shell dp56-how-grid">
          <div className="dp56-how-copy"><p className="dp56-kicker">HOW IT WORKS</p><h2>SET THE RHYTHM.<br/><span>WE KEEP IT.</span></h2></div>
          <div className="dp56-how-steps">{detailPlusSteps.slice(0, 3).map((step, index) => <article className="dp56-how-card" key={step.title}><b>0{index + 1}</b><h3>{step.title}</h3><p>{step.body}</p></article>)}</div>
        </div>
      </section>

      <section className="dp56-faq info80-section"><div className="dp56-shell dp56-faq-grid"><div><p className="dp56-kicker dark">QUICK ANSWERS</p><h2>BEFORE YOU PUT IT ON REPEAT.</h2><p>Want one visit first? <Link href="/book">Book a regular detail ↗</Link></p></div><FaqList faqs={detailPlusFaqs.slice(0, 5)} /></div></section>
      <JsonLd data={serviceSchema({ name: "Detail+ recurring detailing membership", description: "Recurring mobile car detailing on a set schedule for one flat rate per visit.", path: "/detailplus" })} />
    </div>
  );
}
