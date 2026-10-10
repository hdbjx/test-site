"use client";

import { useState } from "react";
import { bookingHref } from "@/data/booking";
import { PRICING, serviceList, vehicles, type VehicleId } from "@/data/services";
import { durationShort, usd } from "@/lib/format";
import { TrackedLink } from "./TrackedLink";

export function ServicesDecisionTool() {
  const [vehicle, setVehicle] = useState<VehicleId>("sedan");
  const label = vehicles.find((v) => v.id === vehicle)?.label ?? "Sedan";

  return (
    <div className="svc-price-tool">
      <div className="svc-vehicle-choices" role="radiogroup" aria-label="Vehicle type">
        {vehicles.map((v) => (
          <button key={v.id} type="button" role="radio" aria-checked={vehicle === v.id} onClick={() => setVehicle(v.id)} className={vehicle === v.id ? "is-active" : ""}>
            <strong>{v.label}</strong><span>{v.hint}</span>
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">Showing prices for {label}</p>
      <div className="svc-live-prices">
        {serviceList.map((s, i) => {
          const p = PRICING[vehicle][s.id];
          return (
            <article key={s.id} className={s.recommended ? "is-featured" : ""}>
              <div className="svc-live-number">0{i + 1}</div>
              <div>
                <p className="svc-live-kicker">{s.recommended ? "MOST BOOKED" : s.short}</p>
                <h3>{s.name}</h3>
                <p className="svc-live-time">About {durationShort(p.minutes)} in your driveway</p>
              </div>
              <div className="svc-live-buy">
                <strong>{usd(p.price)}</strong>
                <TrackedLink href={bookingHref(vehicle, s.id)} event="book_click" params={{ location: "services_compare", vehicle, service: s.id }} className="svc-mini-book">Book <span>↗</span></TrackedLink>
              </div>
            </article>
          );
        })}
      </div>
      <p className="svc-price-note">Power + water included. Pricing is based on vehicle size. Excessive condition or specialty concerns can require a custom quote.</p>
    </div>
  );
}
