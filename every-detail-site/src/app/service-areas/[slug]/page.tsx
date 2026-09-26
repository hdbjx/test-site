import { notFound } from "next/navigation";
import { CtaBand } from "@/components/CtaBand";
import { PageHeader } from "@/components/PageHeader";
import { Photo } from "@/components/Photo";
import { ReviewGrid } from "@/components/ReviewGrid";
import { ServicePicker } from "@/components/ServicePicker";
import { TrackedLink } from "@/components/TrackedLink";
import { areasWithPages } from "@/data/areas";
import { pageMetadata } from "@/lib/seo";

/**
 * Location landing pages. Only areas with `page` content in src/data/areas.ts are built.
 * Everything else 404s — no thin, find-and-replace town pages.
 */

type Params = { params: Promise<{ slug: string }> };
export const dynamicParams = false;

export function generateStaticParams() {
  return areasWithPages.map((a) => ({ slug: a.slug }));
}

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
    <>
      <PageHeader
        crumbs={[
          { name: "Service areas", path: "/service-areas" },
          { name: area.name, path: `/service-areas/${slug}` },
        ]}
        title={page.title}
        lede={<p>{page.intro}</p>}
        aside={page.photos?.[0] ? <Photo id={page.photos[0]} priority ratio="4/3" sizes="(min-width: 1024px) 45vw, 100vw" className="rounded-[var(--radius-photo)]" /> : undefined}
      >
        <TrackedLink href="/book" event="book_click" params={{ location: `area_${slug}` }} className="btn btn-primary">
          Book your detail
        </TrackedLink>
      </PageHeader>
      <section className="border-t border-line bg-paper2 py-16">
        <div className="container-ed">
          <h2 className="t-h2">Detailing in {area.name}</h2>
          <ul className="mt-8 grid gap-6 md:grid-cols-2">
            {page.localNotes.map((n) => (
              <li key={n} className="border-t-2 border-ink pt-4 text-ink/85">
                {n}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="container-ed py-16 md:py-24">
        <h2 id="area-vehicle" className="t-h2">
          Prices for your vehicle
        </h2>
        <div className="mt-10">
          <ServicePicker location={`area_${slug}`} headingId="area-vehicle" />
        </div>
      </section>
      <section className="border-t border-line bg-paper2 py-16 md:py-24">
        <div className="container-ed">
          <ReviewGrid />
        </div>
      </section>
      <CtaBand location={`area_${slug}_final`} />
    </>
  );
}
