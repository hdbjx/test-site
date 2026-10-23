"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PAINT_PRICING, paintServices, type PaintServiceId } from "@/data/paint";
import { vehicles } from "@/data/services";
import { usd } from "@/lib/format";
import { siteVehicleLabel, useVehicle } from "@/components/vehicle/VehicleContext";
import { useJourney } from "@/components/journey/JourneyContext";

type Props = {
  services: PaintServiceId[];
  primary?: PaintServiceId;
  quoteHref: string;
  quoteLabel: string;
};

export function PaintPricingPanel({ services, primary, quoteHref, quoteLabel }: Props) {
  const { vehicle, openPicker } = useVehicle();
  const { setServiceIntent } = useJourney();
  const size = vehicle ? vehicles.find((item) => item.id === vehicle.vehicle)?.label : null;

  useEffect(() => {
    if (primary) setServiceIntent(primary);
  }, [primary, setServiceIntent]);

  return (
    <div className="paint85-pricing-panel">
      <div className="paint85-pricing-context">
        <span>{vehicle ? "PRICING FOR" : "PAINT CARE PRICING"}</span>
        <button type="button" onClick={openPicker}>
          <strong>{vehicle ? siteVehicleLabel(vehicle) : "ADD YOUR VEHICLE"}</strong>
          <small>{vehicle ? `${size ?? "Vehicle"} · Change vehicle` : "See exact pricing"}</small>
        </button>
      </div>

      <div className={`paint85-price-options ${services.length === 1 ? "is-single" : ""}`}>
        {services.map((id) => {
          const service = paintServices.find((item) => item.id === id)!;
          const price = vehicle ? PAINT_PRICING[vehicle.vehicle][id] : service.startingAt;
          return (
            <div key={id} className={`paint85-price-option ${id === primary ? "is-primary" : ""}`}>
              <div>
                <span>{service.name}</span>
                <p>{service.bestFor}</p>
                <ul className="paint86-price-includes">
                  {service.includes.slice(0, 3).map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <strong>{usd(price)}</strong>
            </div>
          );
        })}
      </div>

      <div className="paint85-pricing-action">
        <a href={quoteHref} className="paint85-btn paint85-btn-primary">{quoteLabel} <span>↗</span></a>
        <Link href="/our-services" className="paint85-text-link">See all services</Link>
      </div>
    </div>
  );
}
