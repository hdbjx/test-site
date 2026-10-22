"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function SitewideMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const html = document.documentElement;
    html.dataset.route = pathname || "/";

    if (pathname === "/") return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;

    const sections = Array.from(document.querySelectorAll<HTMLElement>("main section"));
    sections.forEach((section, i) => {
      section.dataset.siteSection = String(i + 1).padStart(2, "0");
      if (!reduce) section.classList.add("site-reveal-ready");
    });

    let observer: IntersectionObserver | null = null;
    if (!reduce) {
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("site-reveal-in");
            observer?.unobserve(entry.target);
          }
        }
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
      sections.forEach((section) => observer?.observe(section));
    } else {
      sections.forEach((section) => section.classList.add("site-reveal-in"));
    }

    const interactive = Array.from(document.querySelectorAll<HTMLElement>(
      "main figure, main [class*='photo'], main [class*='media'], main [class*='card']"
    ));

    const cleanups: Array<() => void> = [];
    if (fine && !reduce) {
      interactive.forEach((el) => {
        const onMove = (ev: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const x = ((ev.clientX - r.left) / Math.max(r.width, 1) - 0.5) * 2;
          const y = ((ev.clientY - r.top) / Math.max(r.height, 1) - 0.5) * 2;
          el.style.setProperty("--site-pointer-x", x.toFixed(3));
          el.style.setProperty("--site-pointer-y", y.toFixed(3));
        };
        const onLeave = () => {
          el.style.setProperty("--site-pointer-x", "0");
          el.style.setProperty("--site-pointer-y", "0");
        };
        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", onLeave);
        });
      });
    }

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
        html.style.setProperty("--site-scroll", String(y / max));
      });
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer?.disconnect();
      cleanups.forEach((fn) => fn());
      removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      delete html.dataset.route;
    };
  }, [pathname]);

  return null;
}
