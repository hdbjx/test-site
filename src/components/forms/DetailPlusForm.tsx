"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { siteVehicleLabel, useVehicle } from "@/components/vehicle/VehicleContext";
import { useJourney } from "@/components/journey/JourneyContext";
import { quoteDetailPlus, detailPlusTaskPrice, staticDetailPlusCatalog, type DetailPlusCatalog } from "@/lib/detailPlusPricing";
import { vehicles, type VehicleId } from "@/data/services";
import { usd } from "@/lib/format";
import { site } from "@/data/site";
import { track } from "@/lib/analytics";
import { submitLead } from "@/lib/submit";
import { FormError, formToObject, Honeypot, Success, TextArea, TextField } from "./parts";
import { TurnstileField } from "./TurnstileField";

export function DetailPlusForm({ catalog = staticDetailPlusCatalog }: { catalog?: DetailPlusCatalog }) {
  const { tasks: detailPlusTasks, groups: detailPlusGroups, presets: detailPlusPresets, rhythms: frequencies, minimum: detailPlusMinimum } = catalog;
  const cadenceFor = (id: string) => frequencies.find((frequency) => frequency.id === id) ?? frequencies.find((frequency) => frequency.id === "monthly") ?? frequencies[0];
  const defaultTasks: string[] = [...(detailPlusPresets[0]?.tasks ?? [])];
  const { vehicle: siteVehicle, hydrated: siteVehicleHydrated, openPicker } = useVehicle();
  const { setServiceIntent } = useJourney();
  const [freq, setFreq] = useState<string>("monthly");
  const [taskIds, setTaskIds] = useState<string[]>(defaultTasks);
  const [vehicle, setVehicle] = useState<string>("sedan");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const [invalid, setInvalid] = useState<string[]>([]);
  const started = useRef(false);

  useEffect(() => {
    if (siteVehicleHydrated && siteVehicle) setVehicle(siteVehicle.vehicle);
  }, [siteVehicleHydrated, siteVehicle]);

  const cadence = cadenceFor(freq);
  const weeks = cadence.weeks;
  const displayFrequency = cadence.label;
  const vehicleTypeLabel = vehicles.find((item) => item.id === vehicle)?.label ?? "";
  const displayVehicle = siteVehicle ? siteVehicleLabel(siteVehicle) : vehicleTypeLabel;
  const quote = useMemo(() => quoteDetailPlus(vehicle as VehicleId, freq, taskIds, catalog), [vehicle, freq, taskIds, catalog]);
  const taskLabels = detailPlusTasks.filter((task) => taskIds.includes(task.id)).map((task) => task.label);
  const summary = `${displayFrequency} · ${taskLabels.length} task${taskLabels.length === 1 ? "" : "s"} · ${displayVehicle.toLowerCase()}`;

  const cycleMarks = useMemo(() => {
    return Array.from({ length: 13 }, (_, index) => {
      const week = index + 1;
      return week === 1 || (week - 1) % weeks === 0;
    });
  }, [weeks]);

  const toggleTask = (id: string) => {
    setTaskIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
    touch();
  };

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
    if (!quote) {
      setError("Pick at least one thing to have cleaned.");
      return;
    }
    if (missing.length) {
      setInvalid(missing);
      setError("Add your name and phone so we can set up your plan.");
      form.querySelector<HTMLElement>(`[name="${missing[0]}"]`)?.focus();
      return;
    }

    setStatus("sending");
    setError(null);
    const res = await submitLead({ type: "detailplus", ...data });
    if (res.ok) {
      setStatus("sent");
      track("detailplus_submit", { frequency: displayFrequency, tasks: taskIds.length, vehicle, perVisit: quote.perVisit });
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
          {quote && <p>Your rate: {usd(quote.perVisit)} per visit, flat.</p>}
          <p>We&rsquo;ll confirm the details and reach out to set the first visit.</p>
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
      <input type="hidden" name="frequencyId" value={freq} />
      <input type="hidden" name="coverage" value={taskLabels.join(", ")} />
      <input type="hidden" name="taskIds" value={taskIds.join(",")} />
      <input type="hidden" name="vehicleId" value={vehicle} />
      <input type="hidden" name="quotedPerVisit" value={quote ? String(quote.perVisit) : ""} />
      <input type="hidden" name="vehicle" value={displayVehicle} />

      <div className="dp56-builder-grid">
        <div className="dp56-builder-controls">
          <div className="dp70-bar" aria-live="polite">
            <span>{taskIds.length} task{taskIds.length === 1 ? "" : "s"} · {cadence.short}</span>
            <strong>{quote ? `${usd(quote.perVisit)} / visit` : "Pick a task"}</strong>
          </div>
          <fieldset className="dp70-step">
            <legend className="dp70-legend">01 / YOUR VEHICLE</legend>
            {siteVehicle ? (
              <button type="button" className="dp64-selected-vehicle" onClick={openPicker}>
                <strong>{siteVehicleLabel(siteVehicle)}</strong><span>{vehicleTypeLabel} · Change vehicle</span>
              </button>
            ) : (
              <div className="dp56-vehicle-select-wrap">
                <select value={vehicle} onChange={(event) => { setVehicle(event.target.value); touch(); }} aria-label="Vehicle type">
                  {vehicles.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                </select>
                <button type="button" className="dp64-search-vehicle" onClick={openPicker}>Search exact vehicle</button>
              </div>
            )}
          </fieldset>

          <div className="dp70-step">
            <div className="dp56-control-head">
              <span>02 / PICK WHAT GETS CLEANED</span>
              <strong>{taskIds.length} selected</strong>
            </div>
            <div className="dp70-presets" role="group" aria-label="Start from a set">
              {detailPlusPresets.map((preset) => (
                <button key={preset.id} type="button" onClick={() => { setTaskIds([...preset.tasks]); touch(); }}>{preset.label}</button>
              ))}
              <button type="button" onClick={() => { setTaskIds([]); touch(); }}>Clear</button>
            </div>
            {detailPlusGroups.map((group) => (
              <div className="dp70-group" key={group.id}>
                <h4>{group.label}</h4>
                <ul>
                  {detailPlusTasks.filter((task) => task.group === group.id).map((task) => {
                    const on = taskIds.includes(task.id);
                    return (
                      <li key={task.id}>
                        <button type="button" role="checkbox" aria-checked={on} className={on ? "is-on" : ""} onClick={() => toggleTask(task.id)}>
                          <i aria-hidden="true">{on ? "✓" : ""}</i>
                          <span><b>{task.label}</b><small>{task.note}</small></span>
                          <em>{usd(detailPlusTaskPrice(task.id, vehicle as VehicleId, catalog))}</em>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          <div className="dp70-step">
            <div className="dp56-control-head">
              <span>03 / PICK YOUR RHYTHM</span>
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
                    <small>{String(index + 1).padStart(2, "0")}</small>
                    <b>{option.label}</b>
                    <span>{option.hint} · save {Math.round(option.discount * 100)}%</span>
                  </button>
                );
              })}
            </div>

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
          </div>
        </div>

        <aside className="dp56-member-stack" aria-label="Detail Plus plan preview">
          <div className="dp56-member-card ed-paper ed-paper--coral ed-paper--crumpled">
            <div className="dp56-member-card-top"><span>EVERY DETAIL</span><b>DETAIL+</b></div>
            <p>SERVICE CLUB</p>
            <div className="dp56-member-lines">
              <div><span>RHYTHM</span><strong>{displayFrequency}</strong></div>
              <div><span>WHAT GETS CLEANED</span><strong>{taskIds.length ? `${taskIds.length} task${taskIds.length === 1 ? "" : "s"}` : "Pick at least one"}</strong></div>
              <div><span>VEHICLE</span><strong>{displayVehicle}</strong></div>
            </div>
            <div className="dp56-member-stamp">ON<br/>REPEAT</div>
            <small>MEMBER CARD / PLAN PREVIEW</small>
          </div>

          <div className="dp56-rate-note dp70-total" aria-live="polite">
            <span>YOUR RATE</span>
            {quote ? (
              <>
                <strong className="dp70-price">{usd(quote.perVisit)}<small> / visit</small></strong>
                <dl>
                  <div><dt>Tasks</dt><dd>{usd(quote.subtotal)}</dd></div>
                  {quote.discount > 0 && <div><dt>{cadence.short} rhythm ({quote.discountPct}% off)</dt><dd>−{usd(quote.discount)}</dd></div>}
                  {quote.minimumApplied && <div><dt>Visit minimum</dt><dd>{usd(detailPlusMinimum)}</dd></div>}
                </dl>
                <p>Flat every visit. About {quote.visitsPer13Weeks} visit{quote.visitsPer13Weeks === 1 ? "" : "s"} per 13 weeks. No contract. Pause or change anytime.</p>
              </>
            ) : (
              <>
                <strong>PICK A TASK</strong>
                <p>Choose what gets cleaned and your flat per-visit price shows up here.</p>
              </>
            )}
          </div>
        </aside>
      </div>

      <div className="dp56-contact-sheet">
        <div className="dp56-contact-copy">
          <span>04 / START YOUR PLAN</span>
          <h3>{quote ? `${usd(quote.perVisit)} per visit.` : "Build your plan."}</h3>
          <p>Tell us who to send it to. We&rsquo;ll confirm the plan and set up your first visit. Nothing is charged until the visit.</p>
        </div>
        <div className="dp56-contact-fields">
          <TextField label="Name" name="name" autoComplete="name" error={bad("name")} />
          <TextField label="Phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" error={bad("phone")} errorText="Enter a 10-digit phone number." />
          <TextField label="Email" name="email" type="email" autoComplete="email" optional error={bad("email")} errorText="Check your email address." />
          <TextArea label="Anything else?" name="notes" optional hint="More than one car, preferred day, anything about the vehicle." />
          <FormError message={error} />
          <button type="submit" disabled={status === "sending"} className="dp56-submit">
            {status === "sending" ? "Sending…" : "Start my Detail+ plan ↗"}
          </button>
        </div>
      </div>
    </form>
  );
}
