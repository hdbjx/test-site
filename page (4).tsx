import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { FaqList } from "@/components/FaqList";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { ServicePicker } from "@/components/ServicePicker";
import { TrackedLink } from "@/components/TrackedLink";
import { bookingHref } from "@/data/booking";
import { homeFaqs } from "@/data/faqs";
import { paintServices } from "@/data/paint";
import { PRICING, serviceList, startingPrice, vehicles } from "@/data/services";
import { duration, usd } from "@/lib/format";
import { pageMetadata, serviceSchema } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Car Detailing Services & Prices in Decatur, GA | Every Detail",
  description:
    "Maintenance, Premium and Factory Reset mobile detailing with prices for every vehicle size, plus paint correction, ceramic coating and Detail+ plans. Decatur and Atlanta.",
  path: "/our-services",
});

const situations = [
  { q: "It's clean, it just needs upkeep.", a: "Maintenance Detail", href: "#maintenance-detail" },
  { q: "It's my first detail with you, or it's been a while.", a: "Premium Detail", href: "#premium-detail" },
  { q: "Kids, pets, stains, smells. It's rough.", a: "Factory Reset", href: "#factory-reset" },
  { q: "The paint looks dull or swirled.", a: "Paint correction & ceramic", href: "#paint" },
  { q: "I want it to stay clean.", a: "Detail+", href: "#detail-plus" },
];

