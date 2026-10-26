"use client";

import { useEffect, useMemo, useState } from "react";
import { SplitFlapPrice } from "@/components/services/SplitFlapPrice";
import { TrackedLink } from "@/components/TrackedLink";
import { useJourney } from "@/components/journey/JourneyContext";
import { siteVehicleLabel, useVehicle } from "@/components/vehicle/VehicleContext";
import { catalogPrice, catalogServices, type CatalogService, type CatalogServiceId } from "@/data/serviceCatalog";
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
  if (service.category === "Paint Care") return { event: "paint_inquiry" as const };
  if (service.category === "Recurring") return { event: "detailplus_start" as const };
  return { event: "book_click" as const };
}

function priceText(id: CatalogServiceId, vehicle: VehicleId) {
  const price = catalogPrice(id, vehicle);
  return price == null ? "CUSTOM" : usd(price);
}

export function ServicesMenuBoard({ anchorId = "all-services" }: { anchorId?: string }) {
  const { vehicle: siteVehicle, openPicker, selectVehicle } = useVehicle();
  const { setServiceIntent } = useJourney();
  const [fallbackVehicle, setFallbackVehicle] = useState<VehicleId>(siteVehicle?.vehicle ?? "sedan");
  const selectedVehicle = siteVehicle?.vehicle ?? fallbackVehicle;
  const selectedLabel = vehicles.find((item) => item.id === selectedVehicle)?.label ?? "Sedan";

  useEffect(() => {
    if (siteVehicle?.vehicle) setFallbackVehicle(siteVehicle.vehicle);
  }, [siteVehicle?.vehicle]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("ed:services-menu-vehicle", { detail: selectedVehicle }));
  }, [selectedVehicle]);

  const rows = useMemo(() => catalogServices.map((service, index) => ({ service, index })), []);

  const chooseVehicle = (vehicleId: VehicleId) => {
    setFallbackVehicle(vehicleId);
    if (!siteVehicle) return;
    const label = vehicles.find((item) => item.id === vehicleId)?.label ?? "Vehicle";
    void selectVehicle({ make: "", model: "", vehicle: vehicleId, customLabel: label }, false);
  };

  return (
    <section id={anchorId} className="sv90-menu ed90-halftone" data-header-tone="light" aria-labelledby="sv90-menu-title">
      <div className="sv90-shell sv90-menu-inner">
        <div className="sv90-menu-heading-row">
          <h2 id="sv90-menu-title" className="ed90-heading">THE FULL<br /><span>MENU.</span></h2>
          <div className="sv90-menu-vehicle-status">
            {siteVehicle ? (
              <button type="button" onClick={openPicker}>PRICED FOR {siteVehicleLabel(siteVehicle).toUpperCase()} · CHANGE</button>
            ) : (
              <span>CHOOSE A VEHICLE SIZE FOR EXACT MENU PRICING</span>
            )}
          </div>
        </div>

        <div className="sv90-menu-keys" aria-label="Choose vehicle size">
          {vehicles.map((vehicle) => (
            <button
              key={vehicle.id}
              type="button"
              aria-pressed={selectedVehicle === vehicle.id}
              onClick={() => chooseVehicle(vehicle.id)}
            >
              {vehicle.label.toUpperCase()}
            </button>
          ))}
        </div>

        <p className="sr-only" aria-live="polite">Prices updated for {selectedLabel}</p>

        <div className="sv90-menu-groups" aria-label={`Every Detail service menu priced for ${selectedLabel}`}>
          {groups.map((group) => (
            <div className="sv90-menu-group" key={group}>
              <h3>{group.toUpperCase()}</h3>
              <div className="sv90-menu-rows">
                {rows.filter(({ service }) => service.category === group).map(({ service, index }) => {
                  const cta = ctaFor(service);
                  return (
                    <TrackedLink
                      key={service.id}
                      href={serviceHref(service, selectedVehicle, !!siteVehicle)}
                      event={cta.event}
                      params={{ location: "services_menu", service: service.id, vehicle: selectedVehicle }}
                      onClick={() => setServiceIntent(service.id)}
                      className="sv90-menu-row"
                    >
                      <span className="sv90-menu-copy">
                        <strong>{service.name}</strong>
                        <small>{service.short}</small>
                      </span>
                      <span className="sv90-menu-dots" aria-hidden="true" />
                      <SplitFlapPrice value={priceText(service.id, selectedVehicle)} rowIndex={index} />
                      <span className="sv90-menu-arrow" aria-hidden="true">↗</span>
                    </TrackedLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <p className="sv90-menu-foot">EXACT PRICE FOLLOWS THE VEHICLE SELECTED · POWER + WATER INCLUDED ON EVERY JOB</p>
      </div>
    </section>
  );
}
