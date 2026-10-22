"use client";

import { useEffect, useRef } from "react";

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function HomeCinematicMotion() {
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    const update = () => {
      raf.current = null;
      const vh = Math.max(1, window.innerHeight);
      const vw = Math.max(1, window.innerWidth);

      const hero = document.querySelector<HTMLElement>("[data-ed26-hero]");
      if (hero) {
        const r = hero.getBoundingClientRect();
        const p = clamp(-r.top / Math.max(1, r.height * 0.72));
        hero.style.setProperty("--hero-p", String(p));
      }

      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        const r = el.getBoundingClientRect();
        const p = clamp((vh * 0.9 - r.top) / (vh * 0.42));
        el.style.setProperty("--reveal", String(p));
      });

      const process = document.querySelector<HTMLElement>("[data-process-scene]");
      if (process) {
        const r = process.getBoundingClientRect();
        const scrollable = Math.max(1, r.height - vh);
        const p = clamp(-r.top / scrollable);
        process.style.setProperty("--scene-p", String(p));
        const stage = p < 0.34 ? 0 : p < 0.67 ? 1 : 2;
        process.dataset.stage = String(stage);
      }

      const archive = document.querySelector<HTMLElement>("[data-archive-scene]");
      if (archive && vw >= 860) {
        const r = archive.getBoundingClientRect();
        const scrollable = Math.max(1, r.height - vh);
        const p = clamp(-r.top / scrollable);
        archive.style.setProperty("--archive-p", String(p));
      }

      const story = document.querySelector<HTMLElement>("[data-story-scene]");
      if (story) {
        const r = story.getBoundingClientRect();
        const p = clamp((vh - r.top) / (vh + r.height));
        story.style.setProperty("--story-p", String(p));
      }
    };

    const request = () => {
      if (raf.current === null) raf.current = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, []);

  return null;
}
