"use client";

import Link from "next/link";
import { useState } from "react";
import { siteVehicleLabel, useVehicle } from "@/components/vehicle/VehicleContext";
import { useJourney } from "@/components/journey/JourneyContext";
import { PAINT_PRICING, paintServices } from "@/data/paint";
import { usd } from "@/lib/format";

const OPTIONS = [
  {
    id: "protect",
    number: "01",
    label: "Mostly clean",
    title: "I mainly want protection.",
    note: "Newer or well-kept paint with only light defects.",
    service: "ceramic2yr",
    path: ["DECON", "REFINE", "CERAMIC"],
    reason: "If the finish is already healthy, the goal is to prepare it properly, refine what needs attention, then protect it for the long run.",
  },
  {
    id: "dull",
    number: "02",
    label: "Lost gloss",
    title: "It looks dull or hazy.",
    note: "The paint still looks okay, but the reflection has flattened out.",
    service: "enhancement",
    path: ["DECON", "POLISH", "PROTECT"],
    reason: "A single-stage enhancement is usually the efficient starting point when the paint needs clarity and gloss more than heavy defect removal.",
  },
  {
    id: "swirls",
    number: "03",
    label: "Visible defects",
    title: "I see swirls in sunlight.",
    note: "Wash marring, spider-web marks, or light scratches are easy to see.",
    service: "correction",
    path: ["DECON", "CORRECT", "REFINE"],
    reason: "Visible swirls and wash marring usually call for deeper correction before any long-term protection is considered.",
  },
  {
    id: "serious",
    number: "04",
    label: "Needs assessment",
    title: "The paint needs serious work.",
    note: "Heavy haze, oxidation, deeper marks, or an unknown history.",
    service: "correction",
    path: ["INSPECT", "TEST", "CORRECT"],
    reason: "When the finish is more compromised, we inspect first and test the paint before deciding how aggressive the correction should be.",
  },
] as const;

type OptionId = (typeof OPTIONS)[number]["id"];

export function PaintPlanBuilder() {
  const { vehicle, openPicker } = useVehicle();
  const { serviceIntent, setServiceIntent } = useJourney();
  const initialOption: OptionId = serviceIntent === "ceramic2yr" ? "protect" : serviceIntent === "enhancement" ? "dull" : serviceIntent === "correction" ? "swirls" : "swirls";
  const [selected, setSelected] = useState<OptionId>(initialOption);
  const option = OPTIONS.find((item) => item.id === selected) ?? OPTIONS[2];
  const service = paintServices.find((item) => item.id === option.service) ?? paintServices[1];
  const personalizedPrice = vehicle ? PAINT_PRICING[vehicle.vehicle][service.id] : service.startingAt;

  return (
    <div className="pl57-plan-builder">
      <div className="pl57-plan-options" role="radiogroup" aria-label="Describe your paint condition">
        {OPTIONS.map((item) => {
          const on = item.id === selected;
          return (
            <button
              type="button"
              role="radio"
              aria-checked={on}
              key={item.id}
              className={`pl57-plan-option ${on ? "is-on" : ""}`}
              onClick={() => { setSelected(item.id); setServiceIntent(item.service); }}
            >
              <span className="pl57-plan-no">{item.number}</span>
              <span className="pl57-plan-label">{item.label}</span>
              <strong>{item.title}</strong>
              <small>{item.note}</small>
            </button>
          );
        })}
      </div>

      <aside className="pl57-plan-result ed-paper" aria-live="polite">
        <div className="pl57-plan-stamp">LIKELY STARTING POINT</div>
        <p className="pl57-mini-label">PAINT LAB / RECOMMENDATION</p>
        <h3>{service.name}</h3>
        <div className="pl57-plan-path" aria-label={`Likely process: ${option.path.join(", ")}`}>
          {option.path.map((step, index) => (
            <span key={step}>{step}{index < option.path.length - 1 ? <i>→</i> : null}</span>
          ))}
        </div>
        <p>{option.reason}</p>
        <div className="pl57-plan-price">
          <small>{vehicle ? `for ${siteVehicleLabel(vehicle)}` : "starting at"}</small>
          <strong>{usd(personalizedPrice)}</strong>
          {vehicle ? <button type="button" onClick={openPicker}>Change vehicle</button> : null}
        </div>
        <p className="pl57-plan-fine">Likely starting point only. We confirm the finish before correction begins.</p>
        <div className="pl57-plan-actions">
          <a href={service.id === "ceramic2yr" ? "/ceramic#coating-quote" : "/paint-correction#paint-quote"} className="pl57-primary-btn" onClick={() => setServiceIntent(service.id)}>ASK ABOUT MY PAINT ↗</a>
          {service.id !== "ceramic2yr" ? <Link href="/paint-correction">See correction details →</Link> : null}
        </div>
      </aside>
    </div>
  );
}
