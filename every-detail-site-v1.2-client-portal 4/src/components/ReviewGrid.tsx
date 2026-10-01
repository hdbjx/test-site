import { reviews } from "@/data/reviews";
import { reviewCountLabel, site } from "@/data/site";
import { Stars } from "./Stars";

export function ReviewGrid({ heading = true }: { heading?: boolean }) {
  const [lead, ...rest] = reviews;
  return (
    <div>
      {heading && (
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 className="t-h2 max-w-3xl">{reviewCountLabel} five-star reviews from local drivers</h2>
          <a href={site.reviews.googleUrl} target="_blank" rel="noopener" className="link shrink-0 font-display font-semibold">
            Read them on Google
          </a>
        </div>
      )}
      <div className="mt-12 grid gap-12 lg:grid-cols-12">
        <figure className="lg:col-span-7">
          <Stars className="h-5 w-5" />
          <blockquote className="mt-5 font-display text-2xl font-medium leading-snug tracking-tight md:text-[1.9rem]">
            <p>&ldquo;{lead.text}&rdquo;</p>
          </blockquote>
          <figcaption className="mt-6 font-display font-semibold">
            {lead.author} <span className="font-body font-normal text-muted">on Google</span>
          </figcaption>
        </figure>
        <div className="space-y-10 lg:col-span-4 lg:col-start-9">
          {rest.map((r) => (
            <figure key={r.author} className="border-t-2 border-ink pt-5">
              <Stars />
              <blockquote className="mt-3 leading-relaxed text-ink/85">
                <p>&ldquo;{r.text}&rdquo;</p>
              </blockquote>
              <figcaption className="mt-3 font-display text-[0.9375rem] font-semibold">
                {r.author} <span className="font-body font-normal text-muted">on Google</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
