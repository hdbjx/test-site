"use client";

import { useEffect, useMemo, useState } from "react";
import { TrackedLink } from "@/components/TrackedLink";
import { useJourney } from "@/components/journey/JourneyContext";
import { siteVehicleLabel, useVehicle } from "@/components/vehicle/VehicleContext";
import { catalogPrice, catalogService, catalogServices, type CatalogService, type CatalogServiceId } from "@/data/serviceCatalog";
import { vehicles, type VehicleId } from "@/data/services";
import { usd } from "@/lib/format";

const groups = ["Detail", "Paint Care", "Recurring"] as const;

function serviceHref(service: CatalogService, vehicle: VehicleId, hasVehicleContext: boolean) {
  if (service.category !== "Detail") return service.href;
  return hasVehicleContext
    ? `/book?service=${service.id}&from=context`
    : `/book?service=${service.id}&vehicle=${vehicle}&from=context`;
}

function ctaFor(service: CatalogService) {
  if (service.category === "Paint Care") return { label: "View Paint Care", event: "paint_inquiry" as const };
  if (service.category === "Recurring") return { label: "Build Detail+", event: "detailplus_start" as const };
  return { label: "Book", event: "book_click" as const };
}

function priceText(id: CatalogServiceId, vehicle: VehicleId) {
  const price = catalogPrice(id, vehicle);
  return price == null ? "CUSTOM" : usd(price);
}

function ServiceSelect({ value, onChange, label }: { value: CatalogServiceId; onChange: (value: CatalogServiceId) => void; label: string }) {
  return (
    <label className="sv90-inline-select">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as CatalogServiceId)}>
        {groups.map((group) => (
          <optgroup key={group} label={group}>
            {catalogServices.filter((service) => service.category === group).map((service) => (
              <option key={service.id} value={service.id}>{service.name}</option>
            ))}
          </optgroup>
        ))}
      </select>
      <span aria-hidden="true">{catalogService(value).name} ▾</span>
    </label>
  );
}

export function ServicesCompareSheet() {
  const { vehicle: siteVehicle } = useVehicle();
  const { serviceIntent, setServiceIntent } = useJourney();
  const [fallbackVehicle, setFallbackVehicle] = useState<VehicleId>(siteVehicle?.vehicle ?? "sedan");
  const vehicle = siteVehicle?.vehicle ?? fallbackVehicle;
  const [leftId, setLeftId] = useState<CatalogServiceId>(serviceIntent ?? "premium");
  const [rightId, setRightId] = useState<CatalogServiceId>(serviceIntent === "factoryReset" ? "premium" : "factoryReset");
  const [differencesOnly, setDifferencesOnly] = useState(false);

  useEffect(() => {
    const onMenuVehicle = (event: Event) => {
      const vehicleId = (event as CustomEvent<VehicleId>).detail;
      if (!siteVehicle && vehicles.some((item) => item.id === vehicleId)) setFallbackVehicle(vehicleId);
    };
    window.addEventListener("ed:services-menu-vehicle", onMenuVehicle);
    return () => window.removeEventListener("ed:services-menu-vehicle", onMenuVehicle);
  }, [siteVehicle]);

  useEffect(() => {
    if (!serviceIntent) return;
    setLeftId(serviceIntent);
    setRightId((current) => current === serviceIntent ? (serviceIntent === "premium" ? "factoryReset" : "premium") : current);
  }, [serviceIntent]);

  const left = catalogService(leftId);
  const right = catalogService(rightId);
  const vehicleLabel = siteVehicle ? siteVehicleLabel(siteVehicle) : vehicles.find((item) => item.id === vehicle)?.label ?? "Sedan";

  const rows = useMemo(() => {
    const all = [
      { label: "Best for", left: left.bestFor, right: right.bestFor },
      { label: "Primary goal", left: left.compare.goal, right: right.compare.goal },
      { label: "Interior", left: left.compare.interior, right: right.compare.interior },
      { label: "Exterior", left: left.compare.exterior, right: right.compare.exterior },
      { label: "Paint correction", left: left.compare.correction, right: right.compare.correction },
      { label: "Protection", left: left.compare.protection, right: right.compare.protection },
      { label: "Cadence", left: left.compare.cadence, right: right.compare.cadence },
    ];
    return differencesOnly ? all.filter((row) => row.left !== row.right) : all;
  }, [differencesOnly, left, right]);

  return (
    <section className="sv90-compare" data-header-tone="ink" aria-labelledby="sv90-compare-title">
      <div className="sv90-shell">
        <div className="sv90-compare-heading">
          <h2 id="sv90-compare-title" className="ed90-heading">PUT TWO<br /><span>SIDE BY SIDE.</span></h2>
          <p className="sv90-compare-sentence">
            Compare <ServiceSelect value={leftId} onChange={setLeftId} label="First service" /> with <ServiceSelect value={rightId} onChange={setRightId} label="Second service" />.
          </p>
          <label className="sv90-diff-check">
            <input type="checkbox" checked={differencesOnly} onChange={(event) => setDifferencesOnly(event.target.checked)} />
            <span aria-hidden="true" />
            SHOW ONLY DIFFERENCES
          </label>
        </div>

        <div className="sv90-spec-scroll" tabIndex={0} aria-label="Service comparison table. Scroll horizontally on smaller screens.">
          <div className="sv90-spec-sheet">
            <div className="sv90-spec-head">
              <div><small>PRICED FOR</small><strong>{vehicleLabel}</strong></div>
              {[left, right].map((service) => {
                const cta = ctaFor(service);
                return (
                  <div key={service.id}>
                    <span>{service.categoryLabel}</span>
                    <h3>{service.name}</h3>
                    <strong>{priceText(service.id, vehicle)}</strong>
                    <TrackedLink
                      href={serviceHref(service, vehicle, !!siteVehicle)}
                      event={cta.event}
                      params={{ location: "services_compare", service: service.id, vehicle }}
                      onClick={() => setServiceIntent(service.id)}
                    >
                      {cta.label} ↗
                    </TrackedLink>
                  </div>
                );
              })}
            </div>

            <div className="sv90-spec-body">
              {rows.length ? rows.map((row) => {
                const different = row.left !== row.right;
                return (
                  <div className="sv90-spec-row" key={row.label}>
                    <div>{row.label}</div>
                    <div className={differencesOnly && different ? "is-different" : ""}>{row.left}</div>
                    <div className={differencesOnly && different ? "is-different" : ""}>{row.right}</div>
                  </div>
                );
              }) : (
                <p className="sv90-no-differences">No differences to show. Pick another service or turn off “Show only differences.”</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
