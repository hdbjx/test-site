"use client";

import Link from "next/link";
import { useJourney } from "@/components/journey/JourneyContext";
import { nextOpeningLabel, useNextOpening } from "@/components/journey/useNextOpening";
import type { ServiceId, VehicleId } from "@/data/services";
import { track } from "@/lib/analytics";
import styles from "./NextOpeningNote.module.css";

type Props = {
  service: ServiceId | null | undefined;
  vehicle: VehicleId | null | undefined;
  location: string;
  className?: string;
};

/**
 * "Next opening · Thu, Oct 29, 9:00 AM" for a vehicle size + service. Renders nothing
 * until a real slot comes back, so it never shows a guess. When the visitor's journey
 * is already on this service, it also offers to hold that time for the booking page.
 */
export function NextOpeningNote({ service, vehicle, location, className = "" }: Props) {
  const { serviceIntent, setSelectedSlot } = useJourney();
  const slot = useNextOpening(vehicle, service);
  if (!service || !vehicle || !slot) return null;

  const canHold = serviceIntent === service;

  return (
    <p className={`${styles.note} ${className}`}>
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.label}>Next opening</span>
      <span className={styles.when}>{nextOpeningLabel(slot)}</span>
      {canHold && (
        <Link
          href={`/book?service=${service}&from=context`}
          className={styles.take}
          onClick={() => {
            setSelectedSlot(slot);
            track("book_click", { location: `${location}_next_opening`, vehicle, service });
          }}
        >
          Take it ↗
        </Link>
      )}
    </p>
  );
}
