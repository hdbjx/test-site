/**
 * Team roster. Update here when people join, leave, or move up a tier.
 * `photo` is an id from src/data/images.ts (optional — initials show without one).
 * First names only on the public site.
 */

export type TeamRole = "owner" | "manager" | "marketing" | "tier3" | "tier2" | "tier1";

export const roleLabels: Record<TeamRole, string> = {
  owner: "Founder & Owner",
  manager: "Business Manager",
  marketing: "Social Media Director",
  tier3: "Tier 3 Technician",
  tier2: "Tier 2 Technician",
  tier1: "Tier 1 Technician",
};

export type TeamMember = { name: string; role: TeamRole; photo?: string };

export const team: TeamMember[] = [
  { name: "Wiley", role: "owner", photo: "about-founder" },
  { name: "Davis", role: "manager" },
  { name: "Skylar", role: "marketing" },
  { name: "Grady", role: "tier3" },
  { name: "Mateo", role: "tier3" },
  { name: "Will", role: "tier2" },
  { name: "Aidan", role: "tier2" },
  { name: "Nathan", role: "tier1" },
  { name: "Thomas", role: "tier1" },
  { name: "Hayes", role: "tier1" },
  { name: "Rex", role: "tier1" },
];

export const leadership = team.filter((m) => ["owner", "manager", "marketing"].includes(m.role));
export const technicians = team.filter((m) => m.role.startsWith("tier"));
