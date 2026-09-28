"use client";

import { useState } from "react";
import { bookingHref } from "@/data/booking";
import { PRICING, serviceList, services, vehicles, type ServiceId, type VehicleId } from "@/data/services";
import { track } from "@/lib/analytics";
import { durationShort, usd } from "@/lib/format";
import { TrackedLink } from "./TrackedLink";

const serviceMeta: Record<ServiceId, { number: string; cue: string }> = {
  maintenance: { number: "01", cue: "Already pretty clean" },
  premium: { number: "02", cue: "Needs a real reset" },
  factoryReset: { number: "03", cue: "Needs everything" },
};

function VehicleIcon({ id }: { id: VehicleId }) {
  const truck = id === "smallTruck" || id === "largeTruck";
  const van = id === "minivan";
  const suv = id === "smallSUV" || id === "largeSUV";
  return (
    <svg aria-hidden="true" viewBox="0 0 120 48" className="vehicle-sketch">
      <path d={truck ? "M12 31h15l7-14h35l7 14h30v7H12z" : van ? "M12 32l9-18h61l20 18v6H12z" : suv ? "M12 32l12-17h54l25 17v6H12z" : "M12 32l18-15h45l28 15v6H12z"} />
      <circle cx="34" cy="38" r="7" /><circle cx="88" cy="38" r="7" />
    </svg>
  );
}

export function HomeBookingFlow() {
  const [service, setService] = useState<ServiceId | null>(null);
  const [vehicle, setVehicle] = useState<VehicleId | null>(null);
  const chosenService = service ? services[service] : null;
  const chosenVehicle = vehicle ? vehicles.find((v) => v.id === vehicle)! : null;
  const quote = service && vehicle ? PRICING[vehicle][service] : null;

  const chooseService = (id: ServiceId) => {
    setService(id);
    setVehicle(null);
    track("service_select", { service: id, location: "home_flow" });
    requestAnimationFrame(() => document.getElementById("home-vehicle-step")?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  };

  return (
    <div className="spend-flow">
      <div className="spend-services" role="radiogroup" aria-label="Choose a detailing service">
        {serviceList.map((s) => {
          const active = service === s.id;
          const meta = serviceMeta[s.id];
          return (
            <button key={s.id} type="button" role="radio" aria-checked={active} className={`spend-service ${active ? "is-active" : ""}`} onClick={() => chooseService(s.id)}>
              <div className="spend-service-top"><span>{meta.number}</span>{s.recommended && <em>Most booked</em>}</div>
              <div>
                <p className="spend-cue">{meta.cue}</p>
                <h3>{s.name.replace(" Detail", "")}</h3>
                <p>{s.summary}</p>
              </div>
              <span className="spend-pick">{active ? "Selected ✓" : "Choose this →"}</span>
            </button>
          );
        })}
      </div>

      <div id="home-vehicle-step" className={`vehicle-reveal ${service ? "is-open" : ""}`} aria-hidden={!service}>
        {service && (
          <div className="vehicle-reveal-inner">
            <div className="vehicle-step-head">
              <div><span className="step-chip">Step 2 of 2</span><h3>What are we working on?</h3></div>
              <button type="button" onClick={() => { setService(null); setVehicle(null); }} className="change-service">Change service</button>
            </div>
            <p className="vehicle-help">Pick the closest match. You can give us the exact year, make, and model when you book.</p>
            <div className="vehicle-rail" role="radiogroup" aria-label="Choose vehicle size">
              {vehicles.map((v) => (
                <button key={v.id} type="button" role="radio" aria-checked={vehicle === v.id} className={`vehicle-tile ${vehicle === v.id ? "is-active" : ""}`} onClick={() => { setVehicle(v.id); track("vehicle_select", { vehicle: v.id, service, location: "home_flow" }); }}>
                  <VehicleIcon id={v.id} /><strong>{v.label}</strong><span>{v.hint}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={`booking-result ${quote ? "is-ready" : ""}`} aria-live="polite">
        {quote && chosenService && chosenVehicle && service && vehicle && (
          <div className="booking-result-inner">
            <div className="booking-result-copy">
              <span>Your detail</span>
              <h3>{chosenService.name} · {chosenVehicle.label}</h3>
              <p>About {durationShort(quote.minutes)} in your driveway. We bring the power and water.</p>
            </div>
            <div className="booking-result-action">
              <div><span>Exact price</span><strong>{usd(quote.price)}</strong></div>
              <TrackedLink href={bookingHref(vehicle, service)} event="book_click" params={{ location: "home_flow", vehicle, service }} className="btn btn-primary spend-continue">Choose a time →</TrackedLink>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
