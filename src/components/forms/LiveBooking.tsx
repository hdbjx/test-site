"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { PRICING, serviceList, services, vehicleIdFromSize, vehicles, type ServiceId, type VehicleId } from "@/data/services";
import { ADDON_LABELS, ADDON_PRICES, PAINT_UPGRADES, isAddonIncludedInService, purchasableAddonIds, type AddonId, type PaintUpgradeId } from "@/data/quoteExtras";
import { site } from "@/data/site";
import { track } from "@/lib/analytics";
import { duration, usd } from "@/lib/format";
import type { AccountInfo, GarageVehicle } from "@/lib/supabase/account";
import { FormError, Success, TextArea, TextField } from "./parts";
import { AddressFields } from "./AddressFields";

const TZ = "America/New_York";
const isValidDate = (d: Date) => Number.isFinite(d.getTime());
const dayKey = (d: Date) => {
  if (!isValidDate(d)) return "";
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
};
const fmtTime = (d: Date) => isValidDate(d)
  ? new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" }).format(d)
  : "";
const fmtDay = (d: Date, opts: Intl.DateTimeFormatOptions) => isValidDate(d)
  ? new Intl.DateTimeFormat("en-US", { timeZone: TZ, ...opts }).format(d)
  : "";
const vName = (v: GarageVehicle) => [v.year, v.make, v.model].filter(Boolean).join(" ") || "Vehicle";

type Props = {
  account?: AccountInfo;
  email?: string;
  garage?: GarageVehicle[];
  initialVehicle?: VehicleId;
  initialService?: ServiceId;
  initialAddons?: AddonId[];
  initialPaint?: PaintUpgradeId[];
  fromQuote?: boolean;
};

type BookingLine = {
  key: number;
  savedId: string | "size";
  size?: VehicleId;
  service: ServiceId;
  addons: AddonId[];
  paint: PaintUpgradeId[];
};

type Booked = {
  service: string;
  vehicle: string;
  vehicles: Array<{ vehicle: string; service: string; price: number }>;
  start: string;
  price: number;
  minutes: number;
  confirmationEmailSent: boolean;
};

