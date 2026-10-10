"use client";

import { useState } from "react";
import { TextField } from "./parts";

export const LEAD_SOURCE_OPTIONS = [
  { value: "google", label: "Google" },
  { value: "instagram", label: "Instagram" },
  { value: "referral", label: "Friend / Referral" },
  { value: "van_trailer", label: "Saw our van / trailer" },
  { value: "local_event", label: "Local event" },
  { value: "previous_customer", label: "Previous customer" },
  { value: "other", label: "Other" },
] as const;

export function LeadSourceField({ error = false }: { error?: boolean }) {
  const [source, setSource] = useState("");
  const needsDetail = source === "referral" || source === "other";

  return (
    <div>
      <p id="lead-source-label" className="field-label">How did you hear about us?</p>
      <p className="mb-3 mt-1 text-sm text-muted">One quick tap helps us know what&rsquo;s working.</p>
      <div role="radiogroup" aria-labelledby="lead-source-label" className="flex flex-wrap gap-2">
        {LEAD_SOURCE_OPTIONS.map((option) => (
          <label key={option.value} className="choice min-h-11 items-center px-3 py-2">
            <input
              type="radio"
              name="leadSource"
              value={option.value}
              checked={source === option.value}
              onChange={() => setSource(option.value)}
              className="sr-only"
            />
            <span className="font-display font-semibold">{option.label}</span>
          </label>
        ))}
      </div>
      {error && <p id="leadSource-error" className="field-error">Choose how you heard about us.</p>}
      {needsDetail && (
        <div className="mt-4">
          <TextField
            label={source === "referral" ? "Who referred you?" : "Where did you hear about us?"}
            name="leadSourceDetail"
            optional
            maxLength={200}
            autoComplete="off"
          />
        </div>
      )}
    </div>
  );
}
