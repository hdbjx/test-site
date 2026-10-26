"use client";

import Image from "next/image";
import { useRef, type PointerEvent } from "react";

export function PaintInspectionLight() {
  const stage = useRef<HTMLDivElement>(null);

  function move(event: PointerEvent<HTMLDivElement>) {
    const el = stage.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--pl57-lamp-x", `${Math.max(0, Math.min(100, x))}%`);
    el.style.setProperty("--pl57-lamp-y", `${Math.max(0, Math.min(100, y))}%`);
  }

  return (
    <div className="pl57-inspection-stage pl60-inspection-stage" ref={stage} onPointerMove={move}>
      <Image
        src="/images/red-paint-detail.webp"
        alt="Close-up of a vehicle finish under inspection lighting"
        fill
        sizes="(max-width: 900px) 100vw, 72vw"
        className="pl57-inspection-image"
        priority={false}
      />
      <div className="pl57-inspection-dim" aria-hidden="true" />
      <div className="pl60-inspection-defects" aria-hidden="true" />
      <div className="pl57-inspection-lamp" aria-hidden="true" />
      <div className="pl57-inspection-crosshair" aria-hidden="true"><i /><i /></div>
      <span className="pl57-inspection-tag pl57-inspection-tag-a">SIMULATED INSPECTION LIGHT</span>
      <p className="pl57-inspection-hint">Defects become easier to see under direct light.</p>
    </div>
  );
}
