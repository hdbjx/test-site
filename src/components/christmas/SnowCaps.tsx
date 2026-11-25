"use client";

import { useEffect, useRef } from "react";
import "./christmas.css";

/**
 * CHRISTMAS — small snow piles sitting on a few key buttons.
 * Caps live in one fixed overlay layer and follow their buttons every frame, so nothing
 * inside the real buttons is touched (no clipping, no layout changes, no edits to other components).
 * A cap hides itself when its button is covered (menu open, modal, etc.) or not on screen.
 */
const TARGETS = [
  ".site-shared-menu-button", // header MENU
  ".v29-hero [data-hero-vehicle]", // hero "What do you drive?" field
  ".home-book-bar-cta", // mobile sticky "Book a detail"
  'button[aria-label="Chat with Every Detail"]', // "Ask us"
].join(",");

const CAP_H = 22; // px of SVG above the button's top edge (mound + overhang)
const DRIP = 6; // px a drip can hang down over the button face

type Cap = { el: HTMLElement; node: HTMLDivElement; width: number };

// Small seeded RNG so a given button always gets the same pile (no reshuffling on resize).
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function capSvg(w: number, seed: number) {
  const r = rng(seed);
  const over = 3; // overhang past each side
  const W = w + over * 2;
  const base = CAP_H; // y of the button's top edge inside the svg
  // Lumpy top edge: low at the ends, fuller in the middle.
  const steps = Math.max(4, Math.round(W / (W > 300 ? 46 : 22)));
  const fullness = Math.min(1, W / 260); // wider surfaces hold a deeper pile
  let top = `M0 ${base + 1.5}`;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * W;
    const mid = 1 - Math.abs(i / steps - 0.5) * 2; // 0 at ends, 1 in middle
    const h = 2.5 + mid * (5 + fullness * 7) + r() * (2.5 + fullness * 4.5);
    const cx = x - W / steps / 2;
    top += i === 0 ? ` Q${x} ${base - h} ${x + 1} ${base - h}` : ` Q${cx} ${base - h - 2.2} ${x} ${base - h}`;
  }
  // Underside: hugs the button edge, with a couple of drips.
  let bottom = ` L${W} ${base + 1.5}`;
  const drips = W > 90 ? 2 : 1;
  const spots = Array.from({ length: drips }, (_, i) => over + 8 + ((i + 0.35 + r() * 0.3) / drips) * (w - 16)).sort((a, b) => b - a);
  for (const x of spots) {
    const d = 3 + r() * (DRIP - 3);
    bottom += ` L${x + 4} ${base + 1.5} Q${x + 3} ${base + d} ${x} ${base + d} Q${x - 3} ${base + d} ${x - 4} ${base + 1.5}`;
  }
  bottom += ` L0 ${base + 1.5} Z`;
  const id = `snow${seed}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${base + DRIP + 2}" viewBox="0 0 ${W} ${base + DRIP + 2}">
<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".7" stop-color="#f4f6f8"/><stop offset="1" stop-color="#d9e1e8"/></linearGradient></defs>
<path d="${top}${bottom}" fill="url(#${id})"/>
<path d="${top}" fill="none" stroke="#fff" stroke-width="1" opacity=".9"/>
</svg>`;
}

export function SnowCaps() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    const caps = new Map<HTMLElement, Cap>();
    let raf = 0;

    const collect = () => {
      const found = new Set(document.querySelectorAll<HTMLElement>(TARGETS));
      for (const [el, cap] of caps) if (!found.has(el) || !el.isConnected) { cap.node.remove(); caps.delete(el); }
      found.forEach((el) => {
        if (caps.has(el)) return;
        const node = document.createElement("div");
        node.className = "xmas-snowcap";
        layer.appendChild(node);
        caps.set(el, { el, node, width: 0 });
      });
    };

    const seedFor = (el: HTMLElement) => {
      const s = (el.className || "") + (el.textContent || "");
      let h = 7;
      for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 2147483647;
      return h || 1;
    };

    const tick = () => {
      for (const cap of caps.values()) {
        const r = cap.el.getBoundingClientRect();
        const onScreen = r.width > 20 && r.height > 10 && r.bottom > 0 && r.top < innerHeight && getComputedStyle(cap.el).visibility !== "hidden";
        // Hidden if something is covering the button's top edge (menu panel, modal, etc.)
        let covered = false;
        if (onScreen) {
          const hit = document.elementFromPoint(r.left + r.width / 2, Math.max(r.top + 3, 1));
          covered = !!hit && !cap.el.contains(hit) && !hit.contains(cap.el);
        }
        const show = onScreen && !covered && parseFloat(getComputedStyle(cap.el).opacity) > 0.5;
        cap.node.style.opacity = show ? "1" : "0";
        if (!onScreen) continue;
        const w = Math.round(r.width);
        if (w !== cap.width) {
          cap.width = w;
          cap.node.innerHTML = capSvg(w, seedFor(cap.el));
        }
        cap.node.style.transform = `translate3d(${r.left - 3}px, ${r.top - CAP_H}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    collect();
    const poll = window.setInterval(collect, 600);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(poll);
      caps.forEach((c) => c.node.remove());
    };
  }, []);

  return <div ref={layerRef} className="xmas-snowcaps" aria-hidden="true" />;
}
