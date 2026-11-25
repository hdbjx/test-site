"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import "./christmas.css";

/**
 * CHRISTMAS — a small holiday moment on the booking confirmation and the revealed quote.
 * A bow, one warm line, (quote only) a gift card nudge, and a short one-time snow burst.
 * The booking line only promises "before the holidays" when the appointment really is on or before Dec 24.
 */
type Props = { kind: "booking" | "quote"; date?: Date };

export function HolidayNote({ kind, date }: Props) {
  const beforeHolidays = !!date && date.getMonth() === 11 && date.getDate() <= 24;
  const line =
    kind === "booking"
      ? beforeHolidays
        ? "You’re set for a clean car before the holidays."
        : "Happy holidays from the Every Detail crew."
      : "Happy holidays from the Every Detail crew.";

  return (
    <div className="xmas-note">
      <SnowBurst />
      <p className="xmas-note-line">
        <span className="xmas-note-bow" aria-hidden="true" />
        {line}
      </p>
      {kind === "quote" && (
        <Link href="/gift-cards" className="xmas-note-gift">
          Know someone who’d want one? Give an Every Detail gift card <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}

/** One short burst of falling snow over the screen, then it removes itself. */
function SnowBurst() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(90, Math.round((w * h) / 9000));
    const flakes = Array.from({ length: count }, () => {
      const r = 1 + Math.random() ** 2 * 2.6;
      return {
        x: Math.random() * w,
        y: -Math.random() * h * 0.6 - 10,
        r,
        vy: 60 + r * 28 + Math.random() * 40,
        drift: 10 + Math.random() * 18,
        phase: Math.random() * Math.PI * 2,
      };
    });

    const DURATION = 3600; // ms, then fade
    const start = performance.now();
    let raf = 0;
    let last = start;
    const tick = (now: number) => {
      const t = now - start;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const fade = t < DURATION ? 1 : Math.max(0, 1 - (t - DURATION) / 900);
      ctx.clearRect(0, 0, w, h);
      for (const f of flakes) {
        f.y += f.vy * dt;
        const x = f.x + Math.sin(now / 700 + f.phase) * f.drift;
        // white flakes with a soft cool shadow so they read on the cream booking pages too
        ctx.globalAlpha = 0.9 * fade;
        ctx.fillStyle = "#fff";
        ctx.shadowColor = "rgba(50, 70, 90, 0.45)";
        ctx.shadowBlur = 3;
        ctx.shadowOffsetY = 1;
        ctx.beginPath();
        ctx.arc(x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (fade > 0) raf = requestAnimationFrame(tick);
      else canvas.style.display = "none";
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} className="xmas-snowburst" aria-hidden="true" />;
}
