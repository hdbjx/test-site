"use client";

import { useEffect, useState } from "react";
import { LiveReviewCount } from "./GoogleReviewStats";
import { TrackedLink } from "./TrackedLink";

/**
 * Homepage-only booking bar for phones. Slides up once the hero's own buttons
 * are off screen, and steps aside wherever the page already shows a booking
 * button (hero, the package price panel, the closing section, the footer).
 */
const HIDE_ZONES = [".v29-hero", "#home-config-stage", ".v29-close", ".site-footer"];

export function MobileBookBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Rect checks on scroll rather than IntersectionObserver: the package
    // panel grows from zero height while already on screen, which an
    // observer never re-reports.
    let frame = 0;
    const check = () => {
      frame = 0;
      const vh = window.innerHeight;
      const blocked = HIDE_ZONES.some((selector) =>
        Array.from(document.querySelectorAll(selector)).some((node) => {
          const r = node.getBoundingClientRect();
          return r.height > 1 && r.bottom > 0 && r.top < vh;
        }),
      );
      setVisible(!blocked);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(check); };
    check();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const resize = new ResizeObserver(schedule);
    HIDE_ZONES.forEach((selector) => document.querySelectorAll(selector).forEach((node) => resize.observe(node)));
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      resize.disconnect();
    };
  }, []);

  return (
    <div className={`home-book-bar ${visible ? "is-visible" : ""}`} aria-hidden={!visible}>
      <div className="home-book-bar-proof">
        <span aria-hidden="true">★★★★★</span>
        <small><LiveReviewCount /> Google reviews</small>
      </div>
      <TrackedLink
        href="/book"
        event="book_click"
        params={{ location: "home_sticky_bar" }}
        className="home-book-bar-cta"
        tabIndex={visible ? undefined : -1}
      >
        Book a detail <span aria-hidden="true">↗</span>
      </TrackedLink>
    </div>
  );
}
