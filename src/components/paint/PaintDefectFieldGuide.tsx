"use client";

import { useEffect, useRef, useState } from "react";
import { Photo } from "@/components/Photo";
import { paintDefects } from "@/data/paint";

const visuals = [
  { id: "paint-02", caption: "FIG. 03 - SWIRLS" },
  { id: "hq-black-suv-grille", caption: "FIG. 04 - CLEAR-COAT SCRATCHES" },
  { id: "paint-03", caption: "FIG. 05 - SUN-FADED CLEAR" },
  { id: "classic-red-wheel", caption: "FIG. 06 - FLAT GLOSS" },
] as const;

export function PaintDefectFieldGuide() {
  const [active, setActive] = useState(0);
  const [enhanced, setEnhanced] = useState(false);
  const entryRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    setEnhanced(true);
    const observers = entryRefs.current.map((node, index) => {
      if (!node) return null;
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) setActive(index);
      }, { rootMargin: "-32% 0px -42% 0px", threshold: 0.05 });
      observer.observe(node);
      return observer;
    });

    return () => observers.forEach((observer) => observer?.disconnect());
  }, []);

  return (
    <div className={`pc90-field-guide ${enhanced ? "is-enhanced" : ""}`}>
      <div className="pc90-field-photo" aria-live="polite">
        <div className="pc90-field-photo-stack">
          {visuals.map((visual, index) => (
            <div key={visual.id} className={`pc90-field-photo-layer ed90-photo-grade ${active === index ? "is-active" : ""}`}>
              <Photo id={visual.id} sizes="(max-width: 899px) 100vw, 56vw" fill />
            </div>
          ))}
        </div>
        <p>{visuals[active].caption}</p>
      </div>

      <div className="pc90-field-entries">
        {paintDefects.map((defect, index) => (
          <article
            key={defect.name}
            ref={(node) => { entryRefs.current[index] = node; }}
            className={`pc90-field-entry ${active === index ? "is-active" : ""}`}
          >
            <div className="pc90-mobile-defect-photo ed90-photo-grade">
              <Photo id={visuals[index].id} sizes="100vw" ratio="4/5" />
            </div>
            <span className="pc90-field-number">{String(index + 1).padStart(2, "0")}</span>
            <h3>{defect.name}</h3>
            <p>{defect.detail}</p>
            {index === paintDefects.length - 1 && (
              <small>Correction works in the clear coat. Damage through the clear can be improved, not always erased.</small>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
