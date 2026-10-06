import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { GoogleMapsAttribution, LiveReviewCount } from "@/components/GoogleReviewStats";
import { Photo } from "@/components/Photo";
import { areas } from "@/data/areas";
import { reviewCountLabel, site } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Mobile Car Detailing Service Areas Near Decatur, GA | Every Detail",
  description: `Every Detail brings mobile car detailing to Decatur and nearby Atlanta neighborhoods. 100% electric mobile rigs with their own power and water, online pricing and ${reviewCountLabel} five-star reviews.`,
  path: "/service-areas",
});

export default function ServiceAreas() {
  return (
    <main className="areas-v2">
      <section className="areas-v2-hero">
        <div className="areas-v2-shell areas-v2-hero-grid">
          <div>
            <p className="areas-v2-kicker">SERVICE AREA / DECATUR + ATLANTA</p>
            <h1>The detail shop<br/><span>comes to you.</span></h1>
            <p className="areas-v2-lede">Every Detail is based in Decatur and serves nearby Atlanta neighborhoods with fully equipped mobile rigs. We bring the power, water, products and crew. You provide the car and a place to work.</p>
            <div className="areas-v2-actions"><Link href="/book" className="btn btn-primary">Check availability ↗</Link><Link href="/get-a-quote" className="areas-v2-text-link">Not sure if we reach you? Get a quote</Link></div>
          </div>
          <figure className="areas-v2-hero-photo"><Photo id="rig-03" priority ratio="3/2" sizes="(min-width: 900px) 48vw, 94vw"/><figcaption>MOBILE RIG / POWER + WATER ON BOARD</figcaption></figure>
        </div>
      </section>

      <section className="areas-v2-proof"><div className="areas-v2-shell"><span>BASED IN DECATUR</span><span><LiveReviewCount /> FIVE-STAR REVIEWS · <GoogleMapsAttribution /></span><span>POWER + WATER INCLUDED</span><span>100% ELECTRIC RIGS</span></div></section>

      <section className="areas-v2-list">
        <div className="areas-v2-shell">
          <div className="areas-v2-head"><div><p className="areas-v2-kicker">WHERE WE GO</p><h2>Our regular<br/><span>service area.</span></h2></div><p>Tap your area for local booking information and pricing. If you are close to the edge of the map, send us your address anyway. We may still be able to make it work.</p></div>
          <div className="areas-v2-grid">
            {areas.map((area, i) => (
              <Link key={area.slug} href={`/service-areas/${area.slug}`} className="areas-v2-card">
                <span className="areas-v2-index">{String(i + 1).padStart(2,"0")}</span>
                <div><h3>{area.name}</h3><p>{area.primary ? "Home base" : "Mobile service area"}</p></div>
                <b>↗</b>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="areas-v2-how">
        <div className="areas-v2-shell areas-v2-how-grid">
          <div><p className="areas-v2-kicker">WHAT WE NEED</p><h2>No shop visit.<br/><span>No hose required.</span></h2></div>
          <div className="areas-v2-how-list">
            <article><b>01</b><div><h3>Room around the vehicle</h3><p>A driveway or accessible parking area with enough space for our crew to work safely around the car.</p></div></article>
            <article><b>02</b><div><h3>Access to the vehicle</h3><p>We handle the rest of the setup. Our mobile rigs arrive with the water, power, equipment and products for the service.</p></div></article>
            <article><b>03</b><div><h3>A confirmed appointment</h3><p>Choose your vehicle and service online. Available appointment times account for where our crew can actually travel and work.</p></div></article>
          </div>
        </div>
      </section>

      <section className="areas-v2-edge"><div className="areas-v2-shell"><div><p className="areas-v2-kicker">OUTSIDE THE LIST?</p><h2>Ask us anyway.</h2></div><p>We occasionally work outside our regular service area when the schedule allows. Send the address and vehicle through the quote form, or call <a className="link" href={site.phone.href}>{site.phone.display}</a>.</p><Link href="/get-a-quote" className="btn btn-secondary">Check your address ↗</Link></div></section>
      <CtaBand location="areas_final" />
    </main>
  );
}
