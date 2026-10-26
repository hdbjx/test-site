"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { NextOpeningNote } from "@/components/journey/NextOpeningNote";
import { TrackedLink } from "@/components/TrackedLink";
import { useVehicle } from "@/components/vehicle/VehicleContext";
import { PRICING, services, startingPrice, type ServiceId } from "@/data/services";
import { durationShort, usd } from "@/lib/format";
import { track } from "@/lib/analytics";
import styles from "./ConditionDial.module.css";

/* Dial geometry (SVG user units). 0° points straight up; the needle sweeps ±SWEEP. */
const CX = 160;
const CY = 168;
const R = 124;
const SWEEP = 100;

type Zone = { id: ServiceId; number: string; label: string; from: number; to: number; center: number };

const ZONES: Zone[] = [
  { id: "maintenance", number: "01", label: "CLEAN", from: -SWEEP, to: -34, center: -67 },
  { id: "premium", number: "02", label: "DAILY BUILDUP", from: -34, to: 34, center: 0 },
  { id: "factoryReset", number: "03", label: "NEGLECTED", from: 34, to: SWEEP, center: 67 },
];

const TICKS = Array.from({ length: (SWEEP * 2) / 5 + 1 }, (_, i) => -SWEEP + i * 5);

function polar(deg: number, r: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + r * Math.sin(rad), y: CY - r * Math.cos(rad) };
}

