"use client";

import { useMemo, useState } from "react";
import type { RecommenderVehicle } from "@/data/recommenderVehicles";
import { vehicleClassForYear, vehicleMatches, yearFromVehicleQuery } from "@/lib/vehicle-search";
import { vehicleLabel, vehicles, type VehicleId } from "@/data/services";
import type { SiteVehicle } from "./VehicleContext";

export function VehicleSearch({ onSelect, autoFocus = false, initialQuery = "" }: { onSelect: (vehicle: SiteVehicle) => void; autoFocus?: boolean; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const matches = useMemo(() => vehicleMatches(query), [query]);
  const year = yearFromVehicleQuery(query);

  const choose = (item: RecommenderVehicle) => {
    onSelect({ make: item.make, model: item.model, year: year || undefined, vehicle: vehicleClassForYear(item, year) });
    setQuery("");
  };

  return (
    <div className="veh-search">
      <label>
        <span className="sr-only">Search your vehicle make or model</span>
        <input
          autoFocus={autoFocus}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search make or model…"
          autoComplete="off"
          spellCheck={false}
        />
      </label>
      {matches.length > 0 && (
        <div className="veh-search-results" aria-label="Vehicle matches">
          {matches.map((item, index) => (
            <button key={`${item.make}-${item.model}-${index}`} type="button" onClick={() => choose(item)}>
              <span><strong>{item.make} {item.model}</strong>{year ? <small>{year}</small> : null}</span>
              <em>{vehicleLabel(item.vehicle)}</em>
            </button>
          ))}
        </div>
      )}
      {query.trim().length >= 2 && matches.length === 0 && (
        <div className="veh-search-empty">
          <p>Can&rsquo;t find it? Choose the pricing class.</p>
          <div className="veh-manual-sizes">{vehicles.map((item) => (
            <button key={item.id} type="button" onClick={() => onSelect({ make: "", model: "", vehicle: item.id as VehicleId, customLabel: item.label })}>{item.label}</button>
          ))}</div>
        </div>
      )}
    </div>
  );
}
