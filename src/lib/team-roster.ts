import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";

export type PublicTeamMember = {
  id: string;
  name: string;
  title: string;
  leadership: boolean;
};

const PUBLIC_TITLE_OVERRIDES: Record<string, string> = {
  wiley: "Founder & Owner",
  davis: "Business Manager",
  grady: "Operations Manager",
  skylar: "Social Media Director",
};

function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] || fullName.trim();
}

function publicTitle(fullName: string, role: string | null, canLeadJobs: boolean | null) {
  const first = firstName(fullName).toLowerCase();
  if (PUBLIC_TITLE_OVERRIDES[first]) return PUBLIC_TITLE_OVERRIDES[first];

  const normalizedRole = String(role || "").trim().toLowerCase();
  if (["owner", "founder"].includes(normalizedRole)) return "Founder & Owner";
  if (["manager", "admin", "leadership"].includes(normalizedRole)) return "Leadership";
  if (canLeadJobs) return "Lead Technician";
  return "Technician";
}

function isLeadership(title: string) {
  return /owner|manager|leadership|director/i.test(title);
}

export async function getPublicTeamRoster(): Promise<PublicTeamMember[]> {
  try {
    const db = supabaseAdmin();
    const { data, error } = await db
      .from("profiles")
      .select("id,full_name,role,active,can_lead_jobs")
      .eq("active", true)
      .order("full_name", { ascending: true });

    if (error) throw error;

    const roster = (data || [])
      .filter((row) => typeof row.full_name === "string" && row.full_name.trim())
      .map((row) => {
        const name = firstName(row.full_name as string);
        const title = publicTitle(row.full_name as string, row.role as string | null, row.can_lead_jobs as boolean | null);
        return {
          id: String(row.id),
          name,
          title,
          leadership: isLeadership(title),
        };
      });

    return roster.sort((a, b) => {
      if (a.leadership !== b.leadership) return a.leadership ? -1 : 1;
      const rank = (name: string) => ({ Wiley: 0, Davis: 1, Grady: 2 }[name] ?? 99);
      const rankDiff = rank(a.name) - rank(b.name);
      return rankDiff || a.name.localeCompare(b.name);
    });
  } catch (error) {
    console.error("Unable to load public team roster", error);
    return [];
  }
}
