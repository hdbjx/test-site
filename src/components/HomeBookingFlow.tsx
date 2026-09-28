"use client";

import { useRef, useState } from "react";
import { bookingHref } from "@/data/booking";
import { PRICING, serviceList, services, vehicles, type ServiceId, type VehicleId } from "@/data/services";
import { track } from "@/lib/analytics";
import { durationShort, usd } from "@/lib/format";
import { TrackedLink } from "./TrackedLink";

const serviceMeta: Record<ServiceId, { number: string; cue: string; subline: string; includes: string; detail: string }> = {
  maintenance: {
    number: "01",
    cue: "Keep it clean",
    subline: "For regularly detailed vehicles",
    includes: "Interior refresh · Hand wash · Wheels + tires · Light upkeep",
    detail: "Best for already clean vehicles",
  },
  premium: {
    number: "02",
    cue: "Bring it back",
    subline: "Top-to-bottom clean, inside and out — every corner, every detail.",
    includes: "Deep interior clean · Hand wash · Wheels + tires · Paint protection",
    detail: "Full interior + exterior · Most booked",
  },
  factoryReset: {
    number: "03",
    cue: "Start over",
    subline: "Like it just rolled off the lot — maybe better.",
    includes: "Deep interior clean · Extraction · Decontamination · Detailed cracks + crevices",
    detail: "Deepest clean · Heavy reset",
  },
};

export function HomeBookingFlow() {
  const [service, setService] = useState<ServiceId | null>(null);
  const [vehicle, setVehicle] = useState<VehicleId | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const chosenService = service ? services[service] : null;
  const chosenVehicle = vehicle ? vehicles.find((v) => v.id === vehicle)! : null;
  const quote = service && vehicle ? PRICING[vehicle][service] : null;

  const easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const guideToVehicleStep = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const offset = window.innerWidth <= 640 ? 112 : window.innerWidth <= 1023 ? 145 : 195;
    const start = window.scrollY;
    const target = Math.max(0, stage.getBoundingClientRect().top + window.scrollY - offset);
    if (reduceMotion) {
      window.scrollTo(0, target);
      return;
    }
    const distance = target - start;
    const duration = 500;
    const startedAt = performance.now();
    const step = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      window.scrollTo(0, start + distance * easeInOutCubic(progress));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const chooseService = (id: ServiceId) => {
    const openingForFirstTime = service === null;
    setService(id);
    setVehicle(null);
    track("service_select", { service: id, location: "home_flow" });
    if (openingForFirstTime) window.setTimeout(guideToVehicleStep, 110);
  };

  const chooseVehicle = (id: VehicleId) => {
    setVehicle(id);
    track("vehicle_select", { vehicle: id, service: service ?? undefined, location: "home_flow" });
  };

  return (
    <div className={`v15-flow ${service ? "has-service" : ""} ${quote ? "is-ready" : ""}`}>
      <div ref={stageRef} id="home-config-stage" className={`v15-stage ${service ? "is-open" : ""}`} aria-live="polite">
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
                    <small>About {durationShort(quote.minutes)} in your driveway <span>· Power + water included</span></small>
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
                <span className="v15-service-main">
                  <strong>{s.name.replace(" Detail", "")}</strong>
                  <span className="v15-service-subline">{meta.subline}</span>
                  <span className="v15-service-includes">{meta.includes}</span>
                </span>
              </span>
              <span className={`v15-service-detail ${s.id === "maintenance" ? "is-maintenance" : ""}`}>{meta.detail}</span>
              {s.recommended && <span className="v15-most">Most booked</span>}
              <span className="v15-arrow">↗</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
