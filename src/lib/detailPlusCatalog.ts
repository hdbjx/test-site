import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase/config";
import { staticDetailPlusCatalog, type DetailPlusCatalog } from "@/lib/detailPlusPricing";

/**
 * Server-only: the live Detail+ price sheet from Supabase, refreshed every
 * five minutes. Falls back to the copy in src/data/detailplus.ts so the page
 * still works if the database is unreachable or the migration hasn't run.
 */
export async function getDetailPlusCatalog(): Promise<DetailPlusCatalog> {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return staticDetailPlusCatalog;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/detail_plus_catalog`, {
      method: "POST",
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY, "Content-Type": "application/json" },
      body: "{}",
      next: { revalidate: 300, tags: ["detail-plus-catalog"] },
    });
    if (!res.ok) return staticDetailPlusCatalog;
    const data = (await res.json()) as Partial<DetailPlusCatalog> | null;
    if (!data || !Array.isArray(data.tasks) || !data.tasks.length || !Array.isArray(data.rhythms) || !data.rhythms.length) return staticDetailPlusCatalog;
    return {
      minimum: Number(data.minimum ?? staticDetailPlusCatalog.minimum),
      vehicleOrder: (data.vehicleOrder?.length ? data.vehicleOrder : staticDetailPlusCatalog.vehicleOrder) as DetailPlusCatalog["vehicleOrder"],
      tasks: data.tasks.map((task) => ({ ...task, prices: task.prices.map(Number) })),
      groups: data.groups?.length ? data.groups : staticDetailPlusCatalog.groups,
      rhythms: data.rhythms.map((rhythm) => ({ ...rhythm, weeks: Number(rhythm.weeks), discount: Number(rhythm.discount) })),
      presets: data.presets?.length ? data.presets : staticDetailPlusCatalog.presets,
    };
  } catch {
    return staticDetailPlusCatalog;
  }
}
