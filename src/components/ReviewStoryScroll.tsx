"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";

const chapters = [
  {
    kicker: "Trust over the upsell",
    title: "We’d rather lose the upsell than your trust.",
    quote: "Before they were done Wiley came to me and, being totally transparent, said my car didn't need the premium detail and they would only charge me for the maintenance detail…",
    author: "Vincent Madrigal",
  },
  {
    kicker: "Back to brand new",
    title: "The work still has to speak for itself.",
    quote: "My 2018 car looks brand new after a thorough detail by Aidan and Wiley! … All the dog hair is gone!",
    author: "Leigh Potts",
  },
  {
    kicker: "Serious standards",
    title: "Rain wasn’t going to stop the job.",
    quote: "It was raining when they arrived, but instead of postponing, they took their own initiative to set up a tent over the car and got right to work.",
    author: "Max Galipeau",
  },
];

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const range = (value: number, start: number, end: number) => clamp((value - start) / (end - start));
const bell = (value: number, start: number, peak: number, end: number) => {
  if (value <= start || value >= end) return 0;
  return value < peak ? range(value, start, peak) : 1 - range(value, peak, end);
};

export function ReviewStoryScroll({ reviewCount }: { reviewCount: ReactNode }) {
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

      // Mobile stays in normal document flow, but every story beat is still
      // continuously driven by its position in the viewport.
      const viewport = window.innerHeight;
      section.querySelectorAll<HTMLElement>("[data-mobile-story]").forEach((el) => {
        const rect = el.getBoundingClientRect();
        const raw = clamp((viewport * 0.92 - rect.top) / (viewport * 0.62));
        const exit = clamp((viewport * 0.18 - rect.bottom) / (viewport * 0.28));
        const presence = clamp(raw * (1 - exit * 0.72));
        el.style.setProperty("--mobile-in", String(raw));
        el.style.setProperty("--mobile-presence", String(presence));
        el.style.setProperty("--mobile-exit", String(exit));
      });

      const reveal = section.querySelector<HTMLElement>(".review-story-reveal");
      if (reveal) {
        const rect = reveal.getBoundingClientRect();
        const revealProgress = clamp((viewport - rect.top) / Math.max(viewport * 0.9, rect.height));
        reveal.style.setProperty("--mobile-reveal", String(revealProgress));
      }
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

  const introOut = range(progress, 0.015, 0.10);
  const chapterWindows = [
    [0.07, 0.16, 0.29],
    [0.23, 0.34, 0.47],
    [0.41, 0.52, 0.64],
  ] as const;
  const revealIn = range(progress, 0.60, 0.74);
  const revealCopy = range(progress, 0.67, 0.79);
  const statsIn = range(progress, 0.76, 0.88);
  const standardIn = range(progress, 0.84, 0.94);

  return (
    <section ref={sectionRef} className="review-story review-story-v26" aria-label="What customers say about Every Detail">
      <div className="review-story-sticky">
        <div className="review-story-stage">
          <div
            className="review-story-intro" data-mobile-story
            style={{ opacity: 1 - introOut, transform: `translate3d(0, ${-52 * introOut}px, 0) scale(${1 - introOut * 0.025})`, filter: `blur(${introOut * 8}px)` }}
          >
            <p className="eyebrow">The people who already said yes</p>
            <h2>Trust is earned.<br /><span>So are five stars.</span></h2>
            <p>{reviewCount} five-star Google reviews. Three tell the Every Detail story better than we ever could.</p>
          </div>

          <div className="review-story-chapters">
            {chapters.map((item, index) => {
              const [start, peak, end] = chapterWindows[index];
              const visibility = bell(progress, start, peak, end);
              const entering = range(progress, start, peak);
              const leaving = range(progress, peak, end);
              const style = {
                "--chapter-opacity": visibility,
                "--chapter-y": `${(1 - entering) * 54 - leaving * 44}px`,
                "--chapter-scale": 0.965 + visibility * 0.035,
                "--chapter-blur": `${(1 - visibility) * 9}px`,
              } as CSSProperties;
              return (
                <article key={item.author} className="review-story-chapter" data-mobile-story style={style} aria-hidden={visibility < 0.05}>
                  <div className="review-story-copy">
                    <p className="eyebrow">0{index + 1} / {item.kicker}</p>
                    <h2>{item.title}</h2>
                    <blockquote>“{item.quote}”</blockquote>
                    <footer>{item.author} <span>· Google Review · ★★★★★</span></footer>
                  </div>
                </article>
              );
            })}
          </div>

          <div
            className="review-story-reveal" data-mobile-story
            style={{ opacity: revealIn, transform: `scale(${1.045 - revealIn * 0.045})`, "--reveal-copy": revealCopy, "--stats-in": statsIn, "--standard-in": standardIn } as CSSProperties}
          >
            <div className="review-story-team-photo" aria-hidden="true" />
            <div className="review-story-reveal-shade" />
            <div className="review-story-reveal-copy">
              <p className="eyebrow">100% student-built</p>
              <h2><span className="reveal-line reveal-line-one">Built by students.</span><span className="reveal-line reveal-line-two">Run like a company.</span></h2>
              <p className="review-story-reveal-body">We built the training, the mobile operation, and even the software behind our jobs. Every review has our names on it.</p>
              <div className="review-story-stats">
                <div><strong>{reviewCount}</strong><span>five-star reviews</span></div>
                <div><strong>3</strong><span>training tiers</span></div>
                <div><strong>2</strong><span>equipped rigs</span></div>
                <div><strong>Custom</strong><span>job software</span></div>
              </div>
              <strong className="review-story-standard">Young team. <em>Serious standards.</em></strong>
              <Link href="/about-us" className="btn btn-primary review-story-link">Meet Every Detail ↗</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
