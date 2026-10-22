"use client";

import { useEffect, useRef, useState } from "react";

const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));

export function HomeArtMotion() {
  const raf = useRef<number | null>(null);
  const pointerRaf = useRef<number | null>(null);
  const pointer = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const [cursorLabel, setCursorLabel] = useState("");
  const [cursorVisible, setCursorVisible] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");

    const updateScroll = () => {
      raf.current = null;
      const vh = Math.max(1, window.innerHeight);
      const vw = Math.max(1, window.innerWidth);

      document.querySelectorAll<HTMLElement>("[data-v27-reveal]").forEach((el) => {
        const r = el.getBoundingClientRect();
        const p = clamp((vh * 0.9 - r.top) / (vh * 0.38));
        el.style.setProperty("--r", String(p));
      });

      const hero = document.querySelector<HTMLElement>("[data-v27-hero]");
      if (hero) {
        const r = hero.getBoundingClientRect();
        hero.style.setProperty("--p", String(clamp(-r.top / (vh * 0.85))));
      }

      const work = document.querySelector<HTMLElement>("[data-v27-work]");
      if (work && vw >= 900) {
        const r = work.getBoundingClientRect();
        const span = Math.max(1, r.height - vh);
        work.style.setProperty("--p", String(clamp(-r.top / span)));
      }

      const story = document.querySelector<HTMLElement>("[data-v27-story]");
      if (story) {
        const r = story.getBoundingClientRect();
        const p = clamp((vh - r.top) / (vh + r.height * 0.35));
        story.style.setProperty("--p", String(p));
      }

      document.querySelectorAll<HTMLElement>("[data-v28-scene]").forEach((scene) => {
        const r = scene.getBoundingClientRect();
        const p = clamp((vh - r.top) / (vh + r.height));
        scene.style.setProperty("--scene", String(p));
      });
    };

    const requestScroll = () => {
      if (raf.current == null) raf.current = requestAnimationFrame(updateScroll);
    };

    const animatePointer = () => {
      pointerRaf.current = null;
      pointer.current.x += (pointer.current.targetX - pointer.current.x) * 0.16;
      pointer.current.y += (pointer.current.targetY - pointer.current.y) * 0.16;
      document.documentElement.style.setProperty("--v28-cursor-x", `${pointer.current.x}px`);
      document.documentElement.style.setProperty("--v28-cursor-y", `${pointer.current.y}px`);
      if (Math.abs(pointer.current.targetX - pointer.current.x) > 0.2 || Math.abs(pointer.current.targetY - pointer.current.y) > 0.2) {
        pointerRaf.current = requestAnimationFrame(animatePointer);
      }
    };

    const requestPointer = () => {
      if (pointerRaf.current == null) pointerRaf.current = requestAnimationFrame(animatePointer);
    };

    const resetElement = (el: HTMLElement) => {
      el.style.setProperty("--mx", "0");
      el.style.setProperty("--my", "0");
      el.style.setProperty("--tilt-x", "0deg");
      el.style.setProperty("--tilt-y", "0deg");
      el.style.setProperty("--mag-x", "0px");
      el.style.setProperty("--mag-y", "0px");
    };

    const onPointerMove = (event: PointerEvent) => {
      if (reduced.matches || !finePointer.matches) return;
      pointer.current.targetX = event.clientX;
      pointer.current.targetY = event.clientY;
      requestPointer();

      const hero = document.querySelector<HTMLElement>("[data-v28-scene='hero']");
      if (hero) {
        const hx = event.clientX / window.innerWidth - 0.5;
        const hy = event.clientY / window.innerHeight - 0.5;
        hero.style.setProperty("--mx", String(hx));
        hero.style.setProperty("--my", String(hy));
      }

      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-v28-tilt],[data-v28-float],[data-v28-magnetic],.v15-service");
      if (!target) return;
      const r = target.getBoundingClientRect();
      const nx = clamp((event.clientX - r.left) / Math.max(1, r.width), 0, 1) - 0.5;
      const ny = clamp((event.clientY - r.top) / Math.max(1, r.height), 0, 1) - 0.5;
      target.style.setProperty("--mx", String(nx));
      target.style.setProperty("--my", String(ny));

      if (target.matches("[data-v28-tilt]")) {
        target.style.setProperty("--tilt-x", `${ny * -5}deg`);
        target.style.setProperty("--tilt-y", `${nx * 6}deg`);
      }
      if (target.matches("[data-v28-magnetic]")) {
        target.style.setProperty("--mag-x", `${nx * 12}px`);
        target.style.setProperty("--mag-y", `${ny * 9}px`);
      }
    };

    const onPointerOver = (event: PointerEvent) => {
      if (reduced.matches || !finePointer.matches) return;
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-v28-cursor]");
      if (!target) return;
      setCursorLabel(target.dataset.v28Cursor || "VIEW");
      setCursorVisible(true);
    };

    const onPointerOut = (event: PointerEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-v28-cursor]");
      if (!target) return;
      const next = event.relatedTarget as Node | null;
      if (next && target.contains(next)) return;
      setCursorVisible(false);
    };

    const onPointerLeave = (event: PointerEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-v28-tilt],[data-v28-float],[data-v28-magnetic],.v15-service");
      if (target) resetElement(target);
    };

    updateScroll();
    window.addEventListener("scroll", requestScroll, { passive: true });
    window.addEventListener("resize", requestScroll);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerover", onPointerOver);
    document.addEventListener("pointerout", onPointerOut);
    document.addEventListener("pointerleave", onPointerLeave, true);

    return () => {
      window.removeEventListener("scroll", requestScroll);
      window.removeEventListener("resize", requestScroll);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerout", onPointerOut);
      document.removeEventListener("pointerleave", onPointerLeave, true);
      if (raf.current != null) cancelAnimationFrame(raf.current);
      if (pointerRaf.current != null) cancelAnimationFrame(pointerRaf.current);
    };
  }, []);

  return <div className={`v28-cursor ${cursorVisible ? "is-visible" : ""}`} aria-hidden="true"><span>{cursorLabel}</span></div>;
}
