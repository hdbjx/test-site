import Link from "next/link";
import { GoogleMapsAttribution, LiveReviewCount } from "@/components/GoogleReviewStats";
import { Photo } from "@/components/Photo";
import { areas } from "@/data/areas";
import { reviewCountLabel, site } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Mobile Car Detailing Service Areas Near Decatur, GA | Every Detail", description: `Every Detail brings mobile car detailing to Decatur and nearby Atlanta neighborhoods. 100% electric mobile rigs with their own power and water, online pricing and ${reviewCountLabel} five-star reviews.`, path: "/service-areas" });

export default function ServiceAreas() {
  return (
    <div className="areas-v2 info80-page">
      <section className="areas-v2-hero info80-hero">
        <div className="areas-v2-shell areas-v2-hero-grid">
          <div>
            <p className="areas-v2-kicker">DECATUR + ATLANTA</p>
            <h1>WE BRING THE DETAIL TO YOU.</h1>
            <p className="areas-v2-lede">Our mobile rigs arrive with the water, power, products, and crew. You provide the car and a safe place to work.</p>
            <div className="areas-v2-actions"><Link href="/book" className="btn btn-primary">Check availability ↗</Link><Link href="/get-a-quote" className="areas-v2-text-link">Outside the usual area? Ask us ↗</Link></div>
          </div>
          <figure className="areas-v2-hero-photo"><Photo id="rig-03" priority ratio="3/2" sizes="(min-width: 900px) 48vw, 94vw"/><figcaption>MOBILE RIG / POWER + WATER ON BOARD</figcaption></figure>
        </div>
      </section>

      <section className="areas-v2-proof info80-facts"><div className="areas-v2-shell"><span>BASED IN DECATUR</span><span><LiveReviewCount /> FIVE-STAR REVIEWS · <GoogleMapsAttribution /></span><span>POWER + WATER INCLUDED</span><span>100% ELECTRIC RIGS</span></div></section>

      <section className="areas-v2-list info80-section">
        <div className="areas-v2-shell">
          <div className="info80-heading-row"><div><p className="areas-v2-kicker">REGULAR SERVICE AREA</p><h2>WHERE WE GO.</h2></div><p>Choose your area for local booking information and pricing.</p></div>
          <div className="areas-v2-grid">{areas.map((area, i) => <Link key={area.slug} href={`/service-areas/${area.slug}`} className="areas-v2-card"><span className="areas-v2-index">{String(i + 1).padStart(2,"0")}</span><div><h3>{area.name}</h3><p>{area.primary ? "Home base" : "Mobile service area"}</p></div><b>↗</b></Link>)}</div>
        </div>
      </section>

      <section className="areas-v2-how info80-section">
        <div className="areas-v2-shell areas-v2-how-grid">
          <div><p className="areas-v2-kicker">FOR DETAIL DAY</p><h2>WHAT WE NEED.</h2></div>
          <div className="areas-v2-how-list">
            <article><b>01</b><div><h3>Room around the vehicle</h3><p>A driveway or accessible parking area with enough space to work safely.</p></div></article>
            <article><b>02</b><div><h3>Access to the vehicle</h3><p>We bring the water, power, equipment, and products.</p></div></article>
            <article><b>03</b><div><h3>A confirmed appointment</h3><p>Book online and we’ll show the times that work for your location.</p></div></article>
          </div>
        </div>
      </section>

      <section className="areas-v2-edge info80-simple-band"><div className="areas-v2-shell"><div><p className="areas-v2-kicker">OUTSIDE THE LIST?</p><h2>ASK US ANYWAY.</h2></div><p>We sometimes work beyond our regular area when the schedule allows. Send your location through the quote form or call <a className="link" href={site.phone.href}>{site.phone.display}</a>.</p><Link href="/get-a-quote" className="btn btn-secondary">Check your address ↗</Link></div></section>
    </div>
  );
}
