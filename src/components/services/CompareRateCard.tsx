"use client";

import { useEffect, useState } from "react";
import { TrackedLink } from "@/components/TrackedLink";
import { useVehicle } from "@/components/vehicle/VehicleContext";
import { PAINT_PRICING, paintServices, type PaintServiceId } from "@/data/paint";
import { PRICING, serviceIds, services, vehicles, type ServiceId, type VehicleId } from "@/data/services";
import { track } from "@/lib/analytics";
import { durationShort, usd } from "@/lib/format";
import styles from "./CompareRateCard.module.css";

/**
 * Apple-style "compare" view, set as a printed rate card: all six services side by
 * side, priced for the visitor's vehicle. Facts only come from the service and paint
 * data files, so this can't drift from the cards above it.
 */

type Col = {
  key: ServiceId | PaintServiceId;
  group: "Detail" | "Paint care";
  name: string;
  price: (v: VehicleId) => number;
  time: (v: VehicleId) => string;
  bestFor: string;
  inside: string;
  outside: string;
  paint: string;
  howToBook: string;
  href: (v: VehicleId) => string;
  cta: string;
};

const DETAIL_COVERAGE: Record<ServiceId, { inside: string; outside: string; paint: string }> = {
  maintenance: { inside: "Vacuum + wipe-down", outside: "Hand wash, wheels, windows", paint: "—" },
  premium: { inside: "Full deep clean", outside: "Hand wash, wheels, windows", paint: "Spray sealant" },
  factoryReset: { inside: "Extraction, every seam + vent", outside: "Hand wash, wheels, windows", paint: "Decon, clay + sealant" },
};

const PAINT_COVERAGE: Record<PaintServiceId, string> = {
  enhancement: "Single-stage polish",
  correction: "Multi-stage correction",
  ceramic2yr: "Correction + 2-year coating",
};

const PAINT_PAGE: Record<PaintServiceId, string> = {
  enhancement: "/paint-correction#paint-quote",
  correction: "/paint-correction#paint-quote",
  ceramic2yr: "/ceramic#coating-quote",
};

const columns: Col[] = [
  ...serviceIds.map((id): Col => ({
    key: id,
    group: "Detail",
    name: services[id].name.replace(" Detail", ""),
    price: (v) => PRICING[v][id].price,
    time: (v) => `About ${durationShort(PRICING[v][id].minutes)}`,
    bestFor: services[id].whoFor,
    ...DETAIL_COVERAGE[id],
    howToBook: "Pick a time online",
    href: (v) => `/book?service=${id}&vehicle=${v}&from=context`,
    cta: "Book",
  })),
  ...paintServices.map((p): Col => ({
    key: p.id,
    group: "Paint care",
    name: p.name.replace("Full ", "").replace("2-Year ", ""),
    price: (v) => PAINT_PRICING[v][p.id],
    time: () => "Set at inspection",
    bestFor: p.bestFor,
    inside: "—",
    outside: "Wash + full decontamination",
    paint: PAINT_COVERAGE[p.id],
    howToBook: "Paint assessment first",
    href: () => PAINT_PAGE[p.id],
    cta: "Start",
  })),
];

const ROWS: { label: string; get: (c: Col, v: VehicleId) => string }[] = [
  { label: "Time on site", get: (c, v) => c.time(v) },
  { label: "Best for", get: (c) => c.bestFor },
  { label: "Inside", get: (c) => c.inside },
  { label: "Outside", get: (c) => c.outside },
  { label: "Paint", get: (c) => c.paint },
  { label: "How to book", get: (c) => c.howToBook },
];

export function CompareRateCard() {
  const { vehicle: siteVehicle } = useVehicle();
  const [open, setOpen] = useState(false);
  const [vehicle, setVehicle] = useState<VehicleId>(siteVehicle?.vehicle ?? "sedan");

  useEffect(() => {
    if (siteVehicle?.vehicle) setVehicle(siteVehicle.vehicle);
  }, [siteVehicle?.vehicle]);

  return (
    <section className={styles.section} data-header-tone="ink" aria-labelledby="compare-title">
      <div className={styles.shell}>
        <div className={styles.bar}>
          <div>
            <p className={styles.kicker}>Rate card / all six services</p>
            <h2 id="compare-title" className={styles.title}>Compare everything.</h2>
          </div>
          <button
            type="button"
            className={styles.toggle}
            aria-expanded={open}
            aria-controls="compare-card"
            onClick={() => {
              setOpen((o) => !o);
              if (!open) track("service_select", { location: "services_compare_open" });
            }}
          >
            {open ? "Hide the comparison" : "Compare all six"} <span aria-hidden="true">{open ? "−" : "+"}</span>
          </button>
        </div>

        <div id="compare-card" className={styles.card} hidden={!open}>
          <div className={styles.cardHead}>
            <p>Every Detail · Rate card</p>
            <label className={styles.size}>
              <span>Priced for</span>
              <select value={vehicle} onChange={(e) => setVehicle(e.target.value as VehicleId)}>
                {vehicles.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
              </select>
            </label>
          </div>

          <div className={styles.scroller} tabIndex={0} role="region" aria-label="Service comparison table">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col" className={styles.corner}><span className="sr-only">Service</span></th>
                  {columns.map((c, i) => (
                    <th key={c.key} scope="col" className={i === 3 ? styles.groupStart : undefined}>
                      <span className={styles.group}>{c.group}</span>
                      <span className={styles.name}>{c.name}</span>
                      <span className={styles.price}>{usd(c.price(vehicle))}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    {columns.map((c, i) => (
                      <td key={c.key} className={i === 3 ? styles.groupStart : undefined}>{row.get(c, vehicle)}</td>
                    ))}
                  </tr>
                ))}
                <tr className={styles.ctaRow}>
                  <th scope="row"><span className="sr-only">Next step</span></th>
                  {columns.map((c, i) => (
                    <td key={c.key} className={i === 3 ? styles.groupStart : undefined}>
                      <TrackedLink
                        href={c.href(vehicle)}
                        event={c.group === "Detail" ? "book_click" : "quote_start"}
                        params={{ location: "services_compare", service: c.key, vehicle }}
                        className={styles.cta}
                      >
                        {c.cta} {c.name} <span aria-hidden="true">↗</span>
                      </TrackedLink>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p className={styles.fine}>Paint care is priced by vehicle and confirmed in person before any polishing starts. No payment to book. Pay after the work is done.</p>
        </div>
      </div>
    </section>
  );
}
