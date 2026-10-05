"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";

const chapters = [
  {
    number: "01",
    kicker: "See the paint honestly",
    title: "Swirls are scratches. Shine can hide them.",
    body: "Under direct light, wash marring, haze and oxidation become obvious. We inspect the finish first so the process matches the paint instead of forcing every car into the same package.",
    image: "/images/mercedes-paint.jpg",
  },
  {
    number: "02",
    kicker: "Correct the surface",
    title: "Gloss comes from the paint underneath.",
    body: "Machine polishing refines the clear coat itself. An enhancement targets light haze and swirls. Full correction goes further when the finish needs multiple polishing stages.",
    image: "/images/red-paint-detail.jpg",
  },
  {
    number: "03",
    kicker: "Protect the result",
    title: "Then ceramic locks in the work.",
    body: "The coating bonds to clean, corrected paint and adds durable hydrophobic protection. It makes the finish easier to maintain, but it does not make paint scratch-proof or replace proper washing.",
    image: "/images/red-car-rig.jpg",
  },
];

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const range = (value: number, start: number, end: number) => clamp((value - start) / (end - start));
const bell = (value: number, start: number, peak: number, end: number) => {
  if (value <= start || value >= end) return 0;
  return value < peak ? range(value, start, peak) : 1 - range(value, peak, end);
};

export function PaintStoryScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      rafRef.current = null;
      if (!sectionRef.current || reduced.matches) return;
      const section = sectionRef.current;
      if (window.innerWidth > 800) {
        const rect = section.getBoundingClientRect();
        const travel = Math.max(1, section.offsetHeight - window.innerHeight);
        setProgress(clamp(-rect.top / travel));
        return;
      }
      const viewport = window.innerHeight;
      section.querySelectorAll<HTMLElement>("[data-paint-story]").forEach((el) => {
        const rect = el.getBoundingClientRect();
        const incoming = clamp((viewport * 0.92 - rect.top) / (viewport * 0.62));
        const outgoing = clamp((viewport * 0.14 - rect.bottom) / (viewport * 0.3));
        const presence = clamp(incoming * (1 - outgoing * 0.72));
        el.style.setProperty("--paint-mobile-in", String(incoming));
        el.style.setProperty("--paint-mobile-presence", String(presence));
        el.style.setProperty("--paint-mobile-exit", String(outgoing));
      });
    };
    const requestUpdate = () => {
      if (rafRef.current === null) rafRef.current = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const introOut = range(progress, 0.02, 0.11);
  const windows = [
    [0.07, 0.17, 0.30],
    [0.24, 0.35, 0.48],
    [0.42, 0.53, 0.66],
  ] as const;
  const finalIn = range(progress, 0.62, 0.77);
  const finalCopy = range(progress, 0.69, 0.82);

  return (
    <section ref={sectionRef} className="paint-story" aria-label="How paint correction and ceramic coating work">
      <div className="paint-story-sticky">
        <div className="paint-story-stage">
          <div
            className="paint-story-intro"
            data-paint-story
            style={{ opacity: 1 - introOut, transform: `translate3d(0, ${-46 * introOut}px, 0) scale(${1 - introOut * 0.025})`, filter: `blur(${introOut * 8}px)` }}
          >
            <p className="eyebrow">Correction before protection</p>
            <h2>The coating is only as good as <span>what’s underneath it.</span></h2>
            <p>That is why our ceramic service starts with the paint, not the bottle.</p>
          </div>

          <div className="paint-story-chapters">
            {chapters.map((chapter, index) => {
              const [start, peak, end] = windows[index];
              const visibility = bell(progress, start, peak, end);
              const entering = range(progress, start, peak);
              const leaving = range(progress, peak, end);
              const style = {
                "--paint-opacity": visibility,
                "--paint-y": `${(1 - entering) * 52 - leaving * 38}px`,
                "--paint-scale": 0.97 + visibility * 0.03,
                "--paint-blur": `${(1 - visibility) * 8}px`,
                "--paint-image": `url('${chapter.image}')`,
              } as CSSProperties;
              return (
                <article key={chapter.number} className="paint-story-chapter" data-paint-story style={style} aria-hidden={visibility < 0.05}>
                  <div className="paint-story-image" aria-hidden="true" />
                  <div className="paint-story-shade" />
                  <div className="paint-story-copy">
                    <p className="eyebrow">{chapter.number} / {chapter.kicker}</p>
                    <h2>{chapter.title}</h2>
                    <p>{chapter.body}</p>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="paint-story-final" data-paint-story style={{ opacity: finalIn, "--paint-final-copy": finalCopy } as CSSProperties}>
            <div className="paint-story-final-image" aria-hidden="true" />
            <div className="paint-story-final-shade" />
            <div className="paint-story-final-copy">
              <p className="eyebrow">The difference</p>
              <h2>Correction changes the paint.<br /><span>Ceramic protects the result.</span></h2>
              <p>Choose correction when the finish needs to look better. Add ceramic when you want that corrected finish protected for the long run.</p>
              <Link href="#packages" className="btn btn-primary">Compare the options ↓</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
