"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { vehicleLabel, vehicles, type VehicleId } from "@/data/services";
import { siteVehicleLabel, useVehicle } from "./VehicleContext";

const VehicleSearch = dynamic(() => import("./VehicleSearch").then((mod) => mod.VehicleSearch), { ssr: false });

const PROMPT_ON = ["/", "/our-services", "/ceramic", "/paint-correction", "/detailplus", "/mobile-car-detailing"];

export function VehicleGlobalUI() {
  const pathname = usePathname();
  const { vehicle, hydrated, remembered, pickerOpen, promptDismissed, selectVehicle, closePicker, dismissPrompt, setRemembered } = useVehicle();
  const [rememberChoice, setRememberChoice] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const eligible = PROMPT_ON.some((path) => pathname === path || (path !== "/" && pathname.startsWith(path + "/")));
  const onboarding = hydrated && eligible && !vehicle && !promptDismissed && !pickerOpen;
  const visible = onboarding || pickerOpen;

  useEffect(() => {
    if (!visible) return;
    const prior = document.body.style.overflow;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>("button,input,select")?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (pickerOpen) closePicker();
        else dismissPrompt();
      }
      if (event.key === "Tab" && panel) {
        const items = panel.querySelectorAll<HTMLElement>("button,input,select");
        const first = items[0], last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = prior;
      document.removeEventListener("keydown", key);
      if (opener?.isConnected) window.requestAnimationFrame(() => opener.focus());
    };
  }, [visible, pickerOpen, closePicker, dismissPrompt]);

  if (!visible) return null;

  return (
    <div className="veh-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target !== event.currentTarget) return; pickerOpen ? closePicker() : dismissPrompt(); }}>
      <section ref={panelRef} className="veh-modal veh-modal-clean" role="dialog" aria-modal="true" aria-labelledby="veh-modal-title">
        <button className="veh-modal-close" type="button" onClick={pickerOpen ? closePicker : dismissPrompt} aria-label="Close vehicle picker">×</button>
        <p className="veh-modal-kicker">YOUR VEHICLE</p>
        <h2 id="veh-modal-title">{vehicle ? "Change vehicle." : "What do you drive?"}</h2>
        {!vehicle && <p className="veh-modal-copy">Choose your car for exact pricing.</p>}

        {vehicle && (
          <div className="veh-current-card">
            <strong>{siteVehicleLabel(vehicle)}</strong>
            <small>{vehicleLabel(vehicle.vehicle)}</small>
            <label className="veh-size-override">
              <span>Pricing class</span>
              <select value={vehicle.vehicle} onChange={(event) => selectVehicle({ ...vehicle, vehicle: event.target.value as VehicleId }, remembered)}>
                {vehicles.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}
              </select>
            </label>
          </div>
        )}

        <VehicleSearch onSelect={(next) => selectVehicle(next, vehicle ? remembered : rememberChoice)} />

        <label className="veh-remember">
          <input type="checkbox" checked={vehicle ? remembered : rememberChoice} onChange={(event) => vehicle ? setRemembered(event.target.checked) : setRememberChoice(event.target.checked)} />
          <span><b>Remember on this device</b></span>
        </label>

        {!vehicle && <button type="button" className="veh-skip" onClick={dismissPrompt}>Skip for now</button>}
      </section>
    </div>
  );
}
