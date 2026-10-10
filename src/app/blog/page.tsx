import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { formatDate, getAllPosts } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Shine On: Car Care Tips from Every Detail | Decatur, GA",
  description: "Straightforward car care advice from the Every Detail team: detailing, paint care, maintenance and keeping a vehicle clean in Atlanta.",
  path: "/blog",
});

export default function BlogIndex() {
  const posts = getAllPosts();
  const [lead, ...rest] = posts;
  return (
    <main className="blog-v2">
      <section className="blog-v2-hero"><div className="blog-v2-shell"><p className="blog-v2-kicker">SHINE ON / EVERY DETAIL FIELD NOTES</p><h1>Car care without<br/><span>the nonsense.</span></h1><div className="blog-v2-intro"><p>What we have learned from actually cleaning cars: how to choose a detail, keep the result longer, understand paint care and avoid making simple maintenance harder than it needs to be.</p><span>WRITTEN FROM THE DRIVEWAY</span></div></div></section>

      {lead && <section className="blog-v2-feature"><div className="blog-v2-shell"><Link href={`/post/${lead.slug}`} className="blog-v2-feature-card"><div className="blog-v2-feature-index">LATEST / 01</div><div><p>{lead.category} · {formatDate(lead.date)} · {lead.readingMinutes} MIN READ</p><h2>{lead.title}</h2><span>{lead.description}</span></div><b>READ ↗</b></Link></div></section>}

      <section className="blog-v2-archive"><div className="blog-v2-shell"><div className="blog-v2-archive-head"><div><p className="blog-v2-kicker">THE ARCHIVE</p><h2>Useful stuff.<br/><span>Nothing padded.</span></h2></div><p>Service explainers, maintenance advice and paint-care basics. Built to answer the questions we hear from clients before and after a detail.</p></div><div className="blog-v2-grid">{rest.map((p,i)=><Link href={`/post/${p.slug}`} key={p.slug} className="blog-v2-card"><div className="blog-v2-card-top"><span>{String(i+2).padStart(2,"0")}</span><p>{p.category}</p></div><h3>{p.title}</h3><p>{p.description}</p><div className="blog-v2-card-foot"><span>{formatDate(p.date)} · {p.readingMinutes} MIN</span><b>↗</b></div></Link>)}</div></div></section>
      <CtaBand location="blog_index" title="Enough reading. Want the car clean?" body="Choose your vehicle and service to see pricing and available appointments." />
    </main>
  );
}
