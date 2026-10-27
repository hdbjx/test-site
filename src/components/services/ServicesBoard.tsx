"use client";

import { useEffect, useRef, useState } from "react";
import { Photo } from "@/components/Photo";
import { RubberStamp } from "@/components/ed/RubberStamp";
import { TrackedLink } from "@/components/TrackedLink";
import { NextOpeningNote } from "@/components/journey/NextOpeningNote";
import { useJourney } from "@/components/journey/JourneyContext";
import { siteVehicleLabel, useVehicle } from "@/components/vehicle/VehicleContext";
import { PRICING, serviceIds, services, vehicles, type ServiceId, type VehicleId } from "@/data/services";
import { ADDON_LABELS, ADDON_PRICES, addonIds, isAddonIncludedInService, purchasableAddonIds } from "@/data/quoteExtras";
import { serviceDetails } from "@/data/serviceDetails";
import { track } from "@/lib/analytics";
import { durationShort, usd } from "@/lib/format";
import styles from "./ServicesBoard.module.css";

/**
 * The services menu board: one place to compare the three details. Prices follow the
 * vehicle size; coverage meters and a "builds on" list show what each tier adds so the
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
  const [detailsFor, setDetailsFor] = useState<ServiceId | null>(null);
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
          {serviceIds.map((id) => {
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
                  <span key={`${id}-${quote.price}`} className={styles.price}>{usd(quote.price)}</span>
                  <span className={styles.priceSize}>{sizeLabel}</span>
                </div>

                <p className={styles.cellMeta}>About {durationShort(quote.minutes)} in your driveway</p>

                <div className={styles.cellNext}>
                  <NextOpeningNote service={id} vehicle={siteVehicle ? selected : null} location="services_board" />
                </div>

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
                  <button
                    type="button"
                    className={styles.detailsButton}
                    onClick={() => {
                      setDetailsFor(id);
                      track("service_select", { service: id, location: "services_board_details" });
                    }}
                  >
                    See everything included <span aria-hidden="true">+</span>
                  </button>
                </div>

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

      <ServiceDetailsDialog
        id={detailsFor}
        vehicle={selected}
        sizeLabel={sizeLabel}
        bookHref={detailsFor ? bookHref(detailsFor) : "/book"}
        onBook={(id) => setServiceIntent(id)}
        onClose={() => setDetailsFor(null)}
      />
    </section>
  );
}


/** Full checklist for one service, opened from "See everything included". */
function ServiceDetailsDialog({
  id,
  vehicle,
  sizeLabel,
  bookHref,
  onBook,
  onClose,
}: {
  id: ServiceId | null;
  vehicle: VehicleId;
  sizeLabel: string;
  bookHref: string;
  onBook: (id: ServiceId) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (id && !dialog.open) dialog.showModal();
    if (!id && dialog.open) dialog.close();
  }, [id]);

  const service = id ? services[id] : null;
  const detail = id ? serviceDetails[id] : null;
  const quote = id ? PRICING[vehicle][id] : null;
  const included = id ? addonIds.filter((addon) => isAddonIncludedInService(id, addon)) : [];
  const includedValue = included.reduce((sum, addon) => sum + (ADDON_PRICES[addon] ?? 0), 0);
  const extras = id ? purchasableAddonIds(id) : [];

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby="svc-details-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {id && service && detail && quote && (
        <div className={styles.sheet}>
          <header className={styles.sheetHead}>
            <div>
              <p className={styles.sheetKicker}>{TIER[id].number} / Everything included</p>
              <h3 id="svc-details-title" className={styles.sheetTitle}>{service.name}</h3>
            </div>
            <button type="button" className={styles.sheetClose} onClick={onClose} aria-label="Close">×</button>
          </header>

          <div className={styles.sheetBody}>
            <div className={styles.sheetFacts}>
              <p><strong>{usd(quote.price)}</strong><span>{sizeLabel}</span></p>
              <p><strong>{durationShort(quote.minutes)}</strong><span>On site</span></p>
              <p><strong>{service.crew}</strong><span>{service.crew === 1 ? "Technician" : "Technicians"}</span></p>
            </div>

            <p className={styles.sheetIntro}>{detail.intro}</p>
            <p className={styles.sheetFor}><span>Best for</span>{service.whoFor} {service.cadence}.</p>

            <div className={styles.sheetLists}>
              <section>
                <h4>Exterior</h4>
                <ul>{detail.exterior.map((item) => <li key={item}>{item}</li>)}</ul>
              </section>
              <section>
                <h4>Interior</h4>
                <ul>{detail.interior.map((item) => <li key={item}>{item}</li>)}</ul>
              </section>
            </div>

            {included.length > 0 && (
              <section className={styles.sheetIncluded}>
                <h4>
                  Add-ons already included
                  {includedValue > 0 && <span>{usd(includedValue)} if booked separately</span>}
                </h4>
                <ul>{included.map((addon) => <li key={addon}>{ADDON_LABELS[addon]}</li>)}</ul>
              </section>
            )}

            {extras.length > 0 && (
              <section className={styles.sheetExtras}>
                <h4>Add when you book</h4>
                <ul>
                  {extras.map((addon) => (
                    <li key={addon}>
                      <span>{ADDON_LABELS[addon]}</span>
                      <i aria-hidden="true" />
                      <strong>{ADDON_PRICES[addon] == null ? "Quote" : `+${usd(ADDON_PRICES[addon])}`}</strong>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <footer className={styles.sheetFoot}>
            <TrackedLink
              href={bookHref}
              event="book_click"
              params={{ location: "services_board_details", service: id, vehicle }}
              className={styles.bookPrimary}
              onClick={() => onBook(id)}
            >
              Book {service.name.replace(" Detail", "")} · {usd(quote.price)} <span aria-hidden="true">↗</span>
            </TrackedLink>
          </footer>
        </div>
      )}
    </dialog>
  );
}
