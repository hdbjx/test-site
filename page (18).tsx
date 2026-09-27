import { CtaBand } from "@/components/CtaBand";
import { FaqList } from "@/components/FaqList";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { ReviewGrid } from "@/components/ReviewGrid";
import { RowList } from "@/components/RowList";
import { TrackedLink } from "@/components/TrackedLink";
import { DetailPlusForm } from "@/components/forms/DetailPlusForm";
import { detailPlusBenefits, detailPlusGuarantee, detailPlusSteps, frequencies } from "@/data/detailplus";
import { detailPlusFaqs } from "@/data/faqs";
import { pageMetadata, serviceSchema } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Detail+ Recurring Car Detailing Membership | Every Detail",
  description:
    "Recurring mobile detailing in Decatur and Atlanta. Choose every 2 weeks to quarterly, interior, exterior or both, for one flat rate per visit. No contracts.",
  path: "/detailplus",
});

export default function DetailPlusPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Detail+", path: "/detailplus" }]}
        title={
          <>
            Detail<span className="text-red">+</span>
          </>
        }
        lede={
          <p>
            Recurring detailing for people who&rsquo;d rather keep the car clean than keep scheduling it. Pick how often
            and what gets cleaned. We show up on schedule, for the same flat rate, every visit.
          </p>
        }
      >
        <TrackedLink href="#build" event="detailplus_start" params={{ location: "detailplus_hero" }} className="btn btn-primary">
          Build your plan
        </TrackedLink>
        <a href="#how" className="btn btn-secondary">
          How it works
        </a>
      </PageHeader>

      {/* Who it's for + benefits */}
      <section className="border-t border-line bg-paper2 py-16 md:py-24">
        <div className="container-ed grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="t-h2">Who it&rsquo;s for</h2>
            <p className="mt-5 text-lg text-ink/80">
              People who want the car clean all the time, not just the week after a detail. It works especially well
              for family cars, pet owners and daily commuters.
            </p>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <RowList items={detailPlusBenefits} />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="container-ed scroll-mt-24 py-16 md:py-24">
        <h2 className="t-h2">How it works</h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {detailPlusSteps.map((s, i) => (
            <li key={s.title} className="border-t-2 border-ink pt-5">
              <p className="t-numeral text-5xl text-oxblood">{i + 1}</p>
              <h3 className="mt-3 font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-1 text-ink/75">{s.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 grid gap-6 border-t border-line pt-8 md:grid-cols-2">
          <div>
            <h3 className="font-display font-semibold">Visit frequency</h3>
            <p className="mt-1 text-ink/80">{frequencies.map((f) => f.label).join(", ")}.</p>
          </div>
          <div>
            <h3 className="font-display font-semibold">Pricing</h3>
            <p className="mt-1 text-ink/80">
              A flat per-visit rate, quoted for your vehicle, frequency and coverage. It doesn&rsquo;t change based on how
              dirty the car is that day.
            </p>
          </div>
        </div>
      </section>

      {/* Guarantee */}
      <section className="bg-ink py-16 text-paper md:py-20">
        <div className="container-ed grid gap-6 lg:grid-cols-12 lg:items-center">
          <p className="t-h2 lg:col-span-7">&ldquo;{detailPlusGuarantee}&rdquo;</p>
          <p className="text-lg text-paper/75 lg:col-span-4 lg:col-start-9">
            Whatever your plan covers, interior, exterior or both, gets handled every visit. Spills, stains, crumbs and pet
            hair included. No add-on fees.
          </p>
        </div>
      </section>

      {/* Builder */}
      <section id="build" className="container-ed scroll-mt-24 py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="t-h2">Build your plan</h2>
            <p className="mt-5 text-lg text-ink/80">
              Choose your schedule, coverage and vehicle. We&rsquo;ll send your flat rate and get the first visit on the
              calendar.
            </p>
          </div>
          <div className="lg:col-span-8">
            <DetailPlusForm />
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-paper2 py-16 md:py-24">
        <div className="container-ed">
          <ReviewGrid />
        </div>
      </section>

      <section className="container-ed grid gap-10 py-16 md:py-24 lg:grid-cols-12">
        <h2 className="t-h2 lg:col-span-4">Detail+ questions</h2>
        <div className="lg:col-span-8">
          <FaqList faqs={detailPlusFaqs} />
        </div>
      </section>

      <CtaBand
        location="detailplus_final"
        title="Rather start with one detail?"
        body="Book a one-time detail first and see the work. You can join Detail+ anytime after."
      />
      <JsonLd
        data={serviceSchema({
          name: "Detail+ recurring detailing membership",
          description: "Recurring mobile car detailing on a set schedule for one flat rate per visit.",
          path: "/detailplus",
        })}
      />
    </>
  );
}
