"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { recommenderVehicles, type RecommenderVehicle } from "@/data/recommenderVehicles";
import { PRICING, services, vehicleLabel, type ServiceId } from "@/data/services";
import { ADDON_PRICES, PAINT_UPGRADES, type AddonId, type PaintUpgradeId } from "@/data/quoteExtras";
import { track } from "@/lib/analytics";
import { submitLead } from "@/lib/submit";
import { QuoteBookingContinuation } from "@/components/QuoteBookingContinuation";
import { TurnstileField } from "@/components/forms/TurnstileField";
import { useVehicle } from "@/components/vehicle/VehicleContext";
import { useJourney } from "@/components/journey/JourneyContext";
import { vehicleClassForYear, vehicleMatches, yearFromVehicleQuery } from "@/lib/vehicle-search";

const CONDITIONS = [
  { value: 1, label: "Like New", desc: "Looks great in there. Regular upkeep is all it needs." },
  { value: 2, label: "Good", desc: "Normal wear for a daily driver. Some dust and light grime, easy to refresh." },
  { value: 3, label: "Fair", desc: "Starting to show its age. It needs a proper clean to feel right again." },
  { value: 4, label: "Dirty", desc: "Definitely needs attention, with built-up grime, stains, or general neglect." },
  { value: 5, label: "Wrecked", desc: "Heavy use or a serious mess. The kind of job that takes real time and skill." },
] as const;

type ConcernId = "pet" | "odor" | "carpetStains" | "seatStains" | "exterior" | "headlights" | "selling";
const CONCERNS: Array<{ id: ConcernId; label: string; sub: string }> = [
  { id: "pet", label: "Pet Hair", sub: "Fur on seats or carpet" },
  { id: "odor", label: "Bad Odor", sub: "Smoke, food, pets, mildew" },
  { id: "carpetStains", label: "Carpet Stains", sub: "Stains or spills in the floor carpets" },
  { id: "seatStains", label: "Seat Stains", sub: "Stains or spills in fabric seats" },
  { id: "exterior", label: "Dull Paint", sub: "Faded, scratched, or oxidized" },
  { id: "headlights", label: "Cloudy Headlights", sub: "Yellowed or foggy lenses" },
  { id: "selling", label: "Selling Soon", sub: "Want top dollar" },
];

