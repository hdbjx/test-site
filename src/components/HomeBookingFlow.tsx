"use client";

import { useEffect, useRef, useState } from "react";
import { siteVehicleLabel, useVehicle } from "@/components/vehicle/VehicleContext";
import { useJourney } from "@/components/journey/JourneyContext";
import { bookingHref } from "@/data/booking";
import { PRICING, serviceList, services, vehicleLabel, vehicles, type ServiceId, type VehicleId } from "@/data/services";
import { track } from "@/lib/analytics";
import { durationShort, usd } from "@/lib/format";
import { TrackedLink } from "./TrackedLink";
import { NextOpeningNote } from "@/components/journey/NextOpeningNote";

const serviceMeta: Record<ServiceId, { number: string; cue: string; subline: string; includes: string; detail: string }> = {
  maintenance: {
    number: "01",
    cue: "Keep it clean",
    subline: "For regularly detailed vehicles",
    includes: services.maintenance.includes.join(" · "),
    detail: "Best for already clean vehicles",
  },
  premium: {
    number: "02",
    cue: "Bring it back",
    subline: "Top-to-bottom clean, inside and out. Every corner, every detail.",
    includes: services.premium.includes.join(" · "),
    detail: "Full interior + exterior · Most booked",
  },
  factoryReset: {
    number: "03",
    cue: "Start over",
    subline: "Like it just rolled off the lot. Maybe better.",
    includes: services.factoryReset.includes.join(" · "),
    detail: "Deepest clean · Heavy reset",
  },
};

const fromPrice = (id: ServiceId) => Math.min(...vehicles.map((v) => PRICING[v.id][id].price));

export function HomeBookingFlow() {
  const { vehicle: siteVehicle, hydrated: siteVehicleHydrated, openPicker } = useVehicle();
  const { serviceIntent, setServiceIntent } = useJourney();
  const [service, setService] = useState<ServiceId | null>(serviceIntent === "maintenance" || serviceIntent === "premium" || serviceIntent === "factoryReset" ? serviceIntent : null);
  const [vehicle, setVehicle] = useState<VehicleId | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const chosenService = service ? services[service] : null;
  const chosenVehicle = vehicle ? vehicles.find((v) => v.id === vehicle)! : null;
  const quote = service && vehicle ? PRICING[vehicle][service] : null;


  useEffect(() => {
    if (siteVehicleHydrated && siteVehicle) setVehicle(siteVehicle.vehicle);
  }, [siteVehicleHydrated, siteVehicle]);

  useEffect(() => {
    if (service) return;
    if (serviceIntent === "maintenance" || serviceIntent === "premium" || serviceIntent === "factoryReset") setService(serviceIntent);
  }, [serviceIntent, service]);

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
    setServiceIntent(id);

    // A saved/sitewide vehicle is the source of truth for homepage pricing.
    // Closing this panel used to clear the local vehicle state, but reopening
    // would not re-run the site-vehicle hydration effect because the saved
    // vehicle itself had not changed. That left `quote` null, hiding the
    // price and booking CTA on subsequent opens. Restore it synchronously.
    setVehicle(siteVehicle ? siteVehicle.vehicle : null);

    track("service_select", { service: id, location: "home_flow" });
    if (openingForFirstTime) window.setTimeout(guideToVehicleStep, 110);
  };

  const chooseVehicle = (id: VehicleId) => {
    setVehicle(id);
    track("vehicle_select", { vehicle: id, service: service ?? undefined, location: "home_flow" });

    // The result expands over ~380ms. Measuring it immediately catches the
    // collapsed height and can stop short before the price/CTA are visible.
    // Reconcile after the reveal has finished, then move only the amount needed.
    const revealStartedAt = window.scrollY;
    window.setTimeout(() => {
      const result = resultRef.current;
      if (!result) return;

      // If the customer deliberately moved the page while the result opened,
      // respect that instead of fighting their scroll position.
      if (Math.abs(window.scrollY - revealStartedAt) > 120) return;

      const rect = result.getBoundingClientRect();
      const bottomGutter = window.innerWidth <= 640 ? 22 : 38;
      const visibleBottom = window.innerHeight - bottomGutter;
      const overflow = rect.bottom - visibleBottom;
      if (overflow <= 0) return;

      window.scrollBy({
        top: overflow + 8,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    }, 460);
  };

  return (
    <div className={`v15-flow ${service ? "has-service" : ""} ${quote ? "is-ready" : ""}`}>
      <div ref={stageRef} id="home-config-stage" className={`v15-stage ${service ? "is-open" : ""}`} aria-live="polite">
        {service && chosenService && (
          <div className="v15-stage-inner">
            <div className="v15-stage-topline">
              <span>{serviceMeta[service].number} / {chosenService.name}</span>
              <button type="button" onClick={() => { setService(null); setVehicle(siteVehicle ? siteVehicle.vehicle : null); setServiceIntent(null); }}>Close ×</button>
            </div>

            <div className={`v15-stage-main ${siteVehicle ? "has-site-vehicle" : ""}`}>
              {siteVehicle ? (
                <div className="v76-selected-vehicle">
                  <div>
                    <span>YOUR CAR</span>
                    <strong>{siteVehicleLabel(siteVehicle)}</strong>
                    <small>{vehicleLabel(siteVehicle.vehicle)}</small>
                  </div>
                  <button type="button" onClick={openPicker}>Change</button>
                </div>
              ) : (
                <>
                  <div className="v15-stage-question">
                    <p className="eyebrow">YOUR CAR</p>
                    <h3>What do you drive?</h3>
                    <p>Choose the closest size, or add your exact vehicle from the header.</p>
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
                </>
              )}
            </div>

            <div ref={resultRef} className={`v15-result ${quote && chosenVehicle ? "is-visible" : ""}`}>
              {quote && chosenVehicle && (
                <>
                  <div className="v15-result-summary">
                    <span>Your detail</span>
                    <strong>{chosenService.name} · {siteVehicle ? siteVehicleLabel(siteVehicle) : chosenVehicle.label}</strong>
                    <small>About {durationShort(quote.minutes)} in your driveway <span>· Power + water included</span></small>
                    <NextOpeningNote service={service} vehicle={vehicle} location="home_flow" />
                  </div>
                  <div className="v15-result-price"><span>Total</span><strong>{usd(quote.price)}</strong></div>
                  <TrackedLink href={siteVehicle ? `/book?service=${service}` : bookingHref(vehicle!, service)} event="book_click" params={{ location: "home_flow", vehicle: vehicle ?? undefined, service: service ?? undefined }} className="btn btn-primary v15-continue" onClick={() => service && setServiceIntent(service)}>Choose a time ↗</TrackedLink>
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
                  <span className="v15-service-price">
                    {siteVehicleHydrated && siteVehicle
                      ? <>{usd(PRICING[siteVehicle.vehicle][s.id].price)}<small> · {vehicleLabel(siteVehicle.vehicle)}</small></>
                      : <><small>From </small>{usd(fromPrice(s.id))}</>}
                  </span>
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
