"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { vehicleLabel, vehicles, type VehicleId } from "@/data/services";
import { siteVehicleLabel, useVehicle } from "./VehicleContext";

const VehicleSearch = dynamic(() => import("./VehicleSearch").then((mod) => mod.VehicleSearch), { ssr: false });

function WelcomeRibbon({ placement }: { placement: "top" | "bottom" }) {
  const rawId = useId();
  const pathId = `veh-welcome-ribbon-${placement}-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const curve = placement === "top"
    ? "M -180 102 C 210 34, 520 132, 860 78 S 1370 38, 1620 96"
    : "M -180 60 C 240 140, 610 18, 980 80 S 1380 136, 1620 66";
  const copy = "MOBILE DETAILING • DECATUR / ATLANTA • REAL CREW • EVERY DETAIL • ";

  return (
    <div className={`veh-welcome-ribbon veh-welcome-ribbon-${placement}`} aria-hidden="true">
      <svg viewBox="0 0 1440 160" preserveAspectRatio="xMidYMid meet" focusable="false">
        <path id={pathId} className="veh-welcome-ribbon-line" d={curve} />
        <text className="veh-welcome-ribbon-text" dy="0.34em">
          <textPath href={`#${pathId}`} startOffset={placement === "top" ? "-7%" : "-3%"}>
            {copy.repeat(4)}
          </textPath>
        </text>
      </svg>
    </div>
  );
}

