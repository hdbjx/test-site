import type { ReactNode } from "react";
import { Breadcrumbs } from "./Breadcrumbs";

type Props = {
  crumbs: { name: string; path: string }[];
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
  aside?: ReactNode;
};

export function PageHeader({ crumbs, title, lede, children, aside }: Props) {
  return (
    <section className="site-page-header">
      <div className="container-ed site-page-header-inner">
        <div className="site-page-header-top"><Breadcrumbs items={crumbs} /><span aria-hidden="true">EVERY DETAIL / DECATUR + ATLANTA</span></div>
        <div className={`site-page-header-grid ${aside ? "has-aside" : ""}`}>
          <div className="site-page-header-copy">
            <h1>{title}</h1>
            {lede && <div className="site-page-header-lede">{lede}</div>}
            {children && <div className="site-page-header-actions">{children}</div>}
          </div>
          {aside && <div className="site-page-header-aside">{aside}</div>}
        </div>
      </div>
    </section>
  );
}
