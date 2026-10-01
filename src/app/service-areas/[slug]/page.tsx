import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/CtaBand";
import { GoogleMapsAttribution, LiveReviewCount } from "@/components/GoogleReviewStats";
import { ReviewGrid } from "@/components/ReviewGrid";
import { ServicePicker } from "@/components/ServicePicker";
import { areasWithPages } from "@/data/areas";
import { pageMetadata } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return areasWithPages.map((a) => ({ slug: a.slug })); }

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const area = areasWithPages.find((a) => a.slug === slug);
  if (!area) return {};
  return pageMetadata({ title: `${area.page.title} | Every Detail`, description: area.page.description, path: `/service-areas/${slug}` });
}

export default async function AreaPage({ params }: Params) {
  const { slug } = await params;
  const area = areasWithPages.find((a) => a.slug === slug);
  if (!area) notFound();
  const { page } = area;

  return (
    <main className="area-v2">
      <section className="area-v2-hero"><div className="area-v2-shell">
        <p className="area-v2-kicker">MOBILE DETAILING / {area.name.toUpperCase()}</p>
        <h1>Car detailing in<br/><span>{area.name}.</span></h1>
        <div className="area-v2-hero-bottom"><p>{page.intro}</p><div><Link href="/book" className="btn btn-primary">Book your detail ↗</Link><Link href="/get-a-quote" className="area-v2-inline">Get a recommendation</Link></div></div>
      </div></section>

      <section className="area-v2-proof"><div className="area-v2-shell"><span><LiveReviewCount /> FIVE-STAR REVIEWS · <GoogleMapsAttribution /></span><span>POWER + WATER INCLUDED</span><span>TRAINED CREW</span><span>ONLINE PRICING</span></div></section>

      <section className="area-v2-local"><div className="area-v2-shell area-v2-local-grid"><div><p className="area-v2-kicker">HOW IT WORKS</p><h2>Your parking spot.<br/><span>Our setup.</span></h2></div><div className="area-v2-notes">{page.localNotes.map((n,i)=><article key={n}><b>{String(i+1).padStart(2,"0")}</b><p>{n}</p></article>)}</div></div></section>

      <section className="area-v2-pricing"><div className="area-v2-shell"><div className="area-v2-pricing-head"><div><p className="area-v2-kicker">PRICING</p><h2>Pick your vehicle.<br/><span>See the real price.</span></h2></div><p>Our core detailing prices are based on vehicle size and service level. Choose what you drive to compare Maintenance, Premium and Factory Reset.</p></div><ServicePicker location={`area_${slug}`} headingId="area-pricing" /></div></section>

      <section className="area-v2-reviews"><div className="area-v2-shell"><p className="area-v2-kicker">THE WORK, ACCORDING TO CLIENTS</p><ReviewGrid /></div></section>
      <section className="area-v2-back"><div className="area-v2-shell"><Link href="/service-areas">← See every service area</Link></div></section>
      <CtaBand location={`area_${slug}_final`} />
    </main>
  );
}
