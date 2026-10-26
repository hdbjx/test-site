"use client";

import { useEffect, useState } from "react";
import { Photo } from "@/components/Photo";
import { RubberStamp } from "@/components/ed/RubberStamp";
import { ConditionDial } from "@/components/services/ConditionDial";
import { TrackedLink } from "@/components/TrackedLink";
import { siteVehicleLabel, useVehicle } from "@/components/vehicle/VehicleContext";
import { PRICING, services, startingPrice, type ServiceId } from "@/data/services";
import { usd } from "@/lib/format";

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

  useEffect(() => {
    setEnhanced(true);
    const hash = window.location.hash;
    const next: ServiceId | null = hash === "#maintenance-detail" ? "maintenance" : hash === "#premium-detail" ? "premium" : hash === "#factory-reset" ? "factoryReset" : null;
    if (!next) return;
    setActive(next);
    requestAnimationFrame(() => document.querySelector(hash)?.scrollIntoView({ block: "start" }));
  }, []);

  return (
    <div className={`sv90-condition-module ${enhanced ? "is-enhanced" : ""}`}>
      <div className="sv90-core-intro">
        <div className="sv90-core-heading">
          <h2 id="sv90-core-title" className="ed90-heading">WHAT SHAPE<br /><span>IS IT IN?</span></h2>
          <TrackedLink href="/get-a-quote" event="quote_start" params={{ location: "services_core_unsure" }}>Not sure? Find my detail ↗</TrackedLink>
        </div>
        <div className="sv90-dial-slot">
          <ConditionDial value={active} onChange={setActive} />
        </div>
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
