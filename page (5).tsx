import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PostCta } from "@/components/PostCta";
import { formatDate, getAllPosts, getPost, relatedPosts } from "@/lib/blog";
import { articleSchema, pageMetadata } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return pageMetadata({
    title: `${post.title} | Every Detail`,
    description: post.description,
    path: `/post/${slug}`,
    type: "article",
  });
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const related = relatedPosts(slug, post.category);

  // Split the body after the 3rd paragraph to place the contextual CTA mid-article.
  const parts = post.html.split("</p>");
  const cut = Math.min(3, parts.length - 1);
  const first = parts.slice(0, cut).join("</p>") + (cut ? "</p>" : "");
  const second = parts.slice(cut).join("</p>");

  return (
    <>
      <article className="container-ed pb-16 pt-8 md:pt-10">
        <Breadcrumbs
          items={[
            { name: "Shine On", path: "/blog" },
            { name: post.title, path: `/post/${slug}` },
          ]}
        />
        <header className="mt-10 max-w-3xl">
          <p className="text-sm text-muted">
            {post.category} · <time dateTime={post.date}>{formatDate(post.date)}</time> · {post.readingMinutes} min read
          </p>
          <h1 className="t-h2 mt-4">{post.title}</h1>
          {post.description && <p className="t-lede mt-5 text-ink/80">{post.description}</p>}
        </header>
        <div className="mt-12">
          <div className="prose-ed" dangerouslySetInnerHTML={{ __html: first }} />
          {second && (
            <>
              <div className="max-w-[42rem]">
                <PostCta cta={post.cta} />
              </div>
              <div className="prose-ed" dangerouslySetInnerHTML={{ __html: second }} />
            </>
          )}
          {!second && (
            <div className="max-w-[42rem]">
              <PostCta cta={post.cta} />
            </div>
          )}
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-line bg-paper2 py-16">
          <div className="container-ed">
            <h2 className="t-h3">Keep reading</h2>
            <ul className="mt-6 grid gap-8 md:grid-cols-3">
              {related.map((p) => (
                <li key={p.slug} className="border-t-2 border-ink pt-4">
                  <p className="text-sm text-muted">{p.category}</p>
                  <Link href={`/post/${p.slug}`} className="mt-1 block font-display text-lg font-semibold leading-snug hover:underline">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <JsonLd data={articleSchema({ title: post.title, description: post.description, path: `/post/${slug}`, date: post.date, image: post.image })} />
    </>
  );
}
