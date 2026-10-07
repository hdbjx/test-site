"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";

const levels = [
  {
    number: "01",
    name: "Maintenance",
    kicker: "ROUTINE CARE",
    headline: "Protect the clean baseline.",
    body: "For a vehicle that is already in good shape. We move efficiently through the whole car without pretending it needs restoration-level labor.",
    price: "$150+",
    time: "2–3 HR",
    labor: "LIGHT",
    meter: 34,
    image: "/images/exterior-wash-team.jpg",
    tags: ["HAND WASH", "VACUUM", "SURFACES", "GLASS", "WHEELS"],
  },
  {
    number: "02",
    name: "Premium",
    kicker: "FULL DETAIL",
    headline: "Work through the entire car.",
    body: "This is the full inside-and-out detail most first-time clients need. More technician time means more depth, more consistency, and fewer untouched areas.",
    price: "$260+",
    time: "2.5–3.5 HR",
    labor: "DEEP",
    meter: 67,
    image: "/images/interior-detail-team.jpg",
    tags: ["DEEP VACUUM", "SEATS + MATS", "TRIM", "JAMBS", "PAINT PROTECTION", "TIGHT AREAS"],
  },
  {
    number: "03",
    name: "Factory Reset",
    kicker: "DEEPEST CLEAN",
    headline: "Go after what a normal detail leaves behind.",
    body: "Extraction, embedded buildup, seams, contamination, pet hair and problem areas add real labor. Factory Reset is where the process expands to match the condition.",
    price: "$400+",
    time: "4+ HR",
    labor: "MAXIMUM",
    meter: 100,
    image: "/images/interior-extraction.jpg",
    tags: ["EXTRACTION", "STAINS", "PET HAIR", "SEAMS + VENTS", "CLAY", "DECONTAMINATION", "MORE TECH TIME"],
  },
];

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const range = (value: number, start: number, end: number) => clamp((value - start) / (end - start));
const bell = (value: number, start: number, peak: number, end: number) => {
  if (value <= start || value >= end) return 0;
  return value < peak ? range(value, start, peak) : 1 - range(value, peak, end);
};

export function ServiceDepthScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      rafRef.current = null;
      const section = sectionRef.current;
      if (!section || reduced.matches) return;

      if (window.innerWidth > 800) {
        const rect = section.getBoundingClientRect();
        const travel = Math.max(1, section.offsetHeight - window.innerHeight);
        setProgress(clamp(-rect.top / travel));
        return;
      }

      const viewport = window.innerHeight;
      section.querySelectorAll<HTMLElement>("[data-depth-mobile]").forEach((el) => {
        const rect = el.getBoundingClientRect();
        const incoming = clamp((viewport * 0.9 - rect.top) / (viewport * 0.58));
        const outgoing = clamp((viewport * 0.1 - rect.bottom) / (viewport * 0.28));
        el.style.setProperty("--depth-mobile-in", String(incoming));
        el.style.setProperty("--depth-mobile-out", String(outgoing));
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

  const introOut = range(progress, 0.025, 0.12);
  const windows = [
    [0.07, 0.18, 0.34],
    [0.28, 0.44, 0.60],
    [0.53, 0.69, 0.86],
  ] as const;
  const finaleIn = range(progress, 0.82, 0.94);
  const railProgress = Math.round(range(progress, 0.08, 0.84) * 100);

  return (
    <section ref={sectionRef} className="service-depth" aria-label="How Every Detail service levels increase in depth">
      <div className="service-depth-sticky">
        <div className="service-depth-stage">
          <div className="service-depth-rail" aria-hidden="true">
            <span>ROUTINE</span>
            <i><b style={{ height: `${railProgress}%` }} /></i>
            <span>RESET</span>
          </div>

          <div
            className="service-depth-intro"
            data-depth-mobile
            style={{ opacity: 1 - introOut, transform: `translate3d(0, ${-42 * introOut}px, 0) scale(${1 - introOut * 0.025})`, filter: `blur(${introOut * 8}px)` }}
          >
            <p className="svc-eyebrow">SCROLL TO GO DEEPER</p>
            <h2>Same car.<br /><span>More work.</span></h2>
            <p>The service level changes with the starting condition. Scroll to see what actually grows as the job gets deeper.</p>
            <div className="service-depth-cue"><span>↓</span> KEEP SCROLLING</div>
          </div>

          <div className="service-depth-levels">
            {levels.map((level, index) => {
              const [start, peak, end] = windows[index];
              const visibility = bell(progress, start, peak, end);
              const entering = range(progress, start, peak);
              const leaving = range(progress, peak, end);
              const meterIn = range(entering, 0.22, 0.82);
              const tagIn = range(entering, 0.42, 0.9);
              const style = {
                "--depth-opacity": visibility,
                "--depth-y": `${(1 - entering) * 70 - leaving * 46}px`,
                "--depth-scale": 0.965 + visibility * 0.035,
                "--depth-blur": `${(1 - visibility) * 10}px`,
                "--depth-image": `url('${level.image}')`,
                "--depth-meter": `${level.meter * meterIn}%`,
                "--depth-tags": tagIn,
              } as CSSProperties;

              return (
                <article className={`service-depth-level depth-${index + 1}`} key={level.name} data-depth-mobile style={style}>
                  <div className="service-depth-photo" aria-hidden="true" />
                  <div className="service-depth-shade" aria-hidden="true" />
                  <div className="service-depth-grid">
                    <div className="service-depth-copy">
                      <div className="service-depth-index"><b>{level.number}</b><span>{level.kicker}</span></div>
                      <h2>{level.name}</h2>
                      <h3>{level.headline}</h3>
                      <p>{level.body}</p>
                    </div>

                    <div className="service-depth-data">
                      <div className="service-depth-meter">
                        <div className="service-depth-meter-head"><span>LABOR DEPTH</span><strong>{level.labor}</strong></div>
                        <div className="service-depth-meter-track"><i /></div>
                      </div>
                      <div className="service-depth-tags">
                        {level.tags.map((tag, tagIndex) => <span key={tag} style={{ "--tag-delay": tagIndex } as CSSProperties}>{tag}</span>)}
                      </div>
                      <div className="service-depth-stats"><div><span>TIME</span><strong>{level.time}</strong></div><div><span>STARTS AT</span><strong>{level.price}</strong></div></div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="service-depth-finale" data-depth-mobile style={{ opacity: finaleIn, transform: `scale(${1.04 - finaleIn * 0.04})` }}>
            <div>
              <p className="svc-eyebrow">THE POINT ISN&apos;T TO BUY THE BIGGEST PACKAGE</p>
              <h2>Buy the amount of work<br /><span>your car actually needs.</span></h2>
              <p>That is why we built three levels instead of pretending every vehicle should get the same process.</p>
              <Link href="#maintenance-detail" className="svc-tactile-btn">See exactly what&apos;s included <span>↓</span></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
