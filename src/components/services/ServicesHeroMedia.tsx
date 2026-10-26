"use client";

import { useRef } from "react";
import { Photo } from "@/components/Photo";
import { usePrefersReducedMotion, useRafScroll } from "@/components/motion/useMotion";

export function ServicesHeroMedia() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useRafScroll(() => {
    const node = ref.current;
    if (!node || reduced || window.innerWidth < 900) return;
    const rect = node.getBoundingClientRect();
    const viewport = window.innerHeight;
    const start = viewport * 0.92;
    const end = viewport * 0.52;
    const progress = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
    node.style.setProperty("--sv90-hero-inset", `${7 * (1 - progress)}%`);
  }, !reduced);

  return (
    <div ref={ref} className="sv90-hero-media ed90-photo-grade">
      <Photo id="hq-interior-team-front-seats" sizes="100vw" fill priority />
    </div>
  );
}
