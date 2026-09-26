import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

/**
 * Shine On blog. One Markdown file per post in /content/blog/<slug>.md.
 * The filename is the URL slug and must match the old Wix slug (/post/<slug>).
 *
 * Frontmatter:
 *   title: string
 *   description: string   (meta description, ~150 chars)
 *   date: YYYY-MM-DD
 *   category: "Care tips" | "Services" | "Local" | "Company"
 *   image: /images/…      (optional cover)
 *   cta: premium | factoryReset | maintenance | ceramic | detailplus | quote   (optional; picks the in-article CTA)
 *   draft: true           (optional; hides the post)
 */

const DIR = path.join(process.cwd(), "content", "blog");

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  image?: string;
  cta?: "premium" | "factoryReset" | "maintenance" | "ceramic" | "detailplus" | "quote";
  readingMinutes: number;
};

export type Post = PostMeta & { html: string };

function read(slug: string): Post | null {
  const file = path.join(DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  if (data.draft) return null;
  const words = content.split(/\s+/).filter(Boolean).length;
  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    date: data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date ?? ""),
    category: String(data.category ?? "Care tips"),
    image: data.image ? String(data.image) : undefined,
    cta: data.cta,
    readingMinutes: Math.max(1, Math.round(words / 220)),
    html: marked.parse(content, { async: false }) as string,
  };
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => read(f.replace(/\.md$/, "")))
    .filter((p): p is Post => !!p)
    .map(({ html: _html, ...meta }) => meta)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string) {
  return read(slug);
}

export function relatedPosts(slug: string, category: string, n = 3) {
  const all = getAllPosts().filter((p) => p.slug !== slug);
  const same = all.filter((p) => p.category === category);
  return [...same, ...all.filter((p) => p.category !== category)].slice(0, n);
}

export const formatDate = (iso: string) =>
  new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
