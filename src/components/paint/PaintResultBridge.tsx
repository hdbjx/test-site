"use client";

import { Photo } from "@/components/Photo";
import { TrackedLink } from "@/components/TrackedLink";
import { siteVehicleLabel, useVehicle } from "@/components/vehicle/VehicleContext";
import { PAINT_PRICING, paintServices } from "@/data/paint";
import { usd } from "@/lib/format";

const ceramic = paintServices.find((service) => service.id === "ceramic2yr")!;

export function PaintResultBridge() {
  const { vehicle } = useVehicle();
  const price = vehicle ? PAINT_PRICING[vehicle.vehicle].ceramic2yr : ceramic.startingAt;

  return (
    <>
      <section className="pc90-result" data-header-tone="ink" aria-labelledby="pc90-result-title">
        <div className="pc90-result-photo ed90-photo-grade">
          <Photo id="hq-black-suv-finished" sizes="(max-width: 899px) 100vw, 50vw" fill />
        </div>
        <div className="pc90-result-copy">
          <h2 id="pc90-result-title" className="ed90-heading">CLARITY YOU CAN<br /><span>SEE IN REAL LIGHT.</span></h2>
          <p>Wax makes paint look wet for a few weeks. Correction fixes the surface underneath, so it still looks right after the shine product is gone.</p>
        </div>
      </section>

      <section className="pc90-ceramic-bridge ed90-halftone" data-header-tone="light" aria-labelledby="pc90-ceramic-title">
        <div className="pc90-shell pc90-ceramic-grid">
          <h2 id="pc90-ceramic-title" className="ed90-heading">CORRECT IT ONCE.<br /><span>THEN PROTECT IT.</span></h2>
          <div className="pc90-ceramic-price">
            <span>{vehicle ? `FOR ${siteVehicleLabel(vehicle).toUpperCase()}` : "FROM"}</span>
            <strong>{usd(price)}</strong>
            <TrackedLink
              href="/ceramic"
              event="paint_inquiry"
              params={{ location: "paint_ceramic_bridge", service: "ceramic2yr" }}
              className="ed90-button ed90-button-ink"
            >
              EXPLORE CERAMIC <span>↗</span>
            </TrackedLink>
          </div>
        </div>
      </section>
    </>
  );
}
