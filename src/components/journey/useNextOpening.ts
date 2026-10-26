"use client";

import { useEffect, useState } from "react";
import type { ServiceId, VehicleId } from "@/data/services";

/**
 * First open slot in the next 14 days for a vehicle size + service (or the Detail+
 * preset). Same request the journey drawer makes, shared here so any surface can
 * show it. Results are cached for two minutes so several notes on one page cost a
 * single request each. Returns null while loading, on errors, and when nothing is open.
 */

const TZ = "America/New_York";
const TTL_MS = 120_000;
const WINDOW_DAYS = 14;

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

export const nextOpeningLabel = (iso: string) => new Intl.DateTimeFormat("en-US", {
  timeZone: TZ, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
}).format(new Date(iso));

const cache = new Map<string, { at: number; promise: Promise<string | null> }>();

function firstSlot(url: string): Promise<string | null> {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.promise;
  const promise = fetch(url)
    .then(async (response) => {
      if (!response.ok) return null;
      const json = (await response.json().catch(() => ({}))) as { slots?: unknown };
      const slots = Array.isArray(json.slots) ? json.slots : [];
      return slots.find((value): value is string => typeof value === "string" && Number.isFinite(Date.parse(value))) ?? null;
    })
    .catch(() => null);
  cache.set(url, { at: Date.now(), promise });
  return promise;
}

export function useNextOpening(vehicle: VehicleId | null | undefined, service: ServiceId | "detailplus" | null | undefined) {
  const [result, setResult] = useState<{ url: string; slot: string | null }>({ url: "", slot: null });

  const url = (() => {
    if (!service) return "";
    const from = dayKey(new Date());
    const to = addDays(from, WINDOW_DAYS);
    if (service === "detailplus") return `/api/availability?preset=detailplus&from=${from}&to=${to}`;
    if (!vehicle) return "";
    return `/api/availability?vehicle=${vehicle}&service=${service}&from=${from}&to=${to}`;
  })();

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    void firstSlot(url).then((slot) => {
      if (!cancelled) setResult({ url, slot });
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  // Only report a slot that belongs to the current vehicle + service.
  return url && result.url === url ? result.slot : null;
}
