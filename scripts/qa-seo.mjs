import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const failures = [];
const requireText = (file, needle, label = needle) => {
  const text = read(file);
  if (!text.includes(needle)) failures.push(`${file}: missing ${label}`);
};

for (const file of [
  "src/app/page.tsx",
  "src/app/our-services/page.tsx",
  "src/app/mobile-car-detailing/page.tsx",
  "src/app/paint-correction/page.tsx",
  "src/app/ceramic/page.tsx",
  "src/app/detailplus/page.tsx",
  "src/app/about-us/page.tsx",
  "src/app/service-areas/page.tsx",
  "src/app/blog/page.tsx",
]) requireText(file, "pageMetadata(", "page metadata");

for (const file of ["src/app/book/page.tsx", "src/app/get-a-quote/page.tsx", "src/app/account/page.tsx"]) requireText(file, "noindex: true", "noindex on app/transactional route");

requireText("src/app/layout.tsx", '<html lang="en">', "document language");
requireText("src/app/robots.ts", "sitemap:", "sitemap declaration");
requireText("src/app/sitemap.ts", "areasWithPages", "service area URLs");
requireText("src/app/sitemap.ts", "getAllPosts", "blog URLs");
requireText("src/app/post/[slug]/page.tsx", "articleSchema", "article structured data");
requireText("src/app/post/[slug]/page.tsx", "breadcrumbSchema", "article breadcrumb data");
requireText("src/app/paint-correction/page.tsx", "highPrice", "paint correction price range schema");
requireText("src/app/ceramic/page.tsx", "highPrice", "ceramic price range schema");

const sitemap = read("src/app/sitemap.ts");
for (const route of ["/book", "/get-a-quote", "/account"]) if (sitemap.includes(`[\"${route}\"`)) failures.push(`sitemap: transactional/noindex route included: ${route}`);

const postsDir = path.join(root, "content/blog");
for (const name of fs.readdirSync(postsDir).filter((x) => x.endsWith(".md"))) {
  const text = fs.readFileSync(path.join(postsDir, name), "utf8");
  for (const field of ["title:", "description:", "date:", "category:"]) if (!text.includes(field)) failures.push(`content/blog/${name}: missing ${field}`);
}

if (failures.length) {
  console.error("SEO QA failed:\n" + failures.map((x) => `- ${x}`).join("\n"));
  process.exit(1);
}
console.log("SEO QA passed.");
