"use client";

import { useEffect, useRef } from "react";
import { SantaHat } from "./Hats";
import "./christmas.css";

/**
 * CHRISTMAS — a Santa hat perched on the last letter of the hero's first line ("YOUR CAR." → the R).
 * Works with the personalized title too ("YOUR CIVIC." → the C). The hat tracks the actual glyph every
 * frame, so it rides along with the headline's entrance animation and mouse parallax.
 * Must be rendered inside the hero <section> (it positions itself against it).
 */
export function HeroSantaHat() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hat = ref.current;
    const section = hat?.closest("section");
    if (!hat || !section) return;
    let raf = 0;
    let visible = true;
    const range = document.createRange();
    let lastFont = "";
    let inkTop = 0.25;
    let inkH = 0.7;

    const glyphRect = () => {
      const word = section.querySelector("#v29-hero-title > span:first-child > i:nth-child(2)");
      const text = word?.firstChild;
      if (!text || text.nodeType !== Node.TEXT_NODE) return null;
      const value = text.textContent ?? "";
      const idx = value.replace(/[.\s]+$/, "").length - 1; // last letter, before the period
      if (idx < 0) return null;
      range.setStart(text, idx);
      range.setEnd(text, idx + 1);
      const r = range.getBoundingClientRect();
      if (!r.width) return null;
      // The range box spans the font's full ascent/descent; find where the letter's ink actually starts.
      const cs = getComputedStyle(word as Element);
      const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      if (font !== lastFont) {
        lastFont = font;
        const ctx = document.createElement("canvas").getContext("2d");
        if (ctx) {
          ctx.font = font;
          const m = ctx.measureText(value[idx]);
          inkTop = (m.fontBoundingBoxAscent - m.actualBoundingBoxAscent) / parseFloat(cs.fontSize);
          inkH = (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) / parseFloat(cs.fontSize);
        }
      }
      const fs = parseFloat(cs.fontSize);
      return { left: r.left, width: r.width, top: r.top + inkTop * fs, height: inkH * fs };
    };

    const tick = () => {
      const r = glyphRect();
      if (r) {
        const s = section.getBoundingClientRect();
        const w = r.width * 1.7; // hat width relative to the letter
        // Brim center lands on the top of the letter's bowl, slightly right of center, tipped to the right.
        const x = r.left - s.left + r.width * 0.5 - w * 0.5;
        const y = r.top - s.top + r.height * 0.24 - w * (290 / 420);
        hat.style.width = `${w}px`;
        hat.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(16deg)`;
        hat.style.opacity = "1";
      }
      if (visible) raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(tick);
    });
    io.observe(section);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className="xmas-hero-hat" aria-hidden="true">
      <SantaHat />
    </div>
  );
}
