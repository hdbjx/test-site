"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/components/motion/useMotion";

export function PaintInspectionLight() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let raf = 0;
    let sweepRaf = 0;
    let pointerMoved = false;
    let lastX = 65;
    let lastY = 40;

    const setLight = (x: number, y: number) => {
      node.style.setProperty("--pc90-light-x", `${x}%`);
      node.style.setProperty("--pc90-light-y", `${y}%`);
    };

    setLight(lastX, lastY);

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const bounds = node.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) return;
      pointerMoved = true;
      cancelAnimationFrame(sweepRaf);
      lastX = ((event.clientX - bounds.left) / bounds.width) * 100;
      lastY = ((event.clientY - bounds.top) / bounds.height) * 100;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setLight(lastX, lastY);
      });
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    if (!reduced) {
      const started = performance.now();
      const sweep = (now: number) => {
        if (pointerMoved) return;
        const progress = Math.min((now - started) / 2400, 1);
        const eased = 0.5 - Math.cos(progress * Math.PI) / 2;
        setLight(16 + (65 - 16) * eased, 40);
        if (progress < 1) sweepRaf = requestAnimationFrame(sweep);
      };
      sweepRaf = requestAnimationFrame(sweep);
    }

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(sweepRaf);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [reduced]);

  return (
    <div ref={ref} className="pc90-inspection-visual" aria-hidden="true">
      <div className="pc90-inspection-photo ed90-photo-grade">
        <Image
          src="/images/mercedes-paint.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="pc90-inspection-darkness" />
    </div>
  );
}
