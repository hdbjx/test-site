import { GoogleMapsAttribution, LiveReviewCount } from "@/components/GoogleReviewStats";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CurvedTape } from "@/components/CurvedTape";
import { Photo } from "@/components/Photo";
import { TrackedLink } from "@/components/TrackedLink";
import { site } from "@/data/site";
import { roleLabels, team as fallbackTeam } from "@/data/team";
import { getPublicTeamRoster } from "@/lib/team-roster";
import { pageMetadata } from "@/lib/seo";
import styles from "./about.module.css";

export const metadata = pageMetadata({
  title: "About Every Detail | Student-Run Detailing in Decatur",
  description: "Every Detail started in eighth grade with one driveway job. Meet the student crew, the rigs and the process behind Decatur's mobile detailing team.",
  path: "/about-us",
  image: "about-team",
});

// Roster comes from active staff in the app database (public.profiles); refreshed every 5 minutes.
export const revalidate = 300;

const TEAM_ANCHOR = "team"; // id="team": linked from /our-work

const story = [
  {
    step: "01",
    title: "One driveway job",
    body: "Every Detail started in eighth grade with one driveway job. The name was the standard: door jambs, carpet edges, switches, wheels. Every detail.",
  },
  {
    step: "02",
    title: "Then a crew",
    body: "The bookings outgrew one person. Students joined, learned the process in-house and earned more responsibility as their work got more consistent.",
  },
  {
    step: "03",
    title: "Two rigs",
    body: "A van and a trailer, both electric, set up to carry their own power and water. Nothing gets borrowed from your house.",
  },
  {
    step: "04",
    title: "Reviews + recognition",
    body: "Five-star Google reviews from customers across Decatur and Atlanta, and Best of Decaturish in 2025.",
  },
] as const;

const process = [
  {
    n: "01",
    title: "Trained in tiers",
    body: "Technicians start at Tier 1 and move up to Tier 3 through hands-on training and an 83-module training program. Nobody leads a job before they've earned it.",
    photo: "two-tech-interior-detail",
  },
  {
    n: "02",
    title: "Rigs that carry everything",
    body: "Each rig is organized so every tool and product has a place. Electric power and water ride along, so we can set up in any driveway.",
    photo: "mobile-rig-open-job",
  },
  {
    n: "03",
    title: "Checked on the iPad",
    body: "Every job runs off a checklist on the van iPad: the vehicle profile, each step of the service and photos before the final walk-around.",
    photo: "work-will-0920",
  },
] as const;

