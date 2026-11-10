"use client";

import { siteVehicleLabel, useVehicle } from "@/components/vehicle/VehicleContext";
import { track } from "@/lib/analytics";
import styles from "./hero-vehicle.module.css";

/**
 * Homepage hero entry point for the vehicle picker. Replaces the automatic
 * first-visit popup: looks like a search field so the job is obvious, and
 * opens the same picker only when the visitor asks for it.
 */
export function HeroVehicleField() {
  const { vehicle, hydrated, openPicker } = useVehicle();
  const label = siteVehicleLabel(vehicle);
  const set = hydrated && !!vehicle;

  const open = () => {
    track("vehicle_select", { location: set ? "home_hero_change" : "home_hero_field" });
    openPicker();
  };

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.field}
        data-set={set ? "" : undefined}
        data-hero-vehicle
        onClick={open}
        aria-label={set ? `Pricing for ${label}. Change vehicle` : "Enter your vehicle to see your prices"}
      >
        <span className={styles.icon} aria-hidden="true">
          {set ? (
            <svg viewBox="0 0 24 24" width="20" height="20"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" width="22" height="22"><path d="M5 16.5h14M6.2 16.5l-1.1-.1A1.6 1.6 0 0 1 3.6 14.8v-2.3c0-.8.5-1.4 1.2-1.6l1.9-.5 1.8-3.2c.3-.6.9-.9 1.5-.9h4.6c.6 0 1.2.3 1.5.8l2.1 3.3 1.5.4c.7.2 1.2.8 1.2 1.6v2.4c0 .8-.6 1.5-1.4 1.6l-1.2.1M6.7 10.4h10.8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /><circle cx="8" cy="16.6" r="1.7" fill="none" stroke="currentColor" strokeWidth="1.7" /><circle cx="16" cy="16.6" r="1.7" fill="none" stroke="currentColor" strokeWidth="1.7" /></svg>
          )}
        </span>
        <span className={styles.text}>
          {set ? (
            <>
              <small>Pricing for</small>
              <strong>{label}</strong>
            </>
          ) : (
            <>
              <strong>What do you drive?</strong>
              <small>Search year, make or model</small>
            </>
          )}
        </span>
        <span className={styles.action} aria-hidden="true">{set ? "Change" : <><b className={styles.actionLabel}>See my price</b> <i>→</i></>}</span>
      </button>
      <p className={styles.note}>
        {set
          ? "Prices across the site are set for this vehicle."
          : "Prices across the site update to your vehicle."}
      </p>
    </div>
  );
}
