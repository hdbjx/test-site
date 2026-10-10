"use client";

import { useState, type FormEvent } from "react";
import { FormError, Success, TextField } from "./parts";
import { AddressFields } from "./AddressFields";

type ContactResponse = {
  ok?: boolean;
  error?: string;
  missing?: string[];
};

export function InfoForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const [invalid, setInvalid] = useState<string[]>([]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const fields = {
      name: String(data.name ?? "").trim(),
      phone: String(data.phone ?? "").trim(),
      email: String(data.email ?? "").trim(),
      address: String(data.address ?? "").trim(),
    };

    const missing = Object.entries(fields)
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (missing.length) {
      setInvalid(missing);
      setError("Fill in the highlighted fields.");
      form.querySelector<HTMLElement>(`[name="${missing[0]}"]`)?.focus();
      return;
    }

    if (!/\d/.test(fields.address) || !/\b(?:GA|Georgia)\b/i.test(fields.address) || !/\b\d{5}(?:-\d{4})?\b/.test(fields.address)) {
      setInvalid(["address"]);
      setError("Enter the full service address, including street, city, state and ZIP code.");
      form.querySelector<HTMLElement>('[name="address"]')?.focus();
      return;
    }

    setStatus("sending");
    setError(null);
    setInvalid([]);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const result = (await response.json().catch(() => ({}))) as ContactResponse;

      if (!response.ok || !result.ok) {
        setStatus("idle");
        setError(result.error ?? "We couldn't save your information. Please try again.");
        setInvalid(result.missing ?? []);
        return;
      }

      setStatus("sent");
    } catch {
      setStatus("idle");
      setError("No connection. Check your signal and try again.");
    }
  }

  if (status === "sent") {
    return (
      <Success title="You're all set">
        <p>We saved your information. Our team can now book your detail without asking you for it again.</p>
      </Success>
    );
  }

  const bad = (field: string) => invalid.includes(field);

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-5">
      <TextField label="Full name" name="name" autoComplete="name" error={bad("name")} />
      <TextField
        label="Phone"
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        error={bad("phone")}
        errorText="Enter a 10-digit phone number."
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        error={bad("email")}
        errorText="Check your email address."
      />
      <AddressFields error={bad("address")} />

      <FormError message={error} />

      <button type="submit" disabled={status === "sending"} className="btn btn-primary w-full disabled:opacity-60">
        {status === "sending" ? "Saving…" : "Save my info"}
      </button>
    </form>
  );
}
