"use client";

import { useState } from "react";
import { bookingHref } from "@/data/booking";
import { PRICING, serviceList, services, vehicles, type ServiceId, type VehicleId } from "@/data/services";
import { track } from "@/lib/analytics";
import { durationShort, usd } from "@/lib/format";
import { TrackedLink } from "./TrackedLink";

const serviceMeta: Record<ServiceId, { number: string; cue: string }> = {
  maintenance: { number: "01", cue: "Keep it clean" },
  premium: { number: "02", cue: "Bring it back" },
  factoryReset: { number: "03", cue: "Start over" },
};

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
    requestAnimationFrame(() => {
      document.getElementById("home-config-stage")?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const chooseVehicle = (id: VehicleId) => {
    setVehicle(id);
    track("vehicle_select", { vehicle: id, service: service ?? undefined, location: "home_flow" });
  };

  return (
    <div className={`v15-flow ${service ? "has-service" : ""} ${quote ? "is-ready" : ""}`}>
      <div id="home-config-stage" className={`v15-stage ${service ? "is-open" : ""}`} aria-live="polite">
        {service && chosenService && (
          <div className="v15-stage-inner">
            <div className="v15-stage-topline">
              <span>{serviceMeta[service].number} / {chosenService.name}</span>
              <button type="button" onClick={() => { setService(null); setVehicle(null); }}>Close ×</button>
            </div>

            <div className="v15-stage-main">
              <div className="v15-stage-question">
                <p className="eyebrow">One more thing</p>
                <h3>What do you drive?</h3>
                <p>Choose the closest match. You can give us the exact year, make, and model next.</p>
              </div>

              <div className="v15-vehicles" role="radiogroup" aria-label="Choose vehicle size">
                {vehicles.map((v, index) => (
                  <button
                    key={v.id}
                    type="button"
                    role="radio"
                    aria-checked={vehicle === v.id}
                    className={`v15-vehicle ${vehicle === v.id ? "is-active" : ""}`}
                    onClick={() => chooseVehicle(v.id)}
                  >
                    <span className="v15-vehicle-num">0{index + 1}</span>
                    <span className="v15-vehicle-name">{v.label}</span>
                    <span className="v15-vehicle-hint">{v.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={`v15-result ${quote && chosenVehicle ? "is-visible" : ""}`}>
              {quote && chosenVehicle && (
                <>
                  <div className="v15-result-summary">
                    <span>Your detail</span>
                    <strong>{chosenService.name} · {chosenVehicle.label}</strong>
                    <small>About {durationShort(quote.minutes)} · Power + water included</small>
                  </div>
                  <div className="v15-result-price"><span>Total</span><strong>{usd(quote.price)}</strong></div>
                  <TrackedLink href={bookingHref(vehicle!, service)} event="book_click" params={{ location: "home_flow", vehicle: vehicle ?? undefined, service: service ?? undefined }} className="btn btn-primary v15-continue">Choose a time ↗</TrackedLink>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="v15-service-label">
        <span>{service ? "Change your detail" : "Choose your detail"}</span>
        <span>Tap one to continue</span>
      </div>

      <div className="v15-services" role="radiogroup" aria-label="Choose a detailing service">
        {serviceList.map((s) => {
          const active = service === s.id;
          const meta = serviceMeta[s.id];
          return (
            <button key={s.id} type="button" role="radio" aria-checked={active} className={`v15-service ${active ? "is-active" : ""}`} onClick={() => chooseService(s.id)}>
              <span className="v15-service-num">{meta.number}</span>
              <span className="v15-service-copy">
                <span className="v15-service-cue">{meta.cue}</span>
                <strong>{s.name.replace(" Detail", "")}</strong>
              </span>
              {s.recommended && <span className="v15-most">Most booked</span>}
              <span className="v15-arrow">↗</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
