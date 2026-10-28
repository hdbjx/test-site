"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { track as trackEvent } from "@/lib/analytics";
import { site } from "@/data/site";
import type { CoverageZone } from "@/data/coverage";
import styles from "./coverage.module.css";

export type AddressParts = { street: string; unit: string; city: string; state: string; zip: string };
export type CheckResult = {
  address: string;
  parts: AddressParts;
  precise: boolean;
  lat: number;
  lng: number;
  miles: number;
  zone: CoverageZone;
  nearest: { name: string; slug: string; miles: number } | null;
};
type Suggestion = { placeId: string; main: string; secondary: string };

/** Booking reads this to prefill the service address. */
export const AREA_CHECK_KEY = "ed_area_check_v1";

const newToken = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`);

export function AddressCheck({ location, onResult }: { location: string; onResult?: (result: CheckResult | null) => void }) {
  const uid = useId();
  const listId = `${uid}-list`;
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const session = useRef<string>("");
  const picked = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Debounced suggestions. Quietly returns nothing when Places isn't configured.
  useEffect(() => {
    if (picked.current) { picked.current = false; return; }
    const q = value.trim();
    if (q.length < 4 || /^\d{1,5}$/.test(q)) { setSuggestions([]); return; }
    const ctrl = new AbortController();
    const t = window.setTimeout(async () => {
      try {
        if (!session.current) session.current = newToken();
        const res = await fetch(`/api/service-area?q=${encodeURIComponent(q)}&session=${session.current}`, { signal: ctrl.signal });
        const data = (await res.json()) as { suggestions?: Suggestion[] };
        setSuggestions(data.suggestions ?? []);
        setIndex(-1);
        setOpen(true);
      } catch {}
    }, 220);
    return () => { window.clearTimeout(t); ctrl.abort(); };
  }, [value]);

  // Close the list on outside click.
  useEffect(() => {
    const close = (e: PointerEvent) => { if (!formRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  async function check(payload: { placeId?: string; address?: string }) {
    setLoading(true);
    setError("");
    setOpen(false);
    try {
      const res = await fetch("/api/service-area", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, session: session.current || undefined }),
      });
      const data = await res.json();
      session.current = ""; // a session ends when a place is resolved
      if (!res.ok || !data.ok) {
        setError(data.error || "We couldn't check that address. Text it to us instead.");
        setResult(null);
        onResult?.(null);
        return;
      }
      const r = data as CheckResult;
      setResult(r);
      onResult?.(r);
      trackEvent("area_check", { location, zone: r.zone, miles: Math.round(r.miles), nearest: r.nearest?.slug ?? "" });
      if (r.zone !== "outside" && r.precise) {
        try { sessionStorage.setItem(AREA_CHECK_KEY, JSON.stringify({ address: r.parts, at: Date.now() })); } catch {}
      }
    } catch {
      setError("We couldn't check that address. Text it to us instead.");
    } finally {
      setLoading(false);
    }
  }

  function pick(s: Suggestion) {
    picked.current = true;
    setValue([s.main, s.secondary].filter(Boolean).join(", "));
    setSuggestions([]);
    void check({ placeId: s.placeId });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || !suggestions.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setIndex((i) => (i + 1) % suggestions.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1)); }
    else if (e.key === "Enter" && index >= 0) { e.preventDefault(); pick(suggestions[index]); }
    else if (e.key === "Escape") { setOpen(false); }
  }

  const showList = open && suggestions.length > 0;
  const sms = (text: string) => `${site.phone.sms}?&body=${encodeURIComponent(text)}`;

  return (
    <div className={styles.check}>
      <div className={styles.checkHead}>
        <h3 className={styles.checkTitle}>Check your address</h3>
        <p className={styles.checkHint}>Street address or ZIP</p>
      </div>
      <form
        ref={formRef}
        className={styles.form}
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          const q = value.trim();
          if (q.length < 5) { setError("Enter a street address or 5-digit ZIP."); return; }
          void check({ address: q });
        }}
      >
        <input
          className={styles.input}
          type="text"
          inputMode="text"
          autoComplete="street-address"
          enterKeyHint="search"
          placeholder="123 Main St, Decatur"
          aria-label="Your street address or ZIP code"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={showList && index >= 0 ? `${listId}-${index}` : undefined}
          value={value}
          maxLength={160}
          onChange={(e) => { setValue(e.target.value); setError(""); }}
          onFocus={() => { if (!session.current) session.current = newToken(); if (suggestions.length) setOpen(true); }}
          onKeyDown={onKeyDown}
        />
        <button className={styles.go} type="submit" disabled={loading}>
          {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
          {loading ? "Checking" : "Check"}
        </button>
        {showList && (
          <ul className={styles.list} id={listId} role="listbox" aria-label="Address suggestions">
            {suggestions.map((s, i) => (
              <li
                key={s.placeId}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === index}
                onPointerDown={(e) => { e.preventDefault(); pick(s); }}
                onMouseEnter={() => setIndex(i)}
              >
                <strong>{s.main}</strong>
                {s.secondary && <span>{s.secondary}</span>}
              </li>
            ))}
          </ul>
        )}
      </form>

      <div aria-live="polite">
        {error && <p className={styles.error}>{error}</p>}
        {result && !error && <Verdict result={result} location={location} sms={sms} />}
      </div>
    </div>
  );
}

function Verdict({ result, location, sms }: { result: CheckResult; location: string; sms: (text: string) => string }) {
  const miles = result.miles < 10 ? result.miles.toFixed(1) : Math.round(result.miles);
  const near = result.nearest && result.nearest.miles < 4 ? result.nearest : null;
  const copy = {
    route: {
      mark: "✓",
      title: "You're on our route.",
      body: `${miles} mi from our Decatur home base${near ? `, near ${near.name}` : ""}. Pick a time and we'll bring the whole setup.`,
    },
    edge: {
      mark: "~",
      title: "Edge of our route.",
      body: `${miles} mi from Decatur. We make the trip when the schedule lines up. Text us the address and we'll find a day that works.`,
    },
    outside: {
      mark: "×",
      title: "Outside our regular route.",
      body: `${miles} mi from Decatur. Send us the address anyway and we'll tell you honestly if the schedule can support it.`,
    },
  }[result.zone];

  return (
    <div className={`${styles.verdict} ${styles[`verdict_${result.zone}`]}`}>
      <div className={styles.verdictTop}>
        <span className={styles.badge} aria-hidden="true">{copy.mark}</span>
        <div>
          <p className={styles.verdictTitle}>{copy.title}</p>
          <p className={styles.verdictBody}>
            {copy.body}
            <span className={styles.verdictAddress}>{result.precise ? result.address : `Approximate · ${result.address}`}</span>
          </p>
        </div>
      </div>
      <div className={styles.actions}>
        {result.zone === "route" ? (
          <>
            <Link href="/book" className={styles.cta} onClick={() => trackEvent("book_click", { location: `${location}_area_check` })}>
              Book this address <span aria-hidden="true">↗</span>
            </Link>
            {near && (
              <Link href={`/service-areas/${near.slug}`} className={styles.ghost}>
                {near.name} details <span aria-hidden="true">↗</span>
              </Link>
            )}
          </>
        ) : (
          <>
            <a
              href={sms(`Hi Every Detail! Can you service ${result.address}?`)}
              className={styles.cta}
              onClick={() => trackEvent("text_click", { location: `${location}_area_check_${result.zone}` })}
            >
              Text us this address <span aria-hidden="true">↗</span>
            </a>
            {result.zone === "edge" && (
              <Link href="/book" className={styles.ghost} onClick={() => trackEvent("book_click", { location: `${location}_area_check_edge` })}>
                See open times <span aria-hidden="true">↗</span>
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}