function arc(from: number, to: number, r: number) {
  const a = polar(from, r);
  const b = polar(to, r);
  const large = to - from > 180 ? 1 : 0;
  return `M${a.x.toFixed(2)} ${a.y.toFixed(2)} A${r} ${r} 0 ${large} 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
}

function zoneAt(deg: number) {
  return ZONES.find((z) => deg >= z.from && deg <= z.to) ?? ZONES[1];
}

function zoneOf(id: ServiceId) {
  return ZONES.find((z) => z.id === id) ?? ZONES[1];
}

function Readout({ id }: { id: ServiceId }) {
  const { vehicle } = useVehicle();
  const exact = vehicle ? PRICING[vehicle.vehicle][id] : null;
  const price = exact ? exact.price : startingPrice(id);

  return (
    <TrackedLink
      href={`/book?service=${id}`}
      event="book_click"
      params={{ location: "services_gauge", service: id }}
      className={styles.readout}
    >
      <span className={styles.readoutText}>
        <span className={styles.readoutEyebrow}>Your detail</span>
        <span className={styles.readoutName}>{services[id].name}</span>
        {exact && <span className={styles.readoutTime}>About {durationShort(exact.minutes)} in your driveway</span>}
      </span>
      <span className={styles.readoutPrice} key={`${id}-${price}`}>
        {!exact && <small>From</small>}
        {usd(price)}
      </span>
      <span className={styles.readoutArrow} aria-hidden="true">↗</span>
    </TrackedLink>
  );
}

type Props = {
  value: ServiceId;
  onChange: (id: ServiceId) => void;
};

/**
 * Condition dial for /our-services. Drag the needle (or use arrow keys) to how the car
 * looks today; the dial selects the matching service, which opens its panel and
 * prices it for the saved vehicle.
 */
export function ConditionDial({ value, onChange }: Props) {
  const { vehicle } = useVehicle();
  const svgRef = useRef<SVGSVGElement>(null);
  const faceRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<number | null>(null);
  const [rev, setRev] = useState<number | null>(null);
  const [touched, setTouched] = useState(false);

  const active = zoneOf(value);
  const angle = drag ?? rev ?? active.center;

  // One "ignition sweep" the first time the dial scrolls into view: needle revs to the
  // redline and settles back, which signals that it moves.
  useEffect(() => {
    const el = faceRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timers: number[] = [];
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        timers = [
          window.setTimeout(() => setRev(SWEEP - 6), 250),
          window.setTimeout(() => setRev(null), 900),
        ];
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  function angleFromPointer(e: PointerEvent<HTMLDivElement>) {
    const svg = svgRef.current;
    const matrix = svg?.getScreenCTM();
    if (!svg || !matrix) return null;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(matrix.inverse());
    const deg = (Math.atan2(p.x - CX, CY - p.y) * 180) / Math.PI;
    return Math.max(-SWEEP, Math.min(SWEEP, deg));
  }

  function select(id: ServiceId) {
    setTouched(true);
    setRev(null);
    if (id === value) return;
    onChange(id);
    track("service_select", { service: id, location: "services_gauge" });
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    const deg = angleFromPointer(e);
    if (deg === null) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag(deg);
    select(zoneAt(deg).id);
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (drag === null) return;
    const deg = angleFromPointer(e);
    if (deg === null) return;
    setDrag(deg);
    select(zoneAt(deg).id);
  }

  function endDrag() {
    setDrag(null);
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const i = ZONES.findIndex((z) => z.id === value);
    let next = i;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = Math.min(ZONES.length - 1, i + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = Math.max(0, i - 1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = ZONES.length - 1;
    else return;
    e.preventDefault();
    select(ZONES[next].id);
  }

  const tip = polar(0, R - 16);

  return (
    <div className={styles.dial}>
      <div
        ref={faceRef}
        className={`${styles.face} ${drag !== null ? styles.dragging : ""}`}
        role="slider"
        tabIndex={0}
        aria-label="How does your car look right now?"
        aria-valuemin={1}
        aria-valuemax={ZONES.length}
        aria-valuenow={ZONES.indexOf(active) + 1}
        aria-valuetext={`${active.label.toLowerCase()}: ${services[active.id].name}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
        onKeyDown={onKeyDown}
      >
        <svg ref={svgRef} viewBox="0 0 320 222" aria-hidden="true" focusable="false">
          {ZONES.map((z) => (
            <path
              key={`band-${z.id}`}
              d={arc(z.from + 1.5, z.to - 1.5, R + 9)}
              className={`${styles.band} ${z.id === value ? styles.bandActive : ""}`}
            />
          ))}

          <path d={arc(-SWEEP, SWEEP, R)} className={styles.arc} />

          {TICKS.map((t) => {
            const major = t % 25 === 0;
            const a = polar(t, R);
            const b = polar(t, R - (major ? 14 : 7));
            return (
              <line
                key={t}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                className={`${styles.tick} ${major ? styles.tickMajor : ""} ${t > 34 ? styles.tickRed : ""}`}
              />
            );
          })}


          <text x={polar(-SWEEP, R).x} y="214" textAnchor="middle" className={`${styles.label} ${value === "maintenance" ? styles.labelActive : ""}`}>CLEAN</text>
          <text x={CX} y="26" textAnchor="middle" className={`${styles.label} ${value === "premium" ? styles.labelActive : ""}`}>DAILY BUILDUP</text>
          <text x={polar(SWEEP, R).x} y="214" textAnchor="middle" className={`${styles.label} ${value === "factoryReset" ? styles.labelActive : ""}`}>NEGLECTED</text>

          <g className={styles.needle} style={{ transform: `rotate(${angle}deg)` }}>
            <polygon
              className={styles.needleBody}
              points={`${CX - 3.2},${CY} ${tip.x},${tip.y} ${CX + 3.2},${CY} ${CX + 2.4},${CY + 22} ${CX - 2.4},${CY + 22}`}
            />
          </g>
          {ZONES.map((z) => {
            const n = polar(z.center, R - 34);
            return (
              <text
                key={`num-${z.id}`}
                x={n.x}
                y={n.y + 5}
                textAnchor="middle"
                className={`${styles.num} ${z.id === value ? styles.numActive : ""}`}
              >
                {z.number}
              </text>
            );
          })}
          <circle cx={CX} cy={CY} r="18" className={styles.hub} />
          <text x={CX} y={CY + 3.5} textAnchor="middle" className={styles.hubText}>ED</text>
        </svg>
      </div>

      <p className={`${styles.hint} ${touched ? styles.hintHidden : ""}`} aria-hidden="true">
        Drag the needle to your car
      </p>

      <Readout id={value} />
      <NextOpeningNote service={value} vehicle={vehicle?.vehicle} location="services_gauge" className={styles.next} />
    </div>
  );
}
