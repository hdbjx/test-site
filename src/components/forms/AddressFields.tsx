"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Suggestion = { placeId: string; label: string; main: string; secondary: string };
type Parts = { street: string; unit: string; city: string; state: string; zip: string };

function parseStoredAddress(value?: string): Parts {
  const empty = { street: "", unit: "", city: "", state: "", zip: "" };
  if (!value?.trim()) return empty;
  const chunks = value.split(",").map((part) => part.trim()).filter(Boolean);
  if (chunks.length < 3) return { ...empty, street: value.trim() };
  const stateZip = chunks[chunks.length - 1].match(/^([A-Za-z]{2})\s+(\d{5}(?:-\d{4})?)$/);
  if (!stateZip) return { ...empty, street: value.trim() };
  return {
    street: chunks.slice(0, -2).join(", "),
    unit: "",
    city: chunks[chunks.length - 2],
    state: stateZip[1].toUpperCase(),
    zip: stateZip[2],
  };
}

function fullAddress(parts: Parts) {
  const first = [parts.street.trim(), parts.unit.trim()].filter(Boolean).join(", ");
  const stateZip = [parts.state.trim().toUpperCase(), parts.zip.trim()].filter(Boolean).join(" ");
  const locality = [parts.city.trim(), stateZip].filter(Boolean).join(", ");
  return [first, locality].filter(Boolean).join(", ");
}

export function AddressFields({ defaultAddress, error = false }: { defaultAddress?: string | null; error?: boolean }) {
  const initial = useMemo(() => parseStoredAddress(defaultAddress ?? undefined), [defaultAddress]);
  const [parts, setParts] = useState<Parts>(initial);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchEnabled, setSearchEnabled] = useState(!initial.street);
  const sessionToken = useRef(typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
  const requestId = useRef(0);

  function set<K extends keyof Parts>(key: K, value: Parts[K]) {
    setParts((current) => ({ ...current, [key]: value }));
  }

  useEffect(() => {
    if (!searchEnabled || parts.street.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    const id = ++requestId.current;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/address-autocomplete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: parts.street, sessionToken: sessionToken.current }),
        });
        const json = await response.json().catch(() => ({}));
        if (id !== requestId.current) return;
        const next = response.ok && json.ok && Array.isArray(json.suggestions) ? json.suggestions : [];
        setSuggestions(next);
        setOpen(next.length > 0);
      } catch {
        if (id === requestId.current) {
          setSuggestions([]);
          setOpen(false);
        }
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    }, 220);
    return () => window.clearTimeout(timer);
  }, [parts.street, searchEnabled]);

  async function choose(suggestion: Suggestion) {
    setOpen(false);
    setLoading(true);
    try {
      const response = await fetch("/api/address-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId: suggestion.placeId, sessionToken: sessionToken.current }),
      });
      const json = await response.json().catch(() => ({}));
      if (response.ok && json.ok && json.address) {
        setParts((current) => ({
          street: json.address.street || suggestion.main || current.street,
          unit: json.address.unit || current.unit,
          city: json.address.city || current.city,
          state: json.address.state || current.state,
          zip: json.address.zip || current.zip,
        }));
        setSearchEnabled(false);
        sessionToken.current = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
      }
    } finally {
      setLoading(false);
    }
  }

  const address = fullAddress(parts);
  const fieldClass = `field${error ? " border-red" : ""}`;

  return (
    <div className="space-y-4">
      <input type="hidden" name="address" value={address} />
      <div className="relative">
        <label htmlFor="addressStreet" className="field-label">
          Street address
          <span className="field-hint block text-sm">Start typing and choose your address, or enter it manually.</span>
        </label>
        <input
          id="addressStreet"
          name="addressStreet"
          className={fieldClass}
          value={parts.street}
          onChange={(e) => { set("street", e.target.value); setSearchEnabled(true); }}
          onFocus={() => suggestions.length && setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          autoComplete="address-line1"
          placeholder="123 Main St"
          required
          aria-invalid={error || undefined}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="address-suggestions"
        />
        {loading && <span className="address-search-status" aria-hidden="true">Searching…</span>}
        {open && (
          <div id="address-suggestions" role="listbox" className="address-suggestions">
            {suggestions.map((suggestion) => (
              <button key={suggestion.placeId} type="button" role="option" className="address-suggestion" onMouseDown={(e) => e.preventDefault()} onClick={() => choose(suggestion)}>
                <strong>{suggestion.main}</strong>
                {suggestion.secondary && <span>{suggestion.secondary}</span>}
              </button>
            ))}
            <div className="address-google-attribution"><img src="https://storage.googleapis.com/geo-devrel-public-buckets/powered_by_google_on_white.png" alt="Powered by Google" /></div>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="addressUnit" className="field-label">Apt, suite or unit <span className="field-hint">(optional)</span></label>
          <input id="addressUnit" name="addressUnit" className="field" value={parts.unit} onChange={(e) => set("unit", e.target.value)} autoComplete="address-line2" placeholder="Apt 4B" />
        </div>
        <div>
          <label htmlFor="addressCity" className="field-label">City</label>
          <input id="addressCity" name="addressCity" className={fieldClass} value={parts.city} onChange={(e) => set("city", e.target.value)} autoComplete="address-level2" placeholder="Decatur" required />
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] gap-4">
        <div>
          <label htmlFor="addressState" className="field-label">State</label>
          <input id="addressState" name="addressState" className={fieldClass} value={parts.state} onChange={(e) => set("state", e.target.value.toUpperCase().slice(0, 2))} autoComplete="address-level1" placeholder="GA" maxLength={2} required />
        </div>
        <div>
          <label htmlFor="addressZip" className="field-label">ZIP code</label>
          <input id="addressZip" name="addressZip" className={fieldClass} value={parts.zip} onChange={(e) => set("zip", e.target.value.replace(/[^0-9-]/g, "").slice(0, 10))} autoComplete="postal-code" inputMode="numeric" placeholder="30030" required />
        </div>
      </div>
      {error && <p className="field-error">Enter the full service address.</p>}
    </div>
  );
}
