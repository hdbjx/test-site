import type { ReactNode } from "react";
import { Breadcrumbs } from "./Breadcrumbs";
import { SeasonalDecor } from "./SeasonalDecor";

type Props = {
  crumbs: { name: string; path: string }[];
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode; // actions
  aside?: ReactNode; // photo on the right at desktop
};

export function PageHeader({ crumbs, title, lede, children, aside }: Props) {
  return (
    <section className="page-header-shell container-ed seasonal-host relative pb-12 pt-8 md:pb-16 md:pt-10">
      <SeasonalDecor variant="web" corner="tr" />
      <Breadcrumbs items={crumbs} />
      <div className={`mt-8 grid gap-10 ${aside ? "lg:grid-cols-12 lg:items-center" : ""}`}>
        <div className={aside ? "lg:col-span-6" : "max-w-3xl"}>
          <h1 className="t-page">{title}</h1>
          {lede && <div className="t-lede mt-6 text-ink/80">{lede}</div>}
          {children && <div className="mt-8 flex flex-col gap-3 sm:flex-row">{children}</div>}
        </div>
        {aside && <div className="lg:col-span-6">{aside}</div>}
      </div>
    </section>
  );
}
