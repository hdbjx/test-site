"use client";

import { useId } from "react";
import { useRouter } from "next/navigation";
import { areas } from "@/data/areas";
import {
  EDGE_MILES,
  HOME,
  ROUTE_MILES,
  VIEW,
  areaGeo,
  landmarks,
  milesBetween,
  milesToPx,
  project,
  roads,
  type CoverageZone,
  type LatLng,
} from "@/data/coverage";
import styles from "./coverage.module.css";

export type MapResult = LatLng & { zone: CoverageZone; miles: number };

type Props = {
  /** Area being hovered/focused in a linked list. */
  active?: string | null;
  /** Area this page is about; stays highlighted. */
  focus?: string;
  onActive?: (slug: string | null) => void;
  result?: MapResult | null;
};

/** Catmull-Rom → cubic Bézier, so simplified road points read as curves. */
function smooth(points: { x: number; y: number }[], closed = false) {
  const n = points.length;
  if (n < 2) return "";
  const at = (i: number) => (closed ? points[(i + n) % n] : points[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return closed ? `${d} Z` : d;
}

const LABEL: Record<string, { dx: number; dy: number; anchor: "start" | "middle" | "end" }> = {
  e: { dx: 18, dy: 7, anchor: "start" },
  w: { dx: -18, dy: 7, anchor: "end" },
  n: { dx: 0, dy: -20, anchor: "middle" },
  s: { dx: 0, dy: 34, anchor: "middle" },
  ne: { dx: 14, dy: -12, anchor: "start" },
  nw: { dx: -14, dy: -12, anchor: "end" },
  se: { dx: 14, dy: 26, anchor: "start" },
  sw: { dx: -14, dy: 26, anchor: "end" },
};

const fmtMiles = (miles: number) => `${miles < 10 ? miles.toFixed(1) : Math.round(miles)} mi`;
// The pin body sits above its point, so the top edge needs more room.
const clampToView = (p: { x: number; y: number }) => ({
  x: Math.max(40, Math.min(VIEW - 40, p.x)),
  y: Math.max(84, Math.min(VIEW - 30, p.y)),
});

export function CoverageMap({ active = null, focus, onActive, result }: Props) {
  const uid = useId().replace(/:/g, "");
  const router = useRouter();
  // SVG anchors can't be next/link; keep client-side navigation for plain clicks.
  const go = (e: React.MouseEvent<Element>, href: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    router.push(href);
  };
  const home = project(HOME);
  const highlighted = active ?? focus ?? null;
  const pins = areas
    .filter((a) => areaGeo[a.slug] && a.slug !== "decatur")
    .map((a) => ({ ...a, geo: areaGeo[a.slug], p: project(areaGeo[a.slug]) }));
  const lit = pins.find((pin) => pin.slug === highlighted);

  const resultRaw = result ? project(result) : null;
  const resultP = resultRaw ? clampToView(resultRaw) : null;
  const offMap = !!resultRaw && !!resultP && (resultRaw.x !== resultP.x || resultRaw.y !== resultP.y);

  const ring = (miles: number) => milesToPx(miles);

  return (
    <svg
      className={styles.svg}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      role="img"
      aria-labelledby={`${uid}-t`}
      onMouseLeave={() => onActive?.(null)}
    >
      <title id={`${uid}-t`}>
        {`Service map centered on Decatur. Regular route covers about ${ROUTE_MILES} miles: ${pins.map((p) => p.name).join(", ")}.`}
      </title>
      <defs>
        <pattern id={`${uid}-grid`} width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M50 0H0V50" fill="none" className={styles.gridLine} />
        </pattern>
        <clipPath id={`${uid}-clip`}>
          <rect width={VIEW} height={VIEW} />
        </clipPath>
      </defs>

      <rect width={VIEW} height={VIEW} className={styles.paper} />
      <rect width={VIEW} height={VIEW} fill={`url(#${uid}-grid)`} />

      <g clipPath={`url(#${uid}-clip)`}>
        {/* zones */}
        <circle cx={home.x} cy={home.y} r={ring(EDGE_MILES)} className={styles.edgeZone} />
        <circle cx={home.x} cy={home.y} r={ring(ROUTE_MILES)} className={styles.routeZone} />
        <circle cx={home.x} cy={home.y} r={ring(10)} className={styles.ring} />
        <circle cx={home.x} cy={home.y} r={ring(5)} className={styles.ring} />

        {/* roads */}
        <g aria-hidden="true">
          {roads.map((road) => {
            const d = smooth(road.points.map(([lat, lng]) => project({ lat, lng })), road.closed);
            return (
              <g key={road.name}>
                <path d={d} className={styles.roadCase} />
                <path d={d} className={road.closed ? styles.roadLoop : styles.road} />
              </g>
            );
          })}
          {roads.filter((r) => r.label).map((road) => {
            const p = project(road.label!);
            return (
              <g key={`${road.name}-shield`} transform={`translate(${p.x} ${p.y})`} className={styles.shield}>
                <rect x={-30} y={-15} width={60} height={30} rx={6} />
                <text y={7}>{road.name.replace("I-", "")}</text>
              </g>
            );
          })}
        </g>

        {/* landmarks */}
        <g aria-hidden="true" className={styles.landmark}>
          {landmarks.map((l) => {
            const p = project(l);
            return (
              <g key={l.name}>
                <path d={`M${p.x - 6} ${p.y}h12M${p.x} ${p.y - 6}v12`} />
                <text x={p.x + 12} y={p.y + 6}>{l.name}</text>
              </g>
            );
          })}
        </g>

        {/* ring labels */}
        <g aria-hidden="true" className={styles.ringLabel}>
          <text x={home.x + ring(5) * Math.cos(Math.PI / 5)} y={home.y + ring(5) * Math.sin(Math.PI / 5) + 22}>5 mi</text>
          <text x={home.x + ring(10) * Math.cos(-Math.PI / 4.6)} y={home.y + ring(10) * Math.sin(-Math.PI / 4.6)} textAnchor="end" dx={-8}>10 mi</text>
          <text x={home.x + ring(ROUTE_MILES) * Math.cos(-Math.PI / 2.35)} y={home.y + ring(ROUTE_MILES) * Math.sin(-Math.PI / 2.35) + 30} className={styles.routeLabel}>Regular route</text>
        </g>

        {/* connector lines */}
        {lit && (
          <g key={`line-${lit.slug}`} aria-hidden="true">
            <line x1={home.x} y1={home.y} x2={lit.p.x} y2={lit.p.y} className={styles.leg} />
          </g>
        )}
        {resultP && result && (
          <g key={`res-${result.lat},${result.lng}`} aria-hidden="true">
            <line x1={home.x} y1={home.y} x2={resultP.x} y2={resultP.y} className={`${styles.leg} ${styles.legResult}`} />
          </g>
        )}

        {/* area pins */}
        {pins.map((pin) => {
          const on = pin.slug === highlighted;
          const l = LABEL[pin.geo.label];
          return (
            <a
              key={pin.slug}
              href={`/service-areas/${pin.slug}`}
              onClick={(e) => go(e, `/service-areas/${pin.slug}`)}
              className={`${styles.pin} ${on ? styles.pinOn : ""}`}
              onMouseEnter={() => onActive?.(pin.slug)}
              onFocus={() => onActive?.(pin.slug)}
              onBlur={() => onActive?.(null)}
              aria-label={`${pin.name}, about ${Math.round(milesBetween(HOME, pin.geo))} miles from Decatur`}
            >
              <circle cx={pin.p.x} cy={pin.p.y} r={26} className={styles.hit} />
              <circle cx={pin.p.x} cy={pin.p.y} r={on ? 13 : 9} className={styles.dot} />
              <text x={pin.p.x + l.dx} y={pin.p.y + l.dy} textAnchor={l.anchor}>
                {pin.geo.short ?? pin.name}
                {on && <tspan className={styles.miles}>{` · ${fmtMiles(milesBetween(HOME, pin.geo))}`}</tspan>}
              </text>
            </a>
          );
        })}

        {/* home base */}
        <a
          href="/service-areas/decatur"
          onClick={(e) => go(e, "/service-areas/decatur")}
          className={`${styles.home} ${highlighted === "decatur" ? styles.homeOn : ""}`}
          onMouseEnter={() => onActive?.("decatur")}
          onFocus={() => onActive?.("decatur")}
          onBlur={() => onActive?.(null)}
          aria-label="Decatur, home base"
        >
          <circle cx={home.x} cy={home.y} r={46} className={styles.homeHalo} />
          <circle cx={home.x} cy={home.y} r={14} className={styles.homeDot} />
          <circle cx={home.x} cy={home.y} r={5} className={styles.homeCore} />
          <text x={home.x} y={home.y + 82} className={styles.homeName}>Decatur</text>
          <text x={home.x} y={home.y + 106} className={styles.homeSub}>Home base</text>
        </a>

        {/* checked address */}
        {resultP && result && (
          <g key={`pin-${result.lat},${result.lng}`} className={`${styles.you} ${styles[`you_${result.zone}`]}`} transform={`translate(${resultP.x} ${resultP.y})`}>
            <g className={styles.youDrop}>
              <path d="M0 0c-4-14-22-26-22-44a22 22 0 0 1 44 0c0 18-18 30-22 44z" />
              <circle cy={-44} r={8} className={styles.youEye} />
            </g>
            {!offMap && (
              <text y={resultP.y < 140 ? 40 : -80} className={styles.youLabel} textAnchor={resultP.x > VIEW - 160 ? "end" : resultP.x < 160 ? "start" : "middle"}>
                Your address
                <tspan className={styles.miles}>{` · ${fmtMiles(result.miles)}`}</tspan>
              </text>
            )}
          </g>
        )}
      </g>

      {/* scale + north */}
      <g aria-hidden="true" className={styles.scale} transform={`translate(${VIEW - 46} ${VIEW - 44})`}>
        <path d={`M${-milesToPx(2)} 0h${milesToPx(2)}M${-milesToPx(2)} -9v18M0 -9v18M${-milesToPx(1)} -5v10`} />
        <text x={-milesToPx(1)} y={-16}>2 mi</text>
      </g>
      <g aria-hidden="true" className={styles.north} transform={`translate(${VIEW - 52} 58)`}>
        <path d="M0 -26l11 30-11-7-11 7z" />
        <text y={30}>N</text>
      </g>
    </svg>
  );
}
