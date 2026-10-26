import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CtaBand } from "@/components/CtaBand";
import { GoogleMapsAttribution, LiveReviewCount } from "@/components/GoogleReviewStats";
import { JsonLd } from "@/components/JsonLd";
import { Photo } from "@/components/Photo";
import { ReviewGrid } from "@/components/ReviewGrid";
import { ServicePicker } from "@/components/ServicePicker";
import { areasWithPages } from "@/data/areas";
import { breadcrumbSchema, pageMetadata, serviceSchema } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return areasWithPages.map((a) => ({ slug: a.slug })); }

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const area = areasWithPages.find((a) => a.slug === slug);
  if (!area) return {};
  return pageMetadata({ title: `${area.page.title} | Every Detail`, description: area.page.description, path: `/service-areas/${slug}`, noindex: area.indexable !== true });
}

export default async function AreaPage({ params }: Params) {
  const { slug } = await params;
  const area = areasWithPages.find((a) => a.slug === slug);
  if (!area) notFound();
  const { page } = area;

  return (
    <div className="area-v2">
      <section className="area-v2-hero area90-hero" data-header-tone="ink">
        <div className="area-v2-shell area90-hero-shell">
          <div className="area90-breadcrumbs"><Breadcrumbs items={[{ name: "Service Areas", path: "/service-areas" }, { name: area.name, path: `/service-areas/${slug}` }]} /></div>
          <div className="area90-hero-grid">
            <div className="area90-hero-copy">
              <p className="area-v2-kicker">MOBILE DETAILING / {area.name.toUpperCase()}</p>
              <h1><span>Car detailing</span><strong>{area.name}.</strong></h1>
              <p className="area90-intro">{page.intro}</p>
              <div className="area90-actions">
                <Link href="/book" className="btn btn-primary">Book your detail ↗</Link>
                <Link href="/get-a-quote" className="area-v2-inline">Get a recommendation</Link>
              </div>
            </div>
            <figure className="area90-hero-photo">
              <Photo id="branded-rig-driveway" sizes="(max-width: 760px) 92vw, 43vw" fill priority />
              <figcaption><span>WE COME TO YOU</span><strong>POWER + WATER ON BOARD</strong></figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="area-v2-proof" data-header-tone="light"><div className="area-v2-shell"><span><LiveReviewCount /> FIVE-STAR REVIEWS · <GoogleMapsAttribution /></span><span>POWER + WATER INCLUDED</span><span>TRAINED CREW</span><span>ONLINE PRICING</span></div></section>

      <section className="area-v2-local" data-header-tone="ink"><div className="area-v2-shell area-v2-local-grid"><div className="area86-local-intro"><p className="area-v2-kicker">LOCAL SERVICE</p><h2>Your parking spot.<br/><span>Our setup.</span></h2><figure className="area86-local-photo"><Photo id="hq-mobile-rig-fleet" ratio="4/3" sizes="(min-width: 900px) 32vw, 92vw" /></figure></div><div className="area-v2-notes">{page.localNotes.map((n,i)=><article key={n}><b>{String(i+1).padStart(2,"0")}</b><p>{n}</p></article>)}</div></div></section>

      <section className="area-v2-pricing" data-header-tone="ink"><div className="area-v2-shell"><div className="area-v2-pricing-head"><div><p className="area-v2-kicker">PRICING</p><h2>Pick your vehicle.<br/><span>See the real price.</span></h2></div><p>Choose your vehicle to see exact pricing for Maintenance, Premium and Factory Reset.</p></div><ServicePicker location={`area_${slug}`} headingId="area-pricing" /></div></section>

      <section className="area-v2-reviews" data-header-tone="ink"><div className="area-v2-shell"><p className="area-v2-kicker">WHAT CLIENTS SAY</p><ReviewGrid /></div></section>
      <section className="area-v2-back" data-header-tone="ink"><div className="area-v2-shell"><Link href="/service-areas">← See every service area</Link></div></section>
      <CtaBand location={`area_${slug}_final`} />
      <JsonLd data={[serviceSchema({ name: `Mobile Car Detailing in ${area.name}, GA`, description: page.description, path: `/service-areas/${slug}`, areaServed: [`${area.name}, GA`] }), breadcrumbSchema([{ name: "Service Areas", path: "/service-areas" }, { name: area.name, path: `/service-areas/${slug}` }])]} />
    </div>
  );
}
