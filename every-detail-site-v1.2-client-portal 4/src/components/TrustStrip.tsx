import { reviewCountLabel, site } from "@/data/site";

/** Red band of proof points — the same device as the ticker on the current Detail+ page, but static. */
export function TrustStrip() {
  const items = [
    site.award.title,
    `${reviewCountLabel} five-star Google reviews`,
    "We bring our own power and water",
    "Trained student crew",
  ];
  return (
    <section aria-label="Why people book Every Detail" className="border-y-2 border-ink bg-red text-paper">
      <ul className="container-ed flex flex-wrap items-center gap-x-8 gap-y-1 py-3.5 font-numeral text-xl tracking-[0.06em] md:justify-between md:text-2xl">
        {items.map((it) => (
          <li key={it}>{it}</li>
        ))}
      </ul>
    </section>
  );
}
