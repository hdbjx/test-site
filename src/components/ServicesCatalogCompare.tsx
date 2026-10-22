"use client";

import { useMemo, useState } from "react";
import { TrackedLink } from "./TrackedLink";
import { catalogPrice, catalogService, catalogServices, type CatalogService, type CatalogServiceId } from "@/data/serviceCatalog";
import { vehicles, type VehicleId } from "@/data/services";
import { usd } from "@/lib/format";

const groups = ["Detail", "Paint Care", "Recurring"] as const;

function ctaFor(service: CatalogService) {
  if (service.category === "Paint Care") return { label: "View Paint Care", event: "paint_inquiry" as const };
  if (service.category === "Recurring") return { label: "Build Detail+", event: "detailplus_start" as const };
  return { label: "Book", event: "book_click" as const };
}

function priceText(id: CatalogServiceId, vehicle: VehicleId) {
  const price = catalogPrice(id, vehicle);
  return price == null ? "Custom plan" : usd(price);
}

function ServiceSelect({ value, onChange, label }: { value: CatalogServiceId; onChange: (value: CatalogServiceId) => void; label: string }) {
  return (
    <label className="svc62-compare-select">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as CatalogServiceId)}>
        {groups.map((group) => (
          <optgroup key={group} label={group}>
            {catalogServices.filter((service) => service.category === group).map((service) => (
              <option key={service.id} value={service.id}>{service.name}</option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}

export function ServicesCatalogCompare() {
  const [vehicle, setVehicle] = useState<VehicleId>("sedan");
  const [leftId, setLeftId] = useState<CatalogServiceId>("premium");
  const [rightId, setRightId] = useState<CatalogServiceId>("factoryReset");
  const [differencesOnly, setDifferencesOnly] = useState(false);

  const left = catalogService(leftId);
  const right = catalogService(rightId);
  const vehicleLabel = vehicles.find((item) => item.id === vehicle)?.label ?? "Sedan";

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
    <div className="svc62-catalog-module">
      <div className="svc62-vehicle-row">
        <div>
          <span className="svc62-mini-label">YOUR VEHICLE</span>
          <strong>Prices update together.</strong>
        </div>
        <label className="svc62-vehicle-select">
          <span className="sr-only">Vehicle type</span>
          <select value={vehicle} onChange={(event) => setVehicle(event.target.value as VehicleId)}>
            {vehicles.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
      </div>

      <div className="svc62-service-list" aria-label={`Every Detail services and prices for ${vehicleLabel}`}>
        {groups.map((group) => (
          <section key={group} className="svc62-service-group">
            <div className="svc62-group-name"><span>{group}</span></div>
            <div className="svc62-group-rows">
              {catalogServices.filter((service) => service.category === group).map((service) => {
                const cta = ctaFor(service);
                return (
                  <article key={service.id} className="svc62-service-row">
                    <div className="svc62-service-name">
                      <span>{service.categoryLabel}</span>
                      <h3>{service.name}</h3>
                    </div>
                    <p>{service.short}</p>
                    <div className="svc62-service-price">
                      <small>{service.id === "detailplus" ? "RATE" : vehicleLabel.toUpperCase()}</small>
                      <strong>{priceText(service.id, vehicle)}</strong>
                    </div>
                    <TrackedLink
                      href={service.href}
                      event={cta.event}
                      params={{ location: "services_all", service: service.id, vehicle }}
                      className="svc62-service-link"
                    >
                      {cta.label} <span>↗</span>
                    </TrackedLink>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="svc62-compare" id="compare-services">
        <div className="svc62-compare-intro">
          <div>
            <span className="svc62-mini-label">COMPARE</span>
            <h3>PUT TWO<br /><em>SIDE BY SIDE.</em></h3>
          </div>
          <p>Pick any two services. We will show the meaningful differences for the same vehicle, including the exact listed price when the service has one.</p>
        </div>

        <div className="svc62-compare-controls">
          <ServiceSelect value={leftId} onChange={setLeftId} label="SERVICE ONE" />
          <div className="svc62-vs" aria-hidden="true">VS</div>
          <ServiceSelect value={rightId} onChange={setRightId} label="SERVICE TWO" />
        </div>

        <div className="svc62-compare-actions">
          <span>Showing {vehicleLabel} pricing</span>
          <label className="svc62-diff-toggle">
            <input type="checkbox" checked={differencesOnly} onChange={(event) => setDifferencesOnly(event.target.checked)} />
            <span className="svc62-switch" aria-hidden="true"><i /></span>
            Show only differences
          </label>
        </div>

        <div className="svc62-compare-table">
          <div className="svc62-compare-head">
            <div aria-hidden="true" />
            {[left, right].map((service) => {
              const cta = ctaFor(service);
              return (
                <div key={service.id} className="svc62-compare-service-head">
                  <span>{service.categoryLabel}</span>
                  <h4>{service.name}</h4>
                  <strong>{priceText(service.id, vehicle)}</strong>
                  <small>{service.id === "detailplus" ? "Plan-based rate" : `for ${vehicleLabel}`}</small>
                  <TrackedLink href={service.href} event={cta.event} params={{ location: "services_compare", service: service.id, vehicle }}>
                    {cta.label} <span>↗</span>
                  </TrackedLink>
                </div>
              );
            })}
          </div>

          <div className="svc62-compare-body">
            {rows.length ? rows.map((row) => (
              <div className="svc62-compare-row" key={row.label}>
                <div className="svc62-compare-label">{row.label}</div>
                <div>{row.left}</div>
                <div>{row.right}</div>
              </div>
            )) : (
              <p className="svc62-no-differences">No differences to show. Pick another service or turn off “Show only differences.”</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
