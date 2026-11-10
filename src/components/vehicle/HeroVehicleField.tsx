"use client";

import { useRef, useState } from "react";
import { useVehicle, type SiteVehicle } from "@/components/vehicle/VehicleContext";
import { VehicleSearch } from "@/components/vehicle/VehicleSearch";
import { vehicleClassForYear, vehicleMatches, yearFromVehicleQuery } from "@/lib/vehicle-search";
import { track } from "@/lib/analytics";
import styles from "./hero-vehicle.module.css";

const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: THIS_YEAR + 2 - 1990 }, (_, i) => String(THIS_YEAR + 1 - i));

/** Smooth-scroll to the homepage packages (now priced for the car), clearing the fixed header. */
function goToPricing() {
  const target = document.getElementById("v29-choice-title") ?? document.getElementById("pricing");
  if (!target) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const top = target.getBoundingClientRect().top + window.scrollY - (window.innerWidth <= 640 ? 96 : 130);
  window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
}

/**
 * Homepage hero primary action: type your car inline (no popup), then
 * "See my price" takes you to the packages already priced for it.
 */
export function HeroVehicleField() {
  const { vehicle, hydrated, selectVehicle } = useVehicle();
  const [editing, setEditing] = useState(false);
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const set = hydrated && !!vehicle && !editing;

  const focusInput = () => rootRef.current?.querySelector<HTMLInputElement>("input")?.focus();

  const choose = (next: SiteVehicle, via: string) => {
    void selectVehicle(next, false);
    setEditing(false);
    setQuery("");
    setYear("");
    track("vehicle_select", { vehicle: next.vehicle, location: `home_hero_${via}` });
    // Close the phone keyboard first; scrolling while it animates away lands in the wrong place.
    (document.activeElement as HTMLElement | null)?.blur();
    window.setTimeout(goToPricing, window.matchMedia("(pointer: coarse)").matches ? 350 : 120);
  };

  const primary = () => {
    if (set) {
      track("book_click", { location: "home_hero_see_price", vehicle: vehicle?.vehicle });
      goToPricing();
      return;
    }
    // Typed something: take the best match. Otherwise point them at the field.
    const first = vehicleMatches(query)[0];
    if (first) {
      const y = yearFromVehicleQuery(query) || year;
      choose({ make: first.make, model: first.model, year: y || undefined, vehicle: vehicleClassForYear(first, y) }, "button");
      return;
    }
    focusInput();
  };

  // Leaving "Change" without picking anything goes back to the current car.
  const onBlur = () => {
    window.setTimeout(() => {
      const root = rootRef.current;
      if (editing && !query.trim() && root && !root.contains(document.activeElement)) setEditing(false);
    }, 0);
  };

  const change = () => {
    setEditing(true);
    window.requestAnimationFrame(focusInput);
  };

  return (
    <div ref={rootRef} className={styles.bar} data-set={set ? "" : undefined} data-hero-vehicle onBlur={onBlur}>
      <div className={styles.lead}>
        {set ? (
          <span className={styles.icon} aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="square" /></svg>
          </span>
        ) : null}

        {set ? (
          <div className={styles.current}>
            <span className={styles.label}>Priced for</span>
            <span className={styles.currentRow}>
              <strong>{vehicle ? vehicle.customLabel || [vehicle.make, vehicle.model].filter(Boolean).join(" ") : ""}</strong>
              <button type="button" className={styles.change} onClick={change}>Change</button>
            </span>
          </div>
        ) : (
          <>
            <label className={styles.year}>
              <span className={styles.label}>Year</span>
              <select value={year} onChange={(event) => { setYear(event.target.value); focusInput(); }} aria-label="Vehicle year">
                <option value="">Year</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </label>
            <div className={styles.search}>
              <span className={styles.label} aria-hidden="true">Make and model</span>
              <VehicleSearch
                key={editing ? "edit" : "new"}
                className={styles.vs}
                placeholder="e.g. Toyota RAV4"
                year={year}
                onQueryChange={setQuery}
                onSelect={(next) => choose(next, "search")}
              />
            </div>
          </>
        )}
      </div>

      <button type="button" className={styles.primary} onClick={primary}>
        See my price <span aria-hidden="true">↗</span>
      </button>
    </div>
  );
}
