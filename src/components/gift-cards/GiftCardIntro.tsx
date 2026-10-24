"use client";

import { useEffect, useRef } from "react";

export function GiftCardIntro() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const card = cardRef.current;
    if (!section || !card) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    let raf = 0;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let currentScroll = 0;
    let targetScroll = 0;

    const apply = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      currentScroll += (targetScroll - currentScroll) * 0.1;

      section.style.setProperty("--gift-mouse-x", `${currentX}px`);
      section.style.setProperty("--gift-mouse-y", `${currentY}px`);
      section.style.setProperty("--gift-scroll-shift", `${currentScroll}px`);

      const settled =
        Math.abs(targetX - currentX) < 0.1 &&
        Math.abs(targetY - currentY) < 0.1 &&
        Math.abs(targetScroll - currentScroll) < 0.1;

      if (!settled) {
        raf = window.requestAnimationFrame(apply);
      } else {
        raf = 0;
      }
    };

    const queue = () => {
      if (!raf) raf = window.requestAnimationFrame(apply);
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!finePointer || prefersReducedMotion) return;
      const rect = section.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 12;
      targetY = y * 10;
      queue();
    };

    const onLeave = () => {
      targetX = 0;
      targetY = 0;
      queue();
    };

    const onScroll = () => {
      if (prefersReducedMotion) return;
      const rect = section.getBoundingClientRect();
      const progress = Math.min(Math.max((-rect.top) / Math.max(rect.height, 1), 0), 1);
      targetScroll = Math.min(progress * -46, 0);
      queue();
    };

    section.addEventListener("mousemove", onMouseMove);
    section.addEventListener("mouseleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      section.removeEventListener("mousemove", onMouseMove);
      section.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  const scrollToBuilder = () => {
    document.getElementById("gift-builder")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="gift-intro" data-header-tone="light" ref={sectionRef}>
      <div className="gift-intro-bg" aria-hidden="true">
        <span className="gift-intro-orbit gift-intro-orbit-a" />
        <span className="gift-intro-orbit gift-intro-orbit-b" />
        <span className="gift-intro-glow" />
      </div>

      <div className="container-ed gift-intro-shell">
        <div className="gift-intro-copy">
          <p className="eyebrow">Every Detail gift cards</p>
          <span>Give a better kind of clean.</span>
        </div>

        <div className="gift-intro-card-wrap">
          <div className="gift-card-preview gift-card-preview-lg gift-card-preview-intro" ref={cardRef}>
            <div className="gift-card-top"><span>EVERY DETAIL</span><b>GIFT CARD</b></div>
            <div className="gift-card-center"><strong>A better kind<br />of clean.</strong></div>
            <div className="gift-card-bottom"><span>MOBILE DETAILING · DECATUR + ATLANTA</span><i>ED</i></div>
          </div>
        </div>

        <button type="button" className="gift-intro-scroll" onClick={scrollToBuilder}>
          <span>Scroll to build one</span>
          <i aria-hidden="true">↓</i>
        </button>
      </div>
    </section>
  );
}
