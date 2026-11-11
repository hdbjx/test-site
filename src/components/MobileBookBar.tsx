"use client";

import { useEffect, useState } from "react";
import { LiveReviewCount } from "./GoogleReviewStats";
import { TrackedLink } from "./TrackedLink";
import { useJourney } from "@/components/journey/JourneyContext";
import { useNextOpening } from "@/components/journey/useNextOpening";
import { useVehicle } from "@/components/vehicle/VehicleContext";
import { isServiceId } from "@/data/services";

const TZ = "America/New_York";
const shortOpening = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short", hour: "numeric", minute: "2-digit" }).format(new Date(iso)).replace(":00", "");

/**
 * Homepage-only booking bar for phones. Slides up once the hero's own buttons
 * are off screen, and steps aside wherever the page already shows a booking
 * button (hero, the package price panel, the closing section, the footer).
 */
const HIDE_ZONES = [".v29-hero", "#home-config-stage", ".v29-close", ".site-footer"];

export function MobileBookBar() {
  const [visible, setVisible] = useState(false);
  const { vehicle } = useVehicle();
  const { serviceIntent } = useJourney();
  // Only once we know the vehicle: an opening for the wrong size would be a guess.
  const detailIntent = serviceIntent && isServiceId(serviceIntent) ? serviceIntent : "premium";
  const opening = useNextOpening(vehicle?.vehicle, vehicle ? detailIntent : null);

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
        {opening ? (
          <small className="home-book-bar-next"><i aria-hidden="true" />Next opening · {shortOpening(opening)}</small>
        ) : (
          <small><LiveReviewCount /> Google reviews</small>
        )}
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
