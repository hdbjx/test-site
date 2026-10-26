"use client";

import { useRef } from "react";
import { usePrefersReducedMotion, useRafScroll } from "@/components/motion/useMotion";

const chapters = [
  { number: "01", title: "INSPECT.", body: "First, see what the wash was hiding." },
  { number: "02", title: "CORRECT.", body: "Remove defects. Don't cover them." },
  { number: "03", title: "REFINE.", body: "Gloss is what's left when the defects are gone." },
] as const;

export function PaintProcessChapters() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useRafScroll(() => {
    const root = ref.current;
    if (!root || reduced || window.innerWidth < 900) return;
    const rows = Array.from(root.querySelectorAll<HTMLElement>("[data-pc90-chapter]"));
    const viewport = window.innerHeight;
    rows.forEach((row) => {
      const rect = row.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const progress = Math.max(-1, Math.min(1, (viewport / 2 - center) / viewport));
      row.style.setProperty("--pc90-number-shift", `${progress * 8}vw`);
    });
  }, !reduced);

  return (
    <div ref={ref} className="pc90-process-rows">
      {chapters.map((chapter) => (
        <article key={chapter.number} className="pc90-process-row" data-pc90-chapter>
          <span className="pc90-process-number" aria-hidden="true">{chapter.number}</span>
          <div className="pc90-process-copy">
            <h3>{chapter.title}</h3>
            <p>{chapter.body}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