export function VehicleGlobalUI() {
  const pathname = usePathname();
  const {
    vehicle,
    hydrated,
    remembered,
    pickerOpen,
    promptDismissed,
    authState,
    selectVehicle,
    closePicker,
    dismissPrompt,
    setRemembered,
  } = useVehicle();
  const [rememberChoice, setRememberChoice] = useState(false);
  const [finePointer, setFinePointer] = useState(false);
  const panelRef = useRef<HTMLElement>(null);

  // The automatic first-visit prompt is a homepage experience. SEO/service
  // landing pages keep the vehicle pill but never get a forced interstitial.
  const eligible = pathname === "/";
  const onboarding = hydrated && eligible && !vehicle && !promptDismissed && !pickerOpen;
  const visible = onboarding || pickerOpen;

  useEffect(() => {
    if (!onboarding) return;
    setRememberChoice(authState === "signed-in");
  }, [onboarding, authState]);

  useEffect(() => {
    if (!visible) return;

    const root = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const media = window.matchMedia("(pointer: fine)");
    setFinePointer(media.matches);

    const previous = {
      htmlOverflow: root.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
    };

    root.classList.add("ed-vehicle-modal-open");
    if (onboarding) root.classList.add("ed-vehicle-welcome-open");
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    const panel = panelRef.current;
    if (!media.matches) window.requestAnimationFrame(() => panel?.focus({ preventScroll: true }));

    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (pickerOpen) closePicker();
        else dismissPrompt();
        return;
      }

      if (event.key === "Tab" && panel) {
        const items = Array.from(panel.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
        )).filter((item) => item.offsetParent !== null);
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      root.classList.remove("ed-vehicle-modal-open", "ed-vehicle-welcome-open");
      root.style.overflow = previous.htmlOverflow;
      body.style.overflow = previous.bodyOverflow;
      body.style.position = previous.bodyPosition;
      body.style.top = previous.bodyTop;
      body.style.left = previous.bodyLeft;
      body.style.right = previous.bodyRight;
      body.style.width = previous.bodyWidth;
      window.scrollTo(0, scrollY);
      if (opener?.isConnected) window.requestAnimationFrame(() => opener.focus({ preventScroll: true }));
    };
  }, [visible, onboarding, pickerOpen, closePicker, dismissPrompt]);

  if (!visible) return null;

  const nextPath = encodeURIComponent(pathname || "/");
  const close = pickerOpen ? closePicker : dismissPrompt;

  const modal = (
    <section
      ref={panelRef}
      className={`veh-modal veh-modal-clean ${onboarding ? "is-welcome" : "is-change"}`}
      data-header-tone="ink"
      role="dialog"
      aria-modal="true"
      aria-labelledby="veh-modal-title"
      aria-describedby={onboarding ? "veh-welcome-description" : undefined}
      tabIndex={-1}
    >
      <button className="veh-modal-close" type="button" onClick={close} aria-label="Close vehicle picker">×</button>

      {onboarding ? (
        <div className="veh-welcome-shell">
          <div className="veh-welcome-brandrow" aria-hidden="true">
            <img src="/brand/every-detail-logo.png" alt="" />
            <span>Mobile detailing · Decatur / Atlanta</span>
          </div>

          <div className="veh-welcome-layout">
            <div className="veh-welcome-intro">
              <h2 id="veh-modal-title"><span>Your car</span><span>makes this site</span><em>yours.</em></h2>
              <p id="veh-welcome-description" className="veh-welcome-lede">Tell us what you drive and we’ll tailor pricing, recommendations, and booking around your vehicle.</p>
            </div>

            <div className="veh-welcome-utility">
              <div className="veh-welcome-question">
                <p className="veh-modal-kicker">YOUR CAR</p>
                <h3>What do you drive?</h3>
              </div>

              <VehicleSearch autoFocus={finePointer} onSelect={(next) => { void selectVehicle(next, rememberChoice); }} />

              <label className="veh-remember">
                <input type="checkbox" checked={rememberChoice} onChange={(event) => setRememberChoice(event.target.checked)} />
                <span>
                  <b>{authState === "signed-in" ? "Save this car to my account" : "Remember this car"}</b>
                  <small>{authState === "signed-in" ? "Adds it to your garage for faster future bookings." : "Keep it on this browser for next time."}</small>
                </span>
              </label>

              <div className="veh-account-entry" aria-label="Account options">
                {authState === "signed-in" ? (
                  <Link href="/account" className="veh-account-link veh-account-primary">Open my account</Link>
                ) : (
                  <>
                    <span>Have an account?</span>
                    <Link href={`/account/sign-in?next=${nextPath}`} className="veh-account-link">Sign in</Link>
                    <Link href={`/account/sign-in?mode=signup&next=${nextPath}`} className="veh-account-link">Create one</Link>
                  </>
                )}
              </div>

              <button type="button" className="veh-skip" onClick={dismissPrompt}>I’m just looking around</button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <p className="veh-modal-kicker">YOUR VEHICLE</p>
          <h2 id="veh-modal-title">Change vehicle.</h2>

          {vehicle && (
            <div className="veh-current-card">
              <strong>{siteVehicleLabel(vehicle)}</strong>
              <small>{vehicleLabel(vehicle.vehicle)}</small>
              <label className="veh-size-override">
                <span>Pricing class</span>
                <select value={vehicle.vehicle} onChange={(event) => { void selectVehicle({ ...vehicle, vehicle: event.target.value as VehicleId }, remembered); }}>
                  {vehicles.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}
                </select>
              </label>
            </div>
          )}

          <VehicleSearch autoFocus={finePointer} onSelect={(next) => { void selectVehicle(next, vehicle ? remembered : rememberChoice); }} />

          <label className="veh-remember">
            <input type="checkbox" checked={vehicle ? remembered : rememberChoice} onChange={(event) => vehicle ? setRemembered(event.target.checked) : setRememberChoice(event.target.checked)} />
            <span><b>Keep this car for next time</b></span>
          </label>

          {!vehicle && <button type="button" className="veh-skip" onClick={dismissPrompt}>Just browsing for now</button>}
        </>
      )}
    </section>
  );

  return (
    <div className={`veh-modal-backdrop ${onboarding ? "is-welcome-backdrop" : ""}`} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      {onboarding ? (
        <div className="veh-welcome-stage">
          <WelcomeRibbon placement="top" />
          {modal}
          <WelcomeRibbon placement="bottom" />
        </div>
      ) : modal}
    </div>
  );
}
