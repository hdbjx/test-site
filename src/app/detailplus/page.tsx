import Link from "next/link";
import { FaqList } from "@/components/FaqList";
import { JsonLd } from "@/components/JsonLd";
import { Photo } from "@/components/Photo";
import { DetailPlusForm } from "@/components/forms/DetailPlusForm";
import { detailPlusBenefits, detailPlusGuarantee, detailPlusSteps } from "@/data/detailplus";
import { detailPlusFaqs } from "@/data/faqs";
import { pageMetadata, serviceSchema } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Detail+ Recurring Car Detailing Membership | Every Detail",
  description: "Recurring mobile detailing in Decatur and Atlanta. Choose bi-weekly, monthly, every six weeks, or a custom 1 to 13 week rhythm, with no contracts.",
  path: "/detailplus",
  image: "hq-black-suv-finished",
});

export default function DetailPlusPage() {
  return (
    <div className="dp56-page service85">
      <section className="dp56-hero ed-paper ed-paper--ink ed-paper--crumpled" data-header-tone="light">
        <div className="dp56-shell dp56-hero-grid">
          <div className="dp56-hero-copy">
            <p className="dp56-kicker">EVERY DETAIL / SERVICE CLUB</p>
            <h1>STAY CLEAN.<br/><span>SKIP THE RESET.</span></h1>
            <p className="dp56-hero-lede">Detail+ is recurring mobile detailing for cars that already feel right. Pick the rhythm once, then we come back before the mess turns into another reset.</p>
            <div className="dp56-hero-actions">
              <a href="#club-builder" className="dp56-btn dp56-btn-light">JOIN DETAIL+ ↗</a>
              <a href="#how-it-works" className="dp56-text-link">SEE HOW IT WORKS ↓</a>
            </div>
            <div className="dp56-proof-row" aria-label="Detail Plus plan highlights">
              <span>NO CONTRACT</span><span>FLAT RATE / VISIT</span><span>WE COME TO YOU</span>
            </div>
          </div>

          <div className="dp56-hero-art" aria-label="Detail Plus service club preview">
            <figure className="dp56-polaroid dp56-polaroid-main">
              <Photo id="hq-black-suv-finished" priority sizes="(min-width: 900px) 34vw, 88vw" />
              <figcaption>STAYS CLEAN / STAYS READY</figcaption>
            </figure>
            <div className="dp56-club-card ed-paper ed-paper--coral ed-paper--crumpled">
              <div><span>EVERY DETAIL</span><b>DETAIL+</b></div>
              <p>SERVICE CLUB</p>
              <dl><dt>MEMBER</dt><dd>YOUR CAR</dd><dt>STATUS</dt><dd>ON REPEAT</dd><dt>NEXT VISIT</dt><dd>ALREADY HANDLED</dd></dl>
              <i>+</i>
            </div>
            <div className="dp56-paper-tag">CLEAN SHOULD BE<br/><b>THE BASELINE.</b></div>
          </div>
        </div>
      </section>

      <section className="dp56-thesis" data-header-tone="ink">
        <div className="dp56-shell">
          <p className="dp56-kicker dark">WHY THE CLUB EXISTS</p>
          <div className="dp56-thesis-grid">
            <h2>Clean once is a moment.<br/><span>Staying clean is a system.</span></h2>
            <p>Most cars do not suddenly become a disaster. They slowly slide backward. Detail+ changes the timing by bringing us back while the car is still easy to keep right.</p>
          </div>
          <div className="dp56-compare">
            <article className="dp56-compare-card">
              <span>WITHOUT DETAIL+</span>
              <ol><li><b>01</b> Get it clean</li><li><b>02</b> Life happens</li><li><b>03</b> Put it off</li><li><b>04</b> Need another reset</li></ol>
            </article>
            <article className="dp56-compare-card dp56-compare-accent">
              <span>WITH DETAIL+</span>
              <ol><li><b>01</b> Get it clean</li><li><b>02</b> Stay on schedule</li><li><b>03</b> We come back</li><li><b>04</b> It still feels right</li></ol>
            </article>
          </div>
        </div>
      </section>

      <section id="club-builder" className="dp56-builder" data-header-tone="ink">
        <div className="dp56-shell">
          <div className="dp56-section-head">
            <div><p className="dp56-kicker dark">PICK YOUR RHYTHM</p><h2>Your car.<br/><span>Your clean cycle.</span></h2></div>
            <p>Bi-weekly, monthly, six weeks, or any 1 to 13 week interval.</p>
          </div>
          <DetailPlusForm />
        </div>
      </section>

      <section className="dp56-covered" data-header-tone="ink">
        <div className="dp56-shell">
          <div className="dp56-section-head">
            <div><p className="dp56-kicker dark">THE DETAIL+ RULE</p><h2>If it&rsquo;s in the plan,<br/><span>it&rsquo;s covered.</span></h2></div>
            <p>{detailPlusGuarantee}</p>
          </div>
          <div className="dp56-benefit-grid">
            {detailPlusBenefits.map((benefit, index) => (
              <article key={benefit.title} className="dp56-benefit-card">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{benefit.title}</h3>
                <p>{benefit.body}</p>
              </article>
            ))}
            <figure className="dp56-benefit-photo">
              <Photo id="hq-interior-team-front-seats" sizes="(min-width: 900px) 31vw, 92vw" />
              <figcaption>REAL CARE / BEFORE IT PILES UP</figcaption>
            </figure>
            <figure className="dp56-benefit-photo dp86-benefit-photo-wide">
              <Photo id="finished-white-car" sizes="(min-width: 900px) 62vw, 92vw" />
              <figcaption>CLEAN STAYS THE BASELINE</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="dp56-how ed-paper ed-paper--coral ed-paper--crumpled" data-header-tone="ink">
        <div className="dp56-shell dp56-how-grid">
          <div className="dp56-how-copy">
            <p className="dp56-kicker">THE LOOP</p>
            <h2>Set it once.<br/><span>Keep it moving.</span></h2>
            <p>Choose the plan once. We keep the car on schedule.</p>
          </div>
          <div className="dp56-how-steps">
            {detailPlusSteps.map((step, index) => (
              <article className="dp56-how-card" key={step.title}>
                <b>0{index + 1}</b><h3>{step.title}</h3><p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="dp56-faq" data-header-tone="ink">
        <div className="dp56-shell dp56-faq-grid">
          <div><p className="dp56-kicker dark">CLUB QUESTIONS</p><h2>Before you put it<br/><span>on repeat.</span></h2><p>Still want to start with one visit? <Link href="/book">Book a regular detail ↗</Link></p></div>
          <FaqList faqs={detailPlusFaqs} />
        </div>
      </section>

      <section className="dp56-final ed-paper ed-paper--ink ed-paper--crumpled" data-header-tone="light">
        <div className="dp56-shell">
          <p className="dp56-kicker">DETAIL+ / READY WHEN YOU ARE</p>
          <h2>NEVER THINK ABOUT<br/><span>A DIRTY CAR AGAIN.</span></h2>
          <p>Pick the rhythm. Get the flat rate. We&rsquo;ll keep showing up.</p>
          <a href="#club-builder" className="dp56-btn dp56-btn-light">BUILD MY DETAIL+ PLAN ↗</a>
        </div>
      </section>

      <JsonLd data={serviceSchema({ name: "Detail+ recurring detailing membership", description: "Recurring mobile car detailing on a set schedule for one flat rate per visit.", path: "/detailplus" })} />
    </div>
  );
}