export default function ServicesPage() {
  const schemas = [
    ...serviceList.map((s) => {
      const prices = vehicles.map((v) => PRICING[v.id][s.id].price);
      return serviceSchema({
        name: s.name,
        description: s.summary,
        path: `/our-services#${s.slug}`,
        lowPrice: Math.min(...prices),
        highPrice: Math.max(...prices),
      });
    }),
  ];

  return (
    <>
      <PageHeader
        crumbs={[{ name: "Services", path: "/our-services" }]}
        title="Mobile car detailing services in Decatur, GA"
        lede={
          <p>
            Three detailing services, priced up front by vehicle size, plus paint correction, ceramic coating and a
            recurring membership. Every service happens in your driveway, and we bring our own power and water.
          </p>
        }
      />

      {/* Router */}
      <section aria-labelledby="router-heading" className="container-ed pb-16">
        <h2 id="router-heading" className="font-display text-xl font-semibold">
          Where is your car right now?
        </h2>
        <ul className="mt-4 border-t border-line">
          {situations.map((s) => (
            <li key={s.href} className="border-b border-line">
              <a href={s.href} className="group flex items-center gap-4 py-4 md:py-5">
                <span className="flex-1 text-lg italic text-ink/85">&ldquo;{s.q}&rdquo;</span>
                <span className="font-display font-semibold text-red group-hover:underline">{s.a}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Price by vehicle */}
      <section className="border-y border-line bg-paper2 py-16 md:py-20">
        <div className="container-ed">
          <h2 id="svc-vehicle-heading" className="t-h2">
            Prices for your vehicle
          </h2>
          <p className="mt-3 text-lg text-ink/80">Choose your vehicle type. Prices and times update below.</p>
          <div className="mt-10">
            <ServicePicker location="services" headingId="svc-vehicle-heading" />
          </div>
        </div>
      </section>

      {/* Each service in full */}
      {serviceList.map((s, i) => (
        <section key={s.id} id={s.slug} aria-labelledby={`${s.slug}-h`} className={`py-16 md:py-24 ${i > 0 ? "border-t border-line" : ""}`}>
          <div className="container-ed grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <p className="font-display font-semibold text-oxblood">{s.recommended ? "Most booked. Recommended for first visits." : s.short}</p>
              <h2 id={`${s.slug}-h`} className="t-h2 mt-3">
                {s.name}
              </h2>
              <p className="mt-5 text-lg text-ink/85">{s.summary}</p>
              <h3 className="mt-8 font-display font-semibold">Who it&rsquo;s for</h3>
              <p className="mt-1 text-ink/80">{s.whoFor}</p>
              <h3 className="mt-6 font-display font-semibold">What&rsquo;s included</h3>
              <ul className="mt-2 space-y-1.5">
                {s.includes.map((inc) => (
                  <li key={inc} className="flex gap-2.5">
                    <svg aria-hidden="true" viewBox="0 0 16 16" className="mt-1.5 h-4 w-4 shrink-0 text-red">
                      <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    {inc}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-ink/80">
                <span className="font-display font-semibold text-ink">How often: </span>
                {s.cadence.toLowerCase()}.
              </p>
            </div>
            <div className="lg:col-span-5 lg:col-start-8">
              <table className="w-full text-left">
                <caption className="mb-3 text-left font-display font-semibold">
                  {s.name} prices, from {usd(startingPrice(s.id))}
                </caption>
                <thead className="sr-only">
                  <tr>
                    <th scope="col">Vehicle</th>
                    <th scope="col">Price</th>
                    <th scope="col">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v) => {
                    const p = PRICING[v.id][s.id];
                    return (
                      <tr key={v.id} className="border-t border-line">
                        <th scope="row" className="py-3 pr-4 font-normal">
                          <Link href={bookingHref(v.id, s.id)} className="hover:underline">
                            {v.label}
                          </Link>
                        </th>
                        <td className="t-numeral py-3 pr-4 text-2xl">{usd(p.price)}</td>
                        <td className="py-3 text-right text-sm text-muted">{duration(p.minutes)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <TrackedLink
                href={bookingHref(undefined, s.id)}
                event="book_click"
                params={{ location: "services_detail", service: s.id }}
                className={`btn mt-6 w-full ${s.recommended ? "btn-primary" : "btn-secondary"}`}
              >
                Book a {s.name}
              </TrackedLink>
            </div>
          </div>
        </section>
      ))}

      {/* Interior / exterior only */}
      <section className="border-t border-line bg-paper2 py-16">
        <div className="container-ed grid gap-6 lg:grid-cols-12">
          <h2 className="t-h3 lg:col-span-4">Only need the interior or the exterior?</h2>
          <div className="text-ink/85 lg:col-span-7 lg:col-start-6">
            <p>
              Our three detailing services cover inside and out. Detail+ members can choose interior-only or exterior-only
              plans. For a one-time interior or exterior job,{" "}
              <Link href="/get-a-quote" className="link">
                send a quote request
              </Link>{" "}
              and tell us what you need.
            </p>
          </div>
        </div>
      </section>

      {/* Paint */}
      <section id="paint" className="bg-ink py-16 text-paper md:py-24">
        <div className="container-ed grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="t-h2">Paint correction and ceramic coating</h2>
            <p className="mt-5 text-lg text-paper/75">
              Detailing cleans the car. Paint correction removes swirls, light scratches and haze by machine polishing.
              A ceramic coating then protects that finish for years. We inspect the paint before recommending either.
            </p>
            <TrackedLink href="/ceramic" event="paint_inquiry" params={{ location: "services_paint" }} className="btn btn-on-dark mt-8">
              Paint correction &amp; ceramic details
            </TrackedLink>
          </div>
          <ul className="lg:col-span-6 lg:col-start-7">
            {paintServices.map((p) => (
              <li key={p.id} className="border-b border-paper/20 py-5 first:pt-0">
                <p className="flex items-baseline gap-3">
                  <span className="font-display text-lg font-semibold">{p.name}</span>
                  <span className="flex-1 -translate-y-1 border-b-2 border-dotted border-paper/30" aria-hidden="true" />
                  <span className="t-numeral text-3xl text-sand">from {usd(p.startingAt)}</span>
                </p>
                <p className="mt-1 text-[0.9375rem] text-paper/70">{p.bestFor}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Detail+ */}
      <section id="detail-plus" className="container-ed grid gap-8 py-16 md:py-24 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <h2 className="t-h2">Detail+ recurring detailing</h2>
          <p className="mt-5 text-lg text-ink/80">
            A membership for people who want the car kept clean instead of rescued every few months. Choose a schedule
            from every two weeks to quarterly, interior, exterior or both, and pay the same flat rate every visit. No
            contracts.
          </p>
        </div>
        <div className="flex items-end lg:col-span-5 lg:col-start-8">
          <Link href="/detailplus" className="btn btn-secondary">
            How Detail+ works
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-line bg-paper2 py-16 md:py-24">
        <div className="container-ed">
          <h2 className="t-h2">How mobile detailing works</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              { t: "Pick your vehicle and service", b: "Prices are set by vehicle size, so you know the cost before you book." },
              { t: "We confirm your time", b: "Choose the days that work and we'll confirm an exact time with you by text or call." },
              { t: "We bring everything", b: "Our team arrives with its own power, water and products. All we need is room around the car." },
            ].map((s, i) => (
              <li key={s.t} className="border-t-2 border-ink pt-5">
                <p className="t-numeral text-5xl text-oxblood">{i + 1}</p>
                <h3 className="mt-3 font-display text-lg font-semibold">{s.t}</h3>
                <p className="mt-1 text-ink/75">{s.b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-ed grid gap-10 py-16 md:py-24 lg:grid-cols-12">
        <h2 className="t-h2 lg:col-span-4">Service questions</h2>
        <div className="lg:col-span-8">
          <FaqList faqs={homeFaqs.slice(0, 8)} />
        </div>
      </section>

      <CtaBand location="services_final" />
      <JsonLd data={schemas} />
    </>
  );
}
