"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { vehicleLabel, vehicles, type VehicleId } from "@/data/services";
import { siteVehicleLabel, useVehicle } from "./VehicleContext";
import { supabaseConfigured } from "@/lib/supabase/config";
import { supabaseBrowser } from "@/lib/supabase/browser";

const VehicleSearch = dynamic(() => import("./VehicleSearch").then((mod) => mod.VehicleSearch), { ssr: false });

const PROMPT_ON = ["/", "/our-services", "/ceramic", "/paint-correction", "/detailplus", "/mobile-car-detailing"];

export function VehicleGlobalUI() {
  const pathname = usePathname();
  const { vehicle, hydrated, remembered, pickerOpen, promptDismissed, selectVehicle, closePicker, dismissPrompt, setRemembered } = useVehicle();
  const [rememberChoice, setRememberChoice] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
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
    const searchInput = panel?.querySelector<HTMLInputElement>(".veh-search input");
    const closeButton = panel?.querySelector<HTMLButtonElement>(".veh-modal-close");
    let focusTimer: number | undefined;
    if (window.matchMedia("(pointer: fine)").matches) {
      if (onboarding) focusTimer = window.setTimeout(() => searchInput?.focus(), 2300);
      else searchInput?.focus();
    } else closeButton?.focus({ preventScroll: true });
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
      if (focusTimer) window.clearTimeout(focusTimer);
      if (opener?.isConnected) window.requestAnimationFrame(() => opener.focus());
    };
  }, [visible, onboarding, pickerOpen, closePicker, dismissPrompt]);

  useEffect(() => {
    if (!onboarding || !supabaseConfigured) {
      setSignedIn(supabaseConfigured ? null : false);
      return;
    }
    let cancelled = false;
    void supabaseBrowser().auth.getUser().then((result: { data: { user: unknown | null } }) => {
      if (!cancelled) setSignedIn(!!result.data.user);
    }).catch(() => {
      if (!cancelled) setSignedIn(false);
    });
    return () => { cancelled = true; };
  }, [onboarding]);

  if (!visible) return null;

  return (
    <div className="veh-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target !== event.currentTarget) return; pickerOpen ? closePicker() : dismissPrompt(); }}>
      <section ref={panelRef} className={`veh-modal veh-modal-clean ${onboarding ? "is-welcome" : "is-change"}`} data-header-tone="ink" role="dialog" aria-modal="true" aria-labelledby="veh-modal-title">
        <button className="veh-modal-close" type="button" onClick={pickerOpen ? closePicker : dismissPrompt} aria-label="Close vehicle picker">×</button>
        {onboarding ? (
          <>
            <div className="veh-welcome-intro">
              <h2 id="veh-modal-title"><span>Welcome in.</span><span>We’re glad you’re here.</span></h2>
            </div>
            <div className="veh-welcome-question">
              <p className="veh-modal-kicker">START WITH YOUR CAR</p>
              <h3>What do you drive?</h3>
              <p className="veh-modal-copy">We’ll match the pricing to your exact vehicle.</p>
            </div>
          </>
        ) : (
          <>
            <p className="veh-modal-kicker">YOUR VEHICLE</p>
            <h2 id="veh-modal-title">Change vehicle.</h2>
          </>
        )}

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
          <span><b>Keep this car for next time</b></span>
        </label>

        {onboarding && (
          <div className="veh-account-entry" aria-label="Account options">
            {signedIn ? (
              <Link href="/account" className="veh-account-link veh-account-primary">Open my account</Link>
            ) : (
              <>
                <span>Already know us?</span>
                <Link href="/account/sign-in?next=/" className="veh-account-link">Sign in</Link>
                <i aria-hidden="true" />
                <Link href="/account/sign-in?mode=signup&next=/" className="veh-account-link">Create account</Link>
              </>
            )}
          </div>
        )}

        {!vehicle && <button type="button" className="veh-skip" onClick={dismissPrompt}>Just browsing for now</button>}
      </section>
    </div>
  );
}
