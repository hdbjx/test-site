import Image from "next/image";
import Link from "next/link";
import { roleLabels, team as fallbackTeam, teamPhoto } from "@/data/team";
import { getPublicTeamRoster } from "@/lib/team-roster";

/**
 * "Your crew" polaroid strip for the places people decide to book. Answers the
 * student-run question next to the price instead of only on About. Uses the live
 * roster (same source as About) and falls back to the hand-kept list. Only people
 * with a headshot appear, so the strip never shows empty frames.
 */
export async function CrewStrip({ tone = "ink", max = 6 }: { tone?: "ink" | "paper"; max?: number }) {
  const live = await getPublicTeamRoster();
  const roster = live.length
    ? live.map((m) => ({ name: m.name, title: m.title }))
    : fallbackTeam.map((m) => ({ name: m.name, title: roleLabels[m.role] }));
  // Social/marketing roles don't come to the driveway.
  const crew = roster
    .filter((m) => !/social|marketing/i.test(m.title))
    .map((m) => ({ ...m, photo: teamPhoto(m.name) }))
    .filter((m): m is { name: string; title: string; photo: string } => Boolean(m.photo))
    .slice(0, max);

  if (crew.length < 2) return null;

  return (
    <aside className={`ed-crew ed-crew-${tone}`} aria-label="Who shows up">
      <p className="ed-crew-kicker">Who shows up</p>
      <ul className="ed-crew-list">
        {crew.map((m, i) => (
          <li key={m.name} className="ed-crew-card" style={{ ["--tilt" as string]: `${i % 2 ? 2 : -2}deg` }}>
            <span className="ed-crew-photo">
              <Image src={m.photo} alt="" fill sizes="96px" />
            </span>
            <strong>{m.name}</strong>
            <small>{m.title}</small>
          </li>
        ))}
      </ul>
      <p className="ed-crew-note">
        Every Detail&rsquo;s own crew, trained in-house tier by tier. <Link href="/about-us#team">Meet the team ↗</Link>
      </p>
    </aside>
  );
}
