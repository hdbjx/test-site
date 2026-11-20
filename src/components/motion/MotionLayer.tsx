"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Site-wide motion layer (V113).
 * - Scroll reveal: [data-reveal] fades/settles in once; [data-reveal="stagger"] staggers its direct children.
 * - Content is only hidden after this runs (html.ed-motion), so no-JS and reduced-motion users always see everything.
 * - Uses `translate`/`opacity` so it never fights existing `transform` effects.
 */
export function MotionLayer() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      root.classList.remove("ed-motion");
      return;
    }

    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])"));
    if (!targets.length) return;

    targets.forEach((el) => {
      if (el.dataset.reveal !== "stagger") return;
      Array.from(el.children).forEach((child, i) => (child as HTMLElement).style.setProperty("--reveal-i", String(Math.min(i, 8))));
    });

    // Anything already on screen shows immediately — reveal is for content you scroll to, never a load delay.
    const vh = window.innerHeight;
    targets.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) el.dataset.revealed = "instant";
    });

    root.classList.add("ed-motion");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).dataset.revealed = "true";
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    targets.forEach((el) => { if (!el.dataset.revealed) observer.observe(el); });

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
