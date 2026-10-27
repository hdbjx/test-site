"use client";

import { useEffect, useState } from "react";
import { TrackedLink } from "@/components/TrackedLink";
import { siteVehicleLabel, useVehicle } from "@/components/vehicle/VehicleContext";
import { PAINT_PRICING, paintServices } from "@/data/paint";
import type { VehicleId } from "@/data/services";
import { usd } from "@/lib/format";
import stage from "./PaintStagePricing.module.css";
import styles from "./CeramicPricing.module.css";

/* Wix prices small SUV + small truck and large SUV + large truck together. */
const SIZES: { id: VehicleId; label: string; match: VehicleId[] }[] = [
  { id: "sedan", label: "Sedan", match: ["sedan"] },
  { id: "smallSUV", label: "Small SUV / truck", match: ["smallSUV", "smallTruck"] },
  { id: "minivan", label: "Minivan", match: ["minivan"] },
  { id: "largeSUV", label: "Large SUV / truck", match: ["largeSUV", "largeTruck"] },
];

const PACKAGE = [
  { n: "01", title: "Prep + correction", body: "Wash, decontamination and correction matched to the finish, so the coating bonds to refined paint." },
  { n: "02", title: "2-year ceramic coating", body: "Professional ceramic protection applied panel by panel to the prepared paint." },
  { n: "03", title: "Free follow-up detail", body: "We come back after it cures to clean the car correctly and check the coating." },
];

export function CeramicPricing() {
  const { vehicle, openPicker } = useVehicle();
  const [size, setSize] = useState<VehicleId>(vehicle?.vehicle ?? "sedan");

  useEffect(() => {
    if (vehicle?.vehicle) setSize(vehicle.vehicle);
  }, [vehicle?.vehicle]);

  const activeSize = SIZES.find((item) => item.match.includes(size)) ?? SIZES[0];
  const ceramic = paintServices.find((service) => service.id === "ceramic2yr")!;
  const price = PAINT_PRICING[size].ceramic2yr;
  const correctionAlone = PAINT_PRICING[size].correction;

  return (
    <div className={stage.wrap}>
      <div className={stage.sizeBar}>
        {vehicle ? (
          <p className={stage.vehicleNote}>
            Priced for <strong>{siteVehicleLabel(vehicle)}</strong>
            <button type="button" onClick={openPicker}>Change</button>
          </p>
        ) : (
          <div className={stage.sizes} role="group" aria-label="Vehicle size">
            {SIZES.map((item) => (
              <button key={item.id} type="button" aria-pressed={activeSize.id === item.id} className={stage.size} onClick={() => setSize(item.id)}>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <article className={`${stage.card} ${stage.featured} ${styles.card}`}>
        <div className={styles.main}>
          <div className={stage.topline}><span>One package / correct, coat, follow up</span></div>
          <h3 className={stage.name}>{ceramic.name}</h3>
          <p className={stage.price}>
            <span key={price}>{usd(price)}</span>
            <small>{activeSize.label}</small>
          </p>
          <p className={stage.summary}>{ceramic.summary}</p>
          <p className={styles.compare}>Full correction on its own is {usd(correctionAlone)} for this size. The package adds the coating and the follow-up detail.</p>
          <TrackedLink href="#coating-quote" event="paint_inquiry" params={{ location: "ceramic_pricing", service: "ceramic2yr" }} className={`${stage.cta} ${styles.cta}`}>
            Get my coating plan <span aria-hidden="true">↗</span>
          </TrackedLink>
        </div>
        <ol className={styles.included}>
          {PACKAGE.map((item) => (
            <li key={item.n}>
              <span>{item.n}</span>
              <div><strong>{item.title}</strong><p>{item.body}</p></div>
            </li>
          ))}
        </ol>
      </article>
    </div>
  );
}
