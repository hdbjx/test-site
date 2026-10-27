"use client";

import { useEffect, useState } from "react";
import { Photo } from "@/components/Photo";
import { RubberStamp } from "@/components/ed/RubberStamp";
import { TrackedLink } from "@/components/TrackedLink";
import { NextOpeningNote } from "@/components/journey/NextOpeningNote";
import { useJourney } from "@/components/journey/JourneyContext";
import { SplitFlapPrice } from "@/components/services/SplitFlapPrice";
import { siteVehicleLabel, useVehicle } from "@/components/vehicle/VehicleContext";
import { PRICING, serviceIds, services, vehicles, type ServiceId, type VehicleId } from "@/data/services";
import { track } from "@/lib/analytics";
import { durationShort, usd } from "@/lib/format";
import styles from "./ServicesBoard.module.css";

/**
 * The services menu board: one place to compare the three details. Prices follow the
 * vehicle size, and every column lists the same checklist in the same order so the
 * differences line up across the board.
 */

const TIER: Record<ServiceId, { number: string; condition: string; photo: string }> = {
  maintenance: { number: "01", condition: "Already pretty clean", photo: "work-02" },
  premium: { number: "02", condition: "Normal daily buildup", photo: "work-03" },
  factoryReset: { number: "03", condition: "Heavy buildup or neglect", photo: "hq-technician-trunk-detail" },
};

/*
 * Coverage meters: how deep each detail goes in three areas, out of 5. Paint tops out
 * at 3 on purpose: correction and ceramic are separate services.
 */
const METERS: { label: string; levels: Record<ServiceId, number> }[] = [
  { label: "Exterior", levels: { maintenance: 3, premium: 4, factoryReset: 5 } },
  { label: "Interior", levels: { maintenance: 2, premium: 4, factoryReset: 5 } },
  { label: "Paint", levels: { maintenance: 0, premium: 2, factoryReset: 3 } },
];
const METER_STEPS = 5;

