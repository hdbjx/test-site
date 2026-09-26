#!/usr/bin/env node
/**
 * One-time migration: copies the Shine On posts from the live Wix site into
 * /content/blog/<slug>.md, keeping the same slugs so /post/<slug> URLs don't change.
 *
 *   npm run blog:pull        (run BEFORE the domain moves off Wix)
 *
 * Wix markup changes over time, so treat the output as a draft: open each file,
 * check headings, lists and links, set `category` and `cta`, then commit.
 */
import fs from "node:fs/promises";
import path from "node:path";
import TurndownService from "turndown";

const ORIGIN = "https://www.everydetail.co";
const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "content/blog");

// From the live blog index, Sept 2026.
const posts = [
  "what-should-i-ask-my-detailer-before-booking",
  "how-much-does-mobile-car-detailing-cost",
  "protecting-your-car-during-pollen-season-the-ultimate-guide-to-safe-cleaning-techniques",
  "how-to-keep-your-car-looking-detailed-between-appointments-a-simple-weekly-routine",
  "clay-bar-or-decontamination-towel-which-one-is-right-for-your-car-care-routine",
  "achieving-flawless-exterior-car-detailing-essential-exterior-car-care-tips",
  "mastering-professional-interior-car-cleaning",
  "the-convenience-of-mobile-detailing-benefits",
  "finding-the-best-local-car-detailers-a-complete-guide",
  "the-importance-of-professional-vehicle-care-in-your-area",
  "convenient-ways-to-keep-your-car-looking-spotless",
  "5-hidden-car-cleaning-tips-you-re-probably-missing",
  "going-all-electric-electric-mobile-detailing",
  "why-regular-detailing-matters-protecting-your-car-s-value",
  "spring-cleaning-for-your-car-why-now-is-the-perfect-time-to-detail-your-ride",
  "stay-ahead-of-pollen-season-why-regular-detailing-is-essential",
  "the-truth-about-car-detailing-more-than-just-a-clean-car",
  "the-ultimate-guide-to-keeping-your-car-looking-brand-new",
  "decatur-s-best-car-detailing-services-everydetail-com",
  "ultimate-car-detailing-guide-for-decatur-residents",
];

const td = new TurndownService({ headingStyle: "atx", bulletListMarker: "-" });
td.remove(["script", "style", "button", "svg", "figure"]);

const meta = (html, prop) =>
  html.match(new RegExp(`<meta[^>]+(?:property|name)="${prop}"[^>]+content="([^"]*)"`, "i"))?.[1] ?? "";
const decode = (s) =>
  s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const yamlStr = (s) => JSON.stringify(decode(s));

function extractBody(html) {
  // Newer Wix blog markup
  const rich = html.match(/<div[^>]+data-hook="post-description"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/section>/i);
  if (rich) return rich[1];
  const article = html.match(/<article[\s\S]*?<\/article>/i);
  return article ? article[0] : null;
}

function extractDate(html) {
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  for (const [, json] of ld) {
    try {
      const d = JSON.parse(json);
      const node = Array.isArray(d) ? d.find((x) => x.datePublished) : d;
      if (node?.datePublished) return node.datePublished.slice(0, 10);
    } catch {}
  }
  return meta(html, "article:published_time").slice(0, 10);
}

await fs.mkdir(outDir, { recursive: true });
for (const slug of posts) {
  const file = path.join(outDir, `${slug}.md`);
  try {
    await fs.access(file);
    console.log("skip  ", slug);
    continue;
  } catch {}
  const res = await fetch(`${ORIGIN}/post/${slug}`);
  if (!res.ok) {
    console.error("FAIL  ", res.status, slug);
    continue;
  }
  const html = await res.text();
  const title = decode(meta(html, "og:title").replace(/\s*\|\s*Every Detail\s*$/i, ""));
  const description = meta(html, "og:description") || meta(html, "description");
  const bodyHtml = extractBody(html);
  const body = bodyHtml ? td.turndown(bodyHtml).trim() : "<!-- Body not found automatically. Paste the post content here. -->";
  const md = `---
title: ${yamlStr(title)}
description: ${yamlStr(description)}
date: ${extractDate(html) || "2025-01-01"}
category: "Care tips"
cta: premium
---

${body}
`;
  await fs.writeFile(file, md);
  console.log(bodyHtml ? "saved " : "CHECK ", slug);
}
console.log("\nDone. Review every file in content/blog before committing.");
