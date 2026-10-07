"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";

const levels = [
  {
    number: "01",
    id: "maintenance-detail",
    name: "Maintenance",
    kicker: "ROUTINE CARE",
    headline: "Protect the clean baseline.",
    body: "For a vehicle that is already in good shape. We move efficiently through the whole car without pretending it needs restoration-level labor.",
    best: "Regularly detailed vehicles and returning clients that already have a clean baseline.",
    price: "$150+",
    time: "2–3 HR",
    labor: "LIGHT",
    meter: 34,
    image: "/images/exterior-wash-team.jpg",
    position: "center 61%",
    tags: ["HAND WASH", "VACUUM", "SURFACES", "GLASS", "WHEELS"],
  },
  {
    number: "02",
    id: "premium-detail",
    name: "Premium",
    kicker: "FULL DETAIL",
    headline: "Work through the entire car.",
    body: "This is the full inside-and-out detail most first-time clients need. More technician time means more depth, more consistency, and fewer untouched areas.",
    best: "Most first-time clients and daily-driven vehicles that need a proper full detail.",
    price: "$260+",
    time: "2.5–3.5 HR",
    labor: "DEEP",
    meter: 67,
    image: "/images/interior-detail-team.jpg",
    position: "center 48%",
    tags: ["DEEP VACUUM", "SEATS + MATS", "TRIM", "JAMBS", "PAINT PROTECTION", "TIGHT AREAS"],
  },
  {
    number: "03",
    id: "factory-reset",
    name: "Factory Reset",
    kicker: "DEEPEST CLEAN",
    headline: "Go after what a normal detail leaves behind.",
    body: "Extraction, embedded buildup, seams, contamination, pet hair and problem areas add real labor. Factory Reset expands the process to match the condition.",
    best: "Heavily used vehicles, stains, pet hair, spills and long-term buildup that need a genuine reset.",
    price: "$400+",
    time: "4+ HR",
    labor: "MAXIMUM",
    meter: 100,
    image: "/images/interior-detail.jpg",
    position: "center 50%",
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
  const frameRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const topRef = useRef(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const section = sectionRef.current;
    if (!section) return;

    const measureHeader = () => {
      const header = document.querySelector<HTMLElement>("body > header, header");
      const headerRect = header?.getBoundingClientRect();
      // Use the header's actual viewport bottom rather than only its height.
      // This remains correct when the school-hours banner changes the sticky header.
      const top = window.innerWidth > 800 ? Math.max(0, Math.ceil(headerRect?.bottom ?? 0)) : 0;
      topRef.current = top;
      section.style.setProperty("--depth-top", `${top}px`);
    };

    const update = () => {
      rafRef.current = null;
      if (reduced.matches) return;
      measureHeader();

      if (window.innerWidth > 800) {
        const rect = section.getBoundingClientRect();
        const frame = frameRef.current;
        const frameHeight = frame?.offsetHeight ?? Math.max(1, window.innerHeight - topRef.current - 16);
        const travel = Math.max(1, section.offsetHeight - frameHeight);
        const distanceIntoStory = topRef.current - rect.top;
        setProgress(clamp(distanceIntoStory / travel));

        // Do not rely on CSS sticky alone. A clipped/overflow ancestor can make
        // Chromium treat the story as a normal block while its 760vh track keeps
        // scrolling. Explicit pin states guarantee that the frame stays visible
        // for the whole story and releases exactly at the bottom.
        if (frame) {
          let pin: "before" | "pinned" | "after" = "pinned";
          if (distanceIntoStory <= 0) pin = "before";
          else if (distanceIntoStory >= travel) pin = "after";
          if (frame.dataset.pin !== pin) frame.dataset.pin = pin;
        }
        return;
      }

      if (frameRef.current) delete frameRef.current.dataset.pin;

      const viewport = window.innerHeight;
      section.querySelectorAll<HTMLElement>("[data-depth-mobile]").forEach((el) => {
        const rect = el.getBoundingClientRect();
        const incoming = clamp((viewport * 0.9 - rect.top) / (viewport * 0.58));
        el.style.setProperty("--depth-mobile-in", String(incoming));
      });
    };

    const requestUpdate = () => {
      if (rafRef.current === null) rafRef.current = window.requestAnimationFrame(update);
    };

    measureHeader();
    update();

    // Browsers can resolve a hash before this very tall sticky story has fully
    // laid out. Re-resolve the initial destination after layout so direct
    // links such as /our-services#pricing land where they actually belong.
    const initialHash = window.location.hash.slice(1);
    let hashTimer: number | null = null;
    if (initialHash && !["maintenance-detail", "premium-detail", "factory-reset"].includes(initialHash)) {
      hashTimer = window.setTimeout(() => {
        document.getElementById(initialHash)?.scrollIntoView({ block: "start" });
      }, 120);
    }

    const header = document.querySelector<HTMLElement>("body > header, header");
    const observer = typeof ResizeObserver !== "undefined" && header ? new ResizeObserver(requestUpdate) : null;
    if (header && observer) observer.observe(header);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
      if (hashTimer !== null) window.clearTimeout(hashTimer);
    };
  }, []);

  const intro = 1 - range(progress, 0.045, 0.12);
  const anatomy = bell(progress, 0.085, 0.16, 0.255);
  const value = bell(progress, 0.215, 0.29, 0.37);
  const windows = [
    [0.335, 0.42, 0.515],
    [0.48, 0.57, 0.665],
    [0.63, 0.72, 0.825],
  ] as const;
  const finale = range(progress, 0.79, 0.9);
  const railProgress = Math.round(range(progress, 0.02, 0.9) * 100);

  return (
    <section ref={sectionRef} className="service-depth" aria-label="How Every Detail service levels increase in depth">
      <span id="maintenance-detail" className="service-depth-anchor" style={{ top: "34%" }} aria-hidden="true" />
      <span id="premium-detail" className="service-depth-anchor" style={{ top: "49%" }} aria-hidden="true" />
      <span id="factory-reset" className="service-depth-anchor" style={{ top: "64%" }} aria-hidden="true" />
      <div ref={frameRef} className="service-depth-sticky">
        <div className="service-depth-stage">
          <div className="service-depth-topline" aria-hidden="true">
            <span>EVERY DETAIL / SERVICE DEPTH</span><b>{String(Math.max(1, Math.min(7, Math.ceil(progress * 7)))).padStart(2, "0")} / 07</b>
          </div>
          <div className="service-depth-rail" aria-hidden="true">
            <span>ROUTINE</span><i><b style={{ height: `${railProgress}%` }} /></i><span>RESET</span>
          </div>

          <div className="service-depth-backdrops" aria-hidden="true">
            <div className="depth-backdrop depth-backdrop-intro" style={{ "--backdrop-opacity": intro } as CSSProperties} />
            <div className="depth-backdrop depth-backdrop-anatomy" style={{ "--backdrop-opacity": anatomy } as CSSProperties} />
            <div className="depth-backdrop depth-backdrop-value" style={{ "--backdrop-opacity": value } as CSSProperties} />
            <div className="depth-backdrop depth-backdrop-finale" style={{ "--backdrop-opacity": finale } as CSSProperties} />
            <div className="depth-backdrop-shade" />
          </div>

          <div className="service-depth-intro depth-scene" data-depth-mobile style={{ "--scene-opacity": intro, "--scene-y": `${(1 - intro) * 36}px` } as CSSProperties}>
            <p className="svc-eyebrow">SCROLL TO GO DEEPER</p>
            <h2>One car.<br /><span>Three depths.</span></h2>
            <p>The service level changes with the starting condition. Keep scrolling and the job gets deeper with you.</p>
            <div className="service-depth-cue"><span>↓</span> ENTER THE DETAIL</div>
          </div>

          <div className="service-depth-anatomy depth-scene" data-depth-mobile style={{ "--scene-opacity": anatomy, "--scene-y": `${(1 - anatomy) * 34}px` } as CSSProperties}>
            <div className="depth-anatomy-head"><p className="svc-eyebrow">WHAT A DETAIL ACTUALLY COVERS</p><h2>We don&apos;t clean a surface.<br/><span>We work through a car.</span></h2></div>
            <div className="depth-anatomy-grid">
              <article><b>01</b><h3>Interior</h3><p>Seats, carpets, mats, dash, console, doors, glass, cargo space and the small areas quick cleans skip.</p></article>
              <article><b>02</b><h3>Exterior</h3><p>Hand wash, wheels, tires, glass, jambs and the surfaces collecting road film, brake dust, bugs and grime.</p></article>
              <article><b>03</b><h3>The details</h3><p>Technician time goes into the edges, seams and transitions that make the whole vehicle feel consistently clean.</p></article>
            </div>
          </div>

          <div className="service-depth-value depth-scene" data-depth-mobile style={{ "--scene-opacity": value, "--scene-y": `${(1 - value) * 30}px` } as CSSProperties}>
            <p className="svc-eyebrow">WHY IT COSTS MORE THAN A WASH</p>
            <h2>You&apos;re buying<br/><span>technician hours.</span></h2>
            <div className="depth-value-equation"><span>TIME</span><i>+</i><span>EQUIPMENT</span><i>+</i><span>ATTENTION</span><i>=</i><strong>THE RESULT</strong></div>
            <p>Different starting conditions need different amounts of that labor. That is why the next three levels exist.</p>
          </div>

          <div className="service-depth-levels">
            {levels.map((level, index) => {
              const [start, peak, end] = windows[index];
              const visibility = bell(progress, start, peak, end);
              const entering = range(progress, start, peak);
              const leaving = range(progress, peak, end);
              const meterIn = range(entering, 0.12, 0.76);
              const tagIn = range(entering, 0.32, 0.88);
              const style = {
                "--depth-opacity": visibility,
                "--depth-y": `${(1 - entering) * 58 - leaving * 32}px`,
                "--depth-scale": 0.975 + visibility * 0.025,
                "--depth-image": `url('${level.image}')`,
                "--depth-position": level.position,
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
                      <div className="service-depth-best"><span>BEST FOR</span><p>{level.best}</p></div>
                    </div>
                    <div className="service-depth-data">
                      <div className="service-depth-meter"><div className="service-depth-meter-head"><span>LABOR DEPTH</span><strong>{level.labor}</strong></div><div className="service-depth-meter-track"><i /></div></div>
                      <div className="service-depth-tags">{level.tags.map((tag, tagIndex) => <span key={tag} style={{ "--tag-delay": tagIndex } as CSSProperties}>{tag}</span>)}</div>
                      <div className="service-depth-stats"><div><span>TIME</span><strong>{level.time}</strong></div><div><span>STARTS AT</span><strong>{level.price}</strong></div></div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="service-depth-finale depth-scene" data-depth-mobile style={{ "--scene-opacity": finale, "--scene-y": `${(1 - finale) * 24}px` } as CSSProperties}>
            <div>
              <p className="svc-eyebrow">THE RIGHT SERVICE IS THE RIGHT AMOUNT OF WORK</p>
              <h2>Now choose what<br/><span>your car needs.</span></h2>
              <p>You do not need the biggest package. You need the service that matches the vehicle in front of us.</p>
              <Link href="#pricing" className="svc-tactile-btn">Compare pricing for your vehicle <span>↓</span></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
