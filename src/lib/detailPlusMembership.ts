import { detailPlusPresets, detailPlusTasks, frequencies } from "@/data/detailplus";
import type { DetailPlusQuote } from "@/lib/detailPlusPricing";
import { supabaseAdmin } from "@/lib/supabase/admin";

type SaveInput = {
  clientId: string;
  frequencyId: string;
  vehicleLabel: string;
  quote: DetailPlusQuote;
  customerNotes?: string;
};

/** Name a plan after a package when its tasks match one exactly, otherwise "Custom". */
export function detailPlusPlanName(taskIds: string[]) {
  const sorted = [...taskIds].sort().join(",");
  const hit = detailPlusPresets.find((preset) => [...preset.tasks].sort().join(",") === sorted);
  return hit ? hit.label.replace(" set", "") : "Custom";
}

/**
 * Saves a website Detail+ plan as a row in detail_plus_memberships so it appears in the
 * team app's Detail+ HQ under "Needs action" (Active, no next detail date yet).
 * Best effort: the customer and owner emails already carry everything, so a failure here
 * is logged and never blocks the submission.
 */
export async function saveDetailPlusMembership({ clientId, frequencyId, vehicleLabel, quote, customerNotes }: SaveInput) {
  const frequency = frequencies.find((item) => item.id === frequencyId);
  if (!frequency) return { saved: false as const, reason: "unknown frequency" };

  const tasks = quote.taskIds.map((id) => {
    const task = detailPlusTasks.find((item) => item.id === id);
    return { id, label: task?.label ?? id };
  });
  const taskLine = tasks.map((task) => task.label).join(", ");
  const base = {
    client_id: clientId,
    vehicle_id: null as string | null,
    status: "Active",
    plan: detailPlusPlanName(quote.taskIds),
    service_price: quote.perVisit,
    frequency: frequency.teamLabel,
    next_detail_date: null as string | null,
    special_requests: customerNotes?.trim() || null,
    legacy_vehicle_text: vehicleLabel || null,
    start_date: new Date().toISOString().slice(0, 10),
    updated_at: new Date().toISOString(),
  };
  const notes = `Website plan request. Confirm with the customer and book the first visit. Quoted $${quote.perVisit}/visit (${frequency.label}). Tasks: ${taskLine}.`;

  const admin = supabaseAdmin();
  // One website plan per client and vehicle text: a re-submit updates it instead of duplicating.
  const existing = await admin
    .from("detail_plus_memberships")
    .select("id")
    .eq("client_id", clientId)
    .is("vehicle_id", null)
    .eq("legacy_vehicle_text", base.legacy_vehicle_text ?? "")
    .eq("source", "website")
    .limit(1);

  const withNewColumns = { ...base, notes, plan_tasks: tasks, source: "website" };
  const attempt = async (row: Record<string, unknown>) =>
    existing.data?.[0]?.id
      ? admin.from("detail_plus_memberships").update(row).eq("id", existing.data[0].id)
      : admin.from("detail_plus_memberships").insert(row);

  let result = await attempt(withNewColumns);
  if (result.error && /column|schema cache/i.test(result.error.message)) {
    // The migration that adds plan_tasks/source has not been run yet: keep the tasks in notes.
    result = await attempt({ ...base, notes });
  }
  if (result.error) throw result.error;
  return { saved: true as const };
}
