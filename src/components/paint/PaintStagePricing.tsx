"use client";

import { useEffect, useState } from "react";
import { TrackedLink } from "@/components/TrackedLink";
import { siteVehicleLabel, useVehicle } from "@/components/vehicle/VehicleContext";
import { PAINT_PRICING, paintServices, type PaintServiceId } from "@/data/paint";
import type { VehicleId } from "@/data/services";
import { usd } from "@/lib/format";
import styles from "./PaintStagePricing.module.css";

/* Wix prices small SUV + small truck and large SUV + large truck together, so the picker groups them. */
const SIZES: { id: VehicleId; label: string; match: VehicleId[] }[] = [
  { id: "sedan", label: "Sedan", match: ["sedan"] },
  { id: "smallSUV", label: "Small SUV / truck", match: ["smallSUV", "smallTruck"] },
  { id: "minivan", label: "Minivan", match: ["minivan"] },
  { id: "largeSUV", label: "Large SUV / truck", match: ["largeSUV", "largeTruck"] },
];

const STAGES: { id: Exclude<PaintServiceId, "ceramic2yr">; number: string; condition: string; meters: [number, number] }[] = [
  { id: "enhancement", number: "01", condition: "Lost gloss, light swirls", meters: [4, 2] },
  { id: "correction", number: "02", condition: "Visible swirls + scratches", meters: [5, 4] },
];
const METER_LABELS = ["Gloss", "Defect removal"] as const;
const METER_STEPS = 5;

export function PaintStagePricing() {
  const { vehicle, openPicker } = useVehicle();
  const [size, setSize] = useState<VehicleId>(vehicle?.vehicle ?? "sedan");

  useEffect(() => {
    if (vehicle?.vehicle) setSize(vehicle.vehicle);
  }, [vehicle?.vehicle]);

  const activeSize = SIZES.find((item) => item.match.includes(size)) ?? SIZES[0];
  const ceramic = paintServices.find((service) => service.id === "ceramic2yr")!;

  return (
    <div className={styles.wrap}>
      <div className={styles.sizeBar}>
        {vehicle ? (
          <p className={styles.vehicleNote}>
            Priced for <strong>{siteVehicleLabel(vehicle)}</strong>
            <button type="button" onClick={openPicker}>Change</button>
          </p>
        ) : (
          <div className={styles.sizes} role="group" aria-label="Vehicle size">
            {SIZES.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={activeSize.id === item.id}
                className={styles.size}
                onClick={() => setSize(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.grid}>
        {STAGES.map((stage, index) => {
          const service = paintServices.find((item) => item.id === stage.id)!;
          const price = PAINT_PRICING[size][stage.id];
          return (
            <article key={stage.id} className={`${styles.card} ${index === 1 ? styles.featured : ""}`}>
              <div className={styles.topline}>
                <span>{stage.number} / {stage.condition}</span>
              </div>
              <h3 className={styles.name}>{service.name}</h3>
              <p className={styles.price}>
                <span key={`${stage.id}-${price}`}>{usd(price)}</span>
                <small>{activeSize.label}</small>
              </p>
              <p className={styles.summary}>{service.summary}</p>

              <div className={styles.meters} aria-label={`${METER_LABELS[0]} ${stage.meters[0]} of 5, ${METER_LABELS[1]} ${stage.meters[1]} of 5`}>
                {METER_LABELS.map((label, m) => (
                  <div key={label} className={styles.meter} aria-hidden="true">
                    <span>{label}</span>
                    <span className={styles.meterBar}>
                      {Array.from({ length: METER_STEPS }, (_, step) => (
                        <i key={step} className={step < stage.meters[m] ? styles.meterOn : undefined} />
                      ))}
                    </span>
                  </div>
                ))}
              </div>

              <ul className={styles.includes}>
                {service.includes.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <p className={styles.bestFor}><strong>Best for:</strong> {service.bestFor}</p>

              <TrackedLink
                href="#paint-quote"
                event="paint_inquiry"
                params={{ location: "paint_stage_pricing", service: stage.id }}
                className={styles.cta}
              >
                Get my paint assessment <span aria-hidden="true">↗</span>
              </TrackedLink>
            </article>
          );
        })}
      </div>

      <TrackedLink href="/ceramic" event="paint_inquiry" params={{ location: "paint_ceramic_upsell" }} className={styles.ceramic}>
        <span className={styles.ceramicLabel}>Want it protected?</span>
        <span className={styles.ceramicText}><strong>{ceramic.name}</strong> includes correction first, plus a free follow-up detail.</span>
        <span className={styles.ceramicPrice}>{usd(PAINT_PRICING[size].ceramic2yr)} <span aria-hidden="true">↗</span></span>
      </TrackedLink>
    </div>
  );
}
