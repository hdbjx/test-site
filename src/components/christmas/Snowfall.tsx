"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import "./christmas.css";

/**
 * CHRISTMAS — very light snowfall over the whole site.
 * One fixed canvas, a few dozen small soft flakes drifting down slowly. Never blocks clicks,
 * pauses when the tab is hidden, and is off for reduced-motion visitors and in the booking/quote funnels.
 */
const OFF_ON = ["/book", "/get-a-quote"];
const DENSITY = 1 / 26000; // flakes per px² of viewport (~50 on a laptop, ~13 on a phone)
const MAX_FLAKES = 60;

type Flake = { x: number; y: number; r: number; vy: number; drift: number; phase: number; a: number };

export function Snowfall() {
  const pathname = usePathname();
  const off = OFF_ON.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (off) return;
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let w = 0, h = 0, dpr = 1, raf = 0, last = performance.now();
    let flakes: Flake[] = [];

    const make = (anywhere: boolean): Flake => {
      const r = 0.8 + Math.random() ** 2 * 2.2; // mostly tiny, a few bigger
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : -6,
        r,
        vy: 14 + r * 9 + Math.random() * 8, // bigger = closer = a bit faster
        drift: 6 + Math.random() * 12,
        phase: Math.random() * Math.PI * 2,
        a: 0.35 + Math.random() * 0.4,
      };
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.min(MAX_FLAKES, Math.round(w * h * DENSITY));
      while (flakes.length < target) flakes.push(make(true));
      flakes = flakes.slice(0, target);
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, w, h);
      const t = now / 1000;
      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];
        f.y += f.vy * dt;
        const x = f.x + Math.sin(t * 0.6 + f.phase) * f.drift;
        if (f.y > h + 6) flakes[i] = make(false);
        const g = ctx.createRadialGradient(x, f.y, 0, x, f.y, f.r * 1.6);
        g.addColorStop(0, `rgba(255,255,255,${f.a})`);
        g.addColorStop(0.55, `rgba(255,255,255,${f.a * 0.7})`);
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, f.y, f.r * 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      ctx.clearRect(0, 0, w, h);
    };
  }, [off]);

  if (off) return null;
  return <canvas ref={ref} className="xmas-snowfall" aria-hidden="true" />;
}
