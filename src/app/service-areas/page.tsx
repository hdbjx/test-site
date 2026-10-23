import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { GoogleMapsAttribution, LiveReviewCount } from "@/components/GoogleReviewStats";
import { Photo } from "@/components/Photo";
import { areas } from "@/data/areas";
import { reviewCountLabel, site } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Mobile Detailing Service Areas Near Decatur | Every Detail",
  description: `Mobile detailing from Decatur to nearby Atlanta neighborhoods. Our electric rigs bring their own power and water, with pricing available online.`,
  path: "/service-areas",
  image: "hq-branded-van-side",
});

export default function ServiceAreas() {
  return (
    <div className="areas84">
      <section className="areas84-hero">
        <div className="areas84-shell areas84-hero-grid">
          <div className="areas84-copy">
            <p className="areas84-eyebrow">MOBILE DETAILING / DECATUR + ATLANTA</p>
            <h1>We come to your driveway.</h1>
            <p>Every Detail is based in Decatur and serves nearby Atlanta neighborhoods with fully equipped mobile detailing rigs.</p>
            <div className="areas84-actions">
              <Link href="/book" className="btn btn-primary">Check availability ↗</Link>
              <Link href="/get-a-quote" className="areas84-link">Check another address</Link>
            </div>
          </div>
          <figure className="areas84-photo">
            <Photo id="rig-03" priority ratio="4/3" sizes="(min-width: 900px) 42vw, 92vw" />
          </figure>
        </div>
      </section>

      <section className="areas84-areas">
        <div className="areas84-shell">
          <div className="areas84-head">
            <div>
              <p className="areas84-eyebrow">REGULAR SERVICE AREA</p>
              <h2>Where we’re usually working.</h2>
            </div>
            <p>Pick your area for local details. If you are nearby but not listed, send us the address and we will tell you if the schedule can support it.</p>
          </div>
          <div className="areas84-grid">
            {areas.map((area) => (
              <Link key={area.slug} href={`/service-areas/${area.slug}`} className="areas84-card">
                <div>
                  <h3>{area.name}</h3>
                  <p>{area.primary ? "Home base" : "Mobile service area"}</p>
                </div>
                <span>↗</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="areas84-proof">
        <div className="areas84-shell areas84-proof-grid">
          <div><strong><LiveReviewCount />+</strong><span>five-star reviews</span><small><GoogleMapsAttribution /></small></div>
          <div><strong>Power + water</strong><span>included with the detail</span></div>
          <div><strong>100% electric</strong><span>mobile rigs</span></div>
          <div><strong>Decatur based</strong><span>student-run crew</span></div>
        </div>
      </section>

      <section className="areas84-setup">
        <div className="areas84-shell areas84-setup-grid">
          <div>
            <p className="areas84-eyebrow">DETAIL DAY</p>
            <h2>You provide the car. We bring the setup.</h2>
          </div>
          <div className="areas84-setup-copy">
            <p>We need safe working room around the vehicle and access to it at the appointment time. Our rigs bring the water, power, products, and equipment.</p>
            <p>Outside the regular area? Call <a href={site.phone.href}>{site.phone.display}</a> or use the quote form and send us the address.</p>
          </div>
        </div>
      </section>

      <CtaBand location="areas_final" />
    </div>
  );
}
