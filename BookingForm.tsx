"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { PRICING, serviceList, services, vehicles, type ServiceId, type VehicleId } from "@/data/services";
import { site } from "@/data/site";
import { track } from "@/lib/analytics";
import { duration, usd } from "@/lib/format";
import { submitLead } from "@/lib/submit";
import { FormError, formToObject, Honeypot, SelectField, Success, TextArea, TextField } from "./parts";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function BookingForm({ initialVehicle, initialService }: { initialVehicle?: VehicleId; initialService?: ServiceId }) {
  const [vehicle, setVehicle] = useState<VehicleId | undefined>(initialVehicle);
  const [service, setService] = useState<ServiceId | undefined>(initialService ?? (initialVehicle ? "premium" : undefined));
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const [invalid, setInvalid] = useState<string[]>([]);

  const price = vehicle && service ? PRICING[vehicle][service] : null;
  const bad = (k: string) => invalid.includes(k);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = formToObject(form);
    const missing = ["vehicle", "service", "name", "phone", "address", "preferredDays"].filter((k) => !data[k]?.trim());
    if (missing.length) {
      setInvalid(missing);
      setError("Fill in the highlighted fields.");
      form.querySelector<HTMLElement>(`[name="${missing[0]}"]`)?.focus();
      return;
    }
    setStatus("sending");
    setError(null);
    setInvalid([]);
    const res = await submitLead({
      type: "booking",
      ...data,
      quotedPrice: price ? String(price.price) : "",
      estimatedMinutes: price ? String(price.minutes) : "",
    });
    if (res.ok) {
      setStatus("sent");
      track("booking_submit", { vehicle: data.vehicle, service: data.service });
    } else {
      setStatus("idle");
      setError(res.error);
      setInvalid(res.missing ?? []);
    }
  }

  if (status === "sent" && vehicle && service && price) {
    return (
      <Success title="Booking request received">
        <p>
          {services[service].name} for your {vehicles.find((v) => v.id === vehicle)?.label.toLowerCase()}, {usd(price.price)}.
        </p>
        <p>We'll reach out by text or call to confirm your exact time.</p>
        <p>
          Questions before then? <a className="link" href={site.phone.href}>{site.phone.display}</a>
        </p>
      </Success>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className="relative grid gap-10 lg:grid-cols-12">
      <Honeypot />
      <div className="space-y-10 lg:col-span-8">
        <fieldset>
          <legend className="t-h3">1. Your vehicle</legend>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {vehicles.map((v) => (
              <label key={v.id} className="choice">
                <input
                  type="radio"
                  name="vehicle"
                  value={v.id}
                  checked={vehicle === v.id}
                  onChange={() => {
                    setVehicle(v.id);
                    if (!service) setService("premium");
                    track("vehicle_select", { vehicle: v.id, location: "book" });
                  }}
                  className="sr-only"
                />
                <span className="font-display font-semibold">{v.label}</span>
                <span className="text-sm text-muted">{v.hint}</span>
              </label>
            ))}
          </div>
          {bad("vehicle") && <p className="field-error">Choose your vehicle type.</p>}
        </fieldset>

        <fieldset>
          <legend className="t-h3">2. Your service</legend>
          <div className="mt-4 grid gap-2">
            {serviceList.map((s) => {
              const p = vehicle ? PRICING[vehicle][s.id] : null;
              return (
                <label key={s.id} className="choice flex-row items-center justify-between gap-4 py-4">
                  <input
                    type="radio"
                    name="service"
                    value={s.id}
                    checked={service === s.id}
                    onChange={() => {
                      setService(s.id);
                      track("service_select", { service: s.id, vehicle, location: "book" });
                    }}
                    className="sr-only"
                  />
                  <span>
                    <span className="flex flex-wrap items-center gap-2 font-display font-semibold">
                      {s.name}
                      {s.recommended && (
                        <span className="rounded-full bg-oxblood px-2 py-0.5 text-xs text-paper">Recommended first visit</span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-sm text-muted">{s.whoFor}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="t-numeral block text-3xl">{p ? usd(p.price) : `from ${usd(Math.min(...vehicles.map((v) => PRICING[v.id][s.id].price)))}`}</span>
                    {p && <span className="text-sm text-muted">{duration(p.minutes)}</span>}
                  </span>
                </label>
              );
            })}
          </div>
          {bad("service") && <p className="field-error">Choose a service.</p>}
          <p className="mt-3 text-sm text-muted">
            Not sure? <Link href="/our-services" className="link">Compare services</Link> or{" "}
            <Link href="/get-a-quote" className="link">ask for a quote</Link>.
          </p>
        </fieldset>

        <fieldset className="space-y-6">
          <legend className="t-h3">3. When and where</legend>
          <TextField
            label="Address where the car will be"
            name="address"
            autoComplete="street-address"
            hint="Home, apartment or office. Include the city."
            error={bad("address")}
          />
          <div>
            <p id="days-label" className="field-label">
              Days that work for you
            </p>
            <div role="group" aria-labelledby="days-label" className="flex flex-wrap gap-2">
              {DAYS.map((d) => (
                <label key={d} className="choice min-h-11 min-w-[3.75rem] items-center px-3 py-2">
                  <input type="checkbox" name="preferredDays" value={d} className="sr-only" />
                  <span className="font-display font-semibold">{d}</span>
                </label>
              ))}
            </div>
            {bad("preferredDays") && <p className="field-error">Pick at least one day.</p>}
          </div>
          <SelectField label="Time of day" name="preferredTime" optional defaultValue="Any time">
            <option>Any time</option>
            <option>Morning</option>
            <option>Midday</option>
            <option>Afternoon</option>
          </SelectField>
        </fieldset>

        <fieldset className="space-y-6">
          <legend className="t-h3">4. Your details</legend>
          <div className="grid gap-6 sm:grid-cols-2">
            <TextField label="Name" name="name" autoComplete="name" error={bad("name")} />
            <TextField label="Phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" error={bad("phone")} errorText="Enter a 10-digit phone number." />
          </div>
          <TextField label="Email" name="email" type="email" autoComplete="email" optional error={bad("email")} errorText="Check your email address." />
          <TextArea label="Anything we should know?" name="notes" optional hint="Gate codes, parking, pet hair, stains, a specific spot you care about." />
        </fieldset>
      </div>

      {/* Summary: sticky on desktop, inline before submit on mobile */}
      <aside className="lg:col-span-4">
        <div className="rounded-[var(--radius-panel)] border-2 border-ink bg-white p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-semibold">Your detail</h2>
          {vehicle && service && price ? (
            <>
              <p className="mt-4 flex items-baseline gap-2">
                <span className="font-display font-semibold">{services[service].name}</span>
                <span className="leader" aria-hidden="true" />
                <span className="t-numeral text-4xl">{usd(price.price)}</span>
              </p>
              <p className="mt-1 text-sm text-muted">
                {vehicles.find((v) => v.id === vehicle)?.label} · about {duration(price.minutes)}
              </p>
            </>
          ) : (
            <p className="mt-3 text-muted">Choose your vehicle and service to see your price.</p>
          )}
          <ul className="mt-5 space-y-1.5 border-t border-line pt-5 text-sm text-ink/80">
            <li>We bring our own power and water</li>
            <li>We accept {site.paymentMethods.join(", ")}</li>
            <li>We confirm your exact time by text or call</li>
          </ul>
          <div className="mt-6">
            <FormError message={error} />
          </div>
          <button type="submit" disabled={status === "sending"} className="btn btn-primary mt-4 w-full disabled:opacity-60">
            {status === "sending" ? "Sending…" : "Book my detail"}
          </button>
        </div>
      </aside>
    </form>
  );
}
