"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { PRICING, services, startingPrice, vehicleIdFromSize, vehicles, type ServiceId, type VehicleId } from "@/data/services";
import { ADDON_LABELS, ADDON_PRICES, PAINT_UPGRADES, isAddonIncludedInService, purchasableAddonIds, type AddonId, type PaintUpgradeId } from "@/data/quoteExtras";
import { recommenderVehicles } from "@/data/recommenderVehicles";
import { useVehicle } from "@/components/vehicle/VehicleContext";
import { useJourney } from "@/components/journey/JourneyContext";
import { isServiceId } from "@/data/services";
import { vehicleClassForYear, vehicleMatches, yearFromVehicleQuery } from "@/lib/vehicle-search";
import { areas } from "@/data/areas";
import { site } from "@/data/site";
import { track } from "@/lib/analytics";
import { duration, usd } from "@/lib/format";
import type { AccountInfo, GarageVehicle } from "@/lib/supabase/account";
import { AutofillSafeNotes } from "./AutofillSafeNotes";
import { LeadSourceField } from "./LeadSourceField";
import { BookingTopBar } from "./BookingTopBar";
import { Honeypot } from "./parts";
import { TurnstileField } from "./TurnstileField";

/* ------------------------------------------------------------------ */
/* Time helpers (all scheduling is Eastern)                            */
/* ------------------------------------------------------------------ */

const TZ = "America/New_York";
const isValidDate = (d: Date) => Number.isFinite(d.getTime());
const dayKey = (d: Date) => {
  if (!isValidDate(d)) return "";
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(d);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
};
const fmtTime = (d: Date) => (isValidDate(d) ? new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" }).format(d) : "");
const fmtDay = (d: Date, opts: Intl.DateTimeFormatOptions) => (isValidDate(d) ? new Intl.DateTimeFormat("en-US", { timeZone: TZ, ...opts }).format(d) : "");
const dateFromDayKey = (key: string) => {
  const date = new Date(`${key}T12:00:00Z`);
  return isValidDate(date) ? date : null;
};
const addDaysKey = (key: string, days: number) => {
  const d = new Date(`${key}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};
const monthStartKey = (key: string) => key ? `${key.slice(0, 7)}-01` : "";
const addMonthsKey = (key: string, months: number) => {
  const d = new Date(`${monthStartKey(key)}T12:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 7) + "-01";
};
const calendarMonthCells = (monthKey: string) => {
  if (!monthKey) return [] as Array<{ key: string; inMonth: boolean }>;
  const first = new Date(`${monthStartKey(monthKey)}T12:00:00Z`);
  const start = new Date(first);
  start.setUTCDate(1 - first.getUTCDay());
  return Array.from({ length: 42 }, (_, index) => {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + index);
    const key = d.toISOString().slice(0, 10);
    return { key, inMonth: key.slice(0, 7) === monthKey.slice(0, 7) };
  });
};
const utcDayLabel = (key: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...opts }).format(new Date(`${key}T12:00:00Z`));

function useSchoolHours() {
  const [inClass, setInClass] = useState(false);
  useEffect(() => {
    const check = () => {
      const parts = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short", month: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
      const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
      const minutes = Number(value("hour")) * 60 + Number(value("minute"));
      const month = Number(value("month"));
      const isSchoolYear = month >= 8 || month <= 5;
      setInClass(isSchoolYear && ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(value("weekday")) && minutes >= 7 * 60 + 30 && minutes < 16 * 60);
    };
    check();
    const timer = window.setInterval(check, 30_000);
    return () => window.clearInterval(timer);
  }, []);
  return inClass;
}

/* ------------------------------------------------------------------ */
/* Vehicle classification                                              */
/* ------------------------------------------------------------------ */


/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

const PACKAGE_ORDER: ServiceId[] = ["maintenance", "premium", "factoryReset"];
const PACKAGE_COPY: Record<ServiceId, { label: string; points: string[]; badge?: string }> = {
  factoryReset: {
    label: "The full restart",
    points: services.factoryReset.includes,
  },
  premium: {
    label: "Bring it back",
    badge: "Most popular",
    points: services.premium.includes,
  },
  maintenance: {
    label: "Keep it clean",
    points: services.maintenance.includes,
  },
};

const ADDON_DESC: Record<AddonId, string> = {
  Sealant: "Adds exterior protection and makes future washes easier.",
  "Pet Hair Removal": "Removes heavier embedded hair from seats, carpet, and fabric.",
  "Clay Bar": "Removes bonded grit and contamination from the paint.",
  "Plastic Restoration": "Restores faded exterior trim to a darker, cleaner finish.",
  "Headlight Restoration": "Restores clarity to hazy or yellowed lenses.",
  "Engine Bay": "Cleans and dresses the engine bay while we are already there.",
  "Carpet Extraction": "Deep extraction for stained floor carpet.",
  "Seat Extraction": "Deep extraction for stained cloth seats.",
  "Odor Removal": "Targets lingering smells that normal cleaning can leave behind.",
};
const RECOMMENDED_ADDONS: Partial<Record<ServiceId, AddonId[]>> = {
  maintenance: ["Sealant"],
  premium: ["Pet Hair Removal", "Plastic Restoration", "Odor Removal"],
};

const CONFIRMATION_ADDON_PRIORITY: Record<ServiceId, AddonId[]> = {
  maintenance: ["Sealant"],
  premium: ["Pet Hair Removal", "Plastic Restoration", "Odor Removal"],
  factoryReset: ["Odor Removal"],
};

function confirmationAddonFor(service: ServiceId, selected: AddonId[]) {
  return CONFIRMATION_ADDON_PRIORITY[service].find((id) => !selected.includes(id) && purchasableAddonIds(service).includes(id)) ?? null;
}

/* ------------------------------------------------------------------ */
/* Address                                                             */
/* ------------------------------------------------------------------ */

type AddressParts = { street: string; unit: string; city: string; state: string; zip: string };
function parseAddress(value = ""): AddressParts {
  const parts = value.split(",").map((p) => p.trim()).filter(Boolean);
  const last = parts.at(-1) ?? "";
  const stateZip = last.match(/^([A-Za-z]{2}|Georgia)\s+(\d{5}(?:-\d{4})?)$/i);
  if (parts.length >= 3 && stateZip) {
    return { street: parts[0] ?? "", unit: parts.length > 3 ? parts.slice(1, -2).join(", ") : "", city: parts.at(-2) ?? "", state: stateZip[1], zip: stateZip[2] };
  }
  return { street: value, unit: "", city: "", state: "GA", zip: "" };
}
const fullAddress = (a: AddressParts) =>
  [a.street.trim(), a.unit.trim(), a.city.trim(), [a.state.trim(), a.zip.trim()].filter(Boolean).join(" ")].filter(Boolean).join(", ");
function addressProblem(a: AddressParts): string | null {
  if (!a.street.trim() || !/\d/.test(a.street)) return "Enter the street address, including the house number.";
  if (!a.city.trim()) return "Enter the city.";
  if (!/^(ga|georgia)$/i.test(a.state.trim())) return "We only service addresses in Georgia.";
  if (!/^\d{5}(-\d{4})?$/.test(a.zip.trim())) return "Enter a 5-digit ZIP code.";
  return null;
}
const DIRECT_AREA_NAMES = new Set(areas.filter((area) => area.name.toLowerCase() !== "atlanta").map((area) => area.name.toLowerCase()));
const coverageMessage = (city: string) => {
  const normalized = city.trim().toLowerCase();
  if (DIRECT_AREA_NAMES.has(normalized)) return `Yep. We service ${city.trim()}.`;
  if (normalized === "atlanta") return "We’ll confirm coverage for this Atlanta location with your appointment.";
  return "We’ll confirm this location is within our mobile service area.";
};

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

