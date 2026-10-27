import { detailPlusMinimum, detailPlusTasks, detailPlusVehicleOrder, frequencies } from "@/data/detailplus";
import type { VehicleId } from "@/data/services";

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

export function detailPlusTaskPrice(taskId: string, vehicle: VehicleId) {
  const task = detailPlusTasks.find((item) => item.id === taskId);
  const index = detailPlusVehicleOrder.indexOf(vehicle);
  if (!task || index < 0) return 0;
  return task.prices[index];
}

/** Pure price calculation, shared by the browser and the lead route so they always agree. */
export function quoteDetailPlus(vehicle: VehicleId, frequencyId: string, taskIds: string[]): DetailPlusQuote | null {
  const frequency = frequencies.find((item) => item.id === frequencyId);
  if (!frequency || !detailPlusVehicleOrder.includes(vehicle)) return null;
  const known = new Set(detailPlusTasks.map((task) => task.id));
  const ids = Array.from(new Set(taskIds)).filter((id) => known.has(id));
  if (!ids.length) return null;
  const subtotal = ids.reduce((sum, id) => sum + detailPlusTaskPrice(id, vehicle), 0);
  const discounted = Math.round((subtotal * (1 - frequency.discount)) / 5) * 5;
  const perVisit = Math.max(detailPlusMinimum, discounted);
  return {
    taskIds: ids,
    subtotal,
    discountPct: Math.round(frequency.discount * 100),
    discount: Math.max(0, subtotal - perVisit),
    perVisit,
    minimumApplied: discounted < detailPlusMinimum,
    weeks: frequency.weeks,
    visitsPer13Weeks: Math.max(1, Math.floor(13 / frequency.weeks)),
  };
}
