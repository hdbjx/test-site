"use client";

import { useJourney } from "@/components/journey/JourneyContext";
import { NextOpeningNote } from "@/components/journey/NextOpeningNote";
import { useVehicle } from "@/components/vehicle/VehicleContext";
import { isServiceId } from "@/data/services";

/** Next opening for the service the visitor is already looking at, inside the shared CTA band. */
export function CtaNextOpening({ location }: { location: string }) {
  const { vehicle } = useVehicle();
  const { serviceIntent } = useJourney();
  if (!vehicle || !isServiceId(serviceIntent)) return null;
  return (
    <div style={{ marginTop: "1.1rem" }}>
      <NextOpeningNote service={serviceIntent} vehicle={vehicle.vehicle} location={location} />
    </div>
  );
}
