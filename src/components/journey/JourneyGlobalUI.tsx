"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { catalogPrice, catalogService } from "@/data/serviceCatalog";
import { isServiceId, vehicleLabel } from "@/data/services";
import { usd } from "@/lib/format";
import { siteVehicleLabel, useVehicle } from "@/components/vehicle/VehicleContext";
import { useJourney } from "./JourneyContext";

const TZ = "America/New_York";
const dayKey = (d: Date) => {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(d);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
};
const addDays = (key: string, days: number) => {
  const d = new Date(`${key}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};
const openingLabel = (iso: string) => new Intl.DateTimeFormat("en-US", {
  timeZone: TZ, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
}).format(new Date(iso));

export function JourneyGlobalUI() {
  const pathname = usePathname();
  const { vehicle, openPicker } = useVehicle();
  const {
    serviceIntent, location, nextOpening, selectedSlot, bookingResumeHref,
    drawerOpen, hydrated, setNextOpening, setSelectedSlot, closeDrawer, clearJourney,
  } = useJourney();
  const [loadingOpening, setLoadingOpening] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const service = serviceIntent ? catalogService(serviceIntent) : null;
  const price = serviceIntent && vehicle ? catalogPrice(serviceIntent, vehicle.vehicle) : null;
  const funnel = pathname === "/book" || pathname === "/get-a-quote";

  const primaryHref = useMemo(() => {
    if (!serviceIntent) return "/our-services";
    if (isServiceId(serviceIntent)) {
      const q = new URLSearchParams({ service: serviceIntent, from: "context" });
      return `/book?${q.toString()}`;
    }
    if (serviceIntent === "detailplus") return "/detailplus#club-builder";
    if (serviceIntent === "ceramic2yr") return "/ceramic#coating-quote";
    return "/paint-correction#paint-quote";
  }, [serviceIntent, vehicle]);

  const selectedSlotIsCurrent = useMemo(() => {
    return !!(selectedSlot && serviceIntent && vehicle && isServiceId(serviceIntent));
  }, [selectedSlot, serviceIntent, vehicle]);

  // Availability is fetched only when the customer opens their summary.
  useEffect(() => {
    if (!drawerOpen || !vehicle || !serviceIntent || selectedSlotIsCurrent) return;
    if (!(isServiceId(serviceIntent) || serviceIntent === "detailplus")) {
      setNextOpening(null);
      return;
    }
    let cancelled = false;
    const from = dayKey(new Date());
    const to = addDays(from, 14);
    const url = serviceIntent === "detailplus"
      ? `/api/availability?preset=detailplus&from=${from}&to=${to}`
      : `/api/availability?vehicle=${vehicle.vehicle}&service=${serviceIntent}&from=${from}&to=${to}`;
    setLoadingOpening(true);
    fetch(url)
      .then(async (response) => {
        const json = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error("availability");
        return Array.isArray(json.slots) ? json.slots : [];
      })
      .then((slots: unknown[]) => {
        if (cancelled) return;
        const first = slots.find((value): value is string => typeof value === "string" && Number.isFinite(Date.parse(value)));
        setNextOpening(first ?? null);
      })
      .catch(() => !cancelled && setNextOpening(null))
      .finally(() => !cancelled && setLoadingOpening(false));
    return () => { cancelled = true; };
  }, [drawerOpen, vehicle, serviceIntent, selectedSlotIsCurrent, setNextOpening]);

  useEffect(() => {
    if (!drawerOpen) return;
    const prior = document.body.style.overflow;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    const panel = drawerRef.current;
    panel?.querySelector<HTMLElement>("button,a")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
      if (event.key === "Tab" && panel) {
        const items = panel.querySelectorAll<HTMLElement>("button,a");
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prior;
      document.removeEventListener("keydown", onKey);
      if (opener?.isConnected) window.requestAnimationFrame(() => opener.focus());
    };
  }, [drawerOpen, closeDrawer]);

  if (!hydrated || funnel || !drawerOpen) return null;

  return (
    <div className="journey-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDrawer(); }}>
      <aside ref={drawerRef} className="journey-drawer journey-drawer-clean" data-header-tone="ink" role="dialog" aria-modal="true" aria-label="Your detail">
        <div className="journey-drawer-head">
          <div><span>YOUR DETAIL</span><h2>{service?.name ?? "Your car."}</h2></div>
          <button type="button" onClick={closeDrawer} aria-label="Close">×</button>
        </div>

        <section className="journey-block">
          <span>VEHICLE</span>
          {vehicle ? <><strong>{siteVehicleLabel(vehicle)}</strong><small>{vehicleLabel(vehicle.vehicle)}</small><button type="button" onClick={() => { closeDrawer(); openPicker(); }}>Change</button></> : <button type="button" onClick={() => { closeDrawer(); openPicker(); }}>Add vehicle</button>}
        </section>

        <section className="journey-block">
          <span>SERVICE</span>
          {service ? <><strong>{service.name}</strong>{price != null && <small>{usd(price)}</small>}<Link href="/our-services#all-services" onClick={closeDrawer}>Change</Link></> : <Link href="/our-services" onClick={closeDrawer}>Choose a service</Link>}
        </section>

        {location?.city && (
          <section className="journey-block">
            <span>LOCATION</span>
            <strong>{location.city}{location.state ? `, ${location.state}` : ""}</strong>
            {location.zip ? <small>{location.zip}</small> : null}
          </section>
        )}

        {(vehicle && serviceIntent) && (
          <section className="journey-block">
            <span>{selectedSlotIsCurrent ? "APPOINTMENT" : "NEXT OPENING"}</span>
            {selectedSlotIsCurrent && selectedSlot ? <strong>{openingLabel(selectedSlot)}</strong> : loadingOpening ? <strong>Checking…</strong> : nextOpening ? <><strong>{openingLabel(nextOpening)}</strong>{isServiceId(serviceIntent) && <Link href={primaryHref} onClick={() => { setSelectedSlot(nextOpening); closeDrawer(); }}>Choose this time</Link>}</> : isServiceId(serviceIntent) || serviceIntent === "detailplus" ? <><strong>No opening in the next 14 days.</strong><Link href={primaryHref} onClick={closeDrawer}>View full calendar</Link></> : <strong>Assessment first</strong>}
          </section>
        )}

        {bookingResumeHref && (
          <section className="journey-resume">
            <span>BOOKING</span>
            <strong>Booking in progress</strong>
            <Link href={bookingResumeHref} onClick={closeDrawer}>Continue booking</Link>
          </section>
        )}

        <Link className="journey-primary" href={primaryHref} onClick={closeDrawer}>{serviceIntent ? "CONTINUE" : "VIEW SERVICES"} ↗</Link>
        {(serviceIntent || location) && <button type="button" className="journey-clear" onClick={() => { clearJourney(); closeDrawer(); }}>Clear choices</button>}
      </aside>
    </div>
  );
}
