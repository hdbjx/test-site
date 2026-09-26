"use client";

import { useRef, useState, type FormEvent } from "react";
import { coverages, frequencies } from "@/data/detailplus";
import { vehicles } from "@/data/services";
import { site } from "@/data/site";
import { track } from "@/lib/analytics";
import { submitLead } from "@/lib/submit";
import { FormError, formToObject, Honeypot, Success, TextArea, TextField } from "./parts";

function ChoiceGroup({
  legend,
  name,
  options,
  value,
  onChange,
  cols,
}: {
  legend: string;
  name: string;
  options: readonly { id: string; label: string; hint?: string }[];
  value: string;
  onChange: (v: string) => void;
  cols: string;
}) {
  return (
    <fieldset>
      <legend className="field-label">{legend}</legend>
      <div className={`grid gap-2 ${cols}`}>
        {options.map((o) => (
          <label key={o.id} className="choice">
            <input type="radio" name={name} value={o.label} checked={value === o.id} onChange={() => onChange(o.id)} className="sr-only" />
            <span className="font-display font-semibold leading-tight">{o.label}</span>
            {o.hint && <span className="text-sm text-muted">{o.hint}</span>}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function DetailPlusForm() {
  const [freq, setFreq] = useState<string>("monthly");
  const [coverage, setCoverage] = useState<string>("full");
  const [vehicle, setVehicle] = useState<string>("sedan");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const [invalid, setInvalid] = useState<string[]>([]);
  const started = useRef(false);

  const touch = () => {
    if (started.current) return;
    started.current = true;
    track("detailplus_start");
  };

  const label = (list: readonly { id: string; label: string }[], id: string) => list.find((x) => x.id === id)?.label ?? "";
  const summary = `${label(frequencies, freq)} · ${label(coverages, coverage).toLowerCase()} · ${label(vehicles, vehicle).toLowerCase()}`;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = formToObject(form);
    const missing = ["name", "phone"].filter((k) => !data[k]?.trim());
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
      track("detailplus_submit", { frequency: freq, coverage, vehicle });
    } else {
      setStatus("idle");
      setError(res.error);
      setInvalid(res.missing ?? []);
    }
  }

  if (status === "sent") {
    return (
      <Success title="Plan request sent">
        <p>Your plan: {summary}.</p>
        <p>We'll put together your flat rate and reach out to get your first visit on the calendar.</p>
        <p>
          Questions? <a className="link" href={site.phone.href}>{site.phone.display}</a>
        </p>
      </Success>
    );
  }

  const bad = (k: string) => invalid.includes(k);

  return (
    <form noValidate onSubmit={onSubmit} onChange={touch} className="relative space-y-8">
      <Honeypot />
      <ChoiceGroup legend="How often?" name="frequency" options={frequencies} value={freq} onChange={setFreq} cols="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" />
      <ChoiceGroup legend="What gets cleaned?" name="coverage" options={coverages} value={coverage} onChange={setCoverage} cols="grid-cols-1 sm:grid-cols-3" />
      <ChoiceGroup legend="Vehicle" name="vehicle" options={vehicles} value={vehicle} onChange={setVehicle} cols="grid-cols-2 sm:grid-cols-3" />

      <div className="rounded-[var(--radius-panel)] border-2 border-ink bg-white p-6">
        <p className="text-sm text-muted">Your plan</p>
        <p className="mt-1 font-display text-lg font-semibold" aria-live="polite">
          {summary}
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <TextField label="Name" name="name" autoComplete="name" error={bad("name")} />
          <TextField label="Phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" error={bad("phone")} errorText="Enter a 10-digit phone number." />
        </div>
        <div className="mt-6 space-y-6">
          <TextField label="Email" name="email" type="email" autoComplete="email" optional error={bad("email")} errorText="Check your email address." />
          <TextArea label="Anything else?" name="notes" optional hint="More than one car, a preferred day, anything about the vehicle." />
          <FormError message={error} />
          <button type="submit" disabled={status === "sending"} className="btn btn-primary w-full sm:w-auto disabled:opacity-60">
            {status === "sending" ? "Sending…" : "Get my flat rate"}
          </button>
        </div>
      </div>
    </form>
  );
}
