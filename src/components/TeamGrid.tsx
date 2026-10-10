import { roleLabels, type TeamMember } from "@/data/team";
import { Photo } from "./Photo";

export function TeamGrid({ members }: { members: TeamMember[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {members.map((m) => (
        <li key={m.name}>
          {m.photo ? (
            <Photo id={m.photo} alt={`${m.name}, ${roleLabels[m.role]}`} ratio="4/5" sizes="(min-width: 1024px) 22vw, 45vw" className="rounded-[var(--radius-photo)]" />
          ) : (
            <div aria-hidden="true" className="flex aspect-[4/5] items-end rounded-[var(--radius-photo)] bg-sand p-4">
              <span className="t-numeral text-[4.5rem] text-oxblood/80">{m.name.slice(0, 1)}</span>
            </div>
          )}
          <p className="mt-3 font-display text-lg font-semibold leading-tight">{m.name}</p>
          <p className="text-sm text-muted">{roleLabels[m.role]}</p>
        </li>
      ))}
    </ul>
  );
}
