import { CtaBand } from "@/components/CtaBand";
import { PageHeader } from "@/components/PageHeader";
import { Photo } from "@/components/Photo";
import { ReviewGrid } from "@/components/ReviewGrid";
import { RowList } from "@/components/RowList";
import { TeamGrid } from "@/components/TeamGrid";
import { TrackedLink } from "@/components/TrackedLink";
import { WorkGallery } from "@/components/WorkGallery";
import { areas } from "@/data/areas";
import { reviewCountLabel, site } from "@/data/site";
import { leadership, team, technicians } from "@/data/team";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About Every Detail | Student-Run Mobile Detailing in Decatur, GA",
  description:
    "Every Detail is a student-run mobile detailing company from Decatur, GA. Meet the team, how we train, and the standards behind every car.",
  path: "/about-us",
  image: "about-team",
});

const standards = [
  {
    title: "Training",
    body: "Technicians progress through three tiers of training. Responsibility grows as skill is proven on real cars.",
  },
  {
    title: "Systems",
    body: "Checklists, scheduling, client notes and follow-up run on tools we built ourselves, so every job runs the same way.",
  },
  {
    title: "Equipment",
    body: "Two fully equipped rigs with our own power, water and professional products. We don't borrow your hose or outlet.",
  },
  {
    title: "Reviews",
    body: `${reviewCountLabel} five-star Google reviews. Read them before you book; we want you to.`,
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ name: "About", path: "/about-us" }]}
        title="Student-run. Professionally detailed."
        lede={
          <p>
            Every Detail is a mobile detailing company started and run by students in Decatur, Georgia. Here&rsquo;s how
            it began, how we train, and who&rsquo;ll be working on your car.
          </p>
        }
        aside={<Photo id="about-team" priority ratio="4/3" sizes="(min-width: 1024px) 45vw, 100vw" className="rounded-[var(--radius-photo)]" />}
      />

      {/* Story */}
      <section className="border-t border-line bg-paper2 py-16 md:py-24">
        <div className="container-ed grid gap-10 lg:grid-cols-12">
          <h2 className="t-h2 lg:col-span-4">How it started</h2>
          <div className="space-y-5 text-lg text-ink/85 lg:col-span-7 lg:col-start-6">
            <p>
              Every Detail started as a small student project with one goal: bring a higher standard of care to car
              detailing. The name came from how we approach the work, by focusing on the things most people miss. The
              crumbs in the cupholder seams. The shine on the tires.
            </p>
            <p>
              What began with one person and a set of supplies has grown into a full mobile service with a team of{" "}
              {team.length}, two rigs, a recurring membership, and clients across {areas.slice(0, 4).map((a) => a.name).join(", ")}{" "}
              and the rest of our service area.
            </p>
            <p>
              In 2025, Decatur readers named us {site.award.title.replace(" 2025", "")}. We&rsquo;ve earned {reviewCountLabel}{" "}
              five-star Google reviews, one car at a time.
            </p>
          </div>
        </div>
      </section>

      {/* Standards */}
      <section className="container-ed py-16 md:py-24">
        <h2 className="t-h2 max-w-4xl">How a student-run company stays professional</h2>
        <div className="mt-10">
          <RowList items={standards} />
        </div>
      </section>

      {/* Founder */}
      <section className="border-t border-line bg-paper2 py-16 md:py-24">
        <div className="container-ed grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-3">
            <p className="eyebrow">Founder</p>
            <p className="mt-3 font-display text-3xl font-semibold">Wiley</p>
            <p className="mt-1 text-muted">Founder &amp; owner</p>
          </div>
          <figure className="lg:col-span-8 lg:col-start-5">
            <blockquote className="font-display text-2xl font-medium leading-snug tracking-tight md:text-3xl">
              <p>
                &ldquo;I believe every vehicle deserves professional-level attention, and every customer should drive away
                feeling proud of their car.&rdquo;
              </p>
            </blockquote>
            <figcaption className="mt-6">
              <span className="font-display font-semibold">Wiley</span>
              <span className="text-muted">, founder and owner</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="container-ed scroll-mt-24 py-16 md:py-24">
        <h2 className="t-h2">The team</h2>
        <p className="mt-4 max-w-2xl text-lg text-ink/80">The people running the business and the technicians on your car.</p>
        <h3 className="mt-12 font-display text-xl font-semibold">Leadership</h3>
        <div className="mt-6">
          <TeamGrid members={leadership} />
        </div>
        <h3 className="mt-16 font-display text-xl font-semibold">Technicians</h3>
        <p className="mt-2 max-w-2xl text-ink/75">Tier 3 technicians are our most experienced. Every technician trains up through the tiers.</p>
        <div className="mt-6">
          <TeamGrid members={technicians} />
        </div>
      </section>

      <section className="border-t border-line bg-paper2 py-16 md:py-24">
        <div className="container-ed">
          <p className="eyebrow">On the job</p>
          <h2 className="t-h2 mt-3 mb-8">Built in driveways around Decatur</h2>
          <WorkGallery ids={["about-ops-01", "about-ops-02", "about-ops-03", "about-ops-04", "about-ops-05", "about-ops-06"]} />
        </div>
      </section>

      <section className="border-t border-line bg-paper2 py-16 md:py-24">
        <div className="container-ed">
          <ReviewGrid />
        </div>
      </section>

      <section className="container-ed flex flex-col items-start gap-4 py-12 md:flex-row md:items-center md:justify-between">
        <p className="text-lg">Want to work with us? We hire students who care about doing things right.</p>
        <TrackedLink href={`mailto:${site.email}?subject=Joining%20the%20team`} event="phone_click" params={{ location: "about_hiring" }} className="link font-display font-semibold">
          Email {site.email}
        </TrackedLink>
      </section>

      <CtaBand location="about_final" />
    </>
  );
}
