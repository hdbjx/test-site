"use client";

import { FormEvent, useState } from "react";
import { submitLead } from "@/lib/submit";

type Kind = "paint-correction" | "ceramic";

type Props = { kind: Kind };

const COPY = {
  "paint-correction": {
    eyebrow: "Paint assessment",
    title: "Let’s take a look at your paint.",
    body: "Tell us what you’re seeing and what bothers you most. We’ll review it ourselves and recommend the level of correction that actually makes sense for your car.",
    submit: "Send my paint assessment ↗",
    success: "We’ll take a look at what you sent and reach out with what we’d recommend for your car.",
  },
  ceramic: {
    eyebrow: "Coating quote",
    title: "Let’s find the right protection for your car.",
    body: "Tell us a little about the vehicle and how the paint looks today. We’ll review it and let you know what preparation and protection we’d recommend before anything is booked.",
    submit: "Get my coating recommendation ↗",
    success: "We’ll review your car and paint condition, then reach out with the coating setup we’d recommend.",
  },
} as const;

export function PaintLeadForm({ kind }: Props) {
  const copy = COPY[kind];
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [firstName, setFirstName] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError("");

    const form = new FormData(event.currentTarget);
    const submittedName = String(form.get("name") ?? "").trim();
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
      name: submittedName,
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
      setFirstName(submittedName.split(/\s+/)[0] || "");
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
        <h3>{firstName ? `Thanks, ${firstName}.` : "Thanks. We’ve got it."}</h3>
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
        <div className="paint-lead-meta"><span>Reviewed by our team</span><span>No obligation</span><span>No generic package push</span></div>
      </div>

      <form className="paint-lead-form" onSubmit={onSubmit}>
        <input className="paint-hp" type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <div className="paint-field-grid">
          <label><span>What should we call you?</span><input name="name" autoComplete="name" required placeholder="Your name" /></label>
          <label><span>Best number to reach you</span><input name="phone" type="tel" autoComplete="tel" inputMode="tel" required placeholder="(404) 555-0123" /></label>
        </div>
        <label><span>Email</span><input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
        <div className="paint-field-grid">
          <label><span>What do you drive?</span><input name="vehicleMake" autoComplete="off" required placeholder="Toyota" /></label>
          <label><span>Model</span><input name="vehicleModel" autoComplete="off" required placeholder="4Runner" /></label>
        </div>

        {kind === "paint-correction" ? (
          <fieldset className="paint-choice-field"><legend>What bothers you most about the paint?</legend><div className="paint-choice-grid">{["Swirls / wash marks","Light scratches","Dull or hazy paint","Water spots / etching","Not sure yet"].map((option) => <label className="paint-choice" key={option}><input type="radio" name="concern" value={option} required /><span>{option}</span></label>)}</div></fieldset>
        ) : (
          <fieldset className="paint-choice-field"><legend>How would you describe the paint right now?</legend><div className="paint-choice-grid">{["New / nearly new","Looks good, some light swirls","Visible swirls or scratches","Needs some work","Honestly, I’m not sure"].map((option) => <label className="paint-choice" key={option}><input type="radio" name="paintCondition" value={option} required /><span>{option}</span></label>)}</div></fieldset>
        )}

        <label><span>{kind === "paint-correction" ? "Anything you want us to know?" : "Anything else we should know?"} <em>Optional</em></span><textarea name="notes" rows={4} placeholder={kind === "paint-correction" ? "Tell us where you notice it most, or what you want the paint to look like again." : "Tell us how you use the car, what you want from the coating, or anything else that would help."} /></label>
        {status === "error" && <p className="paint-lead-error" role="alert">{error}</p>}
        <button className="btn btn-primary paint-lead-submit" type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending…" : copy.submit}</button>
        <p className="paint-lead-fine">No instant sales pitch. We’ll review this and follow up with a recommendation that fits your car.</p>
      </form>
    </div>
  );
}
