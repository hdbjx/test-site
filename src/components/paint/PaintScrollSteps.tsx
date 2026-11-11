"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Photo } from "@/components/Photo";
import styles from "./PaintScrollSteps.module.css";

type Step = { title: string; body: string; photo: string | "5050" };

/**
 * Apple-style pinned story for the paint process. On wide screens the photo frame
 * holds still while the steps scroll past at normal speed, and the frame cross-fades
 * to each step's real photo (the Correct step shows the real 50/50 test spot). No
 * scroll hijacking: the page scrolls exactly as fast as it always does. On phones,
 * and with reduced motion, every step simply shows its own photo inline.
 */
export function PaintScrollSteps({ steps, tone = "paper" }: { steps: Step[]; tone?: "paper" | "ink" }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const nodes = refs.current.filter(Boolean) as HTMLLIElement[];
    if (!nodes.length) return;
    // A step becomes active when it crosses the middle band of the screen.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const layer = (step: Step, sizes: string) =>
    step.photo === "5050" ? (
      <Image
        src="/images/paint-5050-single.jpg"
        alt="Real 50/50 paint correction test spot, corrected on the left and as it arrived on the right"
        fill
        sizes={sizes}
        className="object-cover"
      />
    ) : (
      <Photo id={step.photo} fill sizes={sizes} />
    );

  return (
    <div className={`${styles.story} ${tone === "ink" ? styles.ink : ""}`}>
      <div className={styles.frameCol} aria-hidden="true">
        <div className={styles.frame}>
          {steps.map((step, index) => (
            <div key={step.title} className={`${styles.layer} ${index === active ? styles.layerOn : ""}`}>
              {layer(step, "(max-width: 900px) 1px, 44vw")}
            </div>
          ))}
          {steps[active]?.photo === "5050" && (
            <p className={styles.split}><span>Corrected</span><span>As arrived</span></p>
          )}
          <p className={styles.counter}>
            <strong>{String(active + 1).padStart(2, "0")}</strong> / {String(steps.length).padStart(2, "0")} · {steps[active]?.title}
          </p>
          <div className={styles.progress}>
            {steps.map((step, index) => <i key={step.title} className={index <= active ? styles.progressOn : undefined} />)}
          </div>
        </div>
      </div>

      <ol className={styles.steps}>
        {steps.map((step, index) => (
          <li
            key={step.title}
            ref={(node) => { refs.current[index] = node; }}
            data-index={index}
            className={`${styles.step} ${index === active ? styles.stepOn : ""}`}
          >
            <div className={styles.inlinePhoto}>{layer(step, "(max-width: 900px) 92vw, 1px")}</div>
            <span className={styles.num}>{String(index + 1).padStart(2, "0")}</span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
