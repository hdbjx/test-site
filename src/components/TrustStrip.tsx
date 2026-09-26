import { reviewCountLabel, site } from "@/data/site";
import { Stars } from "./Stars";

export function TrustStrip() {
  const items = [
    { big: site.award.short, small: `${site.award.year} winner` },
    { big: `${reviewCountLabel} reviews`, small: "Five stars on Google", stars: true },
    { big: "Fully mobile", small: "We bring power and water" },
    { big: "Trained team", small: "Tiered technician training" },
  ];
  return (
    <section aria-label="Why Decatur trusts Every Detail" className="border-y border-line bg-paper2">
      <div className="container-ed">
        <ul className="grid grid-cols-2 gap-px bg-line lg:grid-cols-4">
          {items.map((it) => (
            <li key={it.big} className="bg-paper2 px-4 py-5 md:px-6 md:py-6">
              <p className="font-display text-[1.0625rem] font-semibold leading-tight md:text-lg">{it.big}</p>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted">
                {it.stars && <Stars className="h-3.5 w-3.5" />}
                {it.small}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
