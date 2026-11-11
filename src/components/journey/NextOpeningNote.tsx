"use client";

import Link from "next/link";
import { useJourney } from "@/components/journey/JourneyContext";
import { useNextOpenings } from "@/components/journey/useNextOpening";
import type { ServiceId, VehicleId } from "@/data/services";
import { track } from "@/lib/analytics";
import styles from "./NextOpeningNote.module.css";

type Props = {
  service: ServiceId | null | undefined;
  vehicle: VehicleId | null | undefined;
  location: string;
  className?: string;
  /** How many openings to offer, one per day. */
  count?: number;
};

const TZ = "America/New_York";
const dayLabel = (iso: string) => new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short" }).format(new Date(iso));
const timeLabel = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" }).format(new Date(iso)).replace(":00", "");
const fullLabel = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(iso));

/**
 * "Next openings · Thu 9 · Fri 1 · Sat 8" for a vehicle size + service. Each time is a
 * link that holds that slot and opens booking with it already picked. Renders nothing
 * until real slots come back, so it never shows a guess.
 */
export function NextOpeningNote({ service, vehicle, location, className = "", count = 3 }: Props) {
  const { setServiceIntent, setSelectedSlot } = useJourney();
  const slots = useNextOpenings(vehicle, service, count);
  if (!service || !vehicle || !slots.length) return null;

  return (
    <div className={`${styles.note} ${className}`}>
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.label}>{slots.length > 1 ? "Next openings" : "Next opening"}</span>
      <span className={styles.slots}>
        {slots.map((slot) => (
          <Link
            key={slot}
            href={`/book?service=${service}&vehicle=${vehicle}&from=context`}
            className={styles.slot}
            aria-label={`Book ${fullLabel(slot)}`}
            onClick={() => {
              setServiceIntent(service);
              setSelectedSlot(slot);
              track("book_click", { location: `${location}_next_opening`, vehicle, service });
            }}
          >
            <span>{dayLabel(slot)}</span> {timeLabel(slot)}
          </Link>
        ))}
      </span>
    </div>
  );
}
