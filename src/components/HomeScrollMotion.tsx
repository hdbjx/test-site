"use client";

import { useEffect, useRef } from "react";

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function HomeScrollMotion() {
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    const update = () => {
      rafRef.current = null;
      const vh = Math.max(1, window.innerHeight);

      const hero = document.querySelector<HTMLElement>(".hero-full");
      if (hero) {
        const rect = hero.getBoundingClientRect();
        const progress = clamp(-rect.top / Math.max(1, rect.height * 0.82));
        hero.style.setProperty("--home-hero-progress", String(progress));
      }

      document.querySelectorAll<HTMLElement>(".work-v157-lead, .work-v157-grid figure").forEach((figure, index) => {
        const rect = figure.getBoundingClientRect();
        const progress = clamp((vh * 0.94 - rect.top) / (vh * 0.78));
        figure.style.setProperty("--home-work-in", String(progress));
        figure.style.setProperty("--home-work-drift", String((index % 2 ? -1 : 1) * (progress - 0.5)));
      });

      const howCards = Array.from(document.querySelectorAll<HTMLElement>(".how-stack-card"));
      howCards.forEach((card, index) => {
        const next = howCards[index + 1];
        const nextTop = next?.getBoundingClientRect().top ?? vh * 1.2;
        const compression = next ? clamp((vh * 0.84 - nextTop) / (vh * 0.54)) : 0;
        card.style.setProperty("--stack-compress", String(compression));
      });

      const upgradeCards = Array.from(document.querySelectorAll<HTMLElement>(".upgrade-board"));
      upgradeCards.forEach((card, index) => {
        const next = upgradeCards[index + 1];
        const nextTop = next?.getBoundingClientRect().top ?? vh * 1.2;
        const compression = next ? clamp((vh * 0.88 - nextTop) / (vh * 0.52)) : 0;
        card.style.setProperty("--stack-compress", String(compression));
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
