import { detailPlusGroups, detailPlusMinimum, detailPlusPresets, detailPlusTasks, detailPlusVehicleOrder, frequencies, type DetailPlusTaskGroup } from "@/data/detailplus";
import type { VehicleId } from "@/data/services";

/**
 * The Detail+ price sheet as every app sees it. The live copy lives in Supabase
 * (detail_plus_catalog()) so the website, Team App and Van HQ always agree;
 * src/data/detailplus.ts is the fallback when the database can't be reached.
 */
export type DetailPlusCatalog = {
  minimum: number;
  vehicleOrder: VehicleId[];
  tasks: { id: string; label: string; note: string; group: DetailPlusTaskGroup; prices: number[] }[];
  groups: { id: DetailPlusTaskGroup; label: string }[];
  rhythms: { id: string; label: string; short: string; weeks: number; discount: number; hint: string }[];
  presets: { id: string; label: string; tasks: string[] }[];
};

export const staticDetailPlusCatalog: DetailPlusCatalog = {
  minimum: detailPlusMinimum,
  vehicleOrder: [...detailPlusVehicleOrder],
  tasks: detailPlusTasks.map((task) => ({ ...task, prices: [...task.prices] })),
  groups: [...detailPlusGroups],
  rhythms: frequencies.map((item) => ({ ...item })),
  presets: detailPlusPresets.map((preset) => ({ id: preset.id, label: preset.label, tasks: [...preset.tasks] })),
};

export type DetailPlusQuote = {
  taskIds: string[];
  subtotal: number;
  discountPct: number;
  discount: number;
  /** Per-visit price after discount, rounded to the nearest $5 and never below the minimum. */
  perVisit: number;
  minimumApplied: boolean;
  weeks: number;
  /** Visits across a 13-week stretch, for the monthly feel. */
  visitsPer13Weeks: number;
};

export function detailPlusTaskPrice(taskId: string, vehicle: VehicleId, catalog: DetailPlusCatalog = staticDetailPlusCatalog) {
  const task = catalog.tasks.find((item) => item.id === taskId);
  const index = catalog.vehicleOrder.indexOf(vehicle);
  if (!task || index < 0) return 0;
  return Number(task.prices[index] ?? 0);
}

/**
 * Pure price calculation. Identical to the database's detail_plus_quote(), which
 * the lead route uses as the final word, so what a customer sees is what is saved.
 */
export function quoteDetailPlus(vehicle: VehicleId, frequencyId: string, taskIds: string[], catalog: DetailPlusCatalog = staticDetailPlusCatalog): DetailPlusQuote | null {
  const frequency = catalog.rhythms.find((item) => item.id === frequencyId);
  if (!frequency || !catalog.vehicleOrder.includes(vehicle)) return null;
  const known = new Set(catalog.tasks.map((task) => task.id));
  const order = new Map(catalog.tasks.map((task, index) => [task.id, index]));
  const ids = Array.from(new Set(taskIds)).filter((id) => known.has(id)).sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0));
  if (!ids.length) return null;
  const subtotal = ids.reduce((sum, id) => sum + detailPlusTaskPrice(id, vehicle, catalog), 0);
  const discounted = Math.round((subtotal * (1 - frequency.discount)) / 5) * 5;
  const perVisit = Math.max(catalog.minimum, discounted);
  return {
    taskIds: ids,
    subtotal,
    discountPct: Math.round(frequency.discount * 100),
    discount: Math.max(0, subtotal - perVisit),
    perVisit,
    minimumApplied: discounted < catalog.minimum,
    weeks: frequency.weeks,
    visitsPer13Weeks: Math.max(1, Math.floor(13 / frequency.weeks)),
  };
}
