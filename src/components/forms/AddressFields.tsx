"use client";

import { useMemo, useState } from "react";
import { TextField } from "./parts";

type AddressParts = { street: string; unit: string; city: string; state: string; zip: string };

function parseAddress(value = ""): AddressParts {
  const parts = value.split(",").map((p) => p.trim()).filter(Boolean);
  const last = parts.at(-1) ?? "";
  const stateZip = last.match(/^([A-Za-z]{2}|Georgia)\s+(\d{5}(?:-\d{4})?)$/i);
  if (parts.length >= 3 && stateZip) {
    return {
      street: parts[0] ?? "",
      unit: parts.length > 3 ? parts.slice(1, -2).join(", ") : "",
      city: parts.at(-2) ?? "",
      state: stateZip[1],
      zip: stateZip[2],
    };
  }
  return { street: value, unit: "", city: "", state: "", zip: "" };
}

export function AddressFields({ defaultValue = "", error = false, optional = false }: { defaultValue?: string | null; error?: boolean; optional?: boolean }) {
  const initial = useMemo(() => parseAddress(defaultValue ?? ""), [defaultValue]);
  const [address, setAddress] = useState<AddressParts>(initial);
  const full = [address.street, address.unit, address.city, [address.state, address.zip].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const update = (key: keyof AddressParts) => (e: React.ChangeEvent<HTMLInputElement>) => setAddress((old) => ({ ...old, [key]: e.target.value }));

  return (
    <div className="space-y-4">
      <input type="hidden" name="address" value={full} />
      <TextField label="Street address" name="address_street" autoComplete="street-address" placeholder="123 Main St" optional={optional} value={address.street} onChange={update("street")} error={error && !address.street} />
      <TextField label="Apt / Unit" name="address_unit" autoComplete="address-line2" placeholder="Apt 2B" optional value={address.unit} onChange={update("unit")} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1.4fr_.65fr_.8fr]">
        <TextField label="City" name="address_city" autoComplete="address-level2" placeholder="Decatur" optional={optional} value={address.city} onChange={update("city")} error={error && !address.city} />
        <TextField label="State" name="address_state" autoComplete="address-level1" placeholder="GA" optional={optional} value={address.state} onChange={update("state")} error={error && !address.state} />
        <TextField label="ZIP" name="address_zip" inputMode="numeric" autoComplete="postal-code" placeholder="30030" optional={optional} value={address.zip} onChange={update("zip")} error={error && !address.zip} />
      </div>
      {error && <p className="field-error">Enter street, city, state and ZIP code.</p>}
    </div>
  );
}
