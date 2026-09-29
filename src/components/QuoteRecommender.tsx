"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { bookingHref } from "@/data/booking";
import { recommenderVehicles, type RecommenderVehicle } from "@/data/recommenderVehicles";
import { PRICING, services, vehicleLabel, type ServiceId, type VehicleId } from "@/data/services";
import { track } from "@/lib/analytics";
import { submitLead } from "@/lib/submit";

const CONDITIONS = [
  { value: 1, label: "Like New", desc: "Looks great in there. Regular upkeep is all it needs." },
  { value: 2, label: "Good", desc: "Normal wear for a daily driver. Some dust and light grime, easy to refresh." },
  { value: 3, label: "Fair", desc: "Starting to show its age. It needs a proper clean to feel right again." },
  { value: 4, label: "Dirty", desc: "Definitely needs attention, with built-up grime, stains, or general neglect." },
  { value: 5, label: "Wrecked", desc: "Heavy use or a serious mess. The kind of job that takes real time and skill." },
] as const;

type ConcernId = "pet" | "odor" | "stains" | "exterior" | "headlights" | "selling";
const CONCERNS: Array<{ id: ConcernId; label: string; sub: string }> = [
  { id: "pet", label: "Pet Hair", sub: "Fur on seats or carpet" },
  { id: "odor", label: "Bad Odor", sub: "Smoke, food, pets, mildew" },
  { id: "stains", label: "Stains", sub: "Seats, carpet, or headliner" },
  { id: "exterior", label: "Dull Paint", sub: "Faded, scratched, or oxidized" },
  { id: "headlights", label: "Cloudy Headlights", sub: "Yellowed or foggy lenses" },
  { id: "selling", label: "Selling Soon", sub: "Want top dollar" },
];

type AddonId = "Sealant" | "Pet Hair Removal" | "Clay Bar" | "Plastic Restoration" | "Headlight Restoration" | "Engine Bay" | "Extraction" | "Odor Removal";
type Addon = { id: AddonId; name: string; price: string; recommended: boolean };

const ADDON_PRICES: Record<AddonId, number | null> = {
  Sealant: 60,
  "Pet Hair Removal": 40,
  "Clay Bar": 95,
  "Plastic Restoration": 40,
  "Headlight Restoration": 70,
  "Engine Bay": 70,
  Extraction: null,
  "Odor Removal": null,
};

type PaintUpgradeId = "polish" | "ceramic";
const PAINT_UPGRADES: Record<PaintUpgradeId, { name: string; tag: string; why: string; prices: Record<VehicleId, number> }> = {
  polish: {
    name: "Enhancement Polish",
    tag: "Paint correction",
    why: "A single-stage machine polish removes light swirl marks and water spot etching, restoring gloss and optical clarity. Scheduled as a separate appointment after your detail.",
    prices: { sedan: 395, smallSUV: 445, smallTruck: 445, largeSUV: 525, largeTruck: 525, minivan: 495 },
  },
  ceramic: {
    name: "2-Year Ceramic Coating",
    tag: "Long-term protection",
    why: "A nano-ceramic coating bonds to the clear coat to create a durable hydrophobic layer rated for two years. It pairs with the Enhancement Polish for maximum results.",
    prices: { sedan: 895, smallSUV: 995, smallTruck: 995, largeSUV: 1095, largeTruck: 1095, minivan: 1020 },
  },
};

type Recommendation = {
  service: ServiceId;
  why: string;
  addons: Addon[];
  upgradeService: ServiceId | null;
  upgradeMessage: string | null;
  preSelectPaint: boolean;
};

