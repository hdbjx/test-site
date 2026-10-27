"use client";

import { useEffect, useId, useRef } from "react";

type CurvedTapeProps = {
  text: string;
  /** idle drift, SVG units per second */
  speed?: number;
  /** how hard scroll velocity pushes it */
  boost?: number;
  /** flip direction with scroll direction */
  followScroll?: boolean;
  label?: string;
  /** colour of the section right below the tape, so the fill under the curve blends into it */
  surface?: "paper" | "ink";
};

// One curve drives everything: the paper fill below it, the red ribbon on it, and the text riding it.
const CURVE = "M -400 172 C 120 214, 520 222, 820 156 S 1340 78, 1840 112";

export function CurvedTape({ text, speed = 70, boost = 0.9, followScroll = true, label, surface = "paper" }: CurvedTapeProps) {
  const rawId = useId();
  const pathId = `ed-tape-path-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const svgRef = useRef<SVGSVGElement>(null);
  const tpRef = useRef<SVGTextPathElement>(null);
  const measureRef = useRef<SVGTextElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const tp = tpRef.current;
    const measure = measureRef.current;
    if (!svg || !tp || !measure) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let cancelled = false;
    let observer: IntersectionObserver | null = null;

    const start = () => {
      if (cancelled) return;
      const path = svg.querySelector<SVGPathElement>(".ed-tape-line");
      if (!path) return;

      // measure one repeat exactly (2 copies - 1 copy sidesteps trailing-space trimming)
      measure.textContent = text;
      const one = measure.getComputedTextLength();
      measure.textContent = text + text;
      const unit = measure.getComputedTextLength() - one;
      measure.textContent = "";
      if (!unit) return;

      tp.textContent = text.repeat(Math.ceil(path.getTotalLength() / unit) + 2);

      let offset = 0;
      let vel = 0;
      let dir = -1;
      let last = performance.now();
      let lastY = window.scrollY;
      let visible = true;

      observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { rootMargin: "200px" });
      observer.observe(svg);

      const tick = (now: number) => {
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;

        const y = window.scrollY;
        const dy = y - lastY;
        lastY = y;
        if (followScroll && dy !== 0) dir = dy > 0 ? -1 : 1;

        const push = reduced.matches ? 0 : boost;
        const target = dt > 0 ? Math.abs(dy / dt) * push : 0;
        const ease = target > vel ? 0.25 : 0.06; // fast attack, slow settle
        vel += (target - vel) * (1 - Math.pow(1 - ease, dt * 60));

        if (visible) {
          const s = Math.min(speed + vel, 2500);
          offset = (((offset + dir * s * dt) % unit) + unit) % unit;
          tp.setAttribute("startOffset", String(offset - unit));
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    if (document.fonts?.ready) document.fonts.ready.then(start);
    else start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, [text, speed, boost, followScroll]);

  return (
    <section className="ed-tape" data-header-tone="brand" aria-label={label ?? text.trim()}>
      <svg
        ref={svgRef}
        className="ed-tape-svg"
        viewBox="0 0 1440 260"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        focusable="false"
      >
        <path className="ed-tape-paper" d={`${CURVE} L 1840 400 L -400 400 Z`} style={surface === "ink" ? { fill: "var(--v29-ink, #0b0a09)" } : undefined} />
        <path id={pathId} className="ed-tape-line" d={CURVE} />
        <text className="ed-tape-text" dy="0.36em">
          <textPath ref={tpRef} href={`#${pathId}`} />
        </text>
        <text ref={measureRef} className="ed-tape-text" visibility="hidden" />
      </svg>
    </section>
  );
}
