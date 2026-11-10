"use client";

import { useEffect, useRef, useState } from "react";
import { useVehicle, type SiteVehicle } from "@/components/vehicle/VehicleContext";
import { VehicleSearch } from "@/components/vehicle/VehicleSearch";
import { TrackedLink } from "@/components/TrackedLink";
import { vehicleClassForYear, vehicleMatches, yearFromVehicleQuery } from "@/lib/vehicle-search";
import { track } from "@/lib/analytics";
import styles from "./hero-vehicle.module.css";

/** Smooth-scroll to the homepage packages (now priced for the car), clearing the fixed header. */
function goToPricing() {
  const target = document.getElementById("v29-choice-title") ?? document.getElementById("pricing");
  if (!target) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const top = target.getBoundingClientRect().top + window.scrollY - (window.innerWidth <= 640 ? 96 : 130);
  window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
}

/** Full name for the "Priced for" line, without the year. */
const fullName = (v: SiteVehicle) => v.customLabel || [v.make, v.model].filter(Boolean).join(" ");

/** Short name for button labels: "CR-V", or "SUV"/"truck"/"car" when the model is long. */
function shortName(v: SiteVehicle) {
  const model = v.model?.trim() ?? "";
  if (model && model.length <= 10 && !/[/]/.test(model)) return model;
  if (v.vehicle === "smallTruck" || v.vehicle === "largeTruck") return "truck";
  if (v.vehicle === "smallSUV" || v.vehicle === "largeSUV") return "SUV";
  if (v.vehicle === "minivan") return "van";
  return "car";
}

/**
 * Homepage hero actions. One filled button at a time, chosen by state:
 *  - no car:            [What do you drive? | See my price]    Book a detail · Find my detail
 *  - car just picked:   [Priced for X      | See X prices]    Book my X · Find my detail
 *  - car already saved: [Priced for X      | Book my X]       See X prices · Find my detail
 * Book and Find fade back while someone is typing a car.
 */
export function HeroVehicleField() {
  const { vehicle, hydrated, selectVehicle } = useVehicle();
  const [editing, setEditing] = useState(false);
  const [query, setQuery] = useState("");
  const [pickedHere, setPickedHere] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const set = hydrated && !!vehicle && !editing;
  const returning = set && !pickedHere;
  const name = vehicle ? shortName(vehicle) : "";
  const typing = !set && query.trim().length > 0;

  // While the hero bar is on screen, the header's "Add your vehicle" pill would be a second
  // control for the same thing, so CSS hides it (html[data-hero-vehicle-visible]).
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const root = document.documentElement;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) root.dataset.heroVehicleVisible = "";
      else delete root.dataset.heroVehicleVisible;
    });
    io.observe(el);
    return () => {
      io.disconnect();
      delete root.dataset.heroVehicleVisible;
    };
  }, []);

  const focusInput = () => barRef.current?.querySelector<HTMLInputElement>("input")?.focus();

  const choose = (next: SiteVehicle, via: string) => {
    void selectVehicle(next, false);
    setPickedHere(true);
    setEditing(false);
    setQuery("");
    track("vehicle_select", { vehicle: next.vehicle, location: `home_hero_${via}` });
    // Close the phone keyboard first; scrolling while it animates away lands in the wrong place.
    (document.activeElement as HTMLElement | null)?.blur();
    window.setTimeout(goToPricing, window.matchMedia("(pointer: coarse)").matches ? 350 : 120);
  };

  const seePrices = () => {
    track("book_click", { location: "home_hero_see_price", vehicle: vehicle?.vehicle });
    goToPricing();
  };

  const searchSubmit = () => {
    // Typed something: take the best match. Otherwise point them at the field.
    const first = vehicleMatches(query)[0];
    if (first) {
      const year = yearFromVehicleQuery(query);
      choose({ make: first.make, model: first.model, year: year || undefined, vehicle: vehicleClassForYear(first, year) }, "button");
      return;
    }
    focusInput();
  };

  // Leaving "Change" without picking anything goes back to the current car.
  const onBlur = () => {
    window.setTimeout(() => {
      const bar = barRef.current;
      if (editing && !query.trim() && bar && !bar.contains(document.activeElement)) setEditing(false);
    }, 0);
  };

  const change = () => {
    setEditing(true);
    window.requestAnimationFrame(focusInput);
  };

  const bookParams = { location: "home_v29_hero", vehicle: vehicle?.vehicle };

  return (
    <div ref={rootRef} className={styles.actions} data-typing={typing ? "" : undefined}>
      <div ref={barRef} className={styles.bar} data-set={set ? "" : undefined} data-hero-vehicle onBlur={onBlur}>
        <div className={styles.lead}>
          {set && vehicle ? (
            <>
              <span className={styles.icon} aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="square" /></svg>
              </span>
              <div className={styles.current}>
                <span className={styles.label}>Priced for</span>
                <span className={styles.currentRow}>
                  <strong>{fullName(vehicle)}</strong>
                  <button type="button" className={styles.change} onClick={change}>Change</button>
                </span>
              </div>
            </>
          ) : (
            <div className={styles.search}>
              <VehicleSearch
                key={editing ? "edit" : "new"}
                className={styles.vs}
                placeholder="What do you drive?"
                onQueryChange={setQuery}
                onSelect={(next) => choose(next, "search")}
              />
            </div>
          )}
        </div>

        {!set ? (
          <button type="button" className={styles.primary} onClick={searchSubmit}>
            See my price <span aria-hidden="true">↗</span>
          </button>
        ) : returning ? (
          <TrackedLink href="/book" event="book_click" params={bookParams} className={styles.primary}>
            Book my {name} <span aria-hidden="true">↗</span>
          </TrackedLink>
        ) : (
          <button type="button" className={styles.primary} onClick={seePrices}>
            See {name} prices <span aria-hidden="true">↗</span>
          </button>
        )}
      </div>

      <div className={styles.secondary}>
        {set && returning ? (
          <button type="button" className={styles.ghost} onClick={seePrices}>
            See {name} prices <span aria-hidden="true">↗</span>
          </button>
        ) : (
          <TrackedLink href="/book" event="book_click" params={bookParams} className={styles.ghost}>
            {set ? <>Book my {name}</> : "Book a detail"} <span aria-hidden="true">↗</span>
          </TrackedLink>
        )}
        <TrackedLink href="/get-a-quote" event="quote_start" params={{ location: "home_v29_hero" }} className={styles.ghost}>
          <span>{!set ? <span className={styles.ghostPre}>Not sure? </span> : null}Find my detail</span> <span aria-hidden="true">↗</span>
        </TrackedLink>
      </div>
    </div>
  );
}
