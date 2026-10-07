import { CtaBand } from "@/components/CtaBand";
import { GoogleMapsAttribution, LiveReviewCount } from "@/components/GoogleReviewStats";
import { Photo } from "@/components/Photo";
import { TrackedLink } from "@/components/TrackedLink";
import { site } from "@/data/site";
import { team } from "@/data/team";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About Every Detail | Student-Run Mobile Detailing in Decatur, GA",
  description:
    "The story behind Every Detail, a student-run mobile detailing company built in Decatur, Georgia.",
  path: "/about-us",
});

const standards = [
  ["01", "Train before touching client cars", "Technicians work through a tiered training system. More responsibility comes with demonstrated skill, consistency and attention to detail."],
  ["02", "Follow the same process", "Our job checklists, quality checks and operating procedures keep the standard consistent, no matter which technicians are on the driveway."],
  ["03", "Bring the shop with us", "Our mobile rigs arrive with power, water, professional equipment and products. The client should not have to supply the setup."],
  ["04", "Finish with accountability", "Every job is checked before we leave. Reviews, client feedback and repeat business are part of how we measure whether the system is actually working."],
];

const milestones = [
  ["8TH GRADE", "The beginning", "Every Detail started at the end of 8th grade with a small set of supplies and a simple idea: take the details more seriously."],
  ["THE TEAM", "One person became a crew", `The company grew into a student team of ${team.length}, with training tiers, managers and systems built around doing the work consistently.`],
  ["2025", site.award.short, "Decatur readers recognized Every Detail for car cleaning, a milestone that meant a lot for a company built in the community."],
  ["TODAY", "__LIVE_REVIEWS__", "Two mobile rigs, recurring clients and a growing operation, while keeping the student-run model at the center of the company."],
];

export default function AboutPage() {
  return (
    <main className="about-v2">
      <section className="about-v2-hero">
        <div className="about-v2-shell about-v2-hero-grid">
          <div className="about-v2-hero-copy">
            <p className="about-v2-kicker">ABOUT EVERY DETAIL / DECATUR, GA</p>
            <h1>Started in 8th grade.<br/><span>Built into something real.</span></h1>
            <p className="about-v2-lede">Every Detail is a student-run mobile detailing company from Decatur. What started as one student cleaning cars has grown into a trained team, two mobile rigs and a company built around doing the small things right.</p>
          </div>
          <div className="about-v2-hero-photo">
            <Photo id="about-team" priority ratio="3/2" sizes="(min-width: 900px) 48vw, 92vw" />
            <div className="about-v2-photo-tag">THE CREW / DECATUR, GA</div>
          </div>
        </div>
      </section>

      <section className="about-v2-origin">
        <div className="about-v2-shell about-v2-origin-grid">
          <div>
            <p className="about-v2-kicker">HOW IT STARTED</p>
            <h2>It was never supposed to feel like <span>just a car wash.</span></h2>
          </div>
          <div className="about-v2-story-copy">
            <p className="about-v2-story-lead">Every Detail began with a simple obsession: notice what other people miss.</p>
            <p>At first, that meant the crumbs buried in seams, the dirt around switches, the door jambs and the little areas that change how clean a car actually feels. The name came from that approach.</p>
            <p>As more people trusted us with their cars, the challenge changed. It was no longer just about learning how to detail well. We had to figure out how to teach other students, schedule jobs, build mobile rigs, communicate with clients and make the quality repeatable.</p>
            <p>That is what Every Detail is now: still student-run, but supported by real training, systems and standards.</p>
          </div>
        </div>
      </section>

      <section className="about-v2-proof">
        <div className="about-v2-shell about-v2-proof-grid">
          <div><strong><LiveReviewCount /></strong><span>FIVE-STAR REVIEWS · <GoogleMapsAttribution /></span></div>
          <div><strong>2</strong><span>100% ELECTRIC MOBILE RIGS</span></div>
          <div><strong>{team.length}</strong><span>STUDENTS ON THE TEAM</span></div>
          <div><strong>2025</strong><span>BEST OF DECATURISH</span></div>
        </div>
      </section>

      <section className="about-v2-student">
        <div className="about-v2-shell">
          <div className="about-v2-section-head">
            <p className="about-v2-kicker">STUDENT-RUN, ON PURPOSE</p>
            <h2>Being students is part of the story.<br/><span>The standard still has to hold.</span></h2>
            <p>We know “student-run” can create a question before it creates confidence. So we built the company to answer that question through the way the work is done.</p>
          </div>
          <div className="about-v2-standards">
            {standards.map(([n,title,body]) => (
              <article key={n}>
                <span className="about-v2-num">{n}</span>
                <div><h3>{title}</h3><p>{body}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-v2-work">
        <div className="about-v2-shell">
          <div className="about-v2-work-head">
            <div><p className="about-v2-kicker">WHAT IT LOOKS LIKE NOW</p><h2>Built in driveways<br/><span>around Decatur.</span></h2></div>
            <p>The company grew, but the work still happens the same place it started: outside somebody&rsquo;s house, with a team that has to earn the result one car at a time.</p>
          </div>
          <div className="about-v2-work-grid">
            <figure className="about-v2-work-wide"><Photo id="two-tech-interior-detail" ratio="3/2" sizes="(min-width: 900px) 60vw, 92vw"/><figcaption>THE TEAM / INSIDE THE CAR</figcaption></figure>
            <figure><Photo id="mobile-rig-open-driveway" ratio="4/5" sizes="(min-width: 900px) 30vw, 92vw"/><figcaption>THE RIG / BUILT TO BE MOBILE</figcaption></figure>
            <figure><Photo id="rear-seat-detail" ratio="3/2" sizes="(min-width: 900px) 45vw, 92vw"/><figcaption>THE WORK / SEAT BY SEAT</figcaption></figure>
            <figure><Photo id="classic-car-cockpit" ratio="3/2" sizes="(min-width: 900px) 45vw, 92vw"/><figcaption>THE RESULT / CLEAN THROUGHOUT</figcaption></figure>
          </div>
        </div>
      </section>

      <section className="about-v2-timeline">
        <div className="about-v2-shell">
          <p className="about-v2-kicker">THE STORY SO FAR</p>
          <h2>Still building.</h2>
          <div className="about-v2-milestones">
            {milestones.map(([year,title,body]) => <article key={year}><span>{year}</span><h3>{title === "__LIVE_REVIEWS__" ? <><LiveReviewCount /> five-star reviews <GoogleMapsAttribution /></> : title}</h3><p>{body}</p></article>)}
          </div>
        </div>
      </section>

      <section className="about-v2-belief">
        <div className="about-v2-shell about-v2-belief-grid">
          <p className="about-v2-kicker">WHAT WE CARE ABOUT</p>
          <blockquote>“The goal is not to look impressive because we&rsquo;re students. <span>The goal is to do work that&rsquo;s impressive, period.</span>”</blockquote>
        </div>
      </section>

      <section className="about-v2-join">
        <div className="about-v2-shell about-v2-join-grid">
          <div><p className="about-v2-kicker">JOIN THE TEAM</p><h2>Learn to do things <span>the right way.</span></h2></div>
          <div><p>We hire students who care about the work, can take feedback and want real responsibility. Experience helps, but willingness to learn matters more.</p><TrackedLink href={`mailto:${site.email}?subject=Joining%20the%20team`} event="phone_click" params={{location:"about_hiring"}} className="about-v2-button">Email {site.email} ↗</TrackedLink></div>
        </div>
      </section>

      <CtaBand location="about_final" />
    </main>
  );
}
