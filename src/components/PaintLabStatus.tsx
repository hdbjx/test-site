"use client";

import { useEffect, useState } from "react";

const LABELS = [
  ["inspect", "01 / INSPECT"],
  ["diagnose", "02 / DIAGNOSE"],
  ["process", "03 / PROCESS"],
  ["protect", "04 / PROTECT"],
  ["choose", "05 / CHOOSE"],
  ["plan", "06 / PLAN"],
] as const;

export function PaintLabStatus() {
  const [active, setActive] = useState("01 / INSPECT");

  useEffect(() => {
    const sections = LABELS
      .map(([id, label]) => ({ el: document.querySelector<HTMLElement>(`[data-paint-lab="${id}"]`), label }))
      .filter((item) => item.el);
    if (!sections.length) return;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const hit = sections.find((item) => item.el === visible.target);
      if (hit) setActive(hit.label);
    }, { rootMargin: "-34% 0px -48% 0px", threshold: [0, .2, .45, .7] });

    sections.forEach((item) => item.el && observer.observe(item.el));
    return () => observer.disconnect();
  }, []);

  return <div className="pl57-status pl60-status" aria-hidden="true"><span>PAINT LAB</span><b>{active}</b></div>;
}
