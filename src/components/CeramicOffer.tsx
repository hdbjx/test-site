"use client";

import { useEffect } from "react";
import { PAINT_PRICING } from "@/data/paint";
import { vehicles } from "@/data/services";
import { usd } from "@/lib/format";
import { siteVehicleLabel, useVehicle } from "@/components/vehicle/VehicleContext";
import { useJourney } from "@/components/journey/JourneyContext";

export function CeramicOffer() {
  const { vehicle, openPicker } = useVehicle();
  const { setServiceIntent } = useJourney();
  const price = vehicle ? PAINT_PRICING[vehicle.vehicle].ceramic2yr : 895;
  const size = vehicle ? vehicles.find((item) => item.id === vehicle.vehicle)?.label : null;

  useEffect(() => {
    setServiceIntent("ceramic2yr");
  }, [setServiceIntent]);

  return (
    <div className="cer68-offer">
      <div>
        <span>{vehicle ? "YOUR CERAMIC PRICE" : "2-YEAR CERAMIC FROM"}</span>
        <strong>{usd(price)}</strong>
      </div>
      {vehicle ? (
        <button type="button" onClick={openPicker} className="cer68-vehicle-button">
          <b>{siteVehicleLabel(vehicle)}</b>
          <small>{size} · Change vehicle</small>
        </button>
      ) : (
        <button type="button" onClick={openPicker} className="cer68-vehicle-button">
          <b>ADD YOUR VEHICLE</b>
          <small>See your exact price</small>
        </button>
      )}
      <a href="#coating-quote" className="cer68-offer-cta">GET MY COATING PLAN ↗</a>
    </div>
  );
}
