"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import "./christmas.css";

/**
 * Christmas: two ornaments hanging from the top-left of the homepage hero.
 * Each one is a damped pendulum. Moving the mouse past one pushes it (stronger the closer
 * the cursor is), scrolling gives both a small nudge, and they settle back on their own.
 */
const ORNAMENTS = [
  { key: "a", w0: 2.3, phase: 0 },
  { key: "b", w0: 1.85, phase: 2.1 },
] as const;

const DAMPING = 1.1; // per second
const MAX_ANGLE = 0.32; // rad (~18deg)
const REACH = 170; // px — how close the cursor has to be to really push
const PUSH = 0.0035; // per px of cursor travel near the ornament, at full speed
const FULL_SPEED = 1500; // px/s — slower moves push proportionally less
const MAX_VEL = 0.9; // rad/s cap so a wild swipe still looks natural
const IDLE = 0; // no resting drift: at rest nothing is written to the DOM (the header watches style mutations)

export function XmasOrnaments() {
  const refs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const state = ORNAMENTS.map(() => ({ angle: 0, vel: 0 }));
    let raf = 0;
    let last = performance.now();
    let visible = true;
    let lastPointer: { x: number; y: number; t: number } | null = null;
    let lastScroll = window.scrollY;
    const lastTf: string[] = [];

    const kick = (i: number, amount: number) => {
      state[i].vel = Math.max(-MAX_VEL, Math.min(MAX_VEL, state[i].vel + amount));
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const now = performance.now();
      if (lastPointer) {
        const dt = Math.max((now - lastPointer.t) / 1000, 1 / 240);
        const dx = e.clientX - lastPointer.x;
        const speed = Math.min(Math.abs(dx / dt) / FULL_SPEED, 1);
        refs.current.forEach((el, i) => {
          const img = el?.querySelector("img");
          if (!img) return;
          const r = img.getBoundingClientRect();
          const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
          const falloff = Math.exp(-((d / REACH) ** 2));
          if (falloff > 0.02) kick(i, dx * PUSH * speed * falloff);
        });
      }
      lastPointer = { x: e.clientX, y: e.clientY, t: now };
    };

    const onScroll = () => {
      const dy = window.scrollY - lastScroll;
      lastScroll = window.scrollY;
      state.forEach((_, i) => kick(i, Math.max(-0.12, Math.min(0.12, dy * 0.0015)) * (i ? -1 : 1)));
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      const t = now / 1000;
      ORNAMENTS.forEach((o, i) => {
        const s = state[i];
        const rest = Math.sin(t * o.w0 * 0.35 + o.phase) * IDLE;
        const acc = -o.w0 * o.w0 * Math.sin(s.angle - rest) - DAMPING * s.vel;
        s.vel += acc * dt;
        s.angle = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, s.angle + s.vel * dt));
        const el = refs.current[i];
        const tf = `rotate(${s.angle.toFixed(4)}rad)`;
        if (el && tf !== lastTf[i]) { lastTf[i] = tf; el.style.transform = tf; }
      });
      if (visible) raf = requestAnimationFrame(tick);
    };

    const hero = refs.current[0]?.closest("section");
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        last = performance.now();
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(tick);
      }
    });
    if (hero) io.observe(hero);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="xmas-ornaments" aria-hidden="true">
      {ORNAMENTS.map((o, i) => (
        <span key={o.key} ref={(el) => { refs.current[i] = el; }} className={`xmas-ornament xmas-ornament--${o.key}`}>
          <i />
          <Image src="/christmas/ornament.webp" alt="" width={300} height={382} loading="eager" />
        </span>
      ))}
    </div>
  );
}
