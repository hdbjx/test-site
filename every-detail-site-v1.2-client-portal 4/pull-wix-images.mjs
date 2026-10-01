#!/usr/bin/env node
/**
 * One-time migration: downloads original photos + logo from the old Wix media
 * library into /public so the new site doesn't depend on Wix.
 *
 *   npm run images:pull
 *
 * Reads the `file` / `wix` pairs from src/data/images.ts. Safe to re-run (skips existing files).
 */
import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const src = await fs.readFile(path.join(root, "src/data/images.ts"), "utf8");

const jobs = [...src.matchAll(/file:\s*"([^"]+)",\s*wix:\s*"([^"]+)"/g)].map(([, file, wix]) => ({
  out: path.join(root, "public", file),
  url: `https://static.wixstatic.com/media/${wix}`,
}));

// Logo files: same crops the Wix site used.
jobs.push(
  {
    out: path.join(root, "public/brand/every-detail-mark.png"),
    url: "https://static.wixstatic.com/media/01523f_7ba3b18cfb9942999add0e63504c9919~mv2.png/v1/crop/x_0,y_778,w_2737,h_2232/fill/w_520,h_424,al_c/every-detail-mark.png",
  },
  {
    out: path.join(root, "public/brand/every-detail-logo.png"),
    url: "https://static.wixstatic.com/media/01523f_4071df5486e54b70bc77c57d355ce613~mv2.png/v1/crop/x_0,y_693,w_2860,h_3403/fill/w_840,h_1000,al_c/every-detail-logo.png",
  },
);

let ok = 0;
for (const { out, url } of jobs) {
  try {
    await fs.access(out);
    console.log("skip  ", path.relative(root, out));
    ok++;
    continue;
  } catch {}
  const res = await fetch(url);
  if (!res.ok) {
    console.error("FAIL  ", res.status, url);
    continue;
  }
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, Buffer.from(await res.arrayBuffer()));
  console.log("saved ", path.relative(root, out));
  ok++;
}
console.log(`\n${ok}/${jobs.length} files ready. Review every image with altReview: true in src/data/images.ts.`);
