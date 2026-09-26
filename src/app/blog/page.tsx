import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { PageHeader } from "@/components/PageHeader";
import { formatDate, getAllPosts } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Shine On: Car Care Tips from Every Detail | Decatur, GA",
  description:
    "Car care advice from a Decatur detailing team: what detailing costs, how to keep a car clean between details, pollen season, paint care and more.",
  path: "/blog",
});

export default function BlogIndex() {
  const posts = getAllPosts();
  const categories = [...new Set(posts.map((p) => p.category))];
  const [lead, ...rest] = posts;

  return (
    <>
      <PageHeader
        crumbs={[{ name: "Shine On", path: "/blog" }]}
        title="Shine On"
        lede={<p>Car care advice from the Every Detail team: what we&rsquo;ve learned detailing cars across Decatur and Atlanta.</p>}
      />

      <section className="container-ed pb-20">
        {posts.length === 0 ? (
          <p className="max-w-xl border-t border-line pt-6 text-ink/80">
            New articles are on the way. In the meantime, <Link href="/our-services" className="link">see our services</Link>.
          </p>
        ) : (
          <>
            {categories.length > 1 && (
              <p className="mb-8 text-sm text-muted">Topics: {categories.join(", ")}</p>
            )}
            <article className="border-t-2 border-ink py-8">
              <p className="text-sm text-muted">
                {lead.category} · {formatDate(lead.date)} · {lead.readingMinutes} min read
              </p>
              <h2 className="t-h2 mt-3 max-w-3xl">
                <Link href={`/post/${lead.slug}`} className="hover:underline hover:decoration-red hover:decoration-2 hover:underline-offset-4">
                  {lead.title}
                </Link>
              </h2>
              {lead.description && <p className="mt-4 max-w-2xl text-lg text-ink/80">{lead.description}</p>}
            </article>
            <ul className="grid gap-x-10 md:grid-cols-2">
              {rest.map((p) => (
                <li key={p.slug} className="border-t border-line py-6">
                  <p className="text-sm text-muted">
                    {p.category} · {formatDate(p.date)}
                  </p>
                  <h2 className="mt-2 font-display text-xl font-semibold leading-snug">
                    <Link href={`/post/${p.slug}`} className="hover:underline hover:decoration-red hover:decoration-2 hover:underline-offset-4">
                      {p.title}
                    </Link>
                  </h2>
                  {p.description && <p className="mt-2 text-ink/75">{p.description}</p>}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
      <CtaBand location="blog_index" />
    </>
  );
}