export default async function AboutPage() {
  const live = await getPublicTeamRoster();
  // If the database is unreachable, show the last hand-kept roster instead of an empty section.
  const team = live.length
    ? live.map((member) => ({ id: member.id, name: member.name, title: member.title, lead: member.leadership }))
    : fallbackTeam.map((member, index) => ({
        id: `${member.name}-${index}`,
        name: member.name,
        title: roleLabels[member.role],
        lead: ["owner", "manager", "marketing"].includes(member.role),
      }));
  const leads = team.filter((member) => member.lead);
  const crew = team.filter((member) => !member.lead);

  return (
    <main className={styles.page}>
      {/* Hero: the whole team with the rigs, and the origin in one line. */}
      <section className={styles.hero} data-header-tone="light" aria-labelledby="ab-hero-title">
        <div className={styles.heroPhoto}><Photo id="about-team" sizes="100vw" fill priority /></div>
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={styles.crumbs}><Breadcrumbs items={[{ name: "About Us", path: "/about-us" }]} /></div>
          <p className={styles.kicker}>Every Detail / Decatur, Georgia</p>
          <h1 id="ab-hero-title" className={styles.heroTitle}>
            <span>Started in</span>
            <span>eighth grade.</span>
          </h1>
          <p className={styles.heroLede}>One driveway job turned into a student crew running two fully loaded rigs across Decatur and Atlanta. Built by students, run for real.</p>
          <div className={styles.heroActions}>
            <TrackedLink href="/book" event="book_click" params={{ location: "about_hero" }} className={styles.heroCta}>BOOK A DETAIL <span aria-hidden="true">↗</span></TrackedLink>
            <a href={`#${TEAM_ANCHOR}`} className={styles.heroLink}>MEET THE CREW <span aria-hidden="true">↓</span></a>
          </div>
          <dl className={styles.heroFacts}>
            <div><dt>Five-star reviews</dt><dd><LiveReviewCount /></dd></div>
            {team.length ? <div><dt>On the crew</dt><dd>{team.length}</dd></div> : null}
            <div><dt>Electric rigs</dt><dd>2</dd></div>
            <div><dt>{site.award.short}</dt><dd>{site.award.year}</dd></div>
          </dl>
          <p className={styles.attribution}><GoogleMapsAttribution /></p>
        </div>
      </section>

      <CurvedTape text="BUILT BY STUDENTS • RUN FOR REAL • EST. 8TH GRADE • DECATUR, GA • " label="Every Detail origin" />

      {/* Founder story as a timeline. */}
      <section className={styles.story} data-header-tone="ink" aria-labelledby="ab-story-title">
        <div className={`${styles.shell} ${styles.storyGrid}`}>
          <div className={styles.storyAside}>
            <p className={styles.kickerDark}>The story</p>
            <h2 id="ab-story-title" className={styles.sectionTitle}>
              <span>One driveway.</span>
              <span>Then two rigs.</span>
            </h2>
            <figure className={styles.storyPhoto}>
              <Photo id="about-founder" ratio="4/5" sizes="(max-width: 900px) 70vw, 32vw" />
              <figcaption>On site / Decatur</figcaption>
            </figure>
          </div>

          <ol className={styles.timeline}>
            {story.map((item) => (
              <li key={item.step}>
                <span className={styles.step}>{item.step}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  {item.step === "04" ? (
                    <p className={styles.timelineStat}><strong><LiveReviewCount /></strong> five-star reviews</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* The crew: live roster from the app database. */}
      <section id={TEAM_ANCHOR} className={styles.team} data-header-tone="light" aria-labelledby="ab-team-title">
        <div className={styles.shell}>
          <div className={styles.teamHead}>
            <div>
              <p className={styles.kicker}>The crew</p>
              <h2 id="ab-team-title" className={styles.sectionTitle}>
                <span>Real names.</span>
                <span>Real responsibility.</span>
              </h2>
            </div>
            <p className={styles.teamNote}>Detailing, scheduling, training and marketing are all handled by students. These are the people who show up in your driveway.</p>
          </div>

          {team.length ? (
            <div className={styles.rosterWrap}>
              {leads.length ? (
                <div>
                  <p className={styles.groupLabel}>Running the business</p>
                  <ul className={`${styles.roster} ${styles.rosterLead}`}>
                    {leads.map((member) => (
                      <li key={member.id}><strong>{member.name}</strong><span>{member.title}</span></li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {crew.length ? (
                <div>
                  <p className={styles.groupLabel}>In the driveway</p>
                  <ul className={styles.roster}>
                    {crew.map((member) => (
                      <li key={member.id}><strong>{member.name}</strong><span>{member.title}</span></li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : (
            <p className={styles.teamNote}>Team roster is temporarily unavailable.</p>
          )}

          <figure className={styles.teamPhoto}>
            <Photo id="hq-mobile-rig-fleet" ratio="16/7" sizes="(max-width: 1240px) 94vw, 1200px" />
          </figure>
        </div>
      </section>

      {/* How the business runs day to day. */}
      <section className={styles.process} data-header-tone="light" aria-labelledby="ab-process-title">
        <div className={styles.shell}>
          <div className={styles.processHead}>
            <p className={styles.kicker}>How we run it</p>
            <h2 id="ab-process-title" className={styles.sectionTitle}>
              <span>Student-run.</span>
              <span>Not student-grade.</span>
            </h2>
          </div>

          <div className={styles.processGrid}>
            {process.map((item) => (
              <article key={item.n} className={styles.processCard}>
                <div className={styles.processPhoto}><Photo id={item.photo} fill sizes="(max-width: 900px) 92vw, 31vw" /></div>
                <div className={styles.processBody}>
                  <span className={styles.processNum}>{item.n}</span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </article>
            ))}
          </div>

          <figure className={styles.honest}>
            <p className={styles.honestLabel}>04 / Honest scope</p>
            <blockquote>“…before they were done Wiley came to me and being totally transparent said my car didn&apos;t need the premium detail and they would only charge me for the maintenance detail with the sealant thrown in.”</blockquote>
            <figcaption>Vincent M. / Google review</figcaption>
          </figure>
        </div>
      </section>

      <section className={styles.close} data-header-tone="brand" aria-labelledby="ab-close-title">
        <div className={`${styles.shell} ${styles.closeGrid}`}>
          <h2 id="ab-close-title" className={styles.closeTitle}>
            <span>More cars.</span>
            <span>More students.</span>
            <span>Same standard.</span>
          </h2>
          <div>
            <p>Book the crew for your car. Or, if you&apos;re a student who wants real responsibility and is ready to learn, reach out.</p>
            <div className={styles.closeActions}>
              <TrackedLink href="/book" event="book_click" params={{ location: "about_final" }} className={styles.heroCta}>BOOK A DETAIL <span aria-hidden="true">↗</span></TrackedLink>
              <TrackedLink href={`mailto:${site.email}?subject=Joining%20the%20Every%20Detail%20team`} event="hiring_click" params={{ location: "about_hiring" }} className={styles.heroLink}>JOIN THE TEAM <span aria-hidden="true">↗</span></TrackedLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
