"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { RecommenderVehicle } from "@/data/recommenderVehicles";
import { vehicleClassForYear, vehicleMatches, yearFromVehicleQuery } from "@/lib/vehicle-search";
import { vehicleLabel, vehicles, type VehicleId } from "@/data/services";
import type { SiteVehicle } from "./VehicleContext";

export function VehicleSearch({ onSelect, autoFocus = false, initialQuery = "" }: { onSelect: (vehicle: SiteVehicle) => void; autoFocus?: boolean; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [listOpen, setListOpen] = useState(true);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const matches = useMemo(() => vehicleMatches(query), [query]);
  const year = yearFromVehicleQuery(query);
  const hasQuery = query.trim().length >= 2;
  const showMatches = listOpen && hasQuery && matches.length > 0;
  const showEmpty = listOpen && hasQuery && matches.length === 0;

  useEffect(() => {
    if (!autoFocus) return;
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
    return () => window.cancelAnimationFrame(frame);
  }, [autoFocus]);

  useEffect(() => {
    if (activeIndex < 0 || !showMatches) return;
    document.getElementById(`${listId}-option-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, listId, showMatches]);

  useEffect(() => {
    if (activeIndex >= matches.length) setActiveIndex(matches.length ? matches.length - 1 : -1);
  }, [activeIndex, matches.length]);

  const choose = (item: RecommenderVehicle) => {
    onSelect({ make: item.make, model: item.model, year: year || undefined, vehicle: vehicleClassForYear(item, year) });
    setQuery("");
    setListOpen(false);
    setActiveIndex(-1);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!hasQuery || matches.length === 0) {
      if (event.key === "Escape" && listOpen) setListOpen(false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setListOpen(true);
      setActiveIndex((current) => current < matches.length - 1 ? current + 1 : 0);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setListOpen(true);
      setActiveIndex((current) => current > 0 ? current - 1 : matches.length - 1);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      choose(matches[activeIndex >= 0 ? activeIndex : 0]);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setListOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="veh-search">
      <label>
        <span className="sr-only">Search your vehicle make or model</span>
        <input
          ref={inputRef}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showMatches}
          aria-controls={showMatches ? `${listId}-listbox` : undefined}
          aria-activedescendant={showMatches && activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined}
          autoFocus={false}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setListOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => { if (hasQuery) setListOpen(true); }}
          onKeyDown={onKeyDown}
          placeholder="Search make or model…"
          autoComplete="off"
          spellCheck={false}
        />
      </label>

      <span className="sr-only" aria-live="polite">
        {showMatches ? `${matches.length} vehicle ${matches.length === 1 ? "match" : "matches"} available. Use the arrow keys to review them and Enter to select.` : ""}
      </span>

      {showMatches && (
        <div id={`${listId}-listbox`} className="veh-search-results" role="listbox" aria-label="Vehicle matches">
          {matches.map((item, index) => (
            <button
              id={`${listId}-option-${index}`}
              key={`${item.make}-${item.model}-${index}`}
              type="button"
              role="option"
              aria-selected={activeIndex === index}
              tabIndex={-1}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(item)}
            >
              <span><strong>{item.make} {item.model}</strong>{year ? <small>{year}</small> : null}</span>
              <em>{vehicleLabel(item.vehicle)}</em>
            </button>
          ))}
        </div>
      )}

      {showEmpty && (
        <div className="veh-search-empty" role="group" aria-label="Choose a vehicle pricing class instead">
          <p>Can&rsquo;t find it? Choose the pricing class.</p>
          <div className="veh-manual-sizes">{vehicles.map((item) => (
            <button key={item.id} type="button" onClick={() => onSelect({ make: "", model: "", vehicle: item.id as VehicleId, customLabel: item.label })}>{item.label}</button>
          ))}</div>
        </div>
      )}
    </div>
  );
}
