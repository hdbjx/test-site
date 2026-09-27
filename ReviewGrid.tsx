import { reviews } from "@/data/reviews";
import { reviewCountLabel, site } from "@/data/site";
import { Stars } from "./Stars";

export function ReviewGrid({ heading = true }: { heading?: boolean }) {
  return (
    <div>
      {heading && (
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 className="t-h2 max-w-2xl">{reviewCountLabel} five-star reviews from local drivers</h2>
          <a href={site.reviews.googleUrl} target="_blank" rel="noopener" className="link shrink-0 font-display font-semibold">
            Read them on Google
          </a>
        </div>
      )}
      <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
        {reviews.map((r) => (
          <figure key={r.author} className="flex flex-col border-t-2 border-ink pt-6">
            <Stars />
            <blockquote className="mt-4 flex-1 text-[1.0625rem] leading-relaxed">
              <p>&ldquo;{r.text}&rdquo;</p>
            </blockquote>
            <figcaption className="mt-5 font-display text-[0.9375rem] font-semibold">
              {r.author} <span className="font-body font-normal text-muted">on Google</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