export function ServicesBoard({ anchorId = "all-services" }: { anchorId?: string }) {
  const { vehicle: siteVehicle, openPicker, selectVehicle } = useVehicle();
  const { setServiceIntent } = useJourney();
  const [fallbackVehicle, setFallbackVehicle] = useState<VehicleId>(siteVehicle?.vehicle ?? "sedan");
  // Phone shows one tier at a time; desktop shows all three side by side.
  const [active, setActive] = useState<ServiceId>("premium");
  const selected = siteVehicle?.vehicle ?? fallbackVehicle;
  const sizeLabel = vehicles.find((item) => item.id === selected)?.label ?? "Sedan";

  useEffect(() => {
    if (siteVehicle?.vehicle) setFallbackVehicle(siteVehicle.vehicle);
  }, [siteVehicle?.vehicle]);

  // Deep links like /our-services#factory-reset open that tier on phone.
  useEffect(() => {
    const fromHash = () => {
      const match = serviceIds.find((id) => `#${services[id].slug}` === window.location.hash);
      if (match) setActive(match);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const chooseVehicle = (id: VehicleId) => {
    setFallbackVehicle(id);
    track("vehicle_select", { vehicle: id, location: "services_board" });
    if (!siteVehicle) return;
    const label = vehicles.find((item) => item.id === id)?.label ?? "Vehicle";
    void selectVehicle({ make: "", model: "", vehicle: id, customLabel: label }, false);
  };

  const bookHref = (id: ServiceId) =>
    siteVehicle ? `/book?service=${id}&from=context` : `/book?service=${id}&vehicle=${selected}&from=context`;

  return (
    <section id={anchorId} className={styles.section} data-header-tone="ink" aria-labelledby="svc-board-title">
      <div className={styles.shell}>
        <header className={styles.head}>
          <div>
            <p className={styles.kicker}>The menu / priced by vehicle</p>
            <h2 id="svc-board-title" className={styles.title}>
              <span>Three details.</span>
              <span>One honest price.</span>
            </h2>
          </div>
          <div className={styles.sizes}>
            {siteVehicle ? (
              <p className={styles.pricedFor}>
                Priced for <strong>{siteVehicleLabel(siteVehicle)}</strong>
                <button type="button" onClick={openPicker}>Change</button>
              </p>
            ) : (
              <p className={styles.pricedFor}>Pick your vehicle size</p>
            )}
            <div className={styles.sizeSwitch} role="radiogroup" aria-label="Vehicle size">
              {vehicles.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={item.id === selected}
                  className={item.id === selected ? styles.sizeOn : undefined}
                  onClick={() => chooseVehicle(item.id)}
                  title={item.hint}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className={styles.tierTabs} role="tablist" aria-label="Choose a detail">
          {serviceIds.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={id === active}
              aria-controls={services[id].slug}
              className={id === active ? styles.tierOn : undefined}
              onClick={() => setActive(id)}
            >
              <span>{TIER[id].number}</span>
              {services[id].name.replace(" Detail", "")}
            </button>
          ))}
        </div>

        <div className={styles.board}>
          {serviceIds.map((id, column) => {
            const service = services[id];
            const tier = TIER[id];
            const quote = PRICING[selected][id];
            const featured = Boolean(service.recommended);
            return (
              <article
                key={id}
                id={service.slug}
                className={`${styles.col} ${featured ? styles.featured : ""} ${id === active ? styles.isActive : ""}`}
                aria-labelledby={`svc-board-${id}`}
              >
                <div className={styles.cellHead}>
                  <div className={styles.photo}>
                    <Photo id={tier.photo} sizes="(max-width: 820px) 92vw, 30vw" fill />
                    <span className={styles.photoShade} aria-hidden="true" />
                    <span className={styles.number} aria-hidden="true">{tier.number}</span>
                    {featured && <RubberStamp className={styles.stamp}>MOST BOOKED</RubberStamp>}
                  </div>
                  <p className={styles.condition}>{tier.condition}</p>
                  <h3 id={`svc-board-${id}`} className={styles.name}>{service.name}</h3>
                  <p className={styles.short}>{service.short}</p>
                </div>

                <div className={styles.cellPrice}>
                  <span className={styles.priceSize}>{sizeLabel}</span>
                  <SplitFlapPrice value={usd(quote.price)} rowIndex={column} />
                </div>

                <p className={styles.cellMeta}>
                  About {durationShort(quote.minutes)} · {service.crew === 1 ? "1 technician" : `${service.crew} technicians`}
                </p>

                <div className={styles.cellNext}>
                  <NextOpeningNote service={id} vehicle={siteVehicle ? selected : null} location="services_board" />
                </div>

                <p className={styles.cellFor}><span>Best for</span>{service.whoFor}</p>

                <div className={styles.cellMeters} aria-label={`Coverage: ${METERS.map((m) => `${m.label.toLowerCase()} ${m.levels[id]} of ${METER_STEPS}`).join(", ")}`}>
                  {METERS.map((meter) => (
                    <div key={meter.label} className={styles.meter} aria-hidden="true">
                      <span className={styles.meterLabel}>{meter.label}</span>
                      <span className={styles.meterBar}>
                        {Array.from({ length: METER_STEPS }, (_, step) => (
                          <i key={step} className={step < meter.levels[id] ? styles.meterOn : undefined} />
                        ))}
                      </span>
                    </div>
                  ))}
                </div>

                <div className={styles.cellIncludes}>
                  {service.includes[0]?.startsWith("Everything in") ? (
                    <>
                      <p className={styles.buildsOn}>{service.includes[0]}, <em>plus</em></p>
                      <ul className={styles.adds}>
                        {service.includes.slice(1).map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </>
                  ) : (
                    <ul className={styles.basics}>
                      {service.includes.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  )}
                </div>

                <p className={styles.cellCadence}>{service.cadence}</p>

                <div className={styles.cellCta}>
                  <TrackedLink
                    href={bookHref(id)}
                    event="book_click"
                    params={{ location: "services_board", service: id, vehicle: selected }}
                    className={featured ? styles.bookPrimary : styles.book}
                    onClick={() => setServiceIntent(id)}
                  >
                    Book {service.name.replace(" Detail", "")} <span aria-hidden="true">↗</span>
                  </TrackedLink>
                </div>
              </article>
            );
          })}
        </div>

        <p className={styles.footnote}>Exact price follows the vehicle size · Power and water included on every job</p>
      </div>
    </section>
  );
}

