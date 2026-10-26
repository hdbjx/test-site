"use client";

import { useEffect, useRef, useState } from "react";
import { RubberStamp } from "@/components/ed/RubberStamp";
import { TrackedLink } from "@/components/TrackedLink";
import { siteVehicleLabel, useVehicle } from "@/components/vehicle/VehicleContext";
import { PAINT_PRICING, paintServices, type PaintServiceId } from "@/data/paint";
import { usd } from "@/lib/format";

const stages = [
  paintServices.find((service) => service.id === "enhancement")!,
  paintServices.find((service) => service.id === "correction")!,
] as const;

function RollingPrice({ value }: { value: string }) {
  const previous = useRef(value);
  const [from, setFrom] = useState(value);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (previous.current === value) return;
    setFrom(previous.current);
    previous.current = value;
    setVersion((current) => current + 1);
  }, [value]);

  const slotCount = 6;
  const oldChars = Array.from(from.padStart(slotCount, " "));
  const nextChars = Array.from(value.padStart(slotCount, " "));

  return (
    <span className="pc90-price-roll" aria-label={value}>
      <span className="sr-only">{value}</span>
      <span className="pc90-price-roll-window" aria-hidden="true" key={`${value}-${version}`}>
        {nextChars.map((char, index) => {
          const oldChar = oldChars[index] ?? " ";
          const changed = oldChar !== char;
          return (
            <span className={`pc90-price-digit ${changed ? "is-changing" : ""}`} key={`${index}-${version}`}>
              <i className="pc90-price-digit-old">{oldChar === " " ? "\u00A0" : oldChar}</i>
              <i className="pc90-price-digit-new">{char === " " ? "\u00A0" : char}</i>
            </span>
          );
        })}
      </span>
    </span>
  );
}

function priceFor(id: PaintServiceId, vehicleId: keyof typeof PAINT_PRICING | null) {
  const service = paintServices.find((item) => item.id === id)!;
  return vehicleId ? PAINT_PRICING[vehicleId][id] : service.startingAt;
}

export function PaintStagePricing() {
  const { vehicle, openPicker } = useVehicle();
  const vehicleId = vehicle?.vehicle ?? null;

  return (
    <div className="pc90-stage-wrap">
      <div className="pc90-stage-grid">
        {stages.map((service, index) => {
          const price = priceFor(service.id, vehicleId);
          return (
            <article key={service.id} className={`pc90-stage pc90-stage-${index + 1}`}>
              <div className="pc90-stage-topline">
                <span>STAGE {index + 1}</span>
                <small>{index === 0 ? "GLOSS + LIGHT DEFECTS" : "VISIBLE / HEAVIER DEFECTS"}</small>
              </div>
              <h3>{service.name}</h3>
              <div className="pc90-stage-price-line">
                {!vehicle && <span className="pc90-from">FROM</span>}
                <RollingPrice value={usd(price)} />
              </div>
              <button type="button" className="pc90-vehicle-change" onClick={openPicker}>
                {vehicle ? <>Priced for <strong>{siteVehicleLabel(vehicle)}</strong> · Change</> : <>Add your vehicle for exact pricing</>}
              </button>
              <p className="pc90-stage-best">{service.bestFor}</p>
              <ul className="pc90-ruled-list">
                {service.includes.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <TrackedLink
                href="#paint-quote"
                event="paint_inquiry"
                params={{ location: "paint_stage_pricing", service: service.id }}
                className="ed90-button pc90-stage-cta"
              >
                GET MY PAINT ASSESSMENT <span>↗</span>
              </TrackedLink>
            </article>
          );
        })}
      </div>
      <RubberStamp animate className="pc90-stage-stamp">ASSESSED IN PERSON</RubberStamp>
    </div>
  );
}