function recommendation(condition: number, concerns: Set<ConcernId>): Recommendation {
  const selling = concerns.has("selling");
  const hasPet = concerns.has("pet");
  const hasOdor = concerns.has("odor");
  const hasStain = concerns.has("stains");
  const hasExt = concerns.has("exterior");
  const hasHead = concerns.has("headlights");
  let service: ServiceId;
  let why: string;
  let upgradeService: ServiceId | null = null;
  let upgradeMessage: string | null = null;
  const addons: Addon[] = [];

  if (selling) {
    service = "factoryReset";
    why = "Pre-sale preparation is one of the highest-ROI details we offer. A Factory Reset is fully inclusive: intensive interior restoration with hot water extraction, odor treatment, stain removal, pet hair removal, and APC breakdown of every panel, plus a complete decontamination exterior wash, clay bar, protective sealant, and plastic restoration. A vehicle that looks and smells clean commands more at sale and moves faster.";
  } else if (condition === 1) {
    service = "maintenance";
    upgradeService = "premium";
    why = "Your vehicle is in great shape. Surface contamination is minimal and the interior just needs a light refresh. A Maintenance Detail covers a full interior wipe-down, vacuum, and a contact wash with pH-neutral shampoo finished with paint protection. Quick, thorough, and priced to keep clean cars clean.";
    upgradeMessage = "Want to go deeper? Our Premium Detail adds a full two-bucket decontamination wash, APC treatment on all interior panels, and a protective sealant coat.";
    if (hasPet) addons.push({ id: "Pet Hair Removal", name: "Pet Hair Removal", price: "+$40", recommended: true });
    if (hasOdor) addons.push({ id: "Odor Removal", name: "Odor Elimination", price: "$130–$200", recommended: true });
    if (hasStain) addons.push({ id: "Extraction", name: "Hot Water Extraction", price: "$60–$120", recommended: true });
    if (hasHead) addons.push({ id: "Headlight Restoration", name: "Headlight Restoration", price: "+$70", recommended: true });
    if (hasExt) addons.push({ id: "Clay Bar", name: "Clay Bar Decontamination", price: "+$70–$120", recommended: true });
    if (!hasExt) addons.push({ id: "Sealant", name: "Protective Sealant", price: "+$60", recommended: false });
  } else if (condition === 2) {
    service = "premium";
    why = "Your car is in good shape with normal daily wear. A Premium Detail is the right fit: full two-bucket contact wash, deep interior clean with APC on all surfaces, multi-pass vacuum with drill-brush agitation on mats, seat and door jamb treatment, plus a protective sealant finish.";
    if (hasPet) addons.push({ id: "Pet Hair Removal", name: "Pet Hair Removal", price: "+$40", recommended: true });
    if (hasOdor) addons.push({ id: "Odor Removal", name: "Odor Elimination", price: "$130–$200", recommended: true });
    if (hasStain) addons.push({ id: "Extraction", name: "Hot Water Extraction", price: "$60–$120", recommended: true });
    if (hasHead) addons.push({ id: "Headlight Restoration", name: "Headlight Restoration", price: "+$70", recommended: true });
    if (hasExt) {
      addons.push({ id: "Clay Bar", name: "Clay Bar Decontamination", price: "+$70–$120", recommended: true });
      addons.push({ id: "Plastic Restoration", name: "Trim & Plastic Restoration", price: "+$40", recommended: false });
    }
  } else if (condition === 3) {
    service = "premium";
    upgradeService = "factoryReset";
    why = "With moderate soiling, embedded particulates in carpet fibers, surface oxidation on trim, and general buildup in high-contact areas, a Premium Detail gives us the depth to properly address each surface. APC on all interior panels, multi-pass vacuum, carpet treatment, a full decontamination exterior wash, and protective sealant are included.";
    upgradeMessage = "If you want full stain remediation, odor treatment, clay bar, plastic restoration, and every service in one all-in job, our Factory Reset covers everything with no extras needed.";
    if (hasPet) addons.push({ id: "Pet Hair Removal", name: "Pet Hair Removal", price: "+$40", recommended: true });
    if (hasOdor) addons.push({ id: "Odor Removal", name: "Odor Elimination", price: "$130–$200", recommended: true });
    if (hasStain) addons.push({ id: "Extraction", name: "Hot Water Extraction", price: "$60–$120", recommended: true });
    if (hasHead) addons.push({ id: "Headlight Restoration", name: "Headlight Restoration", price: "+$70", recommended: true });
    if (hasExt) {
      addons.push({ id: "Clay Bar", name: "Clay Bar Decontamination", price: "+$70–$120", recommended: true });
      addons.push({ id: "Plastic Restoration", name: "Trim & Plastic Restoration", price: "+$40", recommended: false });
    }
  } else {
    service = "factoryReset";
    why = condition === 5
      ? "At this level of buildup, heavy contamination, biological matter in seams, deeply embedded staining, and significant exterior oxidation, only a Factory Reset has the scope to do the job right. Full hot water extraction, drill-brush agitation on all fabric, APC breakdown of every interior surface, odor treatment, pet hair removal, pre-wash, two-bucket contact wash, clay bar, protective sealant, and plastic restoration are included."
      : "Your car needs a proper reset. A Factory Reset is our most comprehensive service: intensive interior restoration with hot water extraction, odor treatment, stain and pet hair removal, APC on every surface, plus a full decontamination exterior wash, clay bar, protective sealant, and plastic restoration. Everything is included, with no add-ons needed.";
  }

  return { service, why, addons, upgradeService, upgradeMessage, preSelectPaint: hasExt && !selling };
}

