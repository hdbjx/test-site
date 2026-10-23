"use client";

import { useVehicle } from "@/components/vehicle/VehicleContext";

export function PersonalizedHeroTitle() {
  const { vehicle, hydrated } = useVehicle();
  const model = vehicle?.model?.trim() ?? "";
  const category = vehicle?.vehicle;
  const categoryWord = category === "smallTruck" || category === "largeTruck"
    ? "TRUCK"
    : category === "smallSUV" || category === "largeSUV"
      ? "SUV"
      : category === "minivan"
        ? "VAN"
        : "CAR";
  const canUseModel = hydrated && model && model.length <= 8 && !/[\/]/.test(model);
  const personalized = canUseModel ? `YOUR ${model.toUpperCase()}.` : hydrated && vehicle ? `YOUR ${categoryWord}.` : "YOUR CAR.";
  return (
    <h1 id="v29-hero-title" className="v29-hero-title v43-hero-title" data-v29-hero-type>
      <span>{personalized}</span>
      <span>BACK TO ITS BEST.</span>
    </h1>
  );
}
