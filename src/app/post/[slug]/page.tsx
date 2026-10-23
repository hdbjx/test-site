import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PostCta } from "@/components/PostCta";
import { formatDate, getAllPosts, getPost, relatedPosts } from "@/lib/blog";
import { articleSchema, breadcrumbSchema, pageMetadata } from "@/lib/seo";

 type Params = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return getAllPosts().map((p) => ({ slug: p.slug })); }

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return pageMetadata({
    title: `${post.title} | Every Detail`,
    description: post.description,
    path: `/post/${slug}`,
    type: "article",
    image: post.image,
    publishedTime: post.date,
  });
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const related = relatedPosts(slug, post.category);
  const parts = post.html.split("</p>");
  const cut = Math.min(3, parts.length - 1);
  const first = parts.slice(0, cut).join("</p>") + (cut ? "</p>" : "");
  const second = parts.slice(cut).join("</p>");
  const path = `/post/${slug}`;

  return (
    <div className="post-v2 post85">
      <article>
        <header className="post-v2-hero">
          <div className="post-v2-shell">
            <div className="mb-5"><Breadcrumbs items={[{ name: "Shine On", path: "/blog" }, { name: post.title, path }]} /></div>
            <Link href="/blog" className="post-v2-back">← SHINE ON</Link>
            <p className="post-v2-meta">{post.category} / <time dateTime={post.date}>{formatDate(post.date)}</time> / {post.readingMinutes} MIN READ</p>
            <h1>{post.title}</h1>
            {post.description && <p className="post-v2-deck">{post.description}</p>}
            <div className="post85-byline"><span>By <strong>Every Detail crew</strong></span><span>Based on the cars we work on every week.</span></div>
          </div>
        </header>

        {post.image && <figure className="post85-cover"><Image src={post.image} alt={`Every Detail: ${post.title}`} fill priority sizes="(max-width: 700px) 92vw, 91vw" /></figure>}

        <div className="post-v2-shell post-v2-body">
          <div>
            <div className="prose-ed" dangerouslySetInnerHTML={{ __html: first }} />
            {second && <><PostCta cta={post.cta}/><div className="prose-ed" dangerouslySetInnerHTML={{ __html: second }} /></>}
            {!second && <PostCta cta={post.cta}/>} 
          </div>
        </div>
      </article>

      {related.length > 0 && <section className="post-v2-related"><div className="post-v2-shell"><p className="post-v2-label">KEEP READING</p><div>{related.map((p, i) => <Link href={`/post/${p.slug}`} key={p.slug}><span>{String(i + 1).padStart(2, "0")}</span><div><small>{p.category} · {p.readingMinutes} MIN</small><h2>{p.title}</h2></div><b>↗</b></Link>)}</div></div></section>}

      <JsonLd data={[
        articleSchema({ title: post.title, description: post.description, path, date: post.date, image: post.image }),
        breadcrumbSchema([{ name: "Shine On", path: "/blog" }, { name: post.title, path }]),
      ]} />
    </div>
  );
}