const vName = (v: GarageVehicle) => [v.year, v.make, v.model].filter(Boolean).join(" ") || "Vehicle";
const normalizeVehicleText = (value: string | null | undefined) => (value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
const sizeLabel = (id?: VehicleId) => (id ? vehicles.find((v) => v.id === id)?.label ?? "" : "");

type Props = {
  account?: AccountInfo;
  email?: string;
  garage?: GarageVehicle[];
  initialVehicle?: VehicleId;
  initialService?: ServiceId;
  initialAddons?: AddonId[];
  initialPaint?: PaintUpgradeId[];
  fromQuote?: boolean;
  fromHome?: boolean;
  fromResume?: boolean;
};

type BookingLine = {
  key: number;
  savedId: string | "size";
  size?: VehicleId;
  sizeManual: boolean;
  service: ServiceId | null;
  addons: AddonId[];
  paint: PaintUpgradeId[];
  make: string;
  model: string;
  year: string;
};

type Booked = {
  jobId: string;
  vehicles: Array<{ vehicle: string; service: string; price: number }>;
  lines: Array<{ service: ServiceId; vehicle: VehicleId; title: string; addons: AddonId[] }>;
  start: string;
  price: number;
  minutes: number;
  confirmationEmailSent: boolean;
  address: string;
  summary: string;
};

type StepId = "service" | "car" | "extras" | "schedule" | "info" | "review";
const STEPS: StepId[] = ["service", "car", "extras", "schedule", "info", "review"];
const STAGE_OF: Record<StepId, number> = { service: 0, car: 1, extras: 1, schedule: 2, info: 3, review: 3 };
const STEP_LABEL: Record<StepId, string> = { service: "Detail", car: "Vehicle", extras: "Extras", schedule: "Place + time", info: "Your info", review: "Review" };
const BOOKING_DRAFT_KEY = "ed_booking_draft_v2";

const nationalPhone = (value: string) => {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  return digits.slice(0, 10);
};
const prettyPhone = (digits: string) =>
  digits.length === 10 ? `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}` : digits;

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function LiveBooking({ account, email, garage = [], initialVehicle, initialService, initialAddons = [], initialPaint = [], fromQuote = false, fromHome = false, fromResume = false }: Props) {
  const { vehicle: siteVehicle, hydrated: siteVehicleHydrated, openPicker: openSiteVehiclePicker } = useVehicle();
  const { serviceIntent, location: journeyLocation, selectedSlot: journeySelectedSlot, setServiceIntent, setLocation: setJourneyLocation, setSelectedSlot: setJourneySelectedSlot, setBookingResumeHref } = useJourney();
  const signedIn = !!account;
  const primary = garage.find((g) => g.is_primary) ?? garage[0];
  const nextKey = useRef(2);
  const inClass = useSchoolHours();

  const [lines, setLines] = useState<BookingLine[]>(() => {
    const service = initialService ?? null;
    return [{
      key: 1,
      savedId: primary && !initialVehicle ? primary.id : "size",
      size: initialVehicle ?? undefined,
      sizeManual: !!initialVehicle,
      service,
      addons: service ? initialAddons.filter((addon) => !isAddonIncludedInService(service, addon)) : initialAddons,
      paint: initialPaint,
      make: "",
      model: "",
      year: "",
    }];
  });

  const firstStep: StepId = (() => {
    const vehicleKnown = !!initialVehicle || !!(primary && vehicleIdFromSize(primary.vehicle_size));
    if (initialService && vehicleKnown && (fromQuote || fromHome)) return "schedule";
    if (initialService && initialVehicle) return "extras";
    if (initialService) return "car";
    return "service";
  })();
  const [active, setActive] = useState<StepId>(firstStep);
  const lastActive = useRef<StepId>(firstStep);
  const [reached, setReached] = useState(STEPS.indexOf(firstStep));
  const [stepError, setStepError] = useState<{ step: StepId; message: string } | null>(null);
  const [gridOpen, setGridOpen] = useState<Record<number, boolean>>({});
  const [vehicleSearch, setVehicleSearch] = useState<Record<number, string>>({});
  const [moreOpen, setMoreOpen] = useState<Record<number, boolean>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [address, setAddress] = useState<AddressParts>(() => parseAddress(account?.address ?? ""));
  useEffect(() => {
    if (!fromResume || account?.address) return;
    try {
      const saved = JSON.parse(sessionStorage.getItem(BOOKING_DRAFT_KEY) || "null") as { address?: AddressParts } | null;
      if (saved?.address && !addressProblem(saved.address)) setAddress(saved.address);
    } catch {}
  }, [fromResume, account?.address]);

  useEffect(() => {
    if (!address.street && !address.city && !address.zip) return;
    try {
      const current = JSON.parse(sessionStorage.getItem(BOOKING_DRAFT_KEY) || "{}") as Record<string, unknown>;
      sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify({ ...current, address }));
    } catch {}
  }, [address]);
  const [name, setName] = useState(account?.full_name ?? "");
  const [phone, setPhone] = useState(nationalPhone(account?.phone ?? ""));
  const [contactEmail, setContactEmail] = useState("");
  const [badField, setBadField] = useState<string | null>(null);

  const [slots, setSlots] = useState<Date[] | null>(null);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => monthStartKey(dayKey(new Date())));
  const [start, setStart] = useState<Date | null>(null);

  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [booked, setBooked] = useState<Booked | null>(null);
  const [postBookingAddonBusy, setPostBookingAddonBusy] = useState(false);
  const [postBookingAddonError, setPostBookingAddonError] = useState<string | null>(null);
  const [postBookingAddonAdded, setPostBookingAddonAdded] = useState<AddonId | null>(null);

  const [giftCardCode, setGiftCardCode] = useState("");
  const [giftCardBusy, setGiftCardBusy] = useState(false);
  const [giftCardError, setGiftCardError] = useState<string | null>(null);
  const [giftCardPreview, setGiftCardPreview] = useState<{ codeLast4: string; balanceCents: number } | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const quoteSessionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!fromResume) return;
    try {
      const saved = JSON.parse(sessionStorage.getItem(BOOKING_DRAFT_KEY) || "null") as { lines?: BookingLine[] } | null;
      if (saved?.lines?.length) {
        const restored = saved.lines.map((line, index) => ({ ...line, key: index + 1 }));
        setLines(restored);
        nextKey.current = restored.length + 1;
        const readyForSchedule = restored.every((line) => !!line.service && !!line.size);
        if (readyForSchedule) {
          setActive("schedule");
          setReached((current) => Math.max(current, STEPS.indexOf("schedule")));
        }
      }
    } catch {}
  }, [fromResume]);

  useEffect(() => {
    if (!lines.some((line) => line.service || line.size || line.make || line.model)) return;
    try {
      const current = JSON.parse(sessionStorage.getItem(BOOKING_DRAFT_KEY) || "{}") as Record<string, unknown>;
      sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify({ ...current, lines }));
    } catch {}
  }, [lines]);

  async function recordQuoteBehavior(stage: string, extra: Record<string, unknown> = {}) {
    const sessionId = quoteSessionRef.current;
    if (!sessionId) return;
    await fetch("/api/quote-session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, stage, ...extra }) }).catch(() => null);
  }

  // Carry the sitewide vehicle into Booking. If it already belongs to the
  // signed-in customer's garage, select that exact saved vehicle rather than
  // representing it as a separate custom vehicle.
  useEffect(() => {
    if (!siteVehicleHydrated || !siteVehicle || initialVehicle) return;

    const savedMatch = garage.find((saved) => {
      const sameMake = normalizeVehicleText(saved.make) === normalizeVehicleText(siteVehicle.make);
      const sameModel = normalizeVehicleText(saved.model) === normalizeVehicleText(siteVehicle.model);
      const sameYear = !siteVehicle.year || !saved.year || String(saved.year) === String(siteVehicle.year);
      return sameMake && sameModel && sameYear;
    });

    setLines((current) => current.map((line, index) => {
      if (index !== 0) return line;

      const untouchedInitial =
        (!line.make && !line.model && !line.size) ||
        (primary && line.savedId === primary.id && !line.make && !line.model);
      if (!untouchedInitial) return line;

      if (savedMatch) {
        const savedSize = vehicleIdFromSize(savedMatch.vehicle_size) ?? siteVehicle.vehicle;
        return {
          ...line,
          savedId: savedMatch.id,
          size: savedSize,
          sizeManual: !!savedSize,
          make: "",
          model: "",
          year: "",
        };
      }

      return {
        ...line,
        savedId: "size",
        size: siteVehicle.vehicle,
        sizeManual: false,
        make: siteVehicle.make,
        model: siteVehicle.model,
        year: siteVehicle.year ?? "",
      };
    }));
  }, [siteVehicleHydrated, siteVehicle, initialVehicle, garage, primary]);

  // Contextual handoffs already know the service and shared vehicle, so do not ask twice.
  useEffect(() => {
    if (!(fromQuote || fromHome) || !initialService || initialVehicle || !siteVehicleHydrated || !siteVehicle) return;
    setActive("schedule");
    setReached((current) => Math.max(current, STEPS.indexOf("schedule")));
  }, [fromQuote, fromHome, initialService, initialVehicle, siteVehicleHydrated, siteVehicle]);

  // Reuse explicit session choices, but never override a service/vehicle supplied in the booking URL.
  useEffect(() => {
    if (initialService || !serviceIntent || !isServiceId(serviceIntent)) return;
    setLines((current) => current.map((line, index) => index === 0 && !line.service ? { ...line, service: serviceIntent } : line));
  }, [initialService, serviceIntent]);

  // Quote handoff: carry the contact info captured on the quote page.
  useEffect(() => {
    if (!fromQuote) return;
    quoteSessionRef.current = sessionStorage.getItem("ed_quote_session_id");
    try {
      const c = JSON.parse(sessionStorage.getItem("ed_quote_contact") ?? "{}") as Record<string, unknown>;
      if (typeof c.name === "string") setName((v) => v || c.name as string);
      if (typeof c.phone === "string") setPhone((v) => v || nationalPhone(c.phone as string));
      if (typeof c.email === "string") setContactEmail((v) => v || (c.email as string));
      sessionStorage.removeItem("ed_quote_contact");
    } catch {}
    void recordQuoteBehavior("availability_viewed");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromQuote]);

  /* ----- derived booking object ----- */
  const resolved = lines.map((line) => {
    const saved = line.savedId === "size" ? undefined : garage.find((g) => g.id === line.savedId);
    const savedSize = saved ? vehicleIdFromSize(saved.vehicle_size) : undefined;
    const vehicle = saved && savedSize ? savedSize : line.size;
    const typed = [line.year.trim(), line.make.trim(), line.model.trim()].filter(Boolean).join(" ");
    const title = saved ? vName(saved) : typed || sizeLabel(vehicle);
    const base = vehicle && line.service ? PRICING[vehicle][line.service].price : null;
    const addonTotal = line.addons.reduce((sum, id) => sum + (ADDON_PRICES[id] ?? 0), 0);
    const paintTotal = vehicle ? line.paint.reduce((sum, id) => sum + PAINT_UPGRADES[id].prices[vehicle], 0) : 0;
    return { ...line, saved, savedSize, vehicle, typed, title, base, extras: addonTotal + paintTotal };
  });
  const allServicesChosen = resolved.every((line) => !!line.service);
  const allVehiclesReady = resolved.every((line) => !!line.vehicle);
  const priced = allServicesChosen && allVehiclesReady;
  const detailTotal = priced ? resolved.reduce((sum, l) => sum + (l.base ?? 0), 0) : null;
  const extrasTotal = resolved.reduce((sum, l) => sum + l.extras, 0);
  const total = detailTotal !== null ? detailTotal + extrasTotal : null;
  const fromTotal = resolved[0].service ? startingPrice(resolved[0].service) : null;
  const hasVariableAddons = resolved.some((line) => line.addons.some((id) => ADDON_PRICES[id] === null));
  const appointmentMinutes = priced ? Math.max(...resolved.map((l) => PRICING[l.vehicle!][l.service!].minutes)) : null;
  const availabilityKey = resolved.map((l) => `${l.vehicle ?? "?"}:${l.service ?? "?"}`).join("|");
  const addressIssue = addressProblem(address);
  const addressDone = !addressIssue;
  const resumeHasLocation = fromResume && !addressProblem(address);


  useEffect(() => {
    if (!addressDone) return;
    setJourneyLocation({ city: address.city.trim(), state: address.state.trim().toUpperCase(), zip: address.zip.trim() });
  }, [address.street, address.unit, address.city, address.state, address.zip, addressDone, setJourneyLocation]);

  useEffect(() => {
    const first = resolved[0];
    if (!first?.service || !first.vehicle) {
      setBookingResumeHref(null);
      try { sessionStorage.removeItem(BOOKING_DRAFT_KEY); } catch {}
      setJourneySelectedSlot(null);
      return;
    }
    setServiceIntent(first.service);
    setBookingResumeHref("/book?from=resume");
  }, [availabilityKey, resolved[0]?.addons.join(","), resolved[0]?.paint.join(","), setBookingResumeHref]);

  function updateLine(key: number, patch: Partial<BookingLine>) {
    setLines((current) => current.map((line) => (line.key === key ? { ...line, ...patch } : line)));
  }

  /* ----- availability ----- */
  useEffect(() => {
    if (!priced) {
      setSlots(null);
      setStart(null);
      return;
    }
    let cancelled = false;
    setSlots(null);
    setSlotsError(null);
    setStart(null);
    const from = dayKey(new Date());
    const firstTo = addDaysKey(from, 31);
    const secondFrom = addDaysKey(from, 32);
    const secondTo = addDaysKey(from, 62);
    const items = resolved.map((line) => ({ vehicle: line.vehicle, service: line.service }));
    const itemsParam = encodeURIComponent(JSON.stringify(items));

    const loadRange = async (rangeFrom: string, rangeTo: string) => {
      const response = await fetch(`/api/availability?items=${itemsParam}&from=${rangeFrom}&to=${rangeTo}`);
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json.error || "Availability unavailable");
      return (Array.isArray(json.slots) ? json.slots : []) as unknown[];
    };

    Promise.allSettled([loadRange(from, firstTo), loadRange(secondFrom, secondTo)])
      .then((results) => {
        if (cancelled) return;
        const successful = results.filter((result): result is PromiseFulfilledResult<unknown[]> => result.status === "fulfilled");
        if (!successful.length) throw new Error("Availability unavailable");
        const raw = successful.flatMap((result) => result.value);
        const list = raw
          .filter((s): s is string => typeof s === "string")
          .map((s) => new Date(s))
          .filter(isValidDate)
          .sort((a, b) => a.getTime() - b.getTime());
        setSlots(list);
        const rememberedStart = journeySelectedSlot ? list.find((slot) => slot.toISOString() === journeySelectedSlot) ?? null : null;
        if (rememberedStart) {
          setStart(rememberedStart);
          const rememberedDay = dayKey(rememberedStart);
          setDay(rememberedDay);
          setCalendarMonth(monthStartKey(rememberedDay));
          if (fromResume) {
            const resumeStep: StepId = resumeHasLocation ? "info" : "schedule";
            setActive(resumeStep);
            setReached((current) => Math.max(current, STEPS.indexOf(resumeStep)));
          }
        } else {
          if (journeySelectedSlot) setJourneySelectedSlot(null);
          setDay((current) => {
            const nextDay = current && list.some((slot) => dayKey(slot) === current) ? current : list[0] ? dayKey(list[0]) : null;
            if (nextDay) setCalendarMonth(monthStartKey(nextDay));
            return nextDay;
          });
        }
      })
      .catch(() => !cancelled && setSlotsError("We couldn't load open times. Refresh, or text us to book."));
    return () => {
      cancelled = true;
    };
    // availabilityKey captures every vehicle/service choice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availabilityKey, priced, fromResume, journeySelectedSlot, resumeHasLocation, setJourneySelectedSlot]);

  const slotsByDay = useMemo(() => {
    const map = new Map<string, Date[]>();
    (slots ?? []).forEach((s) => {
      const k = dayKey(s);
      if (k) map.set(k, [...(map.get(k) ?? []), s]);
    });
    return map;
  }, [slots]);
  const todayKey = dayKey(new Date());
  const availabilityEndKey = todayKey ? addDaysKey(todayKey, 62) : "";
  const firstCalendarMonth = monthStartKey(todayKey);
  const lastCalendarMonth = monthStartKey(availabilityEndKey);
  const calendarCells = useMemo(() => calendarMonthCells(calendarMonth), [calendarMonth]);
  const daySlots = day ? slotsByDay.get(day) ?? [] : [];
  const canGoPreviousMonth = !!calendarMonth && !!firstCalendarMonth && calendarMonth > firstCalendarMonth;
  const canGoNextMonth = !!calendarMonth && !!lastCalendarMonth && calendarMonth < lastCalendarMonth;

  /* ----- step navigation ----- */
  function scrollToStep(step: StepId) {
    window.setTimeout(() => {
      document.getElementById(`bk-step-${step}`)?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start",
      });
    }, 60);
  }

  // Deep links (quote, homepage) land mid-funnel: bring that step into view once.
  useEffect(() => {
    if (STEPS.indexOf(firstStep) > 0) scrollToStep(firstStep);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (lastActive.current === active) return;
    lastActive.current = active;
    scrollToStep(active);
  }, [active]);

  function goTo(step: StepId) {
    setStepError(null);
    setDrawerOpen(false);
    setActive(step);
    setReached((r) => Math.max(r, STEPS.indexOf(step)));
  }

  function leadSourceValue() {
    return formRef.current ? String(new FormData(formRef.current).get("leadSource") ?? "").trim() : "";
  }

  function validate(step: StepId): { message: string; field?: string } | null {
    switch (step) {
      case "service":
        return allServicesChosen ? null : { message: "Choose a detail to continue." };
      case "car":
        return allVehiclesReady ? null : { message: "Tell us which vehicle so we can price it.", field: "vehicle" };
      case "extras":
        return null;
      case "schedule":
        if (addressIssue) return { message: addressIssue, field: "address" };
        if (!start) return { message: "Pick a time to continue." };
        return null;
      case "info":
        if (!name.trim()) return { message: "Enter your name.", field: "name" };
        if (phone.length !== 10) return { message: "Enter a 10-digit phone number.", field: "phone" };
        if (!signedIn && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) return { message: "Enter a valid email for your confirmation.", field: "email" };
        if (!leadSourceValue()) return { message: "Tell us how you heard about Every Detail.", field: "leadSource" };
        return null;
      case "review":
        return null;
    }
  }

  function advance() {
    const problem = validate(active);
    if (problem) {
      setStepError({ step: active, message: problem.message });
      setBadField(problem.field ?? null);
      setDrawerOpen(false);
      scrollToStep(active);
      return;
    }
    setBadField(null);
    if (active === "review") {
      formRef.current?.requestSubmit();
      return;
    }
    goTo(STEPS[STEPS.indexOf(active) + 1]);
  }

  /* ----- vehicle edits ----- */
  function setSize(line: (typeof resolved)[number], index: number, size: VehicleId, manual: boolean) {
    updateLine(line.key, { size, sizeManual: manual });
    track("vehicle_select", { vehicle: size, location: "book", vehicleNumber: index + 1 });
  }


  function chooseService(line: (typeof resolved)[number], index: number, service: ServiceId) {
    updateLine(line.key, { service, addons: line.addons.filter((addon) => !isAddonIncludedInService(service, addon)) });
    if (index === 0) setServiceIntent(service);
    track("service_select", { service, vehicle: line.vehicle, location: "book", vehicleNumber: index + 1 });
  }

  function addVehicle() {
    if (lines.length >= 2) return;
    const used = new Set(lines.map((line) => line.savedId).filter((id) => id !== "size"));
    const nextSaved = garage.find((vehicle) => !used.has(vehicle.id));
    setLines((current) => [
      ...current,
      { key: nextKey.current++, savedId: nextSaved?.id ?? "size", size: undefined, sizeManual: false, service: "premium", addons: [], paint: [], make: "", model: "", year: "" },
    ]);
    track("booking_add_vehicle", { count: lines.length + 1 });
  }

  /* ----- gift card ----- */
  async function validateGiftCard() {
    const code = giftCardCode.trim();
    if (!code) {
      setGiftCardPreview(null);
      setGiftCardError("Enter a gift card code.");
      return;
    }
    setGiftCardBusy(true);
    setGiftCardError(null);
    try {
      const response = await fetch("/api/gift-cards/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
      const json = await response.json().catch(() => ({}));
      if (!response.ok || !json.ok) throw new Error(json.error || "We couldn't check that gift card.");
      setGiftCardPreview({ codeLast4: String(json.codeLast4), balanceCents: Number(json.balanceCents) });
    } catch (giftError) {
      setGiftCardPreview(null);
      setGiftCardError(giftError instanceof Error ? giftError.message : "We couldn't check that gift card.");
    } finally {
      setGiftCardBusy(false);
    }
  }

  /* ----- submit ----- */
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    for (const step of STEPS) {
      const problem = validate(step);
      if (problem) {
        setBadField(problem.field ?? null);
        goTo(step);
        setStepError({ step, message: problem.message });
        return;
      }
    }
    if (!start) return;
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) ?? "").trim();

    // The API takes size + service per vehicle; the make/model the customer typed rides along in the notes.
    const typedVehicles = resolved
      .map((line, index) => (!line.saved && line.typed ? `Vehicle ${index + 1}: ${line.typed}` : ""))
      .filter(Boolean);
    const notes = [typedVehicles.join("\n"), get("service_notes")].filter(Boolean).join("\n\n");

    setSending(true);
    setSubmitError(null);
    setBadField(null);
    void recordQuoteBehavior("booking_started", { selectedSlot: start.toISOString() });

    const res = await fetch("/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicles: resolved.map((line) => ({ service: line.service, vehicle: line.vehicle, vehicleId: line.saved?.id ?? null, addons: line.addons, paint: line.paint })),
        start: start.toISOString(),
        name: name.trim(),
        phone,
        email: signedIn ? email ?? "" : contactEmail.trim(),
        address: fullAddress(address),
        notes,
        leadSource: get("leadSource"),
        leadSourceDetail: get("leadSourceDetail"),
        giftCardCode: giftCardPreview ? giftCardCode.trim().toUpperCase() : null,
        company: get("company"),
        turnstileToken: get("turnstileToken"),
      }),
    }).catch(() => null);
    const json = res ? await res.json().catch(() => ({})) : {};
    setSending(false);

    const confirmed =
      res?.ok === true && json.ok === true && typeof json.jobId === "string" && json.jobId.length > 0 &&
      typeof json.start === "string" && !Number.isNaN(Date.parse(json.start)) &&
      Number.isFinite(Number(json.price)) && Number.isFinite(Number(json.minutes)) &&
      Array.isArray(json.vehicles) && json.vehicles.length > 0;

    if (confirmed) {
      void recordQuoteBehavior("booking_completed", { selectedSlot: start.toISOString() });
      track("booking_submit", { vehicleCount: lines.length, services: lines.map((line) => line.service).join(",") });
      setBookingResumeHref(null);
      try { sessionStorage.removeItem(BOOKING_DRAFT_KEY); } catch {}
      setBooked({
        jobId: json.jobId,
        vehicles: json.vehicles,
        lines: resolved.map((line) => ({ service: line.service!, vehicle: line.vehicle!, title: line.title, addons: [...line.addons] })),
        start: json.start,
        price: Number(json.price),
        minutes: Number(json.minutes),
        confirmationEmailSent: json.confirmationEmailSent === true,
        address: fullAddress(address),
        summary: resolved.map((l) => `${l.service ? services[l.service].name : ""} · ${l.title}`).join(" + "),
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (res?.ok && json.ok) {
      setSubmitError("We couldn't verify that your booking was created. Nothing has been confirmed. Please try again or text us.");
      return;
    }
    const message = json.error ?? "No connection. Try again, or text us.";
    if (json.code === "slot_taken") {
      setSlots((s) => (s ?? []).filter((x) => x.getTime() !== start.getTime()));
      setStart(null);
      setJourneySelectedSlot(null);
      goTo("schedule");
      setStepError({ step: "schedule", message });
      return;
    }
    const field: string | null = json.field ?? null;
    setBadField(field);
    const back: StepId | null =
      field === "name" || field === "phone" || field === "email" || field === "leadSource" ? "info"
      : field === "address" ? "schedule"
      : field === "vehicle" ? "car"
      : null;
    if (back) {
      goTo(back);
      setStepError({ step: back, message });
    } else {
      setSubmitError(message);
    }
  }

  async function addPostBookingAddon(addon: AddonId) {
    if (!booked || booked.lines.length !== 1 || postBookingAddonBusy || postBookingAddonAdded) return;
    setPostBookingAddonBusy(true);
    setPostBookingAddonError(null);
    try {
      const response = await fetch("/api/book/addon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: booked.jobId,
          addon,
          email: signedIn ? email ?? "" : contactEmail.trim(),
          phone,
        }),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok || !json.ok) throw new Error(json.error || "We couldn't add that extra. Please text us and we'll take care of it.");
      setBooked((current) => {
        if (!current) return current;
        const updatedLines = current.lines.map((line, index) => index === 0 ? { ...line, addons: [...line.addons, addon] } : line);
        const updatedVehicles = current.vehicles.map((line, index) => index === 0 ? { ...line, price: Number(json.vehiclePrice ?? line.price) } : line);
        return { ...current, lines: updatedLines, vehicles: updatedVehicles, price: Number(json.jobPrice ?? current.price) };
      });
      setPostBookingAddonAdded(addon);
      track("post_booking_addon", { addon, service: booked.lines[0].service, price: ADDON_PRICES[addon] ?? undefined });
    } catch (error) {
      setPostBookingAddonError(error instanceof Error ? error.message : "We couldn't add that extra. Please text us and we'll take care of it.");
    } finally {
      setPostBookingAddonBusy(false);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Confirmation                                                        */
  /* ------------------------------------------------------------------ */

  if (booked) {
    const d = new Date(booked.start);
    const end = new Date(d.getTime() + booked.minutes * 60_000);
    const confirmationLine = booked.lines.length === 1 ? booked.lines[0] : null;
    const confirmationAddon = confirmationLine ? confirmationAddonFor(confirmationLine.service, confirmationLine.addons) : null;
    const stamp = (x: Date) => x.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const esc = (s: string) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Every Detail//Booking//EN", "BEGIN:VEVENT",
      `UID:${stamp(d)}-${Math.abs(booked.address.length * 7919)}@everydetail.co`,
      `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(d)}`, `DTEND:${stamp(end)}`,
      `SUMMARY:${esc(`Every Detail · ${booked.vehicles.map((v) => v.service).join(" + ")}`)}`,
      `LOCATION:${esc(booked.address)}`,
      `DESCRIPTION:${esc(`${booked.summary}\nQuestions? Text ${site.phone.display}`)}`,
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");

    return (
      <div className="bk-shell">
        <BookingTopBar />
        <div id="booking-main" className="bk-done" role="status">
          <p className="bk-kicker"><span className="bk-dot" aria-hidden="true" /> Booking confirmed</p>
          <h1 className="bk-done-title">You&rsquo;re on<br />the books.</h1>
          <p className="bk-done-when">{fmtDay(d, { weekday: "long", month: "short", day: "numeric" })} · {fmtTime(d)}</p>
          <div className="bk-done-lines">
            {booked.vehicles.map((line, index) => (
              <p key={`${line.vehicle}-${index}`}>{line.service} · {line.vehicle}<span>{usd(line.price)}</span></p>
            ))}
            <p className="bk-done-total">Total<span>{usd(booked.price)}</span></p>
            <small>About {duration(booked.minutes)} on site · {booked.address}</small>
          </div>
          <div className="bk-done-actions">
            <a className="bk-btn bk-btn-ink" href={`data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`} download="every-detail-appointment.ics">Add to calendar</a>
            <a className="bk-btn bk-btn-line" href={site.phone.sms}>Text us ↗</a>
          </div>
          <p className="bk-done-note">
            {booked.confirmationEmailSent
              ? `A confirmation email is on its way to ${signedIn ? email || "your inbox" : contactEmail || "your inbox"}.`
              : "Your appointment is confirmed. We couldn't verify email delivery, so save these details or text us for a copy."}
          </p>

          {(confirmationAddon || postBookingAddonAdded) && (
            <section className={`bk-done-addon ${postBookingAddonAdded ? "is-added" : ""}`} aria-live="polite">
              <p className="bk-done-addon-kicker">While we&rsquo;re there</p>
              {postBookingAddonAdded ? (
                <>
                  <h2>Added to your appointment.</h2>
                  <p><strong>{ADDON_LABELS[postBookingAddonAdded]}</strong> is on the job. Your updated total is <strong>{usd(booked.price)}</strong>.</p>
                </>
              ) : confirmationAddon ? (
                <>
                  <h2>Anything else you want us to handle?</h2>
                  <p className="bk-done-addon-intro">Since the crew will already be at your driveway, this is easy to add to the same appointment.</p>
                  <div className="bk-done-addon-offer">
                    <div>
                      <strong>{ADDON_LABELS[confirmationAddon]}</strong>
                      <span>{ADDON_DESC[confirmationAddon]}</span>
                    </div>
                    <em>+{usd(ADDON_PRICES[confirmationAddon] ?? 0)}</em>
                    <button type="button" disabled={postBookingAddonBusy} onClick={() => void addPostBookingAddon(confirmationAddon)}>
                      {postBookingAddonBusy ? "Adding…" : "Add to my appointment"}
                    </button>
                  </div>
                  {postBookingAddonError && <p className="bk-error" role="alert">{postBookingAddonError}</p>}
                </>
              ) : null}
            </section>
          )}

          <section className="bk-done-addon bk-done-next">
            <p className="bk-done-addon-kicker">After today</p>
            <h2>Keep it this clean.</h2>
            <p>Detail+ brings the crew back every 2, 4 or 6 weeks at a flat member rate, so the car never slides back into a reset.</p>
            <div className="bk-done-actions">
              <Link className="bk-btn bk-btn-ink" href="/detailplus#club-builder" onClick={() => track("detailplus_start", { location: "booking_confirmation" })}>Build my Detail+ plan ↗</Link>
              <Link className="bk-btn bk-btn-line" href="/gift-cards">Give a detail as a gift ↗</Link>
            </div>
          </section>

          <div className="bk-done-prep">
            <h2>What to do before we arrive</h2>
            <ul>
              <li>Remove personal valuables</li>
              <li>Make sure we can access the vehicle</li>
              <li>That&rsquo;s basically it</li>
            </ul>
            <p className="bk-done-line">We&rsquo;ll handle the dirty part.</p>
          </div>

          <p className="bk-done-small">
            Need to change it? {signedIn ? <>Manage it from <Link href="/account">your account</Link>, or text</> : "Text or call"}{" "}
            <a href={site.phone.sms}>{site.phone.display}</a>.
            {!signedIn && <> <Link href="/account/sign-in?mode=signup">Create an account</Link> to save your vehicles and book faster next time.</>}
          </p>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Render helpers (plain functions, not components, so inputs keep focus) */
  /* ------------------------------------------------------------------ */

  const activeIndex = STEPS.indexOf(active);

  function doneSummary(step: StepId): string {
    switch (step) {
      case "service": return resolved.map((l) => (l.service ? services[l.service].name : "Choose a detail")).join(" + ");
      case "car": return resolved.map((l) => l.title || "Choose a vehicle").join(" + ");
      case "extras": {
        const names = resolved.flatMap((l) => [...l.addons.map((id) => ADDON_LABELS[id]), ...l.paint.map((id) => PAINT_UPGRADES[id].name)]);
        return names.length ? names.join(", ") : "No extras";
      }
      case "schedule": return [start ? `${fmtDay(start, { weekday: "short", month: "short", day: "numeric" })} · ${fmtTime(start)}` : "Pick a time", address.street].filter(Boolean).join(" · ");
      case "info": return [name, prettyPhone(phone)].filter(Boolean).join(" · ") || "Your info";
      case "review": return "";
    }
  }

  function renderStep(step: StepId, number: string, title: ReactNode, content: ReactNode) {
    const index = STEPS.indexOf(step);
    if (index > reached) return null;
    const isActive = step === active;
    return (
      <div id={`bk-step-${step}`} className={`bk-step ${isActive ? "is-active" : "is-done"}`}>
        {!isActive && (
          <button type="button" className="bk-step-row" onClick={() => goTo(step)}>
            <b>{number}</b>
            <span className="bk-step-row-label">{STEP_LABEL[step]}</span>
            <span className="bk-step-row-value">{doneSummary(step)}</span>
            <span className="bk-step-row-edit">Change</span>
          </button>
        )}
        <div className="bk-step-body" hidden={!isActive}>
          <p className="bk-step-num">{number} / {STEP_LABEL[step]}</p>
          <h2 className="bk-q">{title}</h2>
          {content}
          {stepError?.step === step && <p className="bk-error" role="alert">{stepError.message}</p>}
        </div>
      </div>
    );
  }

  function continueLabel(step: StepId) {
    if (sending) return "Booking…";
    switch (step) {
      case "service": return allServicesChosen ? "Continue →" : "Pick a service to continue";
      case "extras": return resolved.some((l) => l.addons.length || l.paint.length) ? "Continue →" : "No thanks, continue →";
      case "info": return "Review booking →";
      case "review": return "Confirm booking";
      default: return "Continue →";
    }
  }

  function renderSizeGrid(line: (typeof resolved)[number], index: number) {
    return (
      <div className="bk-size-fallback" role="radiogroup" aria-label={`Vehicle ${index + 1} type`}>
        <p className="bk-label">Choose the closest vehicle type</p>
        <div className="bk-size-fallback-grid">
          {vehicles.map((v) => (
            <button
              key={v.id}
              type="button"
              role="radio"
              aria-checked={line.size === v.id}
              className={`bk-size-text ${line.size === v.id ? "is-on" : ""}`}
              onClick={() => {
                setSize(line, index, v.id, true);
                setGridOpen((o) => ({ ...o, [line.key]: false }));
              }}
            >
              <strong>{v.label}</strong>
              <span>{v.hint}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  function renderVehicleEditor(line: (typeof resolved)[number], index: number) {
    const usedSaved = new Set(lines.filter((o) => o.key !== line.key).map((o) => o.savedId));
    const typing = line.savedId === "size" || (line.saved && !line.savedSize);
    const query = vehicleSearch[line.key] ?? [line.make, line.model].filter(Boolean).join(" ");
    const matches = vehicleMatches(query);
    const showResults = typing && !line.make && !line.model && query.trim().length >= 2;
    const showGrid = !!gridOpen[line.key];

    const clearVehicle = () => {
      updateLine(line.key, { make: "", model: "", year: "", size: undefined, sizeManual: false, savedId: "size" });
      setVehicleSearch((current) => ({ ...current, [line.key]: "" }));
      setGridOpen((current) => ({ ...current, [line.key]: false }));
    };

    return (
      <div key={line.key} className="bk-vehicle">
        {lines.length > 1 && (
          <div className="bk-vehicle-head">
            <p>Vehicle {index + 1}</p>
            {index > 0 && <button type="button" onClick={() => setLines((c) => c.filter((l) => l.key !== line.key))}>Remove</button>}
          </div>
        )}

        {index > 0 && (
          <div className="bk-chips" role="radiogroup" aria-label={`Vehicle ${index + 1} detail`}>
            {PACKAGE_ORDER.map((id) => (
              <button key={id} type="button" role="radio" aria-checked={line.service === id} className={`bk-chip ${line.service === id ? "is-on" : ""}`} onClick={() => chooseService(line, index, id)}>
                {services[id].name}
              </button>
            ))}
          </div>
        )}

        {garage.length > 0 && (
          <div className="bk-saved">
            {garage.map((g) => {
              const taken = usedSaved.has(g.id);
              const size = vehicleIdFromSize(g.vehicle_size);
              return (
                <button
                  key={g.id}
                  type="button"
                  disabled={taken}
                  aria-pressed={line.savedId === g.id}
                  className={`bk-saved-opt ${line.savedId === g.id ? "is-on" : ""}`}
                  onClick={() => {
                    updateLine(line.key, { savedId: g.id, size, sizeManual: !!size, make: "", model: "", year: "" });
                    setVehicleSearch((current) => ({ ...current, [line.key]: "" }));
                  }}
                >
                  <strong>{vName(g)}</strong>
                  <span>{[g.color, size ? sizeLabel(size) : "Size not set"].filter(Boolean).join(" · ")}</span>
                </button>
              );
            })}
            <button type="button" aria-pressed={line.savedId === "size"} className={`bk-saved-opt ${line.savedId === "size" ? "is-on" : ""}`} onClick={clearVehicle}>
              <strong>A different vehicle</strong>
              <span>Search make or model</span>
            </button>
          </div>
        )}

        {typing && line.make && line.model && line.size && !showGrid ? (
          <div className="quote-rec-selected bk-vehicle-selected">
            <div>
              <strong>{line.make} {line.model}</strong>
              <span>{sizeLabel(line.size)}</span>
            </div>
            <button type="button" onClick={() => index === 0 ? openSiteVehiclePicker() : clearVehicle()}>Change</button>
            <label className="bk-year-inline">
              <span>Year <em>optional</em></span>
              <input
                className="bk-input"
                inputMode="numeric"
                maxLength={4}
                value={line.year}
                placeholder="2025"
                autoComplete="off"
                onChange={(e) => updateLine(line.key, { year: e.target.value.replace(/\D/g, "").slice(0, 4) })}
              />
            </label>
          </div>
        ) : typing && line.size && !line.make && !line.model && !showGrid ? (
          <div className="quote-rec-selected bk-vehicle-selected">
            <div>
              <strong>{sizeLabel(line.size)}</strong>
              <span>Pricing class</span>
            </div>
            <button type="button" onClick={clearVehicle}>Search exact vehicle</button>
          </div>
        ) : typing && !showGrid ? (
          <>
            <div className="quote-rec-search-wrap bk-vehicle-search">
              <input
                className="field quote-rec-search"
                value={query}
                onChange={(e) => {
                  const value = e.target.value;
                  setVehicleSearch((current) => ({ ...current, [line.key]: value }));
                  if (line.make || line.model || line.size) updateLine(line.key, { make: "", model: "", size: undefined, sizeManual: false });
                }}
                placeholder="Search Ram 2500, RAV4, Model Y..."
                autoComplete="off"
                aria-label={`Search vehicle ${index + 1} make or model`}
              />
              {showResults && (
                <div className="quote-rec-search-results">
                  {matches.length ? matches.map((item, resultIndex) => (
                    <button
                      key={`${item.make}-${item.model}-${resultIndex}`}
                      type="button"
                      onClick={() => {
                        const selectedYear = yearFromVehicleQuery(query) || line.year;
                        updateLine(line.key, {
                          savedId: "size",
                          make: item.make,
                          model: item.model,
                          year: selectedYear,
                          size: vehicleClassForYear(item, selectedYear),
                          sizeManual: false,
                        });
                        setVehicleSearch((current) => ({ ...current, [line.key]: `${item.make} ${item.model}` }));
                        setStepError(null);
                        track("vehicle_select", { vehicle: item.vehicle, location: "book_search", vehicleNumber: index + 1 });
                      }}
                    >
                      <span><strong>{item.make}</strong> {item.model}</span>
                      <small>{sizeLabel(item.vehicle)}</small>
                    </button>
                  )) : <p>No matches. Try another make or model.</p>}
                </div>
              )}
            </div>
            <button type="button" className="bk-link bk-type-fallback" onClick={() => setGridOpen((o) => ({ ...o, [line.key]: true }))}>Can&rsquo;t find it? Choose the closest vehicle type</button>
          </>
        ) : null}

        {!typing && line.vehicle && (
          <div className="quote-rec-selected bk-vehicle-selected">
            <div>
              <strong>{line.saved ? vName(line.saved) : sizeLabel(line.vehicle)}</strong>
              <span>{sizeLabel(line.vehicle)}</span>
            </div>
            <button type="button" onClick={clearVehicle}>Use a different vehicle</button>
          </div>
        )}

        {showGrid && (
          <>
            {renderSizeGrid(line, index)}
            <button type="button" className="bk-link" onClick={() => setGridOpen((o) => ({ ...o, [line.key]: false }))}>← Back to vehicle search</button>
          </>
        )}
      </div>
    );
  }

  function renderAddon(line: (typeof resolved)[number], id: AddonId, recommended = false) {
    const on = line.addons.includes(id);
    const price = ADDON_PRICES[id];
    return (
      <button
        key={id}
        type="button"
        aria-pressed={on}
        className={`bk-addon ${recommended ? "is-recommended" : ""} ${on ? "is-on" : ""}`}
        onClick={() => {
          updateLine(line.key, { addons: on ? line.addons.filter((a) => a !== id) : [...line.addons, id] });
          track("addon_select", { addon: id, action: on ? "remove" : "add", service: line.service ?? undefined, location: "booking" });
        }}
      >
        {recommended && <small className="bk-addon-rec">Recommended</small>}
        <strong>{ADDON_LABELS[id]}</strong>
        <span>{ADDON_DESC[id]}</span>
        <em>{price === null ? "Price confirmed on site" : `+${usd(price)}`}</em>
        <b>{on ? "✓ Added" : "+ Add"}</b>
      </button>
    );
  }

  function renderExtras(line: (typeof resolved)[number], index: number) {
    if (!line.service) return null;
    const available = purchasableAddonIds(line.service);
    const recommended = (RECOMMENDED_ADDONS[line.service] ?? []).filter((id) => available.includes(id));
    const featured = Array.from(new Set([...recommended, ...line.addons.filter((id) => available.includes(id))]));
    const optionalFeatured = recommended.length === 0 && available.length <= 3 ? available : featured;
    const more = available.filter((id) => !optionalFeatured.includes(id));
    const paintChoices = index === 0 ? Array.from(new Set([...initialPaint, ...line.paint])) : line.paint;
    return (
      <div key={line.key} className="bk-extras">
        {lines.length > 1 && <p className="bk-extras-for">Vehicle {index + 1} · {services[line.service].name} · {line.title}</p>}
        {line.service === "premium" && <p className="bk-note">Protective sealant is already included in Premium.</p>}
        {line.service === "factoryReset" && <p className="bk-note">Factory Reset already includes extraction, pet hair, clay, sealant and trim restoration.</p>}
        {recommended.length > 0 ? (
          <div className="bk-recommend-head">
            <p className="bk-label">Worth adding</p>
            <p>{line.service === "maintenance" ? "Our go-to add-on with Maintenance." : "Recommended with Premium."}</p>
          </div>
        ) : (
          <div className="bk-recommend-head"><p className="bk-label">Optional extras</p></div>
        )}
        {optionalFeatured.length > 0 && <div className="bk-addons bk-addons-featured">{optionalFeatured.map((id) => renderAddon(line, id, recommended.includes(id)))}</div>}
        {more.length > 0 && (
          <>
            <button type="button" className="bk-link bk-see-all" aria-expanded={!!moreOpen[line.key]} onClick={() => setMoreOpen((o) => ({ ...o, [line.key]: !o[line.key] }))}>
              {moreOpen[line.key] ? "Hide other extras ↑" : `See all extras ↓`}
            </button>
            {moreOpen[line.key] && <div className="bk-addons bk-reveal">{more.map((id) => renderAddon(line, id))}</div>}
          </>
        )}
        {paintChoices.length > 0 && (
          <div className="bk-paint">
            <p className="bk-label">From your quote · scheduled separately</p>
            <div className="bk-addons">
              {paintChoices.map((id) => {
                const on = line.paint.includes(id);
                return (
                  <button key={id} type="button" aria-pressed={on} className={`bk-addon ${on ? "is-on" : ""}`} onClick={() => updateLine(line.key, { paint: on ? line.paint.filter((p) => p !== id) : [...line.paint, id] })}>
                    <strong>{PAINT_UPGRADES[id].name}</strong>
                    <span>{PAINT_UPGRADES[id].tag}</span>
                    <em>{line.vehicle ? `+${usd(PAINT_UPGRADES[id].prices[line.vehicle])}` : "Priced by vehicle"}</em>
                    <b>{on ? "✓ Added" : "+ Add"}</b>
                  </button>
                );
              })}
            </div>
            <p className="bk-note">Paint work can need its own appointment. We&rsquo;ll confirm that schedule with you.</p>
          </div>
        )}
      </div>
    );
  }

  function renderSummary() {
    return (
      <div className="bk-sum">
        <p className="bk-sum-title">Your detail</p>
        {resolved.map((l, i) => (
          <div key={l.key} className="bk-sum-block">
            {resolved.length > 1 && <p className="bk-label">Vehicle {i + 1}</p>}
            <strong>{l.service ? services[l.service].name : "Choose a detail"}</strong>
            <span>{l.title || "Vehicle not set"}</span>
          </div>
        ))}
        {start && (
          <div className="bk-sum-block">
            <strong>{fmtDay(start, { weekday: "long", month: "short", day: "numeric" })}</strong>
            <span>{fmtTime(start)}</span>
          </div>
        )}
        {address.street && address.city && (
          <div className="bk-sum-block">
            <strong>{[address.street, address.unit].filter(Boolean).join(", ")}</strong>
            <span>{address.city}, {address.state.toUpperCase()}</span>
          </div>
        )}
        <div className="bk-sum-money">
          {total !== null ? (
            <>
              <p><span>Detail</span><span>{usd(detailTotal)}</span></p>
              {extrasTotal > 0 && <p><span>Add-ons</span><span>{usd(extrasTotal)}</span></p>}
              <p className="bk-sum-total" key={total}><span>Est. total</span><span>{usd(total)}{hasVariableAddons ? "+" : ""}</span></p>
            </>
          ) : (
            <p className="bk-sum-total"><span>{fromTotal ? "From" : "Total"}</span><span>{fromTotal ? usd(fromTotal) : "Not set"}</span></p>
          )}
          {giftCardPreview && <p className="bk-sum-gift"><span>Gift card •••• {giftCardPreview.codeLast4}</span><span>{usd(giftCardPreview.balanceCents / 100)} avail.</span></p>}
          {appointmentMinutes && <small>About {duration(appointmentMinutes)} on site · Pay after the detail</small>}
        </div>
      </div>
    );
  }

  const primaryLine = resolved[0];
  const barPrice = total !== null ? `${usd(total)}${hasVariableAddons ? "+" : ""}` : fromTotal ? `From ${usd(fromTotal)}` : "";
  const barName = primaryLine.service ? services[primaryLine.service].name : "Choose a detail";
  const servicePicked = !!primaryLine.service;

  /* ------------------------------------------------------------------ */
  /* Page                                                                */
  /* ------------------------------------------------------------------ */

  return (
    <div className="bk-shell">
      <BookingTopBar stage={STAGE_OF[active]} />

      <div className="bk-intro">
        <div>
          <h1 className="bk-intro-title">Book your detail.</h1>
          <p className="bk-intro-sub">We bring the shop to your driveway.</p>
          <p className="bk-intro-facts">Power + water included <i>•</i> Mobile service <i>•</i> Decatur + Atlanta</p>
          {!signedIn && (
            <p className="bk-intro-signin">Booked with us before? <Link href="/account/sign-in?next=/book">Sign in</Link> to use your saved vehicles.</p>
          )}
          {fromQuote && <p className="bk-intro-quote"><span className="bk-dot" aria-hidden="true" /> Your quote is loaded. Pick a place and time.</p>}
        </div>
      </div>

      <form id="booking-main" ref={formRef} noValidate onSubmit={onSubmit} className="bk-layout">
        <div className="bk-flow">
          <div className="bk-security-fields">
            <Honeypot />
            <TurnstileField action="booking" />
          </div>
          {renderStep("service", "01", "What does your car need?", (
            <div className="bk-pkgs" role="radiogroup" aria-label="Choose your detail">
              {PACKAGE_ORDER.map((id, i) => {
                const copy = PACKAGE_COPY[id];
                const on = primaryLine.service === id;
                const price = primaryLine.vehicle ? PRICING[primaryLine.vehicle][id].price : null;
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    className={`bk-pkg ${on ? "is-on" : ""}`}
                    onClick={() => {
                      const firstSelection = !primaryLine.service;
                      chooseService(primaryLine, 0, id);
                      if (firstSelection) window.setTimeout(() => goTo("car"), 240);
                    }}
                  >
                    {on && <span className="bk-pkg-tab">Selected</span>}
                    <span className="bk-pkg-top">
                      <span className="bk-pkg-no">0{i + 1}</span>
                      {copy.badge && <span className="bk-pkg-badge">{copy.badge}</span>}
                    </span>
                    <span className="bk-label">{copy.label}</span>
                    <span className="bk-pkg-name">{services[id].name}</span>
                    <span className="bk-pkg-points">{copy.points.map((p) => <span key={p}>{p}</span>)}</span>
                    <span className="bk-pkg-price">
                      {price ? <>{usd(price)} <small>for your {sizeLabel(primaryLine.vehicle).toLowerCase()}</small></> : <>From {usd(startingPrice(id))}</>}
                    </span>
                    <span className="bk-pkg-cta">{on ? "✓ Chosen" : `Choose ${services[id].name}`}</span>
                  </button>
                );
              })}
            </div>
          ))}

          {renderStep("car", "02", "What are we working with?", (
            <>
              {resolved.map((line, index) => renderVehicleEditor(line, index))}
              {lines.length < 2 && (
                <button type="button" className="bk-link bk-add" onClick={addVehicle}>Booking two cars in one visit? + Add a second vehicle</button>
              )}
            </>
          ))}

          {renderStep("extras", "03", "Worth adding?", (
            <>{resolved.map((line, index) => renderExtras(line, index))}</>
          ))}

          {renderStep("schedule", "04", "Where should we meet you?", (
            <>
              <div className="bk-address">
                <label className="bk-field bk-field-wide">
                  <span>Street address</span>
                  <input className={`bk-input bk-input-xl ${badField === "address" && !/\d/.test(address.street) ? "is-bad" : ""}`} name="address_street" autoComplete="address-line1" placeholder="123 Main St" value={address.street} onChange={(e) => setAddress((a) => ({ ...a, street: e.target.value }))} />
                </label>
                <label className="bk-field">
                  <span>Apt / Unit <em>optional</em></span>
                  <input className="bk-input" name="address_unit" autoComplete="address-line2" value={address.unit} onChange={(e) => setAddress((a) => ({ ...a, unit: e.target.value }))} />
                </label>
                <label className="bk-field">
                  <span>City</span>
                  <input className="bk-input" name="address_city" autoComplete="address-level2" placeholder="Decatur" value={address.city} onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))} />
                </label>
                <label className="bk-field bk-field-sm">
                  <span>State</span>
                  <input className="bk-input" name="address_state" autoComplete="address-level1" value={address.state} onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))} />
                </label>
                <label className="bk-field bk-field-sm">
                  <span>ZIP</span>
                  <input className="bk-input" name="address_zip" inputMode="numeric" autoComplete="postal-code" placeholder="30030" value={address.zip} onChange={(e) => setAddress((a) => ({ ...a, zip: e.target.value }))} />
                </label>
                <input type="hidden" name="address" value={fullAddress(address)} />
              </div>

              {addressDone ? (
                <p className="bk-yep bk-reveal" aria-live="polite">
                  <b>✓</b> {coverageMessage(address.city)}
                </p>
              ) : null}

              <div className={`bk-time ${addressDone ? "" : "is-waiting"}`} id="booking-time-picker">
                <h3 className="bk-q bk-q-sm">Pick your time.</h3>
                {!addressDone && <p className="bk-note">Add your address and open times appear here.</p>}

                {addressDone && inClass && (
                  <div className="bk-school">
                    <span className="bk-dot" aria-hidden="true" />
                    <div>
                      <strong>School-day hours.</strong>
                      <p>Our student team is typically in class during these hours, so weekday appointments start after school. You can still book online anytime.</p>
                    </div>
                  </div>
                )}

                {addressDone && (
                  !priced ? (
                    <p className="bk-note">Choose your detail and vehicle to see open times.</p>
                  ) : slotsError ? (
                    <p className="bk-error">{slotsError}</p>
                  ) : slots === null ? (
                    <div className="bk-loading" aria-live="polite" aria-label="Checking the schedule"><span /><span /><span /><span /></div>
                  ) : slots.length === 0 ? (
                    <p className="bk-note">No open times in the next two months for this appointment. <a href={site.phone.sms}>Text us</a> and we&rsquo;ll find one.</p>
                  ) : (
                    <>
                      <div className="bk-calendar" aria-label="Appointment calendar">
                        <div className="bk-calendar-head">
                          <button type="button" onClick={() => setCalendarMonth((month) => addMonthsKey(month, -1))} disabled={!canGoPreviousMonth} aria-label="Previous month">←</button>
                          <h4>{calendarMonth ? utcDayLabel(calendarMonth, { month: "long", year: "numeric" }) : "Availability"}</h4>
                          <button type="button" onClick={() => setCalendarMonth((month) => addMonthsKey(month, 1))} disabled={!canGoNextMonth} aria-label="Next month">→</button>
                        </div>
                        <div className="bk-calendar-weekdays" aria-hidden="true">
                          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((label) => <span key={label}>{label}</span>)}
                        </div>
                        <div className="bk-calendar-grid" role="radiogroup" aria-label="Appointment date">
                          {calendarCells.map(({ key, inMonth }) => {
                            const count = slotsByDay.get(key)?.length ?? 0;
                            const on = day === key;
                            const inWindow = !!todayKey && !!availabilityEndKey && key >= todayKey && key <= availabilityEndKey;
                            const available = inMonth && inWindow && count > 0;
                            const isToday = key === todayKey;
                            return (
                              <button
                                key={key}
                                type="button"
                                role="radio"
                                aria-checked={on}
                                disabled={!available}
                                className={`bk-cal-day ${on ? "is-on" : ""} ${!inMonth ? "is-outside" : ""}`}
                                onClick={() => { setDay(key); setStart(null); }}
                                aria-label={`${utcDayLabel(key, { weekday: "long", month: "long", day: "numeric" })}, ${available ? `${count} ${count === 1 ? "time" : "times"} available` : "unavailable"}`}
                              >
                                <span className="bk-cal-num">{utcDayLabel(key, { day: "numeric" })}</span>
                                {isToday && inMonth && <span className="bk-cal-today">Today</span>}
                                {available && <span className="bk-cal-avail">{count} {count === 1 ? "time" : "times"}</span>}
                              </button>
                            );
                          })}
                        </div>
                        <p className="bk-calendar-key"><span /> Open appointments · Select a date to see times</p>
                      </div>
                      {day && (
                        <div className="bk-slots bk-reveal" key={day}>
                          <p className="bk-slots-day">{dateFromDayKey(day) ? utcDayLabel(day, { weekday: "long", month: "long", day: "numeric" }) : ""}</p>
                          <div className="bk-pills" role="radiogroup" aria-label="Start time">
                            {daySlots.map((s) => {
                              const on = start?.getTime() === s.getTime();
                              return (
                                <button key={s.toISOString()} type="button" role="radio" aria-checked={on} className={`bk-pill ${on ? "is-on" : ""}`} onClick={() => { setStart(s); setJourneySelectedSlot(s.toISOString()); setStepError(null); void recordQuoteBehavior("slot_selected", { selectedSlot: s.toISOString() }); }}>
                                  {fmtTime(s)}
                                </button>
                              );
                            })}
                          </div>
                          <p className="bk-tz">Arrival times · Eastern</p>
                        </div>
                      )}
                    </>
                  )
                )}
              </div>
            </>
          ))}

          {renderStep("info", "05", "Almost yours.", (
            <div className="bk-info">
              <label className="bk-field bk-field-wide">
                <span>Name</span>
                <input className={`bk-input bk-input-xl ${badField === "name" ? "is-bad" : ""}`} name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label className="bk-field">
                <span>Phone</span>
                <input className={`bk-input bk-input-xl ${badField === "phone" ? "is-bad" : ""}`} name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" value={phone} onChange={(e) => setPhone(nationalPhone(e.target.value))} />
              </label>
              {signedIn ? (
                <p className="bk-note bk-field">Confirmation goes to <b>{email}</b>.<input type="hidden" name="email" value={email ?? ""} /></p>
              ) : (
                <label className="bk-field">
                  <span>Email</span>
                  <input className={`bk-input bk-input-xl ${badField === "email" ? "is-bad" : ""}`} name="email" type="email" autoComplete="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                </label>
              )}
              <div className="bk-field-wide bk-notes">
                <AutofillSafeNotes label="Anything we should know?" name="service_notes" placeholder="Gate code, pet hair, stains, parking notes…" />
              </div>
              <div className="bk-field-wide bk-source">
                <LeadSourceField error={badField === "leadSource"} />
              </div>
            </div>
          ))}

          {renderStep("review", "06", "Look good?", (
            <div className="bk-review">
              <div className="bk-receipt">
                {resolved.map((l, i) => (
                  <div key={l.key} className="bk-receipt-block">
                    <strong>{l.service ? services[l.service].name : ""}</strong>
                    <p>{l.saved ? vName(l.saved) : l.typed || sizeLabel(l.vehicle)}</p>
                    {(l.typed || l.saved) && <p>{sizeLabel(l.vehicle)}</p>}
                    {resolved.length > 1 && <span className="bk-label">Vehicle {i + 1}</span>}
                  </div>
                ))}
                {start && (
                  <div className="bk-receipt-block">
                    <strong>{fmtDay(start, { weekday: "long", month: "long", day: "numeric" })}</strong>
                    <p>{fmtTime(start)}</p>
                  </div>
                )}
                <div className="bk-receipt-block">
                  <strong>{[address.street, address.unit].filter(Boolean).join(", ")}</strong>
                  <p>{address.city}, {address.state.toUpperCase()} {address.zip}</p>
                </div>
                <div className="bk-receipt-lines">
                  {resolved.map((l) => (
                    <div key={l.key}>
                      <p><span>{l.service ? services[l.service].name : ""}{resolved.length > 1 ? ` · ${l.title}` : ""}</span><span>{usd(l.base)}</span></p>
                      {l.addons.map((id) => <p key={id} className="is-sub"><span>+ {ADDON_LABELS[id]}</span><span>{ADDON_PRICES[id] === null ? "TBD" : usd(ADDON_PRICES[id])}</span></p>)}
                      {l.paint.map((id) => <p key={id} className="is-sub"><span>+ {PAINT_UPGRADES[id].name}</span><span>{l.vehicle ? usd(PAINT_UPGRADES[id].prices[l.vehicle]) : "TBD"}</span></p>)}
                    </div>
                  ))}
                  <p className="bk-receipt-total"><span>Est. total</span><span>{usd(total)}{hasVariableAddons ? "+" : ""}</span></p>
                  <small>Pay after the detail · {site.paymentMethods.join(", ")}</small>
                </div>

                <div className="bk-gift">
                  <p className="bk-label">Have a gift card?</p>
                  {giftCardPreview ? (
                    <div className="bk-gift-on">
                      <span>Gift card •••• {giftCardPreview.codeLast4} · {usd(giftCardPreview.balanceCents / 100)} available</span>
                      <button type="button" onClick={() => { setGiftCardCode(""); setGiftCardPreview(null); setGiftCardError(null); }}>Remove</button>
                    </div>
                  ) : (
                    <div className="bk-gift-entry">
                      <input
                        className="bk-input"
                        type="text"
                        value={giftCardCode}
                        onChange={(event) => { setGiftCardCode(event.target.value.toUpperCase()); setGiftCardError(null); }}
                        onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void validateGiftCard(); } }}
                        placeholder="ED-XXXX-XXXX-XXXX"
                        autoCapitalize="characters"
                        autoCorrect="off"
                        aria-label="Gift card code"
                      />
                      <button type="button" onClick={() => void validateGiftCard()} disabled={giftCardBusy || !giftCardCode.trim()}>{giftCardBusy ? "Checking…" : "Apply"}</button>
                    </div>
                  )}
                  {giftCardError && <p className="bk-error" role="alert">{giftCardError}</p>}
                  <small>You&rsquo;ll choose how much of the balance to use after your detail.</small>
                </div>
              </div>

              <div className="bk-next">
                <h3>What happens next</h3>
                <ol>
                  <li><b>01</b> Confirmation sent instantly</li>
                  <li><b>02</b> Your crew arrives with power + water</li>
                  <li><b>03</b> Keys in. Dirty car out.</li>
                </ol>
              </div>

              {submitError && <p className="bk-error" role="alert">{submitError}</p>}
              <button type="submit" disabled={sending} className="bk-btn bk-btn-coral bk-confirm">
                {sending ? "Booking…" : lines.length > 1 ? `Confirm booking · ${lines.length} vehicles` : "Confirm booking"}
              </button>
            </div>
          ))}
        </div>

        <aside className="bk-aside" aria-label="Booking summary">
          <div className="bk-aside-inner">
            {renderSummary()}
            {active !== "review" && (
              <button type="button" className="bk-btn bk-btn-ink bk-aside-go" onClick={advance} disabled={sending || (active === "service" && !servicePicked)}>
                {continueLabel(active)}
              </button>
            )}
          </div>
        </aside>
      </form>

      {/* Mobile: price always visible, summary slides up */}
      <div className={`bk-drawer ${drawerOpen ? "is-open" : ""}`} aria-hidden={!drawerOpen}>
        <button type="button" className="bk-drawer-scrim" tabIndex={-1} aria-label="Close summary" onClick={() => setDrawerOpen(false)} />
        <div className="bk-drawer-sheet">{renderSummary()}</div>
      </div>
      <div className="bk-bar">
        <button type="button" className="bk-bar-sum" aria-expanded={drawerOpen} onClick={() => setDrawerOpen((o) => !o)}>
          <strong key={barPrice}>{barPrice ? `${barPrice} · ` : ""}{barName}</strong>
          <span>{drawerOpen ? "Hide summary ▾" : "View summary ▴"}</span>
        </button>
        <button
          type="button"
          className="bk-btn bk-btn-coral bk-bar-go"
          disabled={sending || (active === "service" && !servicePicked)}
          onClick={() => (active === "review" ? formRef.current?.requestSubmit() : advance())}
        >
          {continueLabel(active)}
        </button>
      </div>
    </div>
  );
}
