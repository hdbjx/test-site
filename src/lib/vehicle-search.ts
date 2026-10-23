import { recommenderVehicles, type RecommenderVehicle } from "@/data/recommenderVehicles";
import type { VehicleId } from "@/data/services";

const MAKE_ALIASES: Record<string, string> = {
  chevy: "chevrolet",
  benz: "mercedes benz",
  mercedes: "mercedes",
  merc: "mercedes benz",
  vw: "volkswagen",
  range: "land rover range",
  landrover: "land rover",
  caddy: "cadillac",
  beemer: "bmw",
  bimmer: "bmw",
  ram: "ram",
};

export function normalizeVehicleQuery(value: string) {
  const cleaned = value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const parts = cleaned.split(" ").filter(Boolean);
  if (!parts.length) return "";
  const first = MAKE_ALIASES[parts[0]];
  return first ? [first, ...parts.slice(1)].join(" ") : cleaned;
}

export function yearFromVehicleQuery(query: string) {
  const raw = query.match(/\b((?:19|20)\d{2})\b/)?.[1] ?? "";
  if (!raw) return "";
  const value = Number(raw);
  const max = new Date().getFullYear() + 1;
  return value >= 1980 && value <= max ? raw : "";
}

/**
 * A small set of generation-sensitive pricing exceptions. Most catalog entries
 * use one class across generations. Keep exceptions explicit instead of adding
 * duplicate make/model rows with conflicting classes.
 */
export function vehicleClassForYear(item: RecommenderVehicle, year?: string): VehicleId {
  const y = year ? Number(year) : NaN;
  if (item.make.toLowerCase() === "chevrolet" && item.model.toLowerCase() === "trailblazer" && Number.isFinite(y) && y >= 2002 && y <= 2009) {
    return "largeSUV";
  }
  return item.vehicle;
}

export function vehicleMatches(query: string, limit = 12): RecommenderVehicle[] {
  const withoutYear = query.replace(/\b(?:19|20)\d{2}\b/g, "");
  const q = normalizeVehicleQuery(withoutYear);
  if (q.length < 2) return [];
  const tokens = q.split(" ").filter(Boolean);

  return recommenderVehicles
    .map((item) => {
      const full = normalizeVehicleQuery(`${item.make} ${item.model}`);
      const model = normalizeVehicleQuery(item.model);
      const make = normalizeVehicleQuery(item.make);
      let score = 0;
      if (full === q) score += 120;
      if (full.startsWith(q)) score += 60;
      if (model === q) score += 50;
      if (model.startsWith(q)) score += 35;
      if (make === q) score += 25;
      if (tokens.every((token) => full.includes(token))) score += 20;
      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.item.make.localeCompare(b.item.make) || a.item.model.localeCompare(b.item.model))
    .slice(0, limit)
    .map((entry) => entry.item);
}
