"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CatalogServiceId } from "@/data/serviceCatalog";

export type JourneyLocation = {
  city?: string;
  state?: string;
  zip?: string;
};

type JourneyContextValue = {
  serviceIntent: CatalogServiceId | null;
  location: JourneyLocation | null;
  nextOpening: string | null;
  selectedSlot: string | null;
  bookingResumeHref: string | null;
  drawerOpen: boolean;
  hydrated: boolean;
  setServiceIntent: (service: CatalogServiceId | null) => void;
  setLocation: (location: JourneyLocation | null) => void;
  setNextOpening: (iso: string | null) => void;
  setSelectedSlot: (iso: string | null) => void;
  setBookingResumeHref: (href: string | null) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  clearJourney: () => void;
};

const STORAGE_KEY = "ed_site_journey_v1";
const JourneyContext = createContext<JourneyContextValue | null>(null);

type StoredJourney = {
  serviceIntent?: CatalogServiceId | null;
  location?: JourneyLocation | null;
  bookingResumeHref?: string | null;
  selectedSlot?: string | null;
};

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [serviceIntent, setServiceIntentState] = useState<CatalogServiceId | null>(null);
  const [location, setLocationState] = useState<JourneyLocation | null>(null);
  const [nextOpening, setNextOpening] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlotState] = useState<string | null>(null);
  const [bookingResumeHref, setBookingResumeHrefState] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as StoredJourney;
        setServiceIntentState(saved.serviceIntent ?? null);
        setLocationState(saved.location ?? null);
        setBookingResumeHrefState(saved.bookingResumeHref ?? null);
        setSelectedSlotState(saved.selectedSlot ?? null);
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    const onVehicleChange = () => {
      setSelectedSlotState(null);
      setNextOpening(null);
      try {
        const current = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}") as StoredJourney;
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, selectedSlot: null }));
      } catch {}
    };
    window.addEventListener("ed:vehicle-change", onVehicleChange);
    return () => window.removeEventListener("ed:vehicle-change", onVehicleChange);
  }, []);

  const persist = useCallback((patch: Partial<StoredJourney>) => {
    try {
      const current = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}") as StoredJourney;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...patch }));
    } catch {}
  }, []);

  const setServiceIntent = useCallback((service: CatalogServiceId | null) => {
    setServiceIntentState((current) => {
      if (current !== service) {
        setSelectedSlotState(null);
        setNextOpening(null);
        persist({ selectedSlot: null });
      }
      return service;
    });
    persist({ serviceIntent: service });
  }, [persist]);

  const setLocation = useCallback((next: JourneyLocation | null) => {
    setLocationState(next);
    persist({ location: next });
  }, [persist]);

  const setBookingResumeHref = useCallback((href: string | null) => {
    setBookingResumeHrefState(href);
    persist({ bookingResumeHref: href });
  }, [persist]);


  const setSelectedSlot = useCallback((iso: string | null) => {
    setSelectedSlotState(iso);
    persist({ selectedSlot: iso });
  }, [persist]);

  const clearJourney = useCallback(() => {
    setServiceIntentState(null);
    setLocationState(null);
    setNextOpening(null);
    setSelectedSlotState(null);
    setBookingResumeHrefState(null);
    try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  const value = useMemo<JourneyContextValue>(() => ({
    serviceIntent,
    location,
    nextOpening,
    selectedSlot,
    bookingResumeHref,
    drawerOpen,
    hydrated,
    setServiceIntent,
    setLocation,
    setNextOpening,
    setSelectedSlot,
    setBookingResumeHref,
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
    clearJourney,
  }), [serviceIntent, location, nextOpening, selectedSlot, bookingResumeHref, drawerOpen, hydrated, setServiceIntent, setLocation, setSelectedSlot, setBookingResumeHref, clearJourney]);

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
}

export function useJourney() {
  const value = useContext(JourneyContext);
  if (!value) throw new Error("useJourney must be used inside JourneyProvider");
  return value;
}
