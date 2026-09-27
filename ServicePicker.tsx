"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { bookingHref } from "@/data/booking";
import { PRICING, serviceList, vehicles, type VehicleId } from "@/data/services";
import { track } from "@/lib/analytics";
import { durationShort, usd } from "@/lib/format";
import { TrackedLink } from "./TrackedLink";

type Props = {
  location: string; // analytics label: "home", "services"
  headingId?: string;
};

/**
 * "What type of vehicle do you have?" → the three detailing services priced for that vehicle.
 * Server-rendered with Sedan selected, so every service, inclusion and price is in the HTML.
 */
export function ServicePicker({ location, headingId }: Props) {
  const [vehicle, setVehicle] = useState<VehicleId>("sedan");
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeIndex = vehicles.findIndex((v) => v.id === vehicle);

  const choose = (id: VehicleId) => {
    setVehicle(id);
    track("vehicle_select", { vehicle: id, location });
  };

  const onKey = (e: KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const next = (activeIndex + keys[e.key] + vehicles.length) % vehicles.length;
    choose(vehicles[next].id);
    refs.current[next]?.focus();
  };

  const vehicleLabel = vehicles[activeIndex].label;

  return (
    <div>
      <div
        role="radiogroup"
        aria-labelledby={headingId}
        onKeyDown={onKey}
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6"
      >
        {vehicles.map((v, i) => (
          <button
            key={v.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={vehicle === v.id}
            tabIndex={vehicle === v.id ? 0 : -1}
            onClick={() => choose(v.id)}
            className="choice"
          >
            <span className="font-display text-base font-semibold leading-tight">{v.label}</span>
            <span className="mt-0.5 text-sm leading-snug text-muted">{v.hint}</span>
          </button>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        Showing prices for {vehicleLabel}
      </p>

      <div className="mt-8 grid gap-4 md:mt-10 md:grid-cols-3 md:gap-0">
        {serviceList.map((s, i) => {
          const p = PRICING[vehicle][s.id];
          const rec = s.recommended;
          return (
            <article
              key={s.id}
              aria-labelledby={`svc-${location}-${s.id}`}
              className={`relative flex flex-col rounded-[var(--radius-panel)] border p-6 ${rec ? "mt-3 md:mt-0" : ""} md:rounded-none md:p-8 ${
                rec
                  ? "order-first border-ink bg-white md:order-none md:z-10 md:-my-3 md:rounded-[var(--radius-panel)] md:py-11 md:shadow-[0_18px_40px_rgb(17_17_17/0.08)]"
                  : `border-line bg-paper ${i === 0 ? "md:border-r-0" : "md:border-l-0"}`
              }`}
            >
              {rec && (
                <p className="absolute -top-3 left-6 rounded-full bg-oxblood px-3 py-1 font-display text-xs font-semibold text-paper md:left-8">
                  Recommended for first visits
                </p>
              )}
              <h3 id={`svc-${location}-${s.id}`} className="t-h3">
                {s.name}
              </h3>
              <p className="mt-1 font-display font-semibold text-oxblood">{s.short}</p>

              <div className="mt-6 flex items-end gap-3">
                <p className="t-numeral text-[3.75rem] md:text-[4.25rem]">
                  <span className="sr-only">Price for a {vehicleLabel}: </span>
                  {usd(p.price)}
                </p>
                <p className="pb-2 text-sm text-muted">
                  about {durationShort(p.minutes)}
                  <br />
                  {vehicleLabel.toLowerCase()}
                </p>
              </div>

              <p className="mt-5 text-[0.9375rem] text-ink/80">{s.summary}</p>

              <ul className="mt-5 space-y-2 border-t border-line pt-5 text-[0.9375rem]">
                {s.includes.map((inc) => (
                  <li key={inc} className="flex gap-2.5">
                    <svg aria-hidden="true" viewBox="0 0 16 16" className="mt-1 h-4 w-4 shrink-0 text-red">
                      <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    {inc}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-7">
                <TrackedLink
                  href={bookingHref(vehicle, s.id)}
                  event="book_click"
                  params={{ location: `${location}_picker`, vehicle, service: s.id }}
                  onClick={() => track("service_select", { service: s.id, vehicle, location })}
                  className={`btn w-full ${rec ? "btn-primary" : "btn-secondary"}`}
                >
                  Book {s.name.replace(" Detail", "")}
                </TrackedLink>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
