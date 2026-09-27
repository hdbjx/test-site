import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { PageHeader } from "@/components/PageHeader";
import { areas } from "@/data/areas";
import { site } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Service Areas: Decatur & Atlanta Mobile Detailing | Every Detail",
  description: `Every Detail comes to you in ${areas.map((a) => a.name).join(", ")}. Mobile detailing with our own power and water.`,
  path: "/service-areas",
});

export default function ServiceAreas() {
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Service areas", path: "/service-areas" }]}
        title="Where we detail"
        lede={
          <p>
            We&rsquo;re based in Decatur and come to driveways, apartment lots and offices across these neighborhoods. We
            bring our own power and water, so we just need room to work.
          </p>
        }
      />
      <section className="container-ed pb-20">
        <ul className="grid border-t border-line sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((a) => (
            <li key={a.slug} className="border-b border-line py-5 sm:odd:pr-6">
              {a.page ? (
                <Link href={`/service-areas/${a.slug}`} className="font-display text-2xl font-semibold hover:text-red">
                  {a.name}
                </Link>
              ) : (
                <span className="font-display text-2xl font-semibold">{a.name}</span>
              )}
              {a.primary && <span className="ml-3 text-sm text-muted">Home base</span>}
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-2xl text-ink/80">
          Nearby but not listed? Call or text{" "}
          <a href={site.phone.href} className="link">
            {site.phone.display}
          </a>{" "}
          and ask. We may still be able to get to you.
        </p>
      </section>
      <CtaBand location="areas" />
    </>
  );
}
