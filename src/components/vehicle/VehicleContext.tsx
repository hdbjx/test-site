"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { VehicleId } from "@/data/services";

export type SiteVehicle = {
  make: string;
  model: string;
  year?: string;
  vehicle: VehicleId;
  customLabel?: string;
};

type VehicleContextValue = {
  vehicle: SiteVehicle | null;
  hydrated: boolean;
  remembered: boolean;
  pickerOpen: boolean;
  promptDismissed: boolean;
  selectVehicle: (vehicle: SiteVehicle, remember?: boolean) => void;
  clearVehicle: () => void;
  setRemembered: (remember: boolean) => void;
  openPicker: () => void;
  closePicker: () => void;
  dismissPrompt: () => void;
};

const SESSION_KEY = "ed_site_vehicle_session";
const SAVED_KEY = "ed_site_vehicle_saved";
const DISMISSED_KEY = "ed_vehicle_prompt_dismissed";

const VehicleContext = createContext<VehicleContextValue | null>(null);

function readVehicle(raw: string | null): SiteVehicle | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<SiteVehicle>;
    if ((!value.make || !value.model) && !value.customLabel) return null;
    if (!value.vehicle) return null;
    return { make: String(value.make ?? ""), model: String(value.model ?? ""), year: value.year ? String(value.year) : undefined, vehicle: value.vehicle as VehicleId, customLabel: value.customLabel ? String(value.customLabel) : undefined };
  } catch {
    return null;
  }
}

export function VehicleProvider({ children }: { children: ReactNode }) {
  const [vehicle, setVehicle] = useState<SiteVehicle | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [remembered, setRememberedState] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(false);

  useEffect(() => {
    const sessionVehicle = readVehicle(sessionStorage.getItem(SESSION_KEY));
    const savedVehicle = readVehicle(localStorage.getItem(SAVED_KEY));
    const next = sessionVehicle ?? savedVehicle;
    if (next) {
      setVehicle(next);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
    }
    setRememberedState(!!savedVehicle && JSON.stringify(savedVehicle) === JSON.stringify(next));
    setPromptDismissed(sessionStorage.getItem(DISMISSED_KEY) === "1");
    setHydrated(true);
  }, []);

  const selectVehicle = useCallback((next: SiteVehicle, remember = false) => {
    setVehicle(next);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
    sessionStorage.setItem(DISMISSED_KEY, "1");
    setPromptDismissed(true);
    if (remember) {
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      setRememberedState(true);
    } else {
      const saved = readVehicle(localStorage.getItem(SAVED_KEY));
      setRememberedState(!!saved && JSON.stringify(saved) === JSON.stringify(next));
    }
    setPickerOpen(false);
    window.dispatchEvent(new CustomEvent("ed:vehicle-change", { detail: next }));
  }, []);

  const clearVehicle = useCallback(() => {
    setVehicle(null);
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SAVED_KEY);
    setRememberedState(false);
  }, []);

  const setRemembered = useCallback((remember: boolean) => {
    setRememberedState(remember);
    if (!vehicle) return;
    if (remember) localStorage.setItem(SAVED_KEY, JSON.stringify(vehicle));
    else localStorage.removeItem(SAVED_KEY);
  }, [vehicle]);

  const dismissPrompt = useCallback(() => {
    sessionStorage.setItem(DISMISSED_KEY, "1");
    setPromptDismissed(true);
  }, []);

  const value = useMemo<VehicleContextValue>(() => ({
    vehicle,
    hydrated,
    remembered,
    pickerOpen,
    promptDismissed,
    selectVehicle,
    clearVehicle,
    setRemembered,
    openPicker: () => setPickerOpen(true),
    closePicker: () => setPickerOpen(false),
    dismissPrompt,
  }), [vehicle, hydrated, remembered, pickerOpen, promptDismissed, selectVehicle, clearVehicle, setRemembered, dismissPrompt]);

  return <VehicleContext.Provider value={value}>{children}</VehicleContext.Provider>;
}

export function useVehicle() {
  const value = useContext(VehicleContext);
  if (!value) throw new Error("useVehicle must be used inside VehicleProvider");
  return value;
}

export function siteVehicleLabel(vehicle: SiteVehicle | null) {
  if (!vehicle) return "";
  return vehicle.customLabel || [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ");
}
