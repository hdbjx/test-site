"use client";

import { useEffect, useRef } from "react";

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function ServicesScrollEffects() {
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    const update = () => {
      rafRef.current = null;
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>(".services-v161 [data-svc-reveal]").forEach((el) => {
        const rect = el.getBoundingClientRect();
        const progress = clamp((vh * 0.92 - rect.top) / (vh * 0.42));
        el.style.setProperty("--svc-reveal", String(progress));
      });
    };

    const requestUpdate = () => {
      if (rafRef.current === null) rafRef.current = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return null;
}