type Addon = { id: AddonId; name: string; price: string; recommended: boolean };

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
  const hasCarpetStains = concerns.has("carpetStains");
  const hasSeatStains = concerns.has("seatStains");
  const hasExt = concerns.has("exterior");
  const hasHead = concerns.has("headlights");
  let service: ServiceId;
  let why: string;
  let upgradeService: ServiceId | null = null;
  let upgradeMessage: string | null = null;
  const addons: Addon[] = [];

  if (selling) {
    service = "factoryReset";
    why = "Pre-sale preparation is one of the highest-ROI details we offer. A Factory Reset includes intensive interior restoration with hot water extraction, stain removal, pet hair removal, and APC breakdown of every panel, plus a complete decontamination exterior wash, clay bar, protective sealant, and plastic restoration. Odor Removal is available separately when needed.";
    if (hasOdor) addons.push({ id: "Odor Removal", name: "Odor Removal", price: "+$60", recommended: true });
    addons.push({ id: "Engine Bay", name: "Engine Bay", price: "+$70", recommended: false });
  } else if (condition === 1) {
    service = "maintenance";
    upgradeService = "premium";
    why = "Your vehicle is in great shape. Surface contamination is minimal and the interior just needs a light refresh. A Maintenance Detail covers a full interior wipe-down, vacuum, and a contact wash with pH-neutral shampoo finished with paint protection. Quick, thorough, and priced to keep clean cars clean.";
    upgradeMessage = "Want to go deeper? Our Premium Detail adds a full two-bucket decontamination wash, APC treatment on all interior panels, and a protective sealant coat.";
    if (hasPet) addons.push({ id: "Pet Hair Removal", name: "Pet Hair Removal", price: "+$40", recommended: true });
    if (hasOdor) addons.push({ id: "Odor Removal", name: "Odor Removal", price: "+$60", recommended: true });
    if (hasCarpetStains) addons.push({ id: "Carpet Extraction", name: "Floor Carpet Extraction", price: "+$90", recommended: true });
    if (hasSeatStains) addons.push({ id: "Seat Extraction", name: "Seat Extraction", price: "+$60", recommended: true });
    if (hasHead) addons.push({ id: "Headlight Restoration", name: "Headlight Restoration", price: "+$70", recommended: true });
    if (hasExt) addons.push({ id: "Clay Bar", name: "Clay Bar Decontamination", price: "+$95", recommended: true });
    if (!hasExt) addons.push({ id: "Sealant", name: "Protective Sealant", price: "+$60", recommended: false });
  } else if (condition === 2) {
    service = "premium";
    why = "Your car is in good shape with normal daily wear. A Premium Detail is the right fit: full two-bucket contact wash, deep interior clean with APC on all surfaces, multi-pass vacuum with drill-brush agitation on mats, seat and door jamb treatment, plus a protective sealant finish.";
    if (hasPet) addons.push({ id: "Pet Hair Removal", name: "Pet Hair Removal", price: "+$40", recommended: true });
    if (hasOdor) addons.push({ id: "Odor Removal", name: "Odor Removal", price: "+$60", recommended: true });
    if (hasCarpetStains) addons.push({ id: "Carpet Extraction", name: "Floor Carpet Extraction", price: "+$90", recommended: true });
    if (hasSeatStains) addons.push({ id: "Seat Extraction", name: "Seat Extraction", price: "+$60", recommended: true });
    if (hasHead) addons.push({ id: "Headlight Restoration", name: "Headlight Restoration", price: "+$70", recommended: true });
    if (hasExt) {
      addons.push({ id: "Clay Bar", name: "Clay Bar Decontamination", price: "+$95", recommended: true });
      addons.push({ id: "Plastic Restoration", name: "Trim & Plastic Restoration", price: "+$40", recommended: false });
    }
  } else if (condition === 3) {
    service = "premium";
    upgradeService = "factoryReset";
    why = "With moderate soiling, embedded particulates in carpet fibers, surface oxidation on trim, and general buildup in high-contact areas, a Premium Detail gives us the depth to properly address each surface. APC on all interior panels, multi-pass vacuum, carpet treatment, a full decontamination exterior wash, and protective sealant are included.";
    upgradeMessage = "If you want full stain remediation, extraction, clay bar, plastic restoration, and our deepest overall clean, Factory Reset is the right step up. Odor Removal and Engine Bay remain optional add-ons.";
    if (hasPet) addons.push({ id: "Pet Hair Removal", name: "Pet Hair Removal", price: "+$40", recommended: true });
    if (hasOdor) addons.push({ id: "Odor Removal", name: "Odor Removal", price: "+$60", recommended: true });
    if (hasCarpetStains) addons.push({ id: "Carpet Extraction", name: "Floor Carpet Extraction", price: "+$90", recommended: true });
    if (hasSeatStains) addons.push({ id: "Seat Extraction", name: "Seat Extraction", price: "+$60", recommended: true });
    if (hasHead) addons.push({ id: "Headlight Restoration", name: "Headlight Restoration", price: "+$70", recommended: true });
    if (hasExt) {
      addons.push({ id: "Clay Bar", name: "Clay Bar Decontamination", price: "+$95", recommended: true });
      addons.push({ id: "Plastic Restoration", name: "Trim & Plastic Restoration", price: "+$40", recommended: false });
    }
  } else {
    service = "factoryReset";
    why = condition === 5
      ? "At this level of buildup, only a Factory Reset has the scope to do the job right. Full hot water extraction, drill-brush agitation on fabric, APC breakdown of interior surfaces, pet hair removal, pre-wash, two-bucket contact wash, clay bar, protective sealant, and plastic restoration are included. Odor Removal is available separately when needed."
      : "Your car needs a proper reset. A Factory Reset is our most comprehensive service: intensive interior restoration with hot water extraction, stain and pet hair removal, APC on interior surfaces, plus a full decontamination exterior wash, clay bar, protective sealant, and plastic restoration. Odor Removal and Engine Bay are the only optional add-ons.";
    if (hasOdor) addons.push({ id: "Odor Removal", name: "Odor Removal", price: "+$60", recommended: true });
    addons.push({ id: "Engine Bay", name: "Engine Bay", price: "+$70", recommended: false });
  }

  return { service, why, addons, upgradeService, upgradeMessage, preSelectPaint: hasExt && !selling };
}