function concernLabel(id: ConcernId) {
  return CONCERNS.find((item) => item.id === id)?.label ?? id;
}

export function QuoteRecommender({ defaultInterest }: { defaultInterest?: string }) {
  const [vehicle, setVehicle] = useState<RecommenderVehicle | null>(null);
  const [search, setSearch] = useState("");
  const [condition, setCondition] = useState<number | null>(null);
  const [concerns, setConcerns] = useState<Set<ConcernId>>(new Set());
  const [result, setResult] = useState<Recommendation | null>(null);
  const [service, setService] = useState<ServiceId | null>(null);
  const [checkedAddons, setCheckedAddons] = useState<Set<AddonId>>(new Set());
  const [paint, setPaint] = useState<Set<PaintUpgradeId>>(new Set());
  const [whyExpanded, setWhyExpanded] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const started = useRef(false);
  const conditionRef = useRef<HTMLDivElement>(null);
  const concernsRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const start = () => {
    if (started.current) return;
    started.current = true;
    track("quote_start", { location: "recommender" });
  };

  const matches = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (query.length < 2 || vehicle) return [];
    return recommenderVehicles
      .filter((item) => `${item.make} ${item.model}`.toLowerCase().includes(query) || item.make.toLowerCase().startsWith(query) || item.model.toLowerCase().startsWith(query))
      .slice(0, 10);
  }, [search, vehicle]);

  const activeService = service && vehicle ? services[service] : null;
  const basePrice = service && vehicle ? PRICING[vehicle.vehicle][service].price : 0;
  let addonTotal = 0;
  let hasRange = false;
  checkedAddons.forEach((id) => {
    const amount = ADDON_PRICES[id];
    if (amount) addonTotal += amount;
    else hasRange = true;
  });
  paint.forEach((id) => { if (vehicle) addonTotal += PAINT_UPGRADES[id].prices[vehicle.vehicle]; });
  const total = basePrice + addonTotal;
  const hasPaint = paint.size > 0;
  const totalDisplay = `$${total}${hasRange && !hasPaint ? " +" : ""}`;
  const totalNote = hasPaint
    ? "Paint service is a separate appointment after your detail."
    : hasRange
      ? "Some add-ons are priced on-site based on condition. We will confirm before starting."
      : "Pricing confirmed before we start. No surprises.";

  function selectVehicle(item: RecommenderVehicle) {
    start();
    setVehicle(item);
    setSearch("");
    setCondition(null);
    setConcerns(new Set());
    setResult(null);
    track("vehicle_select", { vehicle: item.vehicle, location: "recommender" });
    window.setTimeout(() => conditionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
  }

  function chooseCondition(value: number) {
    start();
    setCondition(value);
    setResult(null);
    window.setTimeout(() => concernsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 120);
  }

  function toggleConcern(id: ConcernId) {
    start();
    setResult(null);
    setConcerns((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function buildResult() {
    if (!vehicle || !condition) return;
    const next = recommendation(condition, concerns);
    setResult(next);
    setService(next.service);
    setCheckedAddons(new Set(next.addons.filter((item) => item.recommended).map((item) => item.id)));
    const initialPaint = defaultInterest === "ceramic"
      ? new Set<PaintUpgradeId>(["ceramic"])
      : defaultInterest === "paint-correction"
        ? new Set<PaintUpgradeId>(["polish"])
        : next.preSelectPaint
          ? new Set<PaintUpgradeId>(["polish", "ceramic"])
          : new Set<PaintUpgradeId>();
    setPaint(initialPaint);
    setWhyExpanded(false);
    setError(null);
    window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }

  function applyUpgrade() {
    if (!result?.upgradeService) return;
    setService(result.upgradeService);
    setResult({ ...result, upgradeService: null, upgradeMessage: null });
  }

  function toggleAddon(id: AddonId) {
    setCheckedAddons((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function togglePaint(id: PaintUpgradeId) {
    setPaint((current) => {
      const wasSelected = current.has(id);
      const next = new Set<PaintUpgradeId>();
      if (!wasSelected) next.add(id);
      return next;
    });
  }

  function reset() {
    setVehicle(null);
    setSearch("");
    setCondition(null);
    setConcerns(new Set());
    setResult(null);
    setService(null);
    setCheckedAddons(new Set());
    setPaint(new Set());
    setWhyExpanded(false);
    setName("");
    setPhone("");
    setEmail("");
    setError(null);
    setSending(false);
    setSent(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function sendBuild() {
    if (!vehicle || !condition || !service || !result) return;
    if (!name.trim()) { setError("Enter your name so we know who the build belongs to."); return; }
    if ((phone.match(/\d/g) ?? []).length < 10) { setError("Enter a 10-digit phone number so we can follow up."); return; }

    const selectedAddonNames = result.addons.filter((item) => checkedAddons.has(item.id)).map((item) => item.name);
    const paintNames = [...paint].map((id) => PAINT_UPGRADES[id].name);
    const allAddons = [...selectedAddonNames, ...paintNames];
    const conditionLabel = CONDITIONS.find((item) => item.value === condition)?.label ?? "Not specified";
    const concernNames = [...concerns].map(concernLabel);
    const message = [
      `Interior condition: ${conditionLabel}`,
      concernNames.length ? `Specific concerns: ${concernNames.join(", ")}` : "",
    ].filter(Boolean).join(" | ");
    const internalNotes = [
      allAddons.length ? `Add-ons: ${allAddons.join(", ")}` : "",
      paintNames.length ? `Paint upgrades: ${paintNames.join(", ")}` : "",
      `Quoted total: ${totalDisplay}`,
      "Source: Website Recommender quiz",
    ].filter(Boolean).join(" | ");

    setSending(true);
    setError(null);
    const response = await submitLead({
      type: "quote",
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      vehicleMake: vehicle.make,
      vehicleModel: vehicle.model,
      vehicleSize: vehicleLabel(vehicle.vehicle),
      interest: services[service].name,
      addons: allAddons.join(", "),
      quote: String(total),
      quoteDisplay: totalDisplay,
      message,
      internalNotes,
      source: "Website Recommender",
    });

    if (response.ok) {
      setSent(true);
      track("quote_submit", { interest: service, source: "recommender" });
      if (paint.size) track("paint_inquiry", { location: "recommender", interest: [...paint].join(",") });
    } else {
      setError(response.error);
    }
    setSending(false);
  }

  if (result && vehicle && service && activeService) {
    return (
      <div ref={resultRef} className="quote-rec-result">
        <button type="button" onClick={reset} className="quote-rec-back">← Start over</button>
        <div className="quote-rec-result-grid">
          <section className="quote-rec-result-main">
            <p className="eyebrow">Our recommendation</p>
            <h2>{activeService.name}</h2>
            <p className={`quote-rec-why ${whyExpanded ? "is-expanded" : ""}`}>{result.why}</p>
            <button type="button" className="quote-rec-read" onClick={() => setWhyExpanded((value) => !value)}>
              {whyExpanded ? "Show less ↑" : "Read why ↓"}
            </button>
            <div className="quote-rec-base-price">
              <span>For your {vehicleLabel(vehicle.vehicle).toLowerCase()}</span>
              <strong>${basePrice}</strong>
            </div>
          </section>

          <aside className="quote-rec-build-summary">
            <span>Your vehicle</span>
            <strong>{vehicle.make} {vehicle.model}</strong>
            <small>{vehicleLabel(vehicle.vehicle)}</small>
          </aside>
        </div>

        {result.upgradeMessage && result.upgradeService && (
          <button type="button" className="quote-rec-upgrade" onClick={applyUpgrade}>
            <span>Consider upgrading</span>
            <strong>{result.upgradeMessage}</strong>
            <b>Upgrade to {services[result.upgradeService].name} ↗</b>
          </button>
        )}

        {result.addons.length > 0 && (
          <section className="quote-rec-options">
            <div className="quote-rec-options-head"><p className="eyebrow">Recommended add-ons</p><span>Tap to add or remove</span></div>
            <div className="quote-rec-addon-list">
              {result.addons.map((addon) => {
                const checked = checkedAddons.has(addon.id);
                return (
                  <button key={addon.id} type="button" className={`quote-rec-addon ${checked ? "is-selected" : ""}`} onClick={() => toggleAddon(addon.id)} aria-pressed={checked}>
                    <span className="quote-rec-check">{checked ? "✓" : ""}</span>
                    <strong>{addon.name}</strong>
                    {addon.recommended && <small>Recommended</small>}
                    <b>{addon.price}</b>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section className="quote-rec-options quote-rec-paint">
          <div className="quote-rec-options-head">
            <div><p className="eyebrow">{result.preSelectPaint ? "Recommended for dull paint" : "Take your paint further"}</p><h3>Paint correction + protection</h3></div>
            <span>Separate appointment</span>
          </div>
          <div className="quote-rec-paint-grid">
            {(Object.keys(PAINT_UPGRADES) as PaintUpgradeId[]).map((id) => {
              const item = PAINT_UPGRADES[id];
              const selected = paint.has(id);
              return (
                <button key={id} type="button" className={`quote-rec-paint-card ${selected ? "is-selected" : ""}`} onClick={() => togglePaint(id)} aria-pressed={selected}>
                  <span>{item.tag}</span>
                  <strong>{item.name}</strong>
                  <b>${item.prices[vehicle.vehicle]}</b>
                  <p>{item.why}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="quote-rec-checkout">
          <div className="quote-rec-total">
            <span>Estimated total</span>
            <strong>{totalDisplay}</strong>
            <p>{totalNote}</p>
          </div>

          {sent ? (
            <div className="quote-rec-sent" role="status">
              <span>Build sent</span>
              <h3>We&rsquo;ve got it.</h3>
              <p>Your exact build is now with the Every Detail team. We&rsquo;ll follow up directly.</p>
            </div>
          ) : (
            <div className="quote-rec-contact">
              <div className="quote-rec-contact-grid">
                <label><span>Name</span><input className="field" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label>
                <label><span>Phone</span><input className="field" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" autoComplete="tel" /></label>
                <label><span>Email <small>(optional)</small></span><input className="field" value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" /></label>
              </div>
              {error && <p className="quote-rec-error" role="alert">{error}</p>}
              <div className="quote-rec-actions">
                <button type="button" className="btn btn-primary" onClick={sendBuild} disabled={sending}>{sending ? "Sending..." : "Send us your build ↗"}</button>
                <Link className="btn btn-secondary" href={bookingHref(vehicle.vehicle, service)}>Book now ↗</Link>
              </div>
              <div className="quote-rec-trust"><span>✓ We follow up quickly</span><span>✓ Mobile, we come to you</span><span>✓ No commitment required</span></div>
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="quote-rec-shell" onFocus={start} onPointerDown={start}>
      <div className="quote-rec-progress" aria-label="Quote progress">
        <span className={vehicle ? "is-done" : "is-active"}><b>{vehicle ? "✓" : "01"}</b> Vehicle</span>
        <i />
        <span className={condition ? "is-done" : vehicle ? "is-active" : ""}><b>{condition ? "✓" : "02"}</b> Condition</span>
        <i />
        <span className={condition ? "is-active" : ""}><b>03</b> Issues</span>
      </div>

      <section className={`quote-rec-step ${vehicle ? "is-complete" : "is-active"}`}>
        <div className="quote-rec-step-number">01</div>
        <div className="quote-rec-step-content">
          <p className="eyebrow">Your vehicle</p>
          <h2>What are you driving?</h2>
          {vehicle ? (
            <div className="quote-rec-selected">
              <div><strong>{vehicle.make} {vehicle.model}</strong><span>{vehicleLabel(vehicle.vehicle)}</span></div>
              <button type="button" onClick={() => { setVehicle(null); setCondition(null); setResult(null); }}>Change</button>
            </div>
          ) : (
            <div className="quote-rec-search-wrap">
              <input className="field quote-rec-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Honda, F-150, RAV4..." autoComplete="off" aria-label="Search vehicle make or model" />
              {search.trim().length >= 2 && (
                <div className="quote-rec-search-results">
                  {matches.length ? matches.map((item, index) => (
                    <button key={`${item.make}-${item.model}-${index}`} type="button" onClick={() => selectVehicle(item)}>
                      <span><strong>{item.make}</strong> {item.model}</span><small>{vehicleLabel(item.vehicle)}</small>
                    </button>
                  )) : <p>No matches. Try another make or model.</p>}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section ref={conditionRef} className={`quote-rec-step ${!vehicle ? "is-locked" : condition ? "is-complete" : "is-active"}`}>
        <div className="quote-rec-step-number">02</div>
        <div className="quote-rec-step-content">
          <p className="eyebrow">Current condition</p>
          <h2>How&rsquo;s the interior looking?</h2>
          <div className="quote-rec-condition-grid">
            {CONDITIONS.map((item, index) => (
              <button key={item.value} type="button" disabled={!vehicle} className={condition === item.value ? "is-selected" : ""} onClick={() => chooseCondition(item.value)} aria-pressed={condition === item.value}>
                <span>0{index + 1}</span><strong>{item.label}</strong>
              </button>
            ))}
          </div>
          <p className="quote-rec-condition-desc">{condition ? CONDITIONS.find((item) => item.value === condition)?.desc : "Choose the closest match. You do not need to overthink it."}</p>
        </div>
      </section>

      <section ref={concernsRef} className={`quote-rec-step ${!condition ? "is-locked" : "is-active"}`}>
        <div className="quote-rec-step-number">03</div>
        <div className="quote-rec-step-content">
          <p className="eyebrow">Specific issues</p>
          <h2>Anything we should know about?</h2>
          <p className="quote-rec-step-lede">Optional. Choose everything that applies.</p>
          <div className="quote-rec-concern-grid">
            {CONCERNS.map((item) => {
              const selected = concerns.has(item.id);
              return (
                <button key={item.id} type="button" disabled={!condition} className={selected ? "is-selected" : ""} onClick={() => toggleConcern(item.id)} aria-pressed={selected}>
                  <span className="quote-rec-check">{selected ? "✓" : ""}</span><span><strong>{item.label}</strong><small>{item.sub}</small></span>
                </button>
              );
            })}
          </div>
          <button type="button" className="btn btn-primary quote-rec-build" disabled={!vehicle || !condition} onClick={buildResult}>See my recommendation ↗</button>
        </div>
      </section>
    </div>
  );
}
