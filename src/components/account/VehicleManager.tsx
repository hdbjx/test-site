"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { vehicleIdFromSize, vehicles } from "@/data/services";
import type { GarageVehicle } from "@/lib/supabase/account";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { FormError, SelectField, TextArea, TextField } from "@/components/forms/parts";

const name = (v: GarageVehicle) => [v.year, v.make, v.model].filter(Boolean).join(" ") || "Vehicle";
const sizeLabel = (s: string | null) => vehicles.find((v) => v.id === vehicleIdFromSize(s))?.label;

function VehicleForm({ vehicle, onDone }: { vehicle?: GarageVehicle; onDone: () => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) ?? "").trim();
    const year = Number(get("year")) || null;
    if (!get("make") || !get("model") || !get("size")) return setError("Add the make, model and size.");
    setBusy(true);
    setError(null);
    const { error } = await supabaseBrowser().rpc("save_my_vehicle", {
      p_id: vehicle?.id ?? null,
      p_year: year,
      p_make: get("make"),
      p_model: get("model"),
      p_color: get("color"),
      p_vehicle_size: vehicles.find((v) => v.id === get("size"))?.label ?? null,
      p_pet_hair: get("pet_hair"),
      p_odor_issues: get("odor_issues"),
      p_problem_areas: get("problem_areas"),
      p_is_primary: fd.get("is_primary") === "on",
    });
    setBusy(false);
    if (error) return setError("Couldn't save that vehicle. Try again.");
    onDone();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} noValidate className="panel mt-4 space-y-5 p-6">
      <div className="grid grid-cols-[5.5rem_1fr] gap-3 sm:grid-cols-[6.5rem_1fr_1fr]">
        <TextField label="Year" name="year" inputMode="numeric" maxLength={4} optional defaultValue={vehicle?.year ?? ""} />
        <TextField label="Make" name="make" defaultValue={vehicle?.make ?? ""} />
        <div className="col-span-2 sm:col-span-1">
          <TextField label="Model" name="model" defaultValue={vehicle?.model ?? ""} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField label="Size" name="size" defaultValue={vehicleIdFromSize(vehicle?.vehicle_size) ?? ""} hint="Sets your price.">
          <option value="" disabled>
            Choose one
          </option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label} ({v.hint.toLowerCase()})
            </option>
          ))}
        </SelectField>
        <TextField label="Color" name="color" optional defaultValue={vehicle?.color ?? ""} />
      </div>
      <TextField label="Pets in the car?" name="pet_hair" optional defaultValue={vehicle?.pet_hair ?? ""} hint="e.g. golden retriever, rides in the back" />
      <TextField label="Any odors?" name="odor_issues" optional defaultValue={vehicle?.odor_issues ?? ""} />
      <TextArea label="Spots we should know about" name="problem_areas" optional defaultValue={vehicle?.problem_areas ?? ""} hint="Stains, scratches, a seat that gets the most use." />
      <label className="flex items-center gap-3">
        <input type="checkbox" name="is_primary" defaultChecked={vehicle?.is_primary} className="h-5 w-5 accent-[var(--color-red)]" />
        <span>Main vehicle (selected first when you book)</span>
      </label>
      <FormError message={error} />
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={busy} className="btn btn-primary btn-sm disabled:opacity-60">
          {busy ? "Saving…" : "Save vehicle"}
        </button>
        <button type="button" onClick={onDone} className="btn btn-secondary btn-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}

export function VehicleManager({ garage }: { garage: GarageVehicle[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | "new" | null>(garage.length === 0 ? "new" : null);
  const [error, setError] = useState<string | null>(null);

  async function remove(v: GarageVehicle) {
    if (!confirm(`Remove ${name(v)}?`)) return;
    setError(null);
    const { error } = await supabaseBrowser().rpc("delete_my_vehicle", { p_id: v.id });
    if (error) {
      setError(error.message.includes("vehicle_has_history") ? `${name(v)} has service history with us, so we keep it on file. Call us if it's no longer yours.` : "Couldn't remove that vehicle.");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <ul className="border-t-2 border-ink">
        {garage.map((v) => (
          <li key={v.id} className="border-b border-ink/15 py-5">
            {editing === v.id ? (
              <VehicleForm vehicle={v} onDone={() => setEditing(null)} />
            ) : (
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-display text-lg font-semibold">
                    {name(v)}
                    {v.is_primary && <span className="ml-2 rounded-full bg-sand px-2 py-0.5 align-middle text-xs">Main</span>}
                  </p>
                  <p className="text-sm text-muted">{[v.color, sizeLabel(v.vehicle_size) ?? "Size not set"].filter(Boolean).join(" · ")}</p>
                  {v.recommended_next && <p className="mt-2 text-sm">Our tech recommends next: {v.recommended_next}</p>}
                </div>
                <div className="flex gap-4 text-sm">
                  <button type="button" className="link" onClick={() => setEditing(v.id)}>
                    Edit
                  </button>
                  <button type="button" className="link" onClick={() => remove(v)}>
                    Remove
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      <FormError message={error} />
      {editing === "new" ? (
        <VehicleForm onDone={() => setEditing(null)} />
      ) : (
        <button type="button" onClick={() => setEditing("new")} className="btn btn-secondary btn-sm mt-5">
          Add a vehicle
        </button>
      )}
    </div>
  );
}
