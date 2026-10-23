"use client";

import { useVehicle } from "@/components/vehicle/VehicleContext";

export function PersonalizedHeroTitle() {
  const { vehicle, hydrated } = useVehicle();
  const model = vehicle?.model?.trim() ?? "";
  const personalized = hydrated && model && model.length <= 16 && !/[\/]/.test(model) ? `YOUR ${model.toUpperCase()}.` : "YOUR CAR.";
  return (
    <h1 id="v29-hero-title" className="v29-hero-title v43-hero-title" data-v29-hero-type>
      <span>{personalized}</span>
      <span>BACK TO ITS BEST.</span>
    </h1>
  );
}
