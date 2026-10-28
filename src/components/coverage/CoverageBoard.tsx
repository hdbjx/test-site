"use client";

import { useState } from "react";
import Link from "next/link";
import { areas } from "@/data/areas";
import { EDGE_MILES, HOME, ROUTE_MILES, areaGeo, milesBetween } from "@/data/coverage";
import { AddressCheck, type CheckResult } from "./AddressCheck";
import { CoverageMap } from "./CoverageMap";
import styles from "./coverage.module.css";

/** Address checker stacked on the coverage map, in one card. */
export function CoveragePanel({
  location,
  active = null,
  focus,
  onActive,
  sticky = false,
}: {
  location: string;
  active?: string | null;
  focus?: string;
  onActive?: (slug: string | null) => void;
  sticky?: boolean;
}) {
  const [result, setResult] = useState<CheckResult | null>(null);
  return (
    <div className={`${styles.panel} ${sticky ? styles.sticky : ""}`}>
      <AddressCheck location={location} onResult={setResult} />
      <div className={styles.mapWrap}>
        <CoverageMap active={active} focus={focus} onActive={onActive} result={result} />
      </div>
      <div className={styles.legend}>
        <span><i className={styles.keyRoute} />Regular route · {ROUTE_MILES} mi</span>
        <span><i className={styles.keyEdge} />Edge · up to {EDGE_MILES} mi</span>
        <small>Miles from Decatur, straight line</small>
      </div>
    </div>
  );
}

type ListStyles = { areas: string; num: string; on: string };

/** Index-page board: the area list and the panel highlight each other. */
export function CoverageBoard({ className, list }: { className: string; list: ListStyles }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div className={className}>
      <ol className={list.areas}>
        {areas.map((area, index) => {
          const geo = areaGeo[area.slug];
          const miles = geo ? milesBetween(HOME, geo) : null;
          return (
            <li key={area.slug} className={active === area.slug ? list.on : undefined}>
              <Link
                href={`/service-areas/${area.slug}`}
                onMouseEnter={() => setActive(area.slug)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(area.slug)}
                onBlur={() => setActive(null)}
              >
                <span className={list.num}>{String(index + 1).padStart(2, "0")}</span>
                <strong>{area.name}</strong>
                <em>{area.primary ? "Home base" : miles !== null ? `${miles < 10 ? miles.toFixed(1) : Math.round(miles)} mi out` : "Mobile service"}</em>
                <i aria-hidden="true">↗</i>
              </Link>
            </li>
          );
        })}
      </ol>
      <CoveragePanel location="areas_index" active={active} onActive={setActive} sticky />
    </div>
  );
}
