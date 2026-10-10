"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { type AddonId, type PaintUpgradeId } from "@/data/quoteExtras";
import { services, vehicles, type ServiceId, type VehicleId } from "@/data/services";
import { AddressFields } from "@/components/forms/AddressFields";
import { LeadSourceField } from "@/components/forms/LeadSourceField";
import { track } from "@/lib/analytics";

const TZ = "America/New_York";
const dayKey = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year:"numeric", month:"2-digit", day:"2-digit" }).format(d);
const fmtDay = (d: Date) => new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday:"short", month:"short", day:"numeric" }).format(d);
const fmtTime = (d: Date) => new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour:"numeric", minute:"2-digit" }).format(d);

export function QuoteBookingContinuation({
  vehicle, service, addons, paint, name, phone, email, timing, sessionId, bookingHref,
}: {
  vehicle: VehicleId;
  service: ServiceId;
  addons: AddonId[];
  paint: PaintUpgradeId[];
  name: string;
  phone: string;
  email: string;
  timing: string;
  sessionId: string | null;
  bookingHref: string;
}) {
  const [slots, setSlots] = useState<Date[] | null>(null);
  const [slotsError, setSlotsError] = useState(false);
  const [selected, setSelected] = useState<Date | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booked, setBooked] = useState<{start:string; price:number} | null>(null);
  const availabilityRef = useRef<HTMLElement>(null);
  const finishRef = useRef<HTMLFormElement>(null);

  async function behavior(stage: string, extra: Record<string, unknown> = {}) {
    if (!sessionId) return;
    await fetch("/api/quote-session", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({sessionId,stage,...extra}) }).catch(() => null);
  }

  useEffect(() => {
    const now = new Date();
    const to = new Date(Date.now() + 31 * 86400000);
    const items = JSON.stringify([{ vehicle, service }]);
    fetch(`/api/availability?items=${encodeURIComponent(items)}&from=${dayKey(now)}&to=${dayKey(to)}`)
      .then(r => r.json().then(j => ({ok:r.ok,j})))
      .then(({ok,j}) => {
        if (!ok) throw new Error();
        setSlots((Array.isArray(j.slots) ? j.slots : []).map((s:string) => new Date(s)).filter((d:Date) => Number.isFinite(d.getTime())));
        void behavior("availability_viewed", { desiredTiming: timing });
      })
      .catch(() => setSlotsError(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicle, service]);

  const suggested = useMemo(() => {
    const all = [...(slots ?? [])].sort((a, b) => a.getTime() - b.getTime());
    if (!all.length) return [] as Array<{ slot: Date; label: string }>;

    const weekday = (d: Date) => new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short" }).format(d);
    const hour = (d: Date) => Number(new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "2-digit", hour12: false }).format(d));
    const chosen: Array<{ slot: Date; label: string }> = [];
    const usedTimes = new Set<number>();
    const usedDays = new Set<string>();

    const add = (slot: Date | undefined, label: string) => {
      if (!slot || usedTimes.has(slot.getTime())) return false;
      chosen.push({ slot, label });
      usedTimes.add(slot.getTime());
      usedDays.add(dayKey(slot));
      return true;
    };

    // 1. The literal earliest opening.
    add(all[0], "Next available");

    // 2. A genuinely different morning choice, preferably on another date.
    const morningDifferentDay = all.find(d => hour(d) < 12 && !usedDays.has(dayKey(d)));
    const morningAnyDay = all.find(d => hour(d) < 12 && !usedTimes.has(d.getTime()));
    add(morningDifferentDay ?? morningAnyDay, "Morning option");

    // 3. A weekend choice, again preferring a different date.
    const weekendDifferentDay = all.find(d => ["Sat", "Sun"].includes(weekday(d)) && !usedDays.has(dayKey(d)));
    const weekendAnyDay = all.find(d => ["Sat", "Sun"].includes(weekday(d)) && !usedTimes.has(d.getTime()));
    add(weekendDifferentDay ?? weekendAnyDay, "Weekend option");

    // If one category is unavailable, fill the row with the next distinct-day opening first.
    for (const slot of all) {
      if (chosen.length >= 3) break;
      if (!usedTimes.has(slot.getTime()) && !usedDays.has(dayKey(slot))) add(slot, "Another opening");
    }
    for (const slot of all) {
      if (chosen.length >= 3) break;
      if (!usedTimes.has(slot.getTime())) add(slot, "Another opening");
    }

    return chosen;
  }, [slots]);

  useEffect(() => {
    if (!slots?.length) return;
    const timer = window.setTimeout(() => availabilityRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    return () => window.clearTimeout(timer);
  }, [slots]);

  useEffect(() => {
    if (!selected) return;
    const timer = window.setTimeout(() => finishRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 90);
    return () => window.clearTimeout(timer);
  }, [selected]);



  async function book(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    const fd = new FormData(e.currentTarget);
    const get = (k:string) => String(fd.get(k) ?? "").trim();
    const address = get("address");
    const leadSource = get("leadSource");
    if (!address) { setError("Add the service address to finish booking."); return; }
    if (!leadSource) { setError("Tell us how you heard about Every Detail."); return; }
    setSending(true); setError(null);
    void behavior("booking_started", { selectedSlot:selected.toISOString() });
    const res = await fetch("/api/book", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({
      vehicles:[{vehicle,service,vehicleId:null,addons,paint}], start:selected.toISOString(), name, phone:phone.replace(/\D/g,""), email, address,
      notes:get("service_notes"), leadSource, leadSourceDetail:get("leadSourceDetail"),
    })}).catch(() => null);
    const json = res ? await res.json().catch(() => ({})) : {};
    setSending(false);
    if (res?.ok && json.ok && json.jobId) {
      setBooked({start:json.start, price:Number(json.price)});
      void behavior("booking_completed", { selectedSlot:selected.toISOString() });
      track("booking_submit", { source:"quote_inline", service, vehicle });
      return;
    }
    if (json.code === "slot_taken") { setSelected(null); setSlots(s => (s ?? []).filter(x => x.getTime() !== selected.getTime())); }
    setError(json.error ?? "We couldn't finish the booking. Try another time or continue to the full booking page.");
  }

  if (booked) {
    const d = new Date(booked.start);
    return <section className="quote-inline-booking quote-inline-booked" role="status"><p className="eyebrow">You're booked</p><h3>{fmtDay(d)} at {fmtTime(d)}</h3><p>{vehicles.find(v=>v.id===vehicle)?.label} · {services[service].name} · ${booked.price}</p><p>A confirmation is on its way to {email}.</p></section>;
  }

  return <section ref={availabilityRef} className="quote-inline-booking scroll-mt-28">
    <div className="quote-inline-head"><div><p className="eyebrow">Live availability</p><h3>{timing === "exploring" ? "Want to see when we could do it?" : `Let's get it on the calendar, ${name.split(/\s+/)[0]}.`}</h3><p>These are real openings for your {services[service].name.toLowerCase()}.</p></div><span>{vehicles.find(v=>v.id===vehicle)?.label}</span></div>

    {slots === null && !slotsError && <p className="quote-inline-loading">Checking the schedule…</p>}
    {slotsError && <p className="quote-rec-error">We couldn't load openings right now. You can still use the full booking calendar.</p>}
    {!selected && suggested.length > 0 && <div className="quote-inline-slots" role="radiogroup" aria-label="Suggested appointments">{suggested.map(({slot,label}) => <button key={slot.toISOString()} type="button" className="quote-inline-slot" onClick={() => { setSelected(slot); setError(null); void behavior("slot_selected", {selectedSlot:slot.toISOString()}); }}><small className="quote-inline-slot-label">{label}</small><span>{fmtDay(slot)}</span><strong>{fmtTime(slot)}</strong><small>Choose</small></button>)}</div>}

    {!selected && <div className="quote-inline-more"><Link href={`${bookingHref}${bookingHref.includes("?") ? "&" : "?"}focus=time`}>See the full calendar →</Link></div>}

    {selected && <form ref={finishRef} className="quote-inline-finish scroll-mt-28" onSubmit={book}>
      <div className="quote-inline-selected"><span>Your time</span><strong>{fmtDay(selected)} at {fmtTime(selected)}</strong><button type="button" onClick={() => { setSelected(null); window.setTimeout(() => availabilityRef.current?.scrollIntoView({behavior:"smooth",block:"start"}), 60); }}>Change</button></div>
      <div><p className="field-label">Where are we coming?</p><p className="quote-inline-help">You already gave us your name, phone, email, vehicle and service. We only need the service address.</p><AddressFields /></div>
      <div className="quote-inline-source"><LeadSourceField /></div>
      {error && <p className="quote-rec-error" role="alert">{error}</p>}
      <button type="submit" className="btn btn-primary quote-inline-confirm" disabled={sending}>{sending ? "Booking…" : `Confirm ${fmtDay(selected)} at ${fmtTime(selected)} ↗`}</button>
      <p className="quote-rec-privacy">No payment is required to reserve the appointment.</p>
    </form>}
  </section>;
}
