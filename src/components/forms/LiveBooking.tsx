"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { PRICING, serviceList, services, vehicleIdFromSize, vehicles, type ServiceId, type VehicleId } from "@/data/services";
import { site } from "@/data/site";
import { track } from "@/lib/analytics";
import { duration, usd } from "@/lib/format";
import type { AccountInfo, GarageVehicle } from "@/lib/supabase/account";
import { FormError, Honeypot, Success, TextArea, TextField } from "./parts";

const TZ = "America/New_York";
const dayKey = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
const fmtTime = (d: Date) => new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" }).format(d);
const fmtDay = (d: Date, opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-US", { timeZone: TZ, ...opts }).format(d);
const vName = (v: GarageVehicle) => [v.year, v.make, v.model].filter(Boolean).join(" ") || "Vehicle";

type Props = {
  account?: AccountInfo;
  email?: string;
  garage?: GarageVehicle[];
  initialVehicle?: VehicleId;
  initialService?: ServiceId;
};

type Booked = { service: string; vehicle: string; start: string; price: number; minutes: number };

export function LiveBooking({ account, email, garage = [], initialVehicle, initialService }: Props) {
  const signedIn = !!account;
  const primary = garage.find((g) => g.is_primary) ?? garage[0];

  // Vehicle: a saved vehicle id, or "size" to pick a size manually
  const [savedId, setSavedId] = useState<string | "size">(primary ? primary.id : "size");
  const saved = garage.find((g) => g.id === savedId);
  const savedSize = saved ? vehicleIdFromSize(saved.vehicle_size) : undefined;
  const [size, setSize] = useState<VehicleId | undefined>(initialVehicle ?? savedSize);
  const vehicle: VehicleId | undefined = saved && savedSize ? savedSize : size;

  const [service, setService] = useState<ServiceId>(initialService ?? "premium");
  const [slots, setSlots] = useState<Date[] | null>(null);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [start, setStart] = useState<Date | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [badField, setBadField] = useState<string | null>(null);
  const [booked, setBooked] = useState<Booked | null>(null);

  const price = vehicle ? PRICING[vehicle][service] : null;

  // Load open times whenever the job shape changes
  useEffect(() => {
    if (!vehicle) return;
    let cancelled = false;
    setSlots(null);
    setSlotsError(null);
    setStart(null);
    const from = dayKey(new Date());
    const to = dayKey(new Date(Date.now() + 31 * 86_400_000));
    fetch(`/api/availability?service=${service}&vehicle=${vehicle}&from=${from}&to=${to}`)
      .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
      .then(({ ok, j }) => {
        if (cancelled) return;
        if (!ok) throw new Error(j.error);
        const list = (j.slots as string[]).map((s) => new Date(s));
        setSlots(list);
        const first = list[0] ? dayKey(list[0]) : null;
        setDay((d) => (d && list.some((s) => dayKey(s) === d) ? d : first));
      })
      .catch(() => !cancelled && setSlotsError("We couldn't load open times. Refresh, or call us to book."));
    return () => {
      cancelled = true;
    };
  }, [vehicle, service]);

  const days = useMemo(() => {
    const map = new Map<string, Date[]>();
    (slots ?? []).forEach((s) => {
      const k = dayKey(s);
      map.set(k, [...(map.get(k) ?? []), s]);
    });
    return [...map.entries()];
  }, [slots]);
  const daySlots = days.find(([k]) => k === day)?.[1] ?? [];

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!vehicle || !start) {
      setError(!vehicle ? "Choose your vehicle." : "Pick a time.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) ?? "").trim();
    setSending(true);
    setError(null);
    setBadField(null);
    const res = await fetch("/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service,
        vehicle,
        vehicleId: saved ? saved.id : null,
        start: start.toISOString(),
        name: get("name"),
        phone: get("phone"),
        email: get("email"),
        address: get("address"),
        notes: get("notes"),
        company: get("company"),
      }),
    }).catch(() => null);
    const json = res ? await res.json().catch(() => ({})) : {};
    setSending(false);

    if (res?.ok && json.ok) {
      track("booking_submit", { vehicle, service });
      setBooked({ service: json.service, vehicle: json.vehicle, start: json.start, price: json.price, minutes: json.minutes });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (json.code === "slot_taken") {
      setSlots((s) => (s ?? []).filter((x) => x.getTime() !== start.getTime()));
      setStart(null);
    }
    setBadField(json.field ?? null);
    setError(json.error ?? "No connection. Try again, or call us.");
  }

  if (booked) {
    const d = new Date(booked.start);
    return (
      <Success title="You're booked">
        <p className="font-display text-lg font-semibold text-ink">
          {booked.service}, {fmtDay(d, { weekday: "long", month: "long", day: "numeric" })} at {fmtTime(d)}
        </p>
        <p>
          {booked.vehicle} · {usd(booked.price)} · about {duration(booked.minutes)}
        </p>
        <p>Need to change it? {signedIn ? <>Manage it from <Link className="link" href="/account">your account</Link>, or call</> : "Call or text"} <a className="link" href={site.phone.href}>{site.phone.display}</a>.</p>
        {!signedIn && (
          <p>
            <Link href="/account/sign-in?mode=signup" className="link">Create an account</Link> to save your vehicle and book faster next time.
          </p>
        )}
      </Success>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className="relative grid gap-10 lg:grid-cols-12">
      <Honeypot />
      <div className="min-w-0 space-y-12 lg:col-span-8">
        {!signedIn && (
          <p className="text-ink/80">
            Booked with us before?{" "}
            <Link href="/account/sign-in?next=/book" className="link">
              Sign in
            </Link>{" "}
            to use your saved vehicles.
          </p>
        )}

        {/* 1. Vehicle */}
        <fieldset>
          <legend className="t-h3">1. Your vehicle</legend>
          {garage.length > 0 && (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {garage.map((g) => (
                <label key={g.id} className="choice">
                  <input
                    type="radio"
                    name="savedVehicle"
                    checked={savedId === g.id}
                    onChange={() => {
                      setSavedId(g.id);
                      setSize(vehicleIdFromSize(g.vehicle_size));
                    }}
                    className="sr-only"
                  />
                  <span className="font-display font-semibold">{vName(g)}</span>
                  <span className="text-sm text-muted">
                    {[g.color, vehicleIdFromSize(g.vehicle_size) ? vehicles.find((v) => v.id === vehicleIdFromSize(g.vehicle_size))?.label : "Size not set"]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </label>
              ))}
              <label className="choice">
                <input type="radio" name="savedVehicle" checked={savedId === "size"} onChange={() => setSavedId("size")} className="sr-only" />
                <span className="font-display font-semibold">A different vehicle</span>
                <span className="text-sm text-muted">Choose its size below</span>
              </label>
            </div>
          )}
          {(!saved || !savedSize) && (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {vehicles.map((v) => (
                <label key={v.id} className="choice">
                  <input
                    type="radio"
                    name="vehicleSize"
                    checked={size === v.id}
                    onChange={() => {
                      setSize(v.id);
                      track("vehicle_select", { vehicle: v.id, location: "book" });
                    }}
                    className="sr-only"
                  />
                  <span className="font-display font-semibold">{v.label}</span>
                  <span className="text-sm text-muted">{v.hint}</span>
                </label>
              ))}
            </div>
          )}
          {badField === "vehicle" && <p className="field-error">Choose your vehicle size.</p>}
        </fieldset>

        {/* 2. Service */}
        <fieldset>
          <legend className="t-h3">2. Your service</legend>
          <div className="mt-4 grid gap-2">
            {serviceList.map((s) => {
              const p = vehicle ? PRICING[vehicle][s.id] : null;
              return (
                <label key={s.id} className="choice flex-row items-center justify-between gap-4 py-4">
                  <input
                    type="radio"
                    name="service"
                    checked={service === s.id}
                    onChange={() => {
                      setService(s.id);
                      track("service_select", { service: s.id, vehicle, location: "book" });
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
                    <span className="t-numeral block text-3xl">{p ? usd(p.price) : "—"}</span>
                    {p && <span className="text-sm text-muted">{duration(p.minutes)}</span>}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* 3. Time */}
        <fieldset>
          <legend className="t-h3">3. Pick a time</legend>
          {!vehicle ? (
            <p className="mt-3 text-muted">Choose your vehicle to see open times.</p>
          ) : slotsError ? (
            <p className="mt-3 text-red">{slotsError}</p>
          ) : slots === null ? (
            <p className="mt-3 text-muted" aria-live="polite">
              Checking the schedule…
            </p>
          ) : days.length === 0 ? (
            <p className="mt-3 text-ink/80">
              No open times in the next month for this service. Call or text{" "}
              <a className="link" href={site.phone.href}>
                {site.phone.display}
              </a>{" "}
              and we&rsquo;ll find one.
            </p>
          ) : (
            <>
              <div role="radiogroup" aria-label="Day" className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-2">
                {days.map(([k, list]) => (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={day === k}
                    onClick={() => {
                      setDay(k);
                      setStart(null);
                    }}
                    className="choice min-w-[4.75rem] shrink-0 items-center px-3 py-2 text-center"
                  >
                    <span className="text-sm text-muted">{fmtDay(list[0], { weekday: "short" })}</span>
                    <span className="t-numeral text-3xl">{fmtDay(list[0], { day: "numeric" })}</span>
                    <span className="text-xs text-muted">{fmtDay(list[0], { month: "short" })}</span>
                  </button>
                ))}
              </div>
              <div role="radiogroup" aria-label="Start time" className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {daySlots.map((s) => (
                  <button
                    key={s.toISOString()}
                    type="button"
                    role="radio"
                    aria-checked={start?.getTime() === s.getTime()}
                    onClick={() => setStart(s)}
                    className="choice min-h-12 items-center px-2 py-2 font-display font-semibold"
                  >
                    {fmtTime(s)}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-sm text-muted">Times are arrival times, Eastern.</p>
            </>
          )}
        </fieldset>

        {/* 4. Details */}
        <fieldset className="space-y-6">
          <legend className="t-h3">4. Your details</legend>
          <TextField
            label="Address where the car will be"
            name="address"
            autoComplete="street-address"
            defaultValue={account?.address ?? ""}
            hint="Home, apartment or office. Include the city."
            error={badField === "address"}
          />
          <div className="grid gap-6 sm:grid-cols-2">
            <TextField label="Name" name="name" autoComplete="name" defaultValue={account?.full_name ?? ""} error={badField === "name"} />
            <TextField
              label="Phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              defaultValue={account?.phone ?? ""}
              error={badField === "phone"}
              errorText="Enter a 10-digit phone number."
            />
          </div>
          {!signedIn && (
            <TextField label="Email" name="email" type="email" autoComplete="email" optional hint="For your confirmation." error={badField === "email"} errorText="Check your email address." />
          )}
          {signedIn && <input type="hidden" name="email" value={email ?? ""} />}
          <TextArea label="Anything we should know?" name="notes" optional hint="Gate codes, parking, pet hair, stains, a spot you care about." />
        </fieldset>
      </div>

      <aside className="lg:col-span-4">
        <div className="panel p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-semibold">Your detail</h2>
          {vehicle && price ? (
            <>
              <p className="mt-4 flex items-baseline gap-2">
                <span className="font-display font-semibold">{services[service].name}</span>
                <span className="leader" aria-hidden="true" />
                <span className="t-numeral text-4xl">{usd(price.price)}</span>
              </p>
              <p className="mt-1 text-sm text-muted">
                {saved && savedSize ? vName(saved) : vehicles.find((v) => v.id === vehicle)?.label} · about {duration(price.minutes)}
              </p>
            </>
          ) : (
            <p className="mt-3 text-muted">Choose your vehicle to see your price.</p>
          )}
          <p className="mt-4 border-t border-line pt-4 font-display font-semibold" aria-live="polite">
            {start ? `${fmtDay(start, { weekday: "long", month: "short", day: "numeric" })}, ${fmtTime(start)}` : "No time picked yet"}
          </p>
          <ul className="mt-4 space-y-1.5 text-sm text-ink/80">
            <li>We bring our own power and water</li>
            <li>We accept {site.paymentMethods.join(", ")}</li>
          </ul>
          <div className="mt-5">
            <FormError message={error} />
          </div>
          <button type="submit" disabled={sending || !start || !vehicle} className="btn btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-50">
            {sending ? "Booking…" : "Book it"}
          </button>
        </div>
      </aside>
    </form>
  );
}
