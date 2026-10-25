"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { vehicleIdFromSize, vehicleLabel, type VehicleId } from "@/data/services";
import { supabaseConfigured } from "@/lib/supabase/config";
import { supabaseBrowser } from "@/lib/supabase/browser";

export type SiteVehicle = {
  make: string;
  model: string;
  year?: string;
  vehicle: VehicleId;
  customLabel?: string;
};

type AuthState = "loading" | "signed-out" | "signed-in";

type GarageSummary = {
  id: string;
  year: number | null;
  make: string | null;
  model: string | null;
  vehicle_size: string | null;
  is_primary: boolean;
};

type VehicleContextValue = {
  vehicle: SiteVehicle | null;
  hydrated: boolean;
  remembered: boolean;
  pickerOpen: boolean;
  promptDismissed: boolean;
  authState: AuthState;
  accountEmail: string | null;
  selectVehicle: (vehicle: SiteVehicle, remember?: boolean) => Promise<void>;
  clearVehicle: () => void;
  setRemembered: (remember: boolean) => void;
  openPicker: () => void;
  closePicker: () => void;
  dismissPrompt: () => void;
};

const SESSION_KEY = "ed_site_vehicle_session";
const SAVED_KEY = "ed_site_vehicle_saved";
const LEGACY_DISMISSED_KEY = "ed_vehicle_prompt_dismissed";
const DISMISSED_UNTIL_KEY = "ed_vehicle_prompt_dismissed_until";
const DISMISS_FOR_MS = 1000 * 60 * 60 * 24 * 30;

const VehicleContext = createContext<VehicleContextValue | null>(null);

function readVehicle(raw: string | null): SiteVehicle | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<SiteVehicle>;
    if ((!value.make || !value.model) && !value.customLabel) return null;
    if (!value.vehicle) return null;
    return {
      make: String(value.make ?? ""),
      model: String(value.model ?? ""),
      year: value.year ? String(value.year) : undefined,
      vehicle: value.vehicle as VehicleId,
      customLabel: value.customLabel ? String(value.customLabel) : undefined,
    };
  } catch {
    return null;
  }
}

function sameGarageVehicle(siteVehicle: SiteVehicle, garageVehicle: GarageSummary) {
  if (!siteVehicle.make || !siteVehicle.model) return false;
  const year = siteVehicle.year ? Number(siteVehicle.year) : null;
  return (
    String(garageVehicle.make ?? "").trim().toLowerCase() === siteVehicle.make.trim().toLowerCase() &&
    String(garageVehicle.model ?? "").trim().toLowerCase() === siteVehicle.model.trim().toLowerCase() &&
    (garageVehicle.year ?? null) === (Number.isFinite(year) ? year : null)
  );
}

function promptIsDismissed() {
  const until = Number(localStorage.getItem(DISMISSED_UNTIL_KEY) ?? "0");
  if (Number.isFinite(until) && until > Date.now()) return true;

  // Migrate the old session-only choice into a real short-term preference.
  if (sessionStorage.getItem(LEGACY_DISMISSED_KEY) === "1") {
    localStorage.setItem(DISMISSED_UNTIL_KEY, String(Date.now() + DISMISS_FOR_MS));
    sessionStorage.removeItem(LEGACY_DISMISSED_KEY);
    return true;
  }
  return false;
}

function persistPromptDismissal() {
  localStorage.setItem(DISMISSED_UNTIL_KEY, String(Date.now() + DISMISS_FOR_MS));
}

