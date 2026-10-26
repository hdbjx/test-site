"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";
import { images } from "@/data/images";
import { useInViewOnce, usePrefersReducedMotion } from "@/components/motion/useMotion";

const before = images.find((image) => image.id === "paint-5050-before");
const after = images.find((image) => image.id === "paint-5050-after");
const single = images.find((image) => image.id === "paint-5050-single");

export function PaintFiftyFifty() {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInViewOnce<HTMLDivElement>({ threshold: 0.35 });
  const [split, setSplit] = useState(single ? 48 : 50);
  const hasPair = Boolean(before && after);

  useEffect(() => {
    if (!inView || reduced || (!hasPair && !single)) return;
    let raf = 0;
    const started = performance.now();
    const start = hasPair ? 15 : 35;
    const end = hasPair ? 50 : 48;
    const animate = (now: number) => {
      const progress = Math.min((now - started) / 1200, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setSplit(start + (end - start) * eased);
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    setSplit(start);
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [hasPair, inView, reduced]);

  if (!hasPair && !single) return null;

  return (
    <section className="pc90-fifty" data-header-tone="light" aria-labelledby="pc90-fifty-title">
      <div className="pc90-shell">
        <h2 id="pc90-fifty-title" className="ed90-heading pc90-fifty-heading">ONE PANEL.<br /><span>TWO STORIES.</span></h2>
        <div ref={ref} className={`pc90-fifty-stage${hasPair ? "" : " is-single"}`} style={{ "--pc90-split": `${split}%` } as CSSProperties}>
          {hasPair ? (
            <>
              <div className="pc90-fifty-layer ed90-photo-grade">
                <Image src={after!.file} alt={after!.alt} fill sizes="100vw" className="object-cover" />
              </div>
              <div className="pc90-fifty-layer pc90-fifty-before ed90-photo-grade">
                <Image src={before!.file} alt={before!.alt} fill sizes="100vw" className="object-cover" />
              </div>
              <label className="pc90-fifty-range-label">
                <span className="sr-only">Drag to compare the uncorrected and corrected halves of the same panel.</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={split}
                  onChange={(event) => setSplit(Number(event.target.value))}
                  aria-label="Drag to compare the uncorrected and corrected halves of the same panel."
                />
              </label>
            </>
          ) : (
            <>
              <div className="pc90-fifty-layer ed90-photo-grade">
                <Image src={single!.file} alt={single!.alt} fill sizes="100vw" className="object-cover" />
              </div>
              <div className="pc90-fifty-side-label pc90-fifty-side-label-left">CORRECTED</div>
              <div className="pc90-fifty-side-label pc90-fifty-side-label-right">AS ARRIVED</div>
              <label className="pc90-fifty-range-label">
                <span className="sr-only">Drag the tape marker to inspect the correction line on the panel.</span>
                <input
                  type="range"
                  min="20"
                  max="80"
                  value={split}
                  onChange={(event) => setSplit(Number(event.target.value))}
                  aria-label="Drag the tape marker to inspect the correction line on the panel."
                />
              </label>
            </>
          )}
          <div className="pc90-fifty-tape" aria-hidden="true">
            <svg viewBox="0 0 58 520" preserveAspectRatio="none">
              <defs>
                <filter id="pc90-paper-fiber" x="-20%" y="-10%" width="140%" height="120%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="4" result="noise" />
                  <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
                </filter>
              </defs>
              <path d="M4 0 L15 8 L9 16 L16 24 L10 34 L17 44 L8 55 L14 68 L8 82 L15 96 L9 110 L15 126 L8 142 L16 158 L9 176 L15 194 L8 212 L16 232 L9 252 L16 272 L8 292 L16 312 L9 332 L15 352 L8 372 L16 392 L9 412 L15 432 L8 452 L16 472 L9 492 L16 506 L10 520 L54 520 L47 508 L53 496 L46 482 L52 468 L45 452 L52 436 L45 418 L52 400 L45 382 L52 364 L45 346 L52 328 L45 310 L52 292 L45 274 L52 256 L45 238 L52 220 L45 202 L52 184 L45 166 L52 148 L45 130 L52 112 L45 94 L52 76 L45 58 L52 42 L46 28 L52 14 L46 0 Z" fill="#e9dfc8" opacity=".94" filter="url(#pc90-paper-fiber)" />
              <text x="29" y="260" textAnchor="middle" dominantBaseline="central" transform="rotate(90 29 260)" className="pc90-fifty-tape-text">50/50</text>
            </svg>
          </div>
        </div>
        <p className="pc90-figure-caption">
          {hasPair
            ? "FIG. 02 - SAME HOOD, SAME LIGHT. LEFT: AS IT ARRIVED. RIGHT: AFTER CORRECTION."
            : "FIG. 02 - REAL 50/50 TEST SPOT UNDER AN INSPECTION LIGHT. LEFT: AFTER CORRECTION. RIGHT: AS IT ARRIVED."}
        </p>
      </div>
    </section>
  );
}
