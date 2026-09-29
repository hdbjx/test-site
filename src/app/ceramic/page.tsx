import Link from "next/link";
import { BeforeAfter } from "@/components/BeforeAfter";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqList } from "@/components/FaqList";
import { JsonLd } from "@/components/JsonLd";
import { Photo } from "@/components/Photo";
import { RowList } from "@/components/RowList";
import { TrackedLink } from "@/components/TrackedLink";
import { WorkGallery } from "@/components/WorkGallery";
import { paintFaqs } from "@/data/faqs";
import { beforeAfterPairs, imagesIn } from "@/data/images";
import { ceramicDoes, ceramicDoesNot, paintDefects, paintProcess, paintServices } from "@/data/paint";
import { reviewCountLabel, site } from "@/data/site";
import { usd } from "@/lib/format";
import { pageMetadata, serviceSchema } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Paint Correction & Ceramic Coating in Decatur, GA | Every Detail",
  description:
    "Enhancement polish from $395, full paint correction from $695, and 2-year ceramic coating with correction included from $895. Mobile service in Decatur and Atlanta.",
  path: "/ceramic",
});

const quoteHref = "/get-a-quote?interest=ceramic";

export default function CeramicPage() {
  const paintPhotos = imagesIn("paint", "ceramic");
  const paintPairs = beforeAfterPairs.filter((p) => p.category === "paint");
  const [enhancement, correction, ceramic] = paintServices;

  return (
    <>
      {/* Hero */}
      <section className="bg-ink text-paper">
        <div className="container-ed pb-16 pt-8 md:pb-24 md:pt-10">
          <div className="[&_a]:text-paper/70 [&_nav]:text-paper/60 [&_span[aria-current]]:text-paper">
            <Breadcrumbs items={[{ name: "Paint Correction & Ceramic Coating", path: "/ceramic" }]} />
          </div>
          <div className={`mt-10 grid gap-10 ${paintPhotos.length ? "lg:grid-cols-12 lg:items-center" : ""}`}>
            <div className={paintPhotos.length ? "lg:col-span-6" : "max-w-3xl"}>
              <h1 className="t-page">Paint correction &amp; ceramic coating in Decatur, GA</h1>
              <p className="t-lede mt-6 text-paper/80">
                We machine-polish out swirls, haze and light scratches, then protect the finish with a two-year ceramic
                coating. Mobile, in your driveway.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <TrackedLink href={quoteHref} event="paint_inquiry" params={{ location: "ceramic_hero" }} className="btn btn-primary">
                  Get a paint quote
                </TrackedLink>
                <a href="#packages" className="btn btn-outline-on-dark">
                  See packages and prices
                </a>
              </div>
              <p className="mt-8 text-[0.9375rem] text-paper/65">
                {reviewCountLabel} five-star Google reviews · {site.award.title}
              </p>
            </div>
            {paintPhotos[0] && (
              <div className="lg:col-span-6">
                <Photo id={paintPhotos[0].id} priority ratio="4/3" sizes="(min-width: 1024px) 45vw, 100vw" className="rounded-[var(--radius-photo)]" />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="container-ed py-12 md:py-16">
        <WorkGallery ids={["ceramic-01", "ceramic-02", "paint-02", "paint-03", "ceramic-03"]} />
      </section>

      {/* Packages */}
      <section id="packages" className="container-ed scroll-mt-24 py-16 md:py-24">
        <h2 className="t-h2">Packages and starting prices</h2>
        <p className="mt-4 max-w-2xl text-lg text-ink/80">
          Final price depends on the vehicle&rsquo;s size and the paint&rsquo;s condition. We inspect in person and confirm
          the price before any work starts.
        </p>

        <div className="mt-12 grid gap-12 lg:grid-cols-12">
          {/* Ceramic — the main package */}
          <article id="ceramic-coating" className="panel panel-red relative scroll-mt-24 p-7 md:p-10 lg:col-span-7">
            <div className="mt-2 flex flex-wrap items-baseline gap-x-4">
              <h3 className="t-h2 pr-24 md:pr-28">{ceramic.name}</h3>
            </div>
            <p className="absolute -right-3 -top-6 flex h-28 w-28 rotate-6 flex-col items-center justify-center rounded-full border-2 border-dashed border-ink/50 bg-sand text-center shadow-[0_0_0_5px_var(--color-sand)] md:-right-6 md:h-32 md:w-32">
              <span className="font-display text-[0.65rem] font-semibold">Starting at</span>
              <span className="t-numeral text-5xl md:text-6xl">{usd(ceramic.startingAt)}</span>
              <span className="font-display text-[0.65rem] font-semibold">Correction included</span>
            </p>
            <p className="mt-4 text-lg text-ink/85">{ceramic.summary}</p>
            <ul className="mt-6 space-y-2 border-t border-line pt-6">
              {ceramic.includes.map((inc) => (
                <li key={inc} className="flex gap-2.5">
                  <svg aria-hidden="true" viewBox="0 0 16 16" className="mt-1.5 h-4 w-4 shrink-0 text-red">
                    <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  {inc}
                </li>
              ))}
            </ul>
            <TrackedLink href={quoteHref} event="paint_inquiry" params={{ location: "ceramic_package", interest: "ceramic" }} className="btn btn-primary mt-8 w-full sm:w-auto">
              Get a ceramic coating quote
            </TrackedLink>
          </article>

          {/* Correction only */}
          <div id="paint-correction" className="scroll-mt-24 lg:col-span-5">
            <h3 className="font-display text-2xl font-bold tracking-tight">Correction only</h3>
            <p className="mt-2 text-ink/80">Want the gloss without the coating? We correct the paint and leave it there.</p>
            <ul className="mt-6">
              {[enhancement, correction].map((p) => (
                <li key={p.id} className="border-t border-line py-6">
                  <p className="flex items-baseline gap-3">
                    <span className="font-display text-lg font-semibold">{p.name}</span>
                    <span className="leader" aria-hidden="true" />
                    <span className="t-numeral text-3xl">
                      <span className="sr-only">starting at </span>
                      {usd(p.startingAt)}+
                    </span>
                  </p>
                  <p className="mt-2 text-ink/80">{p.summary}</p>
                  <p className="mt-1 text-sm text-muted">Best for: {p.bestFor}</p>
                </li>
              ))}
            </ul>
            <TrackedLink
              href="/get-a-quote?interest=paint-correction"
              event="paint_inquiry"
              params={{ location: "ceramic_correction", interest: "paint-correction" }}
              className="btn btn-secondary mt-2"
            >
              Get a correction quote
            </TrackedLink>
          </div>
        </div>
      </section>

      {/* What correction is */}
      <section className="border-t border-line bg-paper2 py-16 md:py-24">
        <div className="container-ed grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="t-h2">What paint correction fixes</h2>
            <p className="mt-5 text-lg text-ink/80">
              Paint correction is machine polishing that levels the clear coat to remove defects instead of filling or
              hiding them. A wash, wax or sealant can&rsquo;t do that.
            </p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <RowList items={paintDefects.map((d) => ({ title: d.name, body: d.detail }))} />
          </div>
        </div>
      </section>

      {/* Enhancement vs correction */}
      <section className="container-ed py-16 md:py-24">
        <h2 className="t-h2 max-w-3xl">Enhancement polish or full correction?</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {[enhancement, correction].map((p) => (
            <div key={p.id} className="border-t-2 border-ink pt-5">
              <h3 className="t-h3">{p.name}</h3>
              <p className="mt-1 font-display font-semibold text-oxblood">From {usd(p.startingAt)}</p>
              <p className="mt-3 text-ink/85">{p.summary}</p>
              <p className="mt-3 text-ink/75">
                <span className="font-semibold text-ink">Choose it if: </span>
                {p.bestFor.charAt(0).toLowerCase() + p.bestFor.slice(1)}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-ink/80">
          Not sure? That&rsquo;s normal. We look at the paint in person and match the process to the car.
        </p>
      </section>

      {/* Ceramic does / doesn't */}
      <section className="border-t border-line bg-paper2 py-16 md:py-24">
        <div className="container-ed">
          <div className="max-w-3xl">
            <h2 className="t-h2">What a ceramic coating is, and what it isn&rsquo;t</h2>
            <p className="mt-5 text-lg text-ink/80">
              A ceramic coating is a liquid protective layer that bonds to your clear coat and cures hard. It&rsquo;s the
              most durable way to protect paint short of film, but it&rsquo;s not magic.
            </p>
          </div>
          <div className="mt-10 grid gap-10 md:grid-cols-2">
            <div>
              <h3 className="t-h3">What it does</h3>
              <ul className="mt-4 space-y-3">
                {ceramicDoes.map((t) => (
                  <li key={t} className="flex gap-3 border-t border-line pt-3">
                    <svg aria-hidden="true" viewBox="0 0 16 16" className="mt-1.5 h-4 w-4 shrink-0 text-red">
                      <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="t-h3">What it doesn&rsquo;t do</h3>
              <ul className="mt-4 space-y-3">
                {ceramicDoesNot.map((t) => (
                  <li key={t} className="flex gap-3 border-t border-line pt-3">
                    <svg aria-hidden="true" viewBox="0 0 16 16" className="mt-1.5 h-4 w-4 shrink-0 text-muted">
                      <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="container-ed py-16 md:py-24">
        <h2 className="t-h2">Our process</h2>
        <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {paintProcess.map((s, i) => (
            <li key={s.title} className="border-t-2 border-ink pt-5">
              <p className="t-numeral text-5xl text-oxblood">{i + 1}</p>
              <h3 className="mt-3 font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-1 text-[0.9375rem] text-ink/75">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {paintPairs.length > 0 && (
        <section className="border-t border-line bg-paper2 py-16 md:py-24">
          <div className="container-ed">
            <h2 className="t-h2">Before and after</h2>
            <div className="mt-10 grid gap-8 md:grid-cols-2">
              {paintPairs.map((p) => (
                <BeforeAfter key={p.id} before={p.before} after={p.after} caption={p.caption} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Maintenance */}
      <section className="border-t border-line py-16 md:py-24">
        <div className="container-ed grid gap-8 lg:grid-cols-12">
          <h2 className="t-h2 lg:col-span-5">Keeping a coating performing</h2>
          <div className="space-y-4 text-lg text-ink/85 lg:col-span-6 lg:col-start-7">
            <p>
              A coated car still needs washing, just less effort. Use a pH-neutral soap and clean microfiber, and skip
              automatic brush washes, which can mar any paint.
            </p>
            <p>
              Every 2-year coating includes a free follow-up detail. After that, regular{" "}
              <Link href="/our-services#maintenance-detail" className="link">
                Maintenance Details
              </Link>{" "}
              or a{" "}
              <Link href="/detailplus" className="link">
                Detail+ plan
              </Link>{" "}
              keep it clean without you having to think about it.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-line bg-paper2 py-16 md:py-24">
        <div className="container-ed grid gap-10 lg:grid-cols-12">
          <h2 className="t-h2 lg:col-span-4">Paint and coating questions</h2>
          <div className="lg:col-span-8">
            <FaqList faqs={paintFaqs} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-oxblood text-paper">
        <div className="container-ed grid gap-8 py-16 md:grid-cols-12 md:items-end md:py-24">
          <div className="md:col-span-7">
            <h2 className="t-h2">Not sure what your paint needs?</h2>
            <p className="mt-4 max-w-xl text-lg text-paper/80">
              Tell us about the car and what&rsquo;s bothering you about the paint. We&rsquo;ll recommend the right service
              and confirm the price after seeing it.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:col-span-5 md:justify-end">
            <TrackedLink href={quoteHref} event="paint_inquiry" params={{ location: "ceramic_final" }} className="btn btn-on-dark">
              Get a paint quote
            </TrackedLink>
            <TrackedLink href={site.phone.href} event="phone_click" params={{ location: "ceramic_final" }} className="btn btn-outline-on-dark">
              Call {site.phone.display}
            </TrackedLink>
          </div>
        </div>
      </section>

      <JsonLd
        data={paintServices.map((p) =>
          serviceSchema({
            name: p.id === "ceramic2yr" ? "Ceramic Coating" : p.name,
            description: p.summary,
            path: p.id === "ceramic2yr" ? "/ceramic#ceramic-coating" : "/ceramic#paint-correction",
            lowPrice: p.startingAt,
          }),
        )}
      />
    </>
  );
}
