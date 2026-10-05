"use client";

import { FormEvent, useState } from "react";
import { submitLead } from "@/lib/submit";

type Kind = "paint-correction" | "ceramic";

type Props = { kind: Kind };

const COPY = {
  "paint-correction": {
    eyebrow: "Paint assessment",
    title: "Tell us what the paint is doing.",
    body: "Give us the basics and what you are seeing. We will recommend the right correction level instead of automatically selling the biggest package.",
    submit: "Get my paint assessment ↗",
    success: "Request received. We’ll review the vehicle and paint concern and follow up with the right next step.",
  },
  ceramic: {
    eyebrow: "Coating quote",
    title: "Tell us what you want to protect.",
    body: "Give us the vehicle and a quick read on the paint. We will confirm the preparation it needs and quote the coating from there.",
    submit: "Get my coating quote ↗",
    success: "Request received. We’ll review the vehicle and paint condition and follow up with your coating recommendation.",
  },
} as const;

export function PaintLeadForm({ kind }: Props) {
  const copy = COPY[kind];
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError("");

    const form = new FormData(event.currentTarget);
    const vehicleMake = String(form.get("vehicleMake") ?? "").trim();
    const vehicleModel = String(form.get("vehicleModel") ?? "").trim();
    const concern = String(form.get("concern") ?? "").trim();
    const paintCondition = String(form.get("paintCondition") ?? "").trim();
    const notes = String(form.get("notes") ?? "").trim();

    const context = kind === "paint-correction"
      ? `Paint concern: ${concern || "Not specified"}${notes ? `\nAdditional notes: ${notes}` : ""}`
      : `Paint condition: ${paintCondition || "Not specified"}${notes ? `\nAdditional notes: ${notes}` : ""}`;

    const result = await submitLead({
      type: "quote",
      name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? ""),
      vehicleMake,
      vehicleModel,
      interest: kind === "paint-correction" ? "Paint Correction" : "Ceramic Coating",
      service: kind === "paint-correction" ? "Paint Correction" : "2-Year Ceramic Coating",
      source: kind === "paint-correction" ? "Website Paint Correction Page" : "Website Ceramic Coating Page",
      message: context,
      company: String(form.get("company") ?? ""),
    });

    if (result.ok) {
      setStatus("success");
      event.currentTarget.reset();
      return;
    }

    setStatus("error");
    setError(result.error);
  }

  if (status === "success") {
    return (
      <div className="paint-lead-success" role="status">
        <span className="paint-lead-success-mark">✓</span>
        <p className="eyebrow">Sent to Every Detail</p>
        <h3>We’ve got it.</h3>
        <p>{copy.success}</p>
      </div>
    );
  }

  return (
    <div className="paint-lead-shell">
      <div className="paint-lead-intro">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2>{copy.title}</h2>
        <p>{copy.body}</p>
        <div className="paint-lead-meta"><span>Same Every Detail team</span><span>Same CRM follow-up</span><span>No obligation</span></div>
      </div>

      <form className="paint-lead-form" onSubmit={onSubmit}>
        <input className="paint-hp" type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <div className="paint-field-grid">
          <label><span>Name</span><input name="name" autoComplete="name" required placeholder="Your name" /></label>
          <label><span>Mobile</span><input name="phone" type="tel" autoComplete="tel" inputMode="tel" required placeholder="(404) 555-0123" /></label>
        </div>
        <label><span>Email</span><input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
        <div className="paint-field-grid">
          <label><span>Vehicle make</span><input name="vehicleMake" autoComplete="off" required placeholder="Toyota" /></label>
          <label><span>Vehicle model</span><input name="vehicleModel" autoComplete="off" required placeholder="4Runner" /></label>
        </div>

        {kind === "paint-correction" ? (
          <label><span>Main paint concern</span><select name="concern" required defaultValue=""><option value="" disabled>Select what you are seeing</option><option>Swirls / wash marks</option><option>Light scratches</option><option>Haze / dull finish</option><option>Oxidation</option><option>Mixed defects / not sure</option></select></label>
        ) : (
          <label><span>Current paint condition</span><select name="paintCondition" required defaultValue=""><option value="" disabled>Choose the closest match</option><option>New / nearly new</option><option>Good with light swirls</option><option>Visible swirls or scratches</option><option>Heavier defects / oxidation</option><option>Not sure</option></select></label>
        )}

        <label><span>Anything else? <em>Optional</em></span><textarea name="notes" rows={4} placeholder={kind === "paint-correction" ? "Where are the defects? What result are you hoping for?" : "Anything we should know about the vehicle or how you use it?"} /></label>
        {status === "error" && <p className="paint-lead-error" role="alert">{error}</p>}
        <button className="btn btn-primary paint-lead-submit" type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending…" : copy.submit}</button>
        <p className="paint-lead-fine">We use this information only to respond to your request and build the right recommendation.</p>
      </form>
    </div>
  );
}
