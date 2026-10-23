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
    <div className="shine84">
      <section className="shine84-masthead">
        <div className="shine84-shell">
          <div className="shine84-mast-row">
            <div>
              <p className="shine84-eyebrow">SHINE ON</p>
              <h1>Car care worth knowing.</h1>
            </div>
            <p className="shine84-deck">Clear advice from the cars we detail every week. Maintenance, interiors, paint care, and the little things that keep a clean car clean longer.</p>
          </div>
        </div>
      </section>

      {lead && (
        <section className="shine84-lead">
          <div className="shine84-shell">
            <Link href={`/post/${lead.slug}`} className="shine84-lead-card">
              <div className="shine84-lead-meta">
                <span>LATEST</span>
                <span>{lead.category}</span>
                <span>{formatDate(lead.date)}</span>
                <span>{lead.readingMinutes} MIN READ</span>
              </div>
              <div className="shine84-lead-main">
                <h2>{lead.title}</h2>
                <p>{lead.description}</p>
              </div>
              <div className="shine84-lead-action">READ STORY <span>↗</span></div>
            </Link>
          </div>
        </section>
      )}

      <section className="shine84-index">
        <div className="shine84-shell">
          <div className="shine84-index-head">
            <h2>More from the driveway</h2>
            <p>Short, practical reads based on the questions clients ask us most.</p>
          </div>
          <div className="shine84-list">
            {rest.map((post, index) => (
              <Link href={`/post/${post.slug}`} key={post.slug} className="shine84-row">
                <span className="shine84-number">{String(index + 2).padStart(2, "0")}</span>
                <div className="shine84-row-copy">
                  <div className="shine84-row-meta"><span>{post.category}</span><span>{formatDate(post.date)}</span><span>{post.readingMinutes} MIN</span></div>
                  <h3>{post.title}</h3>
                  <p>{post.description}</p>
                </div>
                <span className="shine84-arrow">↗</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaBand location="blog_index" title="Want us to handle it instead?" body="Choose your vehicle and service to see pricing and available appointments." />
    </div>
  );
}
