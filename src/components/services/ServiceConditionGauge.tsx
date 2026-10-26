"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Photo } from "@/components/Photo";
import { RubberStamp } from "@/components/ed/RubberStamp";
import { TrackedLink } from "@/components/TrackedLink";
import { siteVehicleLabel, useVehicle } from "@/components/vehicle/VehicleContext";
import { PRICING, services, startingPrice, type ServiceId } from "@/data/services";
import { usd } from "@/lib/format";

const angles: Record<ServiceId, number> = {
  maintenance: -55,
  premium: 0,
  factoryReset: 55,
};

function ServicePrice({ id }: { id: ServiceId }) {
  const { vehicle, openPicker } = useVehicle();
  const price = vehicle ? PRICING[vehicle.vehicle][id].price : startingPrice(id);

  return (
    <div className="sv90-core-price-wrap">
      <div className="sv90-core-price"><small>{vehicle ? "" : "FROM"}</small><strong>{usd(price)}</strong></div>
      <button type="button" onClick={openPicker}>{vehicle ? `Priced for ${siteVehicleLabel(vehicle)} · Change` : "Add your vehicle for exact pricing"}</button>
    </div>
  );
}

function PanelContent({ id, number, condition, image, featured = false }: { id: ServiceId; number: string; condition: string; image: string; featured?: boolean }) {
  const service = services[id];
  return (
    <>
      <div className="sv90-core-photo ed90-photo-grade"><Photo id={image} sizes="(max-width: 899px) 100vw, 45vw" fill /></div>
      <div className="sv90-core-shade" />
      <span className="sv90-core-collapsed-number" aria-hidden="true">{number}</span>
      <span className="sv90-core-collapsed-name" aria-hidden="true">{service.name}</span>
      {featured && <RubberStamp className="sv90-most-booked">MOST BOOKED</RubberStamp>}
      <div className="sv90-core-content">
        <div className="sv90-core-meta"><span>{number}</span><small>{condition}</small></div>
        <h3>{service.name}</h3>
        <strong className="sv90-core-short">{service.short}</strong>
        <ul>{service.includes.map((item) => <li key={item}>{item}</li>)}</ul>
        <ServicePrice id={id} />
        <TrackedLink
          href={`/book?service=${id}`}
          event="book_click"
          params={{ location: "services_core", service: id }}
          className="ed90-button sv90-core-book"
        >
          BOOK <span>↗</span>
        </TrackedLink>
      </div>
    </>
  );
}

type Props = {
  anchors: {
    maintenance: { anchor: string };
    premium: { anchor: string };
    factoryReset: { anchor: string };
  };
};

export function ServiceConditionGauge({ anchors }: Props) {
  const [active, setActive] = useState<ServiceId>("premium");
  const [enhanced, setEnhanced] = useState(false);
  const angle = angles[active];

  useEffect(() => {
    setEnhanced(true);
    const hash = window.location.hash;
    const next: ServiceId | null = hash === "#maintenance-detail" ? "maintenance" : hash === "#premium-detail" ? "premium" : hash === "#factory-reset" ? "factoryReset" : null;
    if (!next) return;
    setActive(next);
    requestAnimationFrame(() => document.querySelector(hash)?.scrollIntoView({ block: "start" }));
  }, []);

  const activeLabel = useMemo(() => active === "maintenance" ? "Clean" : active === "premium" ? "Daily buildup" : "Neglected", [active]);

  return (
    <div className={`sv90-condition-module ${enhanced ? "is-enhanced" : ""}`}>
      <div className="sv90-gauge" aria-hidden="true" style={{ "--sv90-needle": `${angle}deg` } as CSSProperties}>
        <svg viewBox="0 0 300 178">
          <path className="sv90-gauge-arc" d="M35 145 A115 115 0 0 1 265 145" />
          {[-70,-55,-40,-25,-10,5,20,35,50,65,80].map((tick) => (
            <line key={tick} x1="150" y1="22" x2="150" y2={tick % 20 === 0 ? "38" : "32"} transform={`rotate(${tick} 150 145)`} />
          ))}
          <text x="26" y="165">CLEAN</text>
          <text x="150" y="30" textAnchor="middle">DAILY BUILDUP</text>
          <text x="274" y="165" textAnchor="end">NEGLECTED</text>
          <circle cx="150" cy="145" r="18" className="sv90-gauge-cap" />
          <text x="150" y="150" textAnchor="middle" className="sv90-gauge-ed">ED</text>
        </svg>
        <span className="sv90-gauge-needle" />
        <span className="sr-only">Selected condition: {activeLabel}</span>
      </div>

      <div className="sv90-core-panels">
        <article
          id={anchors.maintenance.anchor}
          className={`sv90-core-panel ${active === "maintenance" ? "is-active" : ""}`}
          onMouseEnter={() => setActive("maintenance")}
          onFocusCapture={() => setActive("maintenance")}
          onClick={() => setActive("maintenance")}
        >
          <PanelContent id="maintenance" number="01" condition="ALREADY PRETTY CLEAN" image="tesla-foam-wash" />
        </article>
        <article
          id={anchors.premium.anchor}
          className={`sv90-core-panel ${active === "premium" ? "is-active" : ""}`}
          onMouseEnter={() => setActive("premium")}
          onFocusCapture={() => setActive("premium")}
          onClick={() => setActive("premium")}
        >
          <PanelContent id="premium" number="02" condition="NORMAL DAILY BUILDUP" image="two-tech-interior-detail" featured />
        </article>
        <article
          id={anchors.factoryReset.anchor}
          className={`sv90-core-panel ${active === "factoryReset" ? "is-active" : ""}`}
          onMouseEnter={() => setActive("factoryReset")}
          onFocusCapture={() => setActive("factoryReset")}
          onClick={() => setActive("factoryReset")}
        >
          <PanelContent id="factoryReset" number="03" condition="HEAVY BUILDUP OR NEGLECT" image="hq-interior-front-seat-work" />
        </article>
      </div>
    </div>
  );
}