export function LiveBooking({ account, email, garage = [], initialVehicle, initialService, initialAddons = [], initialPaint = [], fromQuote = false }: Props) {
  const signedIn = !!account;
  const primary = garage.find((g) => g.is_primary) ?? garage[0];
  const nextKey = useRef(2);
  const initialSavedSize = primary ? vehicleIdFromSize(primary.vehicle_size) : undefined;
  const [lines, setLines] = useState<BookingLine[]>([
    {
      key: 1,
      savedId: primary ? primary.id : "size",
      size: initialVehicle ?? initialSavedSize,
      service: initialService ?? "premium",
      addons: initialAddons.filter((addon) => !isAddonIncludedInService(initialService ?? "premium", addon)),
      paint: initialPaint,
    },
  ]);
  const [slots, setSlots] = useState<Date[] | null>(null);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [start, setStart] = useState<Date | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [badField, setBadField] = useState<string | null>(null);
  const [booked, setBooked] = useState<Booked | null>(null);
  const [infoStep, setInfoStep] = useState<1 | 2 | 3>(1);
  const formRef = useRef<HTMLFormElement>(null);

  const resolved = lines.map((line) => {
    const saved = line.savedId === "size" ? undefined : garage.find((g) => g.id === line.savedId);
    const savedSize = saved ? vehicleIdFromSize(saved.vehicle_size) : undefined;
    const vehicle = saved && savedSize ? savedSize : line.size;
    return { ...line, saved, savedSize, vehicle };
  });
  const allVehiclesReady = resolved.every((line) => !!line.vehicle);
  const totalPrice = allVehiclesReady
    ? resolved.reduce((sum, line) => {
        const base = PRICING[line.vehicle!][line.service].price;
        const addons = line.addons.reduce((addonSum, id) => addonSum + (ADDON_PRICES[id] ?? 0), 0);
        const paint = line.paint.reduce((paintSum, id) => paintSum + PAINT_UPGRADES[id].prices[line.vehicle!], 0);
        return sum + base + addons + paint;
      }, 0)
    : null;
  const hasVariableAddons = resolved.some((line) => line.addons.some((id) => ADDON_PRICES[id] === null));
  const displayTotal = totalPrice;
  const appointmentMinutes = allVehiclesReady
    ? Math.max(...resolved.map((line) => PRICING[line.vehicle!][line.service].minutes))
    : null;
  const availabilityKey = resolved.map((line) => `${line.vehicle ?? "?"}:${line.service}`).join("|");

  function updateLine(key: number, patch: Partial<BookingLine>) {
    setLines((current) => current.map((line) => (line.key === key ? { ...line, ...patch } : line)));
  }

  function addVehicle() {
    if (lines.length >= 2) return;
    const used = new Set(lines.map((line) => line.savedId).filter((id) => id !== "size"));
    const nextSaved = garage.find((vehicle) => !used.has(vehicle.id));
    setLines((current) => [
      ...current,
      {
        key: nextKey.current++,
        savedId: nextSaved?.id ?? "size",
        size: nextSaved ? vehicleIdFromSize(nextSaved.vehicle_size) : undefined,
        service: "premium",
        addons: [],
        paint: [],
      },
    ]);
    track("booking_add_vehicle", { count: lines.length + 1 });
  }

  function removeVehicle(key: number) {
    setLines((current) => current.filter((line) => line.key !== key));
  }

  useEffect(() => {
    if (!allVehiclesReady) {
      setSlots(null);
      setStart(null);
      return;
    }
    let cancelled = false;
    setSlots(null);
    setSlotsError(null);
    setStart(null);
    const from = dayKey(new Date());
    const to = dayKey(new Date(Date.now() + 31 * 86_400_000));
    const items = resolved.map((line) => ({ vehicle: line.vehicle, service: line.service }));
    fetch(`/api/availability?items=${encodeURIComponent(JSON.stringify(items))}&from=${from}&to=${to}`)
      .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
      .then(({ ok, j }) => {
        if (cancelled) return;
        if (!ok) throw new Error(j.error);
        const rawSlots: unknown[] = Array.isArray(j.slots) ? j.slots : [];
        const list: Date[] = rawSlots
          .filter((s): s is string => typeof s === "string")
          .map((s: string) => new Date(s))
          .filter(isValidDate);
        setSlots(list);
        const first = list[0] ? dayKey(list[0]) : null;
        setDay((d) => (d && list.some((s) => dayKey(s) === d) ? d : first));
      })
      .catch(() => !cancelled && setSlotsError("We couldn't load open times. Refresh, or call us to book."));
    return () => {
      cancelled = true;
    };
    // availabilityKey intentionally captures every vehicle/service choice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availabilityKey, allVehiclesReady]);

  const days = useMemo(() => {
    const map = new Map<string, Date[]>();
    (slots ?? []).forEach((s) => {
      if (!isValidDate(s)) return;
      const k = dayKey(s);
      if (!k) return;
      map.set(k, [...(map.get(k) ?? []), s]);
    });
    return [...map.entries()];
  }, [slots]);
  const daySlots = days.find(([k]) => k === day)?.[1] ?? [];

  function infoValue(name: string) {
    if (!formRef.current) return "";
    return String(new FormData(formRef.current).get(name) ?? "").trim();
  }

  function nationalPhone(value: string) {
    let digits = value.replace(/\D/g, "");
    if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
    return digits.slice(0, 10);
  }

  function goToContactInfo() {
    const name = infoValue("name");
    if (!name) {
      setBadField("name");
      setError("Enter your name to continue.");
      return;
    }
    setBadField(null);
    setError(null);
    setInfoStep(2);
  }

  function goToAddressInfo() {
    const phone = nationalPhone(infoValue("phone"));
    const contactEmail = infoValue("email");
    if (phone.length !== 10) {
      setBadField("phone");
      setError("Enter a 10-digit phone number to continue.");
      return;
    }
    if (!signedIn && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      setBadField("email");
      setError("Enter a valid email so we can send your confirmation.");
      return;
    }
    setBadField(null);
    setError(null);
    setInfoStep(3);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!allVehiclesReady || !start) {
      setError(!allVehiclesReady ? "Choose every vehicle." : "Pick a time.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) ?? "").trim();
    setSending(true);
    setError(null);
    setBadField(null);

    const bookingVehicles = resolved.map((line) => ({
      service: line.service,
      vehicle: line.vehicle,
      vehicleId: line.saved?.id ?? null,
      addons: line.addons,
      paint: line.paint,
    }));

    const res = await fetch("/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicles: bookingVehicles,
        start: start.toISOString(),
        name: get("name"),
        phone: nationalPhone(get("phone")),
        email: get("email"),
        address: get("address"),
        notes: get("service_notes"),
      }),
    }).catch(() => null);
    const json = res ? await res.json().catch(() => ({})) : {};
    setSending(false);

    const confirmed =
      res?.ok === true &&
      json.ok === true &&
      typeof json.jobId === "string" &&
      json.jobId.length > 0 &&
      typeof json.start === "string" &&
      !Number.isNaN(Date.parse(json.start)) &&
      Number.isFinite(Number(json.price)) &&
      Number.isFinite(Number(json.minutes)) &&
      Array.isArray(json.vehicles) &&
      json.vehicles.length > 0;

    if (confirmed) {
      track("booking_submit", { vehicleCount: lines.length, services: lines.map((line) => line.service).join(",") });
      setBooked({
        service: String(json.service ?? ""),
        vehicle: String(json.vehicle ?? ""),
        vehicles: json.vehicles,
        start: json.start,
        price: Number(json.price),
        minutes: Number(json.minutes),
        confirmationEmailSent: json.confirmationEmailSent === true,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (res?.ok && json.ok) {
      setError("We couldn't verify that your booking was created. Nothing has been confirmed. Please try again or call/text us.");
      return;
    }
    if (json.code === "slot_taken") {
      setSlots((s) => (s ?? []).filter((x) => x.getTime() !== start.getTime()));
      setStart(null);
    }
    const field = json.field ?? null;
    setBadField(field);
    if (field === "name") setInfoStep(1);
    if (field === "phone" || field === "email") setInfoStep(2);
    if (field === "address") setInfoStep(3);
    setError(json.error ?? "No connection. Try again, or call us.");
  }

  if (booked) {
    const d = new Date(booked.start);
    return (
      <Success title="You're booked">
        <p className="font-display text-lg font-semibold text-ink">
          {fmtDay(d, { weekday: "long", month: "long", day: "numeric" })} at {fmtTime(d)}
        </p>
        <div className="space-y-1">
          {booked.vehicles.map((line, index) => (
            <p key={`${line.vehicle}-${index}`}>
              {line.vehicle} · {line.service} · {usd(line.price)}
            </p>
          ))}
        </div>
        <p>Total {usd(booked.price)} · about {duration(booked.minutes)}</p>
        <p>
          {booked.confirmationEmailSent
            ? `A confirmation email was sent to ${email || "the email you provided"}.`
            : "Your appointment is confirmed. We couldn't verify email delivery, so save these details or contact us if you need a copy."}
        </p>
        <p>Need to change it? {signedIn ? <>Manage it from <Link className="link" href="/account">your account</Link>, or call</> : "Call or text"} <a className="link" href={site.phone.href}>{site.phone.display}</a>.</p>
        {!signedIn && (
          <p><Link href="/account/sign-in?mode=signup" className="link">Create an account</Link> to save your vehicles and book faster next time.</p>
        )}
      </Success>
    );
  }

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="relative grid gap-10 lg:grid-cols-12">
      <div className="min-w-0 space-y-12 lg:col-span-8">
        {!signedIn && (
          <p className="text-ink/80">
            Booked with us before? <Link href="/account/sign-in?next=/book" className="link">Sign in</Link> to use your saved vehicles.
          </p>
        )}

        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="t-h3">1. Your vehicles</h2>
              <p className="mt-1 text-sm text-muted">Book one or two vehicles in the same appointment.</p>
            </div>
            {lines.length < 2 && (
              <button type="button" onClick={addVehicle} className="btn btn-secondary">+ Add another vehicle</button>
            )}
          </div>

          <div className="mt-5 space-y-8">
            {resolved.map((line, index) => {
              const usedSavedIds = new Set(lines.filter((other) => other.key !== line.key).map((other) => other.savedId));
              return (
                <fieldset key={line.key} className="panel p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <legend className="font-display text-lg font-semibold">Vehicle {index + 1}</legend>
                    {lines.length > 1 && (
                      <button type="button" onClick={() => removeVehicle(line.key)} className="text-sm font-semibold text-red underline underline-offset-4">Remove</button>
                    )}
                  </div>

                  {garage.length > 0 && (
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {garage.map((g) => {
                        const unavailable = usedSavedIds.has(g.id);
                        return (
                          <label key={g.id} className={`choice ${unavailable ? "cursor-not-allowed opacity-45" : ""}`}>
                            <input
                              type="radio"
                              name={`savedVehicle-${line.key}`}
                              checked={line.savedId === g.id}
                              disabled={unavailable}
                              onChange={() => updateLine(line.key, { savedId: g.id, size: vehicleIdFromSize(g.vehicle_size) })}
                              className="sr-only"
                            />
                            <span className="font-display font-semibold">{vName(g)}</span>
                            <span className="text-sm text-muted">
                              {[g.color, vehicleIdFromSize(g.vehicle_size) ? vehicles.find((v) => v.id === vehicleIdFromSize(g.vehicle_size))?.label : "Size not set"].filter(Boolean).join(" · ")}
                            </span>
                          </label>
                        );
                      })}
                      <label className="choice">
                        <input type="radio" name={`savedVehicle-${line.key}`} checked={line.savedId === "size"} onChange={() => updateLine(line.key, { savedId: "size" })} className="sr-only" />
                        <span className="font-display font-semibold">A different vehicle</span>
                        <span className="text-sm text-muted">Choose its size below</span>
                      </label>
                    </div>
                  )}

                  {(!line.saved || !line.savedSize) && (
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {vehicles.map((v) => (
                        <label key={v.id} className="choice">
                          <input
                            type="radio"
                            name={`vehicleSize-${line.key}`}
                            checked={line.size === v.id}
                            onChange={() => {
                              updateLine(line.key, { size: v.id });
                              track("vehicle_select", { vehicle: v.id, location: "book", vehicleNumber: index + 1 });
                            }}
                            className="sr-only"
                          />
                          <span className="font-display font-semibold">{v.label}</span>
                          <span className="text-sm text-muted">{v.hint}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  <p className="mt-5 field-label">Service for vehicle {index + 1}</p>
                  <div className="mt-2 grid gap-2">
                    {serviceList.map((s) => {
                      const p = line.vehicle ? PRICING[line.vehicle][s.id] : null;
                      return (
                        <label key={s.id} className="choice flex-row items-center justify-between gap-4 py-4">
                          <input
                            type="radio"
                            name={`service-${line.key}`}
                            checked={line.service === s.id}
                            onChange={() => {
                              updateLine(line.key, {
                                service: s.id,
                                addons: line.addons.filter((addon) => !isAddonIncludedInService(s.id, addon)),
                              });
                              track("service_select", { service: s.id, vehicle: line.vehicle, location: "book", vehicleNumber: index + 1 });
                            }}
                            className="sr-only"
                          />
                          <span>
                            <span className="flex flex-wrap items-center gap-2 font-display font-semibold">
                              {s.name}
                              {s.recommended && <span className="rounded-full bg-oxblood px-2 py-0.5 text-xs text-paper">Recommended first visit</span>}
                            </span>
                            <span className="mt-0.5 block text-sm text-muted">{s.whoFor}</span>
                          </span>
                          <span className="shrink-0 text-right">
                            <span className="t-numeral block text-3xl">{p ? usd(p.price) : "-"}</span>
                            {p && <span className="text-sm text-muted">{duration(p.minutes)}</span>}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  <div className="mt-6 border-t border-line pt-5">
                    <div className="flex flex-wrap items-end justify-between gap-2">
                      <div>
                        <p className="field-label">Add-ons for vehicle {index + 1}</p>
                        <p className="mt-1 text-sm text-muted">Optional services you can add to this appointment.</p>
                        {line.service === "premium" && <p className="mt-1 text-xs text-muted">Protective sealant is already included in Premium.</p>}
                        {line.service === "factoryReset" && <p className="mt-1 text-xs text-muted">Factory Reset already includes extraction, pet hair removal, clay, sealant and plastic restoration. Odor Removal and Engine Bay are the only available add-ons.</p>}
                      </div>
                      {line.addons.length > 0 && (
                        <button type="button" className="text-sm font-semibold text-red underline underline-offset-4" onClick={() => updateLine(line.key, { addons: [] })}>Clear add-ons</button>
                      )}
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {purchasableAddonIds(line.service).map((id) => {
                        const checked = line.addons.includes(id);
                        return (
                          <label key={id} className="choice flex-row items-center justify-between gap-4 py-3">
                            <span className="flex min-w-0 items-center gap-3">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => updateLine(line.key, { addons: checked ? line.addons.filter((item) => item !== id) : [...line.addons, id] })}
                                className="h-4 w-4 shrink-0 accent-current"
                              />
                              <span className="font-display font-semibold">{ADDON_LABELS[id]}</span>
                            </span>
                            <span className="shrink-0 text-sm font-semibold">{ADDON_PRICES[id] === null ? "Confirm price" : `+${usd(ADDON_PRICES[id]!)}`}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </fieldset>
              );
            })}
          </div>
          {badField === "vehicle" && <p className="field-error mt-3">Check each vehicle and service.</p>}
        </section>

        {fromQuote && (initialAddons.length > 0 || initialPaint.length > 0) && (
          <section className="panel p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-red">From your saved quote</p>
            <h2 className="t-h3 mt-1">Your selections are already loaded</h2>
            <p className="mt-2 text-sm text-muted">Your quoted add-ons are preselected under Vehicle 1. You can change them before booking.</p>
            {initialPaint.length > 0 && (
              <div className="mt-4 border-t border-line pt-4">
                {initialPaint.map((id) => (
                  <p key={id} className="flex items-baseline gap-2 text-sm">
                    <span className="font-display font-semibold">{PAINT_UPGRADES[id].name}</span><span className="leader" aria-hidden="true" />
                    <span>{resolved[0]?.vehicle ? usd(PAINT_UPGRADES[id].prices[resolved[0].vehicle!]) : "Quoted by vehicle"}</span>
                  </p>
                ))}
                <p className="mt-3 text-sm text-muted">Paint correction and coating work is attached to this booking request. Because paint work can require a separate appointment, our team will confirm the production schedule with you.</p>
              </div>
            )}
          </section>
        )}

        <fieldset>
          <legend className="t-h3">2. Pick a time</legend>
          {!allVehiclesReady ? (
            <p className="mt-3 text-muted">Choose every vehicle to see open times.</p>
          ) : slotsError ? (
            <p className="mt-3 text-red">{slotsError}</p>
          ) : slots === null ? (
            <p className="mt-3 text-muted" aria-live="polite">Checking the schedule…</p>
          ) : days.length === 0 ? (
            <p className="mt-3 text-ink/80">
              No open times in the next month for this appointment. Call or text <a className="link" href={site.phone.href}>{site.phone.display}</a> and we&rsquo;ll find one.
            </p>
          ) : (
            <>
              <div role="radiogroup" aria-label="Day" className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-2">
                {days.map(([k, list]) => (
                  <button key={k} type="button" role="radio" aria-checked={day === k} onClick={() => { setDay(k); setStart(null); }} className="choice min-w-[4.75rem] shrink-0 items-center px-3 py-2 text-center">
                    <span className="text-sm text-muted">{fmtDay(list[0], { weekday: "short" })}</span>
                    <span className="t-numeral text-3xl">{fmtDay(list[0], { day: "numeric" })}</span>
                    <span className="text-xs text-muted">{fmtDay(list[0], { month: "short" })}</span>
                  </button>
                ))}
              </div>
              <div role="radiogroup" aria-label="Start time" className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {daySlots.map((s) => (
                  <button key={s.toISOString()} type="button" role="radio" aria-checked={start?.getTime() === s.getTime()} onClick={() => setStart(s)} className="choice min-h-12 items-center px-2 py-2 font-display font-semibold">
                    {fmtTime(s)}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-sm text-muted">Times are arrival times, Eastern.</p>
            </>
          )}
        </fieldset>

        <fieldset className="space-y-6">
          <legend className="t-h3">3. Your details</legend>

          <div className="client-info-progress" aria-label="Your information progress">
            <button type="button" onClick={() => setInfoStep(1)} className={infoStep === 1 ? "is-active" : infoStep > 1 ? "is-done" : ""}>
              <b>{infoStep > 1 ? "✓" : "01"}</b><span>Name</span>
            </button>
            <i />
            <button type="button" onClick={() => infoStep >= 2 && setInfoStep(2)} className={infoStep === 2 ? "is-active" : infoStep > 2 ? "is-done" : ""}>
              <b>{infoStep > 2 ? "✓" : "02"}</b><span>Phone & email</span>
            </button>
            <i />
            <button type="button" onClick={() => infoStep >= 3 && setInfoStep(3)} className={infoStep === 3 ? "is-active" : ""}>
              <b>03</b><span>Address</span>
            </button>
          </div>

          <div hidden={infoStep !== 1} className="client-info-panel">
            <TextField label="Full name" name="name" autoComplete="name" defaultValue={account?.full_name ?? ""} error={badField === "name"} />
            <button type="button" onClick={goToContactInfo} className="btn btn-primary mt-6 w-full sm:w-auto">Continue to contact info</button>
          </div>

          <div hidden={infoStep !== 2} className="client-info-panel">
            <div className="grid gap-6 sm:grid-cols-2">
              <TextField
                label="Phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={10}
                defaultValue={nationalPhone(account?.phone ?? "")}
                onInput={(event) => { event.currentTarget.value = nationalPhone(event.currentTarget.value); }}
                error={badField === "phone"}
                errorText="Enter a 10-digit phone number."
              />
              {!signedIn && (
                <TextField label="Email" name="email" type="email" autoComplete="email" hint="Required for your confirmation." error={badField === "email"} errorText="Enter a valid email for your confirmation." />
              )}
              {signedIn && <input type="hidden" name="email" value={email ?? ""} />}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={() => setInfoStep(1)} className="btn btn-secondary">Back</button>
              <button type="button" onClick={goToAddressInfo} className="btn btn-primary">Continue to address</button>
            </div>
          </div>

          <div hidden={infoStep !== 3} className="client-info-panel">
            <div className="booking-address-block">
              <p className="field-label">Service address</p>
              <p className="mb-4 mt-1 text-sm text-muted">Where should our team meet the vehicle?</p>
              <AddressFields defaultValue={account?.address ?? ""} error={badField === "address"} />
            </div>
            <div className="mt-6">
              <TextArea label="Anything we should know?" name="service_notes" autoComplete="off" optional hint="Gate codes, parking, pet hair, stains, or a spot you care about." />
            </div>
            <button type="button" onClick={() => setInfoStep(2)} className="btn btn-secondary mt-6">Back</button>
          </div>
        </fieldset>
      </div>

      <aside className="lg:col-span-4">
        <div className="panel p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-semibold">Your appointment</h2>
          {allVehiclesReady && displayTotal !== null ? (
            <div className="mt-4 space-y-4">
              {resolved.map((line, index) => {
                const p = PRICING[line.vehicle!][line.service];
                return (
                  <div key={line.key} className={index ? "border-t border-line pt-4" : ""}>
                    <p className="flex items-baseline gap-2">
                      <span className="font-display font-semibold">{line.saved && line.savedSize ? vName(line.saved) : vehicles.find((v) => v.id === line.vehicle)?.label}</span>
                      <span className="leader" aria-hidden="true" />
                      <span className="t-numeral text-3xl">{usd(p.price)}</span>
                    </p>
                    <p className="mt-1 text-sm text-muted">{services[line.service].name}</p>
                  </div>
                );
              })}
              {resolved.some((line) => line.addons.length > 0 || line.paint.length > 0) && (
                <div className="border-t border-line pt-4 text-sm text-muted">
                  {resolved.map((line, index) => (
                    (line.addons.length > 0 || line.paint.length > 0) ? (
                      <div key={line.key} className={index ? "mt-3" : ""}>
                        {resolved.length > 1 && <p className="mb-1 font-semibold text-ink">Vehicle {index + 1}</p>}
                        {line.addons.map((id) => <p key={id}>+ {ADDON_LABELS[id]} {ADDON_PRICES[id] === null ? "" : `(${usd(ADDON_PRICES[id]!)})`}</p>)}
                        {line.paint.map((id) => <p key={id}>+ {PAINT_UPGRADES[id].name}</p>)}
                      </div>
                    ) : null
                  ))}
                </div>
              )}
              <p className="flex items-baseline gap-2 border-t-2 border-ink pt-4">
                <span className="font-display font-semibold">Total</span>
                <span className="leader" aria-hidden="true" />
                <span className="t-numeral text-4xl">{usd(displayTotal)}{hasVariableAddons ? "+" : ""}</span>
              </p>
              {appointmentMinutes && <p className="text-sm text-muted">About {duration(appointmentMinutes)} on site. Multi-vehicle appointments are staffed to work on the vehicles together.</p>}
            </div>
          ) : (
            <p className="mt-3 text-muted">Choose every vehicle to see your total.</p>
          )}
          <p className="mt-4 border-t border-line pt-4 font-display font-semibold" aria-live="polite">
            {start ? `${fmtDay(start, { weekday: "long", month: "short", day: "numeric" })}, ${fmtTime(start)}` : "No time picked yet"}
          </p>
          <ul className="mt-4 space-y-1.5 text-sm text-ink/80">
            <li>We bring our own power and water</li>
            <li>We accept {site.paymentMethods.join(", ")}</li>
            <li>Confirmation is emailed immediately after booking</li>
          </ul>
          <div className="mt-5"><FormError message={error} /></div>
          <button type="submit" disabled={sending || !start || !allVehiclesReady || infoStep !== 3} className="btn btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-50">
            {sending ? "Booking…" : lines.length > 1 ? `Book ${lines.length} vehicles` : "Book it"}
          </button>
        </div>
      </aside>
    </form>
  );
}