export function VehicleProvider({ children }: { children: ReactNode }) {
  const [vehicle, setVehicle] = useState<SiteVehicle | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [remembered, setRememberedState] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(false);
  const [authState, setAuthState] = useState<AuthState>(supabaseConfigured ? "loading" : "signed-out");
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [garage, setGarage] = useState<GarageSummary[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function hydrateVehicle() {
      const sessionVehicle = readVehicle(sessionStorage.getItem(SESSION_KEY));
      const savedVehicle = readVehicle(localStorage.getItem(SAVED_KEY));
      let next = sessionVehicle;
      let nextGarage: GarageSummary[] = [];
      let nextAuthState: AuthState = supabaseConfigured ? "loading" : "signed-out";
      let nextEmail: string | null = null;

      if (supabaseConfigured) {
        try {
          const supabase = supabaseBrowser();
          const { data: auth } = await supabase.auth.getUser();
          if (auth.user) {
            nextAuthState = "signed-in";
            nextEmail = auth.user.email ?? null;
            const meta = (auth.user.user_metadata ?? {}) as { full_name?: string; phone?: string };
            await supabase.rpc("ensure_my_client", { p_full_name: meta.full_name ?? null, p_phone: meta.phone ?? null });
            const { data: garageRows, error } = await supabase.rpc("get_my_garage");
            if (!error && Array.isArray(garageRows)) {
              nextGarage = garageRows as GarageSummary[];
              if (!next && nextGarage.length > 0) {
                const primary = nextGarage.find((item) => item?.is_primary) ?? nextGarage[0];
                const vehicleClass = vehicleIdFromSize(primary?.vehicle_size);
                if (vehicleClass && primary?.make && primary?.model) {
                  next = {
                    make: String(primary.make),
                    model: String(primary.model),
                    year: primary.year ? String(primary.year) : undefined,
                    vehicle: vehicleClass,
                  };
                }
              }
            }
          } else {
            nextAuthState = "signed-out";
            if (!next) next = savedVehicle;
          }
        } catch {
          nextAuthState = "signed-out";
          if (!next) next = savedVehicle;
        }
      } else if (!next) {
        next = savedVehicle;
      }

      if (cancelled) return;

      setAuthState(nextAuthState);
      setAccountEmail(nextEmail);
      setGarage(nextGarage);

      if (next) {
        setVehicle(next);
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
      }

      const persistedLocally = !!savedVehicle && !!next && JSON.stringify(savedVehicle) === JSON.stringify(next);
      const persistedInGarage = !!next && nextGarage.some((item) => sameGarageVehicle(next!, item));
      setRememberedState(nextAuthState === "signed-in" ? persistedInGarage || persistedLocally : persistedLocally);
      setPromptDismissed(!!next || promptIsDismissed());
      setHydrated(true);
    }

    void hydrateVehicle();
    return () => { cancelled = true; };
  }, []);

  const persistSignedInVehicle = useCallback(async (next: SiteVehicle) => {
    if (authState !== "signed-in" || !next.make.trim() || !next.model.trim()) return false;
    const existing = garage.find((item) => sameGarageVehicle(next, item));
    if (existing) return true;

    try {
      const { data, error } = await supabaseBrowser().rpc("save_my_vehicle", {
        p_id: null,
        p_year: next.year ? Number(next.year) || null : null,
        p_make: next.make.trim(),
        p_model: next.model.trim(),
        p_color: "",
        p_vehicle_size: vehicleLabel(next.vehicle),
        p_pet_hair: "",
        p_odor_issues: "",
        p_problem_areas: "",
        p_is_primary: garage.length === 0,
      });
      if (error) throw error;

      // The RPC's return shape can vary by migration. We only need a local
      // identity marker so this selection behaves as persisted immediately.
      setGarage((current) => current.some((item) => sameGarageVehicle(next, item)) ? current : [
        ...current,
        {
          id: typeof data === "string" && data ? data : `local-${Date.now()}`,
          year: next.year ? Number(next.year) || null : null,
          make: next.make,
          model: next.model,
          vehicle_size: vehicleLabel(next.vehicle),
          is_primary: current.length === 0,
        },
      ]);
      return true;
    } catch (error) {
      console.warn("Could not save selected vehicle to account garage", error);
      return false;
    }
  }, [authState, garage]);

  const selectVehicle = useCallback(async (next: SiteVehicle, remember = false) => {
    setVehicle(next);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
    persistPromptDismissal();
    setPromptDismissed(true);
    setPickerOpen(false);
    window.dispatchEvent(new CustomEvent("ed:vehicle-change", { detail: next }));

    if (remember) {
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      if (authState === "signed-in") {
        const savedToAccount = await persistSignedInVehicle(next);
        setRememberedState(savedToAccount || true);
      } else {
        setRememberedState(true);
      }
      return;
    }

    const saved = readVehicle(localStorage.getItem(SAVED_KEY));
    const inGarage = garage.some((item) => sameGarageVehicle(next, item));
    setRememberedState(authState === "signed-in" ? inGarage : !!saved && JSON.stringify(saved) === JSON.stringify(next));
  }, [authState, garage, persistSignedInVehicle]);

  const clearVehicle = useCallback(() => {
    setVehicle(null);
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SAVED_KEY);
    setRememberedState(false);
  }, []);

  const setRemembered = useCallback((remember: boolean) => {
    if (!vehicle) return;
    if (remember) {
      localStorage.setItem(SAVED_KEY, JSON.stringify(vehicle));
      setRememberedState(true);
      if (authState === "signed-in") void persistSignedInVehicle(vehicle);
    } else {
      localStorage.removeItem(SAVED_KEY);
      setRememberedState(authState === "signed-in" && garage.some((item) => sameGarageVehicle(vehicle, item)));
    }
  }, [vehicle, authState, garage, persistSignedInVehicle]);

  const dismissPrompt = useCallback(() => {
    persistPromptDismissal();
    setPromptDismissed(true);
  }, []);

  const value = useMemo<VehicleContextValue>(() => ({
    vehicle,
    hydrated,
    remembered,
    pickerOpen,
    promptDismissed,
    authState,
    accountEmail,
    selectVehicle,
    clearVehicle,
    setRemembered,
    openPicker: () => setPickerOpen(true),
    closePicker: () => setPickerOpen(false),
    dismissPrompt,
  }), [vehicle, hydrated, remembered, pickerOpen, promptDismissed, authState, accountEmail, selectVehicle, clearVehicle, setRemembered, dismissPrompt]);

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
