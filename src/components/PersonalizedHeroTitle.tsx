"use client";

import type { CSSProperties } from "react";
import { useVehicle } from "@/components/vehicle/VehicleContext";

const motionFor = (index: number, line: number) => ({
  "--hero-word-delay": `${70 + index * 52 + line * 74}ms`,
  "--hero-word-x": `${[-18, 10, -7, 14, -11, 6][(index + line * 2) % 6]}px`,
  "--hero-word-y": `${[74, 58, 82, 64, 70, 54][(index + line) % 6]}px`,
  "--hero-word-rot": `${[-4, 2.5, -1.5, 3.5, -2.5, 1.25][(index + line * 3) % 6]}deg`,
} as CSSProperties);

function AnimatedLine({ text, line }: { text: string; line: number }) {
  return (
    <span>
      {text.split(" ").map((word, index) => (
        <i key={`${line}-${index}`} className="v90-hero-word" style={motionFor(index, line)}>
          {word}
        </i>
      ))}
    </span>
  );
}

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
    <h1 id="v29-hero-title" className="v29-hero-title v43-hero-title v90-hero-build" data-v29-hero-type>
      <AnimatedLine text={personalized} line={0} />
      <AnimatedLine text="BACK TO ITS BEST." line={1} />
    </h1>
  );
}