function concernLabel(id: ConcernId) {
  return CONCERNS.find((item) => item.id === id)?.label ?? id;
}

export function QuoteRecommender({ defaultInterest }: { defaultInterest?: string }) {
  const { vehicle: siteVehicle, selectVehicle: selectSiteVehicle, openPicker } = useVehicle();
  const { setServiceIntent } = useJourney();
  const [vehicle, setVehicle] = useState<RecommenderVehicle | null>(() => siteVehicle?.make && siteVehicle?.model ? { make: siteVehicle.make, model: siteVehicle.model, vehicle: siteVehicle.vehicle } : null);
  const [search, setSearch] = useState("");
  const [condition, setCondition] = useState<number | null>(null);
  const [concerns, setConcerns] = useState<Set<ConcernId>>(new Set());
  const [result, setResult] = useState<Recommendation | null>(null);
  const [service, setService] = useState<ServiceId | null>(null);
  const [checkedAddons, setCheckedAddons] = useState<Set<AddonId>>(new Set());
  const [paint, setPaint] = useState<Set<PaintUpgradeId>>(new Set());
  const [customizeExpanded, setCustomizeExpanded] = useState(false);
  const [quoteDirty, setQuoteDirty] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [desiredTiming, setDesiredTiming] = useState<"asap" | "weekend" | "next_week" | "exploring" | null>(null);
  const [sessionId, setSessionId] = useState("");
  const started = useRef(false);
  const conditionRef = useRef<HTMLDivElement>(null);
  const concernsRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let id = sessionStorage.getItem("ed_quote_session_id");
    if (!id) { id = crypto.randomUUID(); sessionStorage.setItem("ed_quote_session_id", id); }
    setSessionId(id);
  }, []);

  useEffect(() => {
    if (!siteVehicle?.make || !siteVehicle?.model) return;
    setVehicle({ make: siteVehicle.make, model: siteVehicle.model, vehicle: siteVehicle.vehicle });
    setSearch("");
  }, [siteVehicle]);

  // Each result stage (match, then revealed price) starts at the top of the screen.
  useEffect(() => {
    if (!result) return;
    resultRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [result, sent]);

  async function recordBehavior(stage: string, extra: Record<string, unknown> = {}) {
    const id = sessionId || sessionStorage.getItem("ed_quote_session_id");
    if (!id) return;
    await fetch("/api/quote-session", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ sessionId:id, stage, ...extra }) }).catch(() => null);
  }

  const start = () => {
    if (started.current) return;
    started.current = true;
    track("quote_start", { location: "recommender" });
  };

  const matches = useMemo(() => vehicle ? [] : vehicleMatches(search, 10), [search, vehicle]);

  const activeService = service && vehicle ? services[service] : null;
  const selectedCondition = condition ? CONDITIONS.find((item) => item.value === condition) ?? null : null;
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
    const selectedYear = yearFromVehicleQuery(search);
    const pricedVehicle = vehicleClassForYear(item, selectedYear);
    const selectedItem = { ...item, vehicle: pricedVehicle };
    setVehicle(selectedItem);
    selectSiteVehicle({ make: item.make, model: item.model, year: selectedYear || undefined, vehicle: pricedVehicle });
    setSearch("");
    setCondition(null);
    setConcerns(new Set());
    setResult(null);
    track("vehicle_select", { vehicle: item.vehicle, location: "recommender" });
  }

  function chooseCondition(value: number) {
    start();
    setCondition(value);
    setResult(null);
    setService(null);
    setServiceIntent(null);
  }

  function toggleConcern(id: ConcernId) {
    start();
    setResult(null);
    setService(null);
    setServiceIntent(null);
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
    setServiceIntent(next.service);
    setCheckedAddons(new Set(next.addons.filter((item) => item.recommended).map((item) => item.id)));
    const initialPaint = defaultInterest === "ceramic"
      ? new Set<PaintUpgradeId>(["ceramic"])
      : defaultInterest === "paint-correction"
        ? new Set<PaintUpgradeId>(["polish"])
        : next.preSelectPaint
          ? new Set<PaintUpgradeId>(["polish", "ceramic"])
          : new Set<PaintUpgradeId>();
    setPaint(initialPaint);
    setCustomizeExpanded(false);
    setQuoteDirty(false);
    setError(null);
    void recordBehavior("assessment_completed", { vehicleMake: vehicle.make, vehicleModel: vehicle.model, vehicleSize: vehicleLabel(vehicle.vehicle), conditionLabel: CONDITIONS.find((item) => item.value === condition)?.label ?? "", concerns: [...concerns].map(concernLabel) });
  }

  function applyUpgrade() {
    if (!result?.upgradeService) return;
    setService(result.upgradeService);
    setServiceIntent(result.upgradeService);
    setResult({ ...result, upgradeService: null, upgradeMessage: null });
    if (sent) setQuoteDirty(true);
  }

  function toggleAddon(id: AddonId) {
    setCheckedAddons((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (sent) setQuoteDirty(true);
  }

  function togglePaint(id: PaintUpgradeId) {
    setPaint((current) => {
      const wasSelected = current.has(id);
      const next = new Set<PaintUpgradeId>();
      if (!wasSelected) next.add(id);
      return next;
    });
    if (sent) setQuoteDirty(true);
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
    setCustomizeExpanded(false);
    setQuoteDirty(false);
    setName("");
    setPhone("");
    setEmail("");
    setError(null);
    setSending(false);
    setSent(false);
    setDesiredTiming(null);
    setServiceIntent(null);
  }

  function selectedBookingHref() {
    if (!vehicle || !service || !result) return "/book";
    const q = new URLSearchParams();
    q.set("service", service);
    const addonIds = result.addons.filter((item) => checkedAddons.has(item.id)).map((item) => item.id);
    if (addonIds.length) q.set("addons", addonIds.join(","));
    if (paint.size) q.set("paint", [...paint].join(","));
    q.set("from", "quote");
    if (desiredTiming) q.set("timing", desiredTiming);
    return `/book?${q.toString()}`;
  }


  // Turnstile verifies the form before React's onSubmit runs, then leaves the
  // token in the hidden turnstileToken input. /api/lead rejects quotes without it.
  function submitBuild(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = String(new FormData(event.currentTarget).get("turnstileToken") ?? "");
    void sendBuild(token);
  }

  async function sendBuild(turnstileToken: string) {
    if (!vehicle || !condition || !service || !result) return;
    if (!name.trim()) { setError("Add your first name."); return; }
    if ((phone.match(/\d/g) ?? []).length < 10) { setError("Add a 10-digit mobile number."); return; }
    if (!email.trim()) { setError("Add your email so we can send your quote."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("That email doesn't look right. Check it and try again."); return; }

    const selectedAddonNames = result.addons.filter((item) => checkedAddons.has(item.id)).map((item) => item.name);
    const paintNames = [...paint].map((id) => PAINT_UPGRADES[id].name);
    const allAddons = [...selectedAddonNames, ...paintNames];
    const conditionLabel = CONDITIONS.find((item) => item.value === condition)?.label ?? "Not specified";
    const concernNames = [...concerns].map(concernLabel);
    const message = [
      `Vehicle condition: ${conditionLabel}`,
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
      sessionId,
      desiredTiming: desiredTiming ?? "",
      turnstileToken,
    });

    if (response.ok) {
      setSent(true);
      sessionStorage.setItem("ed_quote_contact", JSON.stringify({ name:name.trim(), phone:phone.trim(), email:email.trim() }));
      void recordBehavior("contact_captured", { recommendedService: services[service].name, quoteAmount: total });
      setQuoteDirty(false);
      track("quote_submit", { interest: service, source: "recommender" });
      track("quote_price_reveal", { vehicle: vehicle.vehicle, service, total });
      if (paint.size) track("paint_inquiry", { location: "recommender", interest: [...paint].join(",") });
    } else {
      setError(response.error);
    }
    setSending(false);
  }

  if (result && vehicle && service && activeService) {
    const included = activeService.includes.slice(0, 3);
    const selectedAddonNames = result.addons.filter((item) => checkedAddons.has(item.id)).map((item) => item.name);
    const selectedPaintNames = [...paint].map((id) => PAINT_UPGRADES[id].name);
    const extrasSummary = [...selectedAddonNames, ...selectedPaintNames];
    const vehicleName = `${vehicle.make} ${vehicle.model}`;
    const conditionLabel = CONDITIONS.find((item) => item.value === condition)?.label ?? "";
    const concernNames = [...concerns].map(concernLabel);
    const firstConcern = concernNames[0];
    const firstName = name.trim().split(/\s+/)[0] || "";

    const personalReason = concerns.has("selling")
      ? `Since you're getting the ${vehicle.model} ready to sell, we built this around presentation and value instead of adding work that will not meaningfully help.`
      : concernNames.length > 0
        ? `You told us the ${vehicle.model} is in ${conditionLabel.toLowerCase()} shape${firstConcern ? ` and mentioned ${firstConcern.toLowerCase()}` : ""}. This gives it the level of work it needs without pushing you into more service than makes sense.`
        : `Based on the ${vehicle.model}'s ${conditionLabel.toLowerCase()} condition, this is the level of detail that makes the most sense without adding unnecessary work.`;

    const timingOptions = [
      { value: "asap", label: "As soon as possible" },
      { value: "weekend", label: "This weekend" },
      { value: "next_week", label: "Next week" },
      { value: "exploring", label: "Just looking" },
    ] as const;

    function chooseTiming(value: typeof timingOptions[number]["value"]) {
      setDesiredTiming(value);
      void recordBehavior("timing_selected", { desiredTiming: value });
    }

    // Step 1 of the result: the match is shown, the price is held until we have
    // a way to follow up. The lead is the conversion; booking comes after.
    if (!sent) {
      return (
        <div ref={resultRef} className="quote-rec-result q100-result">
          <button type="button" onClick={reset} className="quote-rec-back">← Start over</button>

          <section className="q100-match" aria-live="polite">
            <p className="q79-eyebrow">Your match · {vehicleName}</p>
            <h2>{activeService.name}</h2>
            <ul className="q100-includes is-compact">
              {[...included, ...extrasSummary].map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>

          <form className="q100-form" onSubmit={submitBuild} noValidate>
            <div className="q100-price-lock" aria-label="Your price is ready">
              <span>Your price</span>
              <strong aria-hidden="true">$000</strong>
            </div>
            <h3>Where should we send your quote?</h3>
            <p>See your price right away. We&rsquo;ll also send you a copy. No payment, no commitment.</p>
            <label><span>First name</span><input className="field" value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" placeholder="First name" required /></label>
            <label><span>Mobile number</span><input className="field" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" autoComplete="tel" placeholder="(404) 555-0123" required /></label>
            <label><span>Email</span><input className="field" value={email} onChange={(e) => setEmail(e.target.value)} type="email" inputMode="email" autoComplete="email" placeholder="you@email.com" required /></label>
            {error && <p className="quote-rec-error" role="alert">{error}</p>}
            <TurnstileField action="lead" />
            <button type="submit" className="btn btn-primary q100-submit" disabled={sending}>{sending ? "Getting your price..." : "See my price ↗"}</button>
            <p className="quote-rec-privacy">No spam. We only use this for your quote.</p>
          </form>
        </div>
      );
    }

    return (
      <div ref={resultRef} className="quote-rec-result q100-result" id="quote-personal-result">
        <section className="q100-match is-revealed" role="status">
          <p className="q79-eyebrow">{firstName ? `Here's your quote, ${firstName}` : "Your quote"} · {vehicleName}</p>
          <div className="q100-reveal-row">
            <h2>{activeService.name}</h2>
            <div className="q100-price"><strong>{totalDisplay}</strong>{extrasSummary.length > 0 && <small>Includes {extrasSummary.join(", ")}</small>}</div>
          </div>
          <p className="q100-reason">{personalReason}</p>
          <ul className="q100-includes">{included.map((item) => <li key={item}>{item}</li>)}</ul>
          <p className="q100-note">{totalNote} A copy is on its way to {email.trim()}.</p>
          <details className="quote-rec-why-details"><summary>Why this fits your {vehicle.model}</summary><p>{result.why}</p></details>
        </section>

        <section className="q100-timing">
          <h3>When are you hoping to get it done?</h3>
          <div role="radiogroup" aria-label="When are you hoping to get it done?">
            {timingOptions.map((item) => (
              <button key={item.value} type="button" role="radio" aria-checked={desiredTiming === item.value} className={desiredTiming === item.value ? "is-selected" : ""} onClick={() => chooseTiming(item.value)}>{item.label}</button>
            ))}
          </div>
        </section>

        <QuoteBookingContinuation
          vehicle={vehicle.vehicle}
          service={service}
          addons={result.addons.filter((item) => checkedAddons.has(item.id)).map((item) => item.id)}
          paint={[...paint]}
          name={name.trim()}
          phone={phone.trim()}
          email={email.trim()}
          timing={desiredTiming ?? ""}
          sessionId={sessionId}
          bookingHref={selectedBookingHref()}
        />

        <button type="button" className="q100-customize-toggle" onClick={() => setCustomizeExpanded((value) => !value)} aria-expanded={customizeExpanded}>{customizeExpanded ? "Hide options ↑" : "Add extras or upgrade +"}</button>
        {customizeExpanded && (
          <section className="quote-rec-customize-panel">
            {result.upgradeMessage && result.upgradeService && <button type="button" className="quote-rec-upgrade" onClick={applyUpgrade}><span>Consider upgrading</span><strong>{result.upgradeMessage}</strong><b>Upgrade to {services[result.upgradeService].name} ↗</b></button>}
            {result.addons.length > 0 && <div className="quote-rec-customize-group"><h4>Add-ons</h4><div className="quote-rec-addon-list">{result.addons.map((addon) => { const checked = checkedAddons.has(addon.id); return <button key={addon.id} type="button" className={`quote-rec-addon ${checked ? "is-selected" : ""}`} onClick={() => toggleAddon(addon.id)} aria-pressed={checked}><span className="quote-rec-check">{checked ? "✓" : ""}</span><strong>{addon.name}</strong>{addon.recommended && <small>Recommended</small>}<b>{addon.price}</b></button>; })}</div></div>}
            <div className="quote-rec-customize-group"><h4>Paint correction + protection</h4><div className="quote-rec-paint-grid">{(Object.keys(PAINT_UPGRADES) as PaintUpgradeId[]).map((id) => { const item = PAINT_UPGRADES[id]; const selected = paint.has(id); return <button key={id} type="button" className={`quote-rec-paint-card ${selected ? "is-selected" : ""}`} onClick={() => togglePaint(id)} aria-pressed={selected}><span>{item.tag}</span><strong>{item.name}</strong><b>${item.prices[vehicle.vehicle]}</b><p>{item.why}</p></button>; })}</div></div>
            <form className="quote-rec-customize-footer" onSubmit={submitBuild}><div><span>Updated estimate</span><strong>{totalDisplay}</strong><p>{totalNote}</p></div><TurnstileField action="lead" />{quoteDirty || sending ? <button type="submit" className="btn btn-primary" disabled={sending}>{sending ? "Saving..." : "Save changes ↗"}</button> : <p className="q100-saved">Saved ✓</p>}</form>
            {error && <p className="quote-rec-error" role="alert">{error}</p>}
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="quote-rec-shell q51-rec q53-rec" onFocus={start} onPointerDown={start}>
      <div className="q51-rec-main q53-rec-main">
        <div className="q51-progress" aria-label="Quote progress">
          <span className={vehicle ? "is-done" : "is-current"}><b>{vehicle ? "✓" : "01"}</b> Vehicle</span>
          <span className={condition ? "is-done" : vehicle ? "is-current" : ""}><b>{condition ? "✓" : "02"}</b> Condition</span>
          <span className={condition ? "is-current" : ""}><b>03</b> Issues</span>
          <span><b>04</b> Your price</span>
        </div>

        {!vehicle && (
          <section data-art-number="01" className="q51-step is-active q53-active-step">
            <div className="q51-step-body">
              <p className="q51-step-label">01 / YOUR VEHICLE</p>
              <h2>What are you driving?</h2>
              <p className="q51-step-help">Four quick steps, about a minute. Search the make or model.</p>
              <div className="q-audit-quick-vehicles" aria-label="Popular vehicle searches">
                {["Honda Civic", "Toyota RAV4", "Ford F-150", "Tesla Model 3"].map((label) => (
                  <button key={label} type="button" onClick={() => {
                    // A quick chip is a full answer: select the exact base model instead of making them pick it again.
                    const exact = recommenderVehicles.find((item) => `${item.make} ${item.model}` === label);
                    if (exact) selectVehicle(exact);
                    else { setSearch(label); start(); }
                  }}>{label}</button>
                ))}
              </div>
              <div className="quote-rec-search-wrap q51-search-wrap">
                <input className="field quote-rec-search q51-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Try RAV4, Ram 2500, Model Y..." autoComplete="off" aria-label="Search vehicle make or model" autoFocus />
                {search.trim().length >= 2 && (
                  <div className="quote-rec-search-results q51-search-results">
                    {matches.length ? matches.map((item, index) => (
                      <button key={`${item.make}-${item.model}-${index}`} type="button" onClick={() => selectVehicle(item)}>
                        <span><strong>{item.make}</strong> {item.model}</span><small>{vehicleLabel(item.vehicle)}</small>
                      </button>
                    )) : <p>No matches. Try another make or model.</p>}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {vehicle && !condition && (
          <section ref={conditionRef} data-art-number="02" className="q51-step is-active q53-active-step">
            <div className="q51-step-body">
              <p className="q51-step-label">02 / CURRENT CONDITION</p>
              <h2>What shape is it in?</h2>
              <p className="q51-step-help">Pick the closest match.</p>
              <div className="quote-rec-condition-grid q51-condition-grid">
                {CONDITIONS.map((item, index) => (
                  <button key={item.value} type="button" className={condition === item.value ? "is-selected" : ""} onClick={() => chooseCondition(item.value)} aria-pressed={condition === item.value}>
                    <span>0{index + 1}</span><strong>{item.label}</strong><small>{item.desc}</small>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {vehicle && condition && (
          <section ref={concernsRef} data-art-number="03" className="q51-step is-active q53-active-step">
            <div className="q51-step-body">
              <p className="q51-step-label">03 / SPECIFIC ISSUES</p>
              <h2>Anything bothering you?</h2>
              <p className="q51-step-help">Optional. Choose anything that applies.</p>
              <div className="quote-rec-concern-grid q51-concern-grid">
                {CONCERNS.map((item) => {
                  const selected = concerns.has(item.id);
                  return (
                    <button key={item.id} type="button" className={selected ? "is-selected" : ""} onClick={() => toggleConcern(item.id)} aria-pressed={selected}>
                      <span className="quote-rec-check">{selected ? "✓" : ""}</span><span><strong>{item.label}</strong><small>{item.sub}</small></span>
                    </button>
                  );
                })}
              </div>
              <button type="button" className="q51-build" onClick={buildResult}>
                <span>SHOW MY MATCH</span><b>↗</b>
              </button>
            </div>
          </section>
        )}
      </div>

      <aside className="q51-snapshot q53-snapshot" aria-label="Your quote inputs">
        <p className="q51-snapshot-title">Your car</p>
        <div className={vehicle ? "is-filled" : ""}>
          <span>Vehicle</span><strong>{vehicle ? `${vehicle.make} ${vehicle.model}` : "Not set yet"}</strong>{vehicle && <small>{vehicleLabel(vehicle.vehicle)}</small>}
          {vehicle && <button type="button" onClick={openPicker}>Change vehicle</button>}
        </div>
        <div className={condition ? "is-filled" : ""}>
          <span>Condition</span><strong>{selectedCondition?.label ?? "Not set yet"}</strong>
          {condition && <button type="button" onClick={() => { setCondition(null); setConcerns(new Set()); setResult(null); setService(null); }}>Change</button>}
        </div>
        <div className={concerns.size ? "is-filled" : ""}><span>Issues</span><strong>{concerns.size ? [...concerns].map(concernLabel).join(", ") : "None selected"}</strong></div>

      </aside>
    </div>
  );
}
