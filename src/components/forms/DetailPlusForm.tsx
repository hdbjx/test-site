"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { siteVehicleLabel, useVehicle } from "@/components/vehicle/VehicleContext";
import { useJourney } from "@/components/journey/JourneyContext";
import { coverages, frequencies } from "@/data/detailplus";
import { vehicles } from "@/data/services";
import { site } from "@/data/site";
import { track } from "@/lib/analytics";
import { submitLead } from "@/lib/submit";
import { FormError, formToObject, Honeypot, Success, TextArea, TextField } from "./parts";
import { TurnstileField } from "./TurnstileField";

const cadenceWeeks = (id: string, customWeeks: number) => {
  const match = frequencies.find((frequency) => frequency.id === id);
  return typeof match?.weeks === "number" ? match.weeks : customWeeks;
};

const cadenceLabel = (id: string, customWeeks: number) => {
  if (id === "custom") return customWeeks === 1 ? "Every week" : customWeeks === 13 ? "Quarterly" : `Every ${customWeeks} weeks`;
  return frequencies.find((frequency) => frequency.id === id)?.label ?? "";
};

export function DetailPlusForm() {
  const { vehicle: siteVehicle, hydrated: siteVehicleHydrated, openPicker } = useVehicle();
  const { setServiceIntent } = useJourney();
  const [freq, setFreq] = useState<string>("monthly");
  const [customWeeks, setCustomWeeks] = useState(8);
  const [coverage, setCoverage] = useState<string>("full");
  const [vehicle, setVehicle] = useState<string>("sedan");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const [invalid, setInvalid] = useState<string[]>([]);
  const started = useRef(false);

  useEffect(() => {
    if (siteVehicleHydrated && siteVehicle) setVehicle(siteVehicle.vehicle);
  }, [siteVehicleHydrated, siteVehicle]);

  const weeks = cadenceWeeks(freq, customWeeks);
  const displayFrequency = cadenceLabel(freq, customWeeks);
  const coverageLabel = coverages.find((item) => item.id === coverage)?.label ?? "";
  const vehicleTypeLabel = vehicles.find((item) => item.id === vehicle)?.label ?? "";
  const displayVehicle = siteVehicle ? siteVehicleLabel(siteVehicle) : vehicleTypeLabel;
  const summary = `${displayFrequency} · ${coverageLabel.toLowerCase()} · ${displayVehicle.toLowerCase()}`;

  const cycleMarks = useMemo(() => {
    return Array.from({ length: 13 }, (_, index) => {
      const week = index + 1;
      return week === 1 || (week - 1) % weeks === 0;
    });
  }, [weeks]);

  const touch = () => {
    if (started.current) return;
    started.current = true;
    setServiceIntent("detailplus");
    track("detailplus_start");
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = formToObject(form);
    const missing = ["name", "phone"].filter((key) => !data[key]?.trim());
    if (missing.length) {
      setInvalid(missing);
      setError("Add your name and phone so we can send your rate.");
      form.querySelector<HTMLElement>(`[name="${missing[0]}"]`)?.focus();
      return;
    }

    setStatus("sending");
    setError(null);
    const res = await submitLead({ type: "detailplus", ...data });
    if (res.ok) {
      setStatus("sent");
      track("detailplus_submit", { frequency: displayFrequency, coverage, vehicle, customWeeks: freq === "custom" ? customWeeks : undefined });
    } else {
      setStatus("idle");
      setError(res.error);
      setInvalid(res.missing ?? []);
    }
  }

  if (status === "sent") {
    return (
      <div className="dp56-success">
        <Success title="Welcome to the list">
          <p>Your plan: {summary}.</p>
          <p>We&rsquo;ll put together your flat per-visit rate and reach out to set the first visit.</p>
          <p>Questions? <a className="link" href={site.phone.href}>{site.phone.display}</a></p>
        </Success>
      </div>
    );
  }

  const bad = (key: string) => invalid.includes(key);

  return (
    <form noValidate onSubmit={onSubmit} onChange={touch} className="dp56-builder-form">
      <Honeypot />
      <TurnstileField action="lead" />
      <input type="hidden" name="frequency" value={displayFrequency} />
      <input type="hidden" name="custom_weeks" value={freq === "custom" ? String(customWeeks) : ""} />
      <input type="hidden" name="coverage" value={coverageLabel} />
      <input type="hidden" name="vehicle" value={displayVehicle} />

      <div className="dp56-builder-grid">
        <div className="dp56-builder-controls">
          <div className="dp56-control-head">
            <span>01 / PICK YOUR RHYTHM</span>
            <strong>{displayFrequency}</strong>
          </div>

          <div className="dp56-cadence-grid" role="radiogroup" aria-label="Detail Plus frequency">
            {frequencies.map((option, index) => {
              const selected = freq === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={`dp56-cadence-ticket ${selected ? "is-selected" : ""}`}
                  onClick={() => { setFreq(option.id); touch(); }}
                >
                  <small>0{index + 1}</small>
                  <b>{option.label}</b>
                  <span>{option.hint}</span>
                </button>
              );
            })}
          </div>

          {freq === "custom" && (
            <div className="dp56-slider-sheet">
              <div className="dp56-slider-readout">
                <span>CUSTOM INTERVAL</span>
                <strong>{displayFrequency}</strong>
              </div>
              <input
                className="dp56-range"
                type="range"
                min="1"
                max="13"
                step="1"
                value={customWeeks}
                onChange={(event) => setCustomWeeks(Number(event.target.value))}
                aria-label="Custom Detail Plus interval in weeks"
              />
              <div className="dp56-range-labels"><span>WEEKLY</span><span>QUARTERLY</span></div>
            </div>
          )}

          <div className="dp56-cycle-card">
            <div className="dp56-cycle-top"><span>13-WEEK SERVICE CYCLE</span><b>{displayFrequency.toUpperCase()}</b></div>
            <div className="dp56-week-strip" aria-label={`Preview of ${displayFrequency.toLowerCase()} visits across thirteen weeks`}>
              {cycleMarks.map((active, index) => (
                <div className={`dp56-week ${active ? "is-visit" : ""}`} key={index}>
                  <i>{String(index + 1).padStart(2, "0")}</i>
                  <span>{active ? "+" : ""}</span>
                </div>
              ))}
            </div>
            <p>The + marks are the weeks your car comes back through the club.</p>
          </div>

          <div className="dp56-subchoices">
            <fieldset>
              <legend>02 / WHAT GETS CLEANED?</legend>
              <div className="dp56-choice-row">
                {coverages.map((option) => (
                  <button key={option.id} type="button" aria-pressed={coverage === option.id} className={coverage === option.id ? "is-selected" : ""} onClick={() => { setCoverage(option.id); touch(); }}>{option.label}</button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>03 / YOUR VEHICLE</legend>
              {siteVehicle ? (
                <button type="button" className="dp64-selected-vehicle" onClick={openPicker}>
                  <strong>{siteVehicleLabel(siteVehicle)}</strong><span>{vehicleTypeLabel} · Change vehicle</span>
                </button>
              ) : (
                <div className="dp56-vehicle-select-wrap">
                  <select value={vehicle} onChange={(event) => setVehicle(event.target.value)} aria-label="Vehicle type">
                    {vehicles.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                  </select>
                  <button type="button" className="dp64-search-vehicle" onClick={openPicker}>Search exact vehicle</button>
                </div>
              )}
            </fieldset>
          </div>
        </div>

        <aside className="dp56-member-stack" aria-label="Detail Plus plan preview">
          <div className="dp56-member-card ed-paper ed-paper--coral ed-paper--crumpled">
            <div className="dp56-member-card-top"><span>EVERY DETAIL</span><b>DETAIL+</b></div>
            <p>SERVICE CLUB</p>
            <div className="dp56-member-lines">
              <div><span>RHYTHM</span><strong>{displayFrequency}</strong></div>
              <div><span>COVERAGE</span><strong>{coverageLabel}</strong></div>
              <div><span>VEHICLE</span><strong>{displayVehicle}</strong></div>
            </div>
            <div className="dp56-member-stamp">ON<br/>REPEAT</div>
            <small>MEMBER CARD / PLAN PREVIEW</small>
          </div>

          <div className="dp56-rate-note">
            <span>YOUR RATE</span>
            <strong>ONE FLAT PRICE / VISIT</strong>
            <p>No contract. Pause or change the rhythm whenever you need to.</p>
          </div>
        </aside>
      </div>

      <div className="dp56-contact-sheet">
        <div className="dp56-contact-copy">
          <span>04 / GET YOUR CLUB RATE</span>
          <h3>We&rsquo;ll price your exact plan.</h3>
          <p>Tell us who to send it to. We&rsquo;ll review the vehicle, coverage and rhythm, then send your flat per-visit rate.</p>
        </div>
        <div className="dp56-contact-fields">
          <TextField label="Name" name="name" autoComplete="name" error={bad("name")} />
          <TextField label="Phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" error={bad("phone")} errorText="Enter a 10-digit phone number." />
          <TextField label="Email" name="email" type="email" autoComplete="email" optional error={bad("email")} errorText="Check your email address." />
          <TextArea label="Anything else?" name="notes" optional hint="More than one car, preferred day, anything about the vehicle." />
          <FormError message={error} />
          <button type="submit" disabled={status === "sending"} className="dp56-submit">
            {status === "sending" ? "Sending…" : "Get my Detail+ rate ↗"}
          </button>
        </div>
      </div>
    </form>
  );
}
