import fs from "node:fs";
import path from "node:path";

const file = path.resolve("src/data/recommenderVehicles.ts");
const source = fs.readFileSync(file, "utf8");
const rows = [...source.matchAll(/\{ make: "([^"]+)", model: "([^"]+)", vehicle: "([^"]+)" \}/g)]
  .map((match) => ({ make: match[1], model: match[2], vehicle: match[3] }));

const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const seen = new Map();
const duplicates = [];
const conflicts = [];
for (const row of rows) {
  const key = `${normalize(row.make)}::${normalize(row.model)}`;
  const prior = seen.get(key);
  if (!prior) {
    seen.set(key, row);
    continue;
  }
  duplicates.push([prior, row]);
  if (prior.vehicle !== row.vehicle) conflicts.push([prior, row]);
}

if (duplicates.length || conflicts.length) {
  console.error(`Vehicle catalog QA failed: ${duplicates.length} duplicate(s), ${conflicts.length} pricing conflict(s).`);
  for (const [a, b] of conflicts) console.error(`Conflict: ${a.make} ${a.model} -> ${a.vehicle} / ${b.vehicle}`);
  for (const [a, b] of duplicates.filter(([a,b]) => a.vehicle === b.vehicle).slice(0, 20)) console.error(`Duplicate: ${a.make} ${a.model}`);
  process.exit(1);
}

if (rows.length < 1300) {
  console.error(`Vehicle catalog QA failed: expected at least 1300 entries, found ${rows.length}.`);
  process.exit(1);
}

console.log(`Vehicle catalog QA passed: ${rows.length} unique entries.`);
