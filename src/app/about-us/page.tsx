import { GoogleMapsAttribution, LiveReviewCount } from "@/components/GoogleReviewStats";
import { Photo } from "@/components/Photo";
import { TrackedLink } from "@/components/TrackedLink";
import { site } from "@/data/site";
import { pageMetadata } from "@/lib/seo";
import { getPublicTeamRoster } from "@/lib/team-roster";

export const metadata = pageMetadata({ title: "About Every Detail | Student-Run Mobile Detailing in Decatur, GA", description: "Meet Every Detail, the student-run mobile detailing team built in Decatur, Georgia.", path: "/about-us" });
const standards = [
  ["TRAIN", "Technicians earn responsibility through hands-on training and consistent work."],
  ["ARRIVE READY", "Our mobile rigs bring the water, power, tools, and products needed for the job."],
  ["CHECK THE WORK", "Every car gets a final quality check before the team leaves the driveway."],
] as const;
export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const team = await getPublicTeamRoster();
  return (
    <div className="about70 info80-page">
      <section className="about70-hero info80-hero">
        <div className="about70-shell about70-hero-grid">
          <div className="about70-hero-copy">
            <p className="about70-kicker">EVERY DETAIL / DECATUR, GEORGIA</p>
            <h1>BUILT BY<br /><span>STUDENTS.</span><br />RUN FOR REAL.</h1>
            <p className="about70-lede">Every Detail started in eighth grade with one driveway job. Today, a student team runs mobile detailing across Decatur and Atlanta.</p>
            <div className="about70-actions"><TrackedLink href="/book" event="book_click" params={{ location: "about_hero" }} className="about70-primary">BOOK A DETAIL ↗</TrackedLink><a href="#team" className="about70-link">MEET THE TEAM ↓</a></div>
          </div>
          <div className="about70-hero-collage"><figure className="about70-photo about70-photo-main"><Photo id="about-team" priority ratio="4/3" sizes="(min-width: 900px) 48vw, 94vw" /></figure><figure className="about70-photo about70-photo-small"><Photo id="hq-crew-shirt-detail" ratio="4/5" sizes="(min-width: 900px) 18vw, 42vw" /></figure></div>
        </div>
      </section>

      <section className="about70-facts info80-facts"><div className="about70-shell about70-facts-grid"><div><strong><LiveReviewCount /></strong><span>FIVE-STAR REVIEWS · <GoogleMapsAttribution /></span></div><div><strong>{team.length || "0"}</strong><span>ACTIVE TEAM MEMBERS</span></div><div><strong>2</strong><span>MOBILE RIGS</span></div><div><strong>2025</strong><span>BEST OF DECATURISH</span></div></div></section>

      <section className="about70-origin info80-section">
        <div className="about70-shell about70-origin-grid"><div className="about70-origin-title"><p className="about70-kicker">HOW IT STARTED</p><h2>THE NAME WAS<br /><span>THE STANDARD.</span></h2></div><div className="about70-origin-copy"><p className="about70-origin-lead">Every Detail meant exactly that.</p><p>As the company grew, the challenge became making that standard repeatable across a real team, real rigs, and real client schedules.</p></div></div>
        <div className="about70-shell about70-workstrip"><figure><Photo id="about-ops-01" ratio="4/3" sizes="32vw" /></figure><figure><Photo id="two-tech-interior-detail" ratio="4/3" sizes="32vw" /></figure><figure><Photo id="about-ops-05" ratio="4/3" sizes="32vw" /></figure></div>
      </section>

      <section id="team" className="about70-team info80-section"><div className="about70-shell"><div className="info80-heading-row"><div><p className="about70-kicker">THE CREW</p><h2>MEET THE TEAM.</h2></div><p>The students behind the detailing, operations, client experience, and growth of Every Detail.</p></div><div className="about70-team-grid"><figure className="about70-team-image"><Photo id="about-founder" ratio="3/4" sizes="(min-width: 900px) 36vw, 92vw" /></figure><div className="about70-roster">{team.length ? team.map((member, index) => <article key={member.id}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{member.name}</strong><small>{member.title}</small></div></article>) : <p className="about70-empty">Team roster is temporarily unavailable.</p>}</div></div></div></section>

      <section className="about70-standard info80-section"><div className="about70-shell"><div className="info80-heading-row info80-on-dark"><div><p className="about70-kicker">HOW WE WORK</p><h2>THE STANDARD.</h2></div><p>Student-run does not change what the customer should expect from the work.</p></div><div className="about70-standard-grid">{standards.map(([title, body], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}</div><figure className="about70-wide-photo"><Photo id="hq-branded-van-side" ratio="16/7" sizes="94vw" /></figure></div></section>

      <section className="about70-close info80-simple-band"><div className="about70-shell about70-close-grid"><h2>MORE CARS.<br />MORE STUDENTS.<br /><span>SAME STANDARD.</span></h2><div><div className="about70-close-actions"><TrackedLink href="/book" event="book_click" params={{ location: "about_final" }} className="about70-primary">BOOK A DETAIL ↗</TrackedLink><TrackedLink href={`mailto:${site.email}?subject=Joining%20the%20Every%20Detail%20team`} event="phone_click" params={{ location: "about_hiring" }} className="about70-secondary">JOIN THE TEAM ↗</TrackedLink></div></div></div></section>
    </div>
  );
}
