"use client";

import { useRef, useState, type FormEvent } from "react";
import { site } from "@/data/site";
import { track } from "@/lib/analytics";
import { submitLead } from "@/lib/submit";
import { FormError, formToObject, Honeypot, SelectField, Success, TextArea, TextField } from "./parts";

export const quoteInterests = [
  { value: "not-sure", label: "Not sure yet — help me choose" },
  { value: "maintenance", label: "Maintenance Detail" },
  { value: "premium", label: "Premium Detail" },
  { value: "factoryReset", label: "Factory Reset" },
  { value: "paint-correction", label: "Paint correction or polish" },
  { value: "ceramic", label: "Ceramic coating" },
  { value: "detailplus", label: "Detail+ membership" },
  { value: "other", label: "Something else" },
];

const PAINT = ["paint-correction", "ceramic"];

export function QuoteForm({ defaultInterest }: { defaultInterest?: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const [invalid, setInvalid] = useState<string[]>([]);
  const started = useRef(false);

  const initial = quoteInterests.some((i) => i.value === defaultInterest) ? defaultInterest : "";

  const onStart = () => {
    if (started.current) return;
    started.current = true;
    track("quote_start", { location: "quote_form" });
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = formToObject(form);
    const missing = ["name", "phone", "email", "vehicleYear", "vehicleMake", "vehicleModel", "interest"].filter((k) => !data[k]?.trim());
    if (missing.length) {
      setInvalid(missing);
      setError("Fill in the highlighted fields.");
      form.querySelector<HTMLElement>(`[name="${missing[0]}"]`)?.focus();
      return;
    }
    setStatus("sending");
    setError(null);
    setInvalid([]);
    const res = await submitLead({ type: "quote", ...data });
    if (res.ok) {
      setStatus("sent");
      track("quote_submit", { interest: data.interest });
      if (PAINT.includes(data.interest)) track("paint_inquiry", { location: "quote_form", interest: data.interest });
    } else {
      setStatus("idle");
      setError(res.error);
      setInvalid(res.missing ?? []);
    }
  }

  if (status === "sent") {
    return (
      <Success title="Quote request sent">
        <p>Thanks. We'll look over your vehicle details and get back to you with a price and the service we'd recommend.</p>
        <p>
          Need it sooner? Call or text <a className="link" href={site.phone.href}>{site.phone.display}</a>.
        </p>
      </Success>
    );
  }

  const bad = (k: string) => invalid.includes(k);

  return (
    <form noValidate onSubmit={onSubmit} onFocus={onStart} className="relative space-y-6">
      <Honeypot />
      <div className="grid gap-6 sm:grid-cols-2">
        <TextField label="Name" name="name" autoComplete="name" error={bad("name")} />
        <TextField
          label="Phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          error={bad("phone")}
          errorText="Enter a 10-digit phone number."
        />
      </div>
      <TextField label="Email" name="email" type="email" autoComplete="email" error={bad("email")} errorText="Check your email address." />

      <fieldset>
        <legend className="field-label">Vehicle</legend>
        <div className="grid grid-cols-[5.5rem_1fr] gap-3 sm:grid-cols-[6.5rem_1fr_1fr]">
          <TextField label="Year" name="vehicleYear" inputMode="numeric" maxLength={4} placeholder="2019" error={bad("vehicleYear")} />
          <TextField label="Make" name="vehicleMake" placeholder="Honda" autoComplete="off" error={bad("vehicleMake")} />
          <div className="col-span-2 sm:col-span-1">
            <TextField label="Model" name="vehicleModel" placeholder="Pilot" autoComplete="off" error={bad("vehicleModel")} />
          </div>
        </div>
      </fieldset>

      <SelectField label="What are you looking for?" name="interest" defaultValue={initial} error={bad("interest")} errorText="Choose one.">
        <option value="" disabled>
          Choose one
        </option>
        {quoteInterests.map((i) => (
          <option key={i.value} value={i.value}>
            {i.label}
          </option>
        ))}
      </SelectField>

      <TextArea
        label="Anything we should know about the vehicle?"
        name="notes"
        optional
        hint="Pet hair, stains, smells, paint scratches, how long since the last detail."
      />

      <FormError message={error} />

      <button type="submit" disabled={status === "sending"} className="btn btn-primary w-full sm:w-auto disabled:opacity-60">
        {status === "sending" ? "Sending…" : "Get my quote"}
      </button>
    </form>
  );
}
