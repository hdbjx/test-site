"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { recommenderVehicles, type RecommenderVehicle } from "@/data/recommenderVehicles";
import { PRICING, services, vehicleLabel, type ServiceId } from "@/data/services";
import { ADDON_PRICES, PAINT_UPGRADES, type AddonId, type PaintUpgradeId } from "@/data/quoteExtras";
import { track } from "@/lib/analytics";
import { submitLead } from "@/lib/submit";

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
  const [vehicle, setVehicle] = useState<RecommenderVehicle | null>(null);
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

  const matches = useMemo(() => {
    const query = search.trim().toLowerCase();
    const vehicleQuery = query.replace(/\b(?:19|20)\d{2}\b/g, "").replace(/\s+/g, " ").trim();
    if (vehicleQuery.length < 2 || vehicle) return [];
    return recommenderVehicles
      .filter((item) => `${item.make} ${item.model}`.toLowerCase().includes(vehicleQuery) || item.make.toLowerCase().startsWith(vehicleQuery) || item.model.toLowerCase().startsWith(vehicleQuery))
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
    setCustomizeExpanded(false);
    setQuoteDirty(false);
    setError(null);
    void recordBehavior("assessment_completed", { vehicleMake: vehicle.make, vehicleModel: vehicle.model, vehicleSize: vehicleLabel(vehicle.vehicle), conditionLabel: CONDITIONS.find((item) => item.value === condition)?.label ?? "", concerns: [...concerns].map(concernLabel) });
    window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }

  function applyUpgrade() {
    if (!result?.upgradeService) return;
    setService(result.upgradeService);
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function selectedBookingHref() {
    if (!vehicle || !service || !result) return "/book";
    const q = new URLSearchParams();
    q.set("vehicle", vehicle.vehicle);
    q.set("service", service);
    const addonIds = result.addons.filter((item) => checkedAddons.has(item.id)).map((item) => item.id);
    if (addonIds.length) q.set("addons", addonIds.join(","));
    if (paint.size) q.set("paint", [...paint].join(","));
    q.set("from", "quote");
    if (desiredTiming) q.set("timing", desiredTiming);
    return `/book?${q.toString()}`;
  }

  async function sendBuild() {
    if (!vehicle || !condition || !service || !result) return;
    if (!desiredTiming) { setError("Tell us when you would want it done."); return; }
    if (!name.trim()) { setError("Enter your name so we know who the build belongs to."); return; }
    if ((phone.match(/\d/g) ?? []).length < 10) { setError("Enter a 10-digit phone number so we can follow up."); return; }
    if (!email.trim()) { setError("Enter your email so we can save your quote."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Check your email address and try again."); return; }

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
      desiredTiming,
    });

    if (response.ok) {
      setSent(true);
      sessionStorage.setItem("ed_quote_contact", JSON.stringify({ name:name.trim(), phone:phone.trim(), email:email.trim() }));
      void recordBehavior("contact_captured", { desiredTiming, quoteAmount: total });
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
    const included = activeService.includes.slice(0, 4);
    const selectedAddonNames = result.addons.filter((item) => checkedAddons.has(item.id)).map((item) => item.name);
    const selectedPaintNames = [...paint].map((id) => PAINT_UPGRADES[id].name);
    const extrasSummary = [...selectedAddonNames, ...selectedPaintNames];
    const vehicleName = `${vehicle.make} ${vehicle.model}`;
    const conditionLabel = CONDITIONS.find((item) => item.value === condition)?.label ?? "";
    const concernNames = [...concerns].map(concernLabel);
    const firstConcern = concernNames[0];

    const timingOptions = [
      { value: "asap", label: "As soon as possible", sub: "I'd like to get it handled" },
      { value: "weekend", label: "This weekend", sub: "Weekend works best" },
      { value: "next_week", label: "Next week", sub: "I'm planning ahead" },
      { value: "exploring", label: "Just looking around", sub: "I'm not ready yet" },
    ] as const;

    const timingCopy = desiredTiming === "asap"
      ? { eyebrow: "Let's get it handled", title: `Let's find the earliest fit for your ${vehicle.model}.`, body: "We'll save this recommendation and take you straight to the best available openings.", cta: "Find my earliest opening ↗" }
      : desiredTiming === "weekend"
        ? { eyebrow: "Weekend works", title: `Let's see what works for your ${vehicle.model} this weekend.`, body: "We'll keep your recommendation together and show you the weekend options that fit it.", cta: "Check weekend openings ↗" }
        : desiredTiming === "next_week"
          ? { eyebrow: "Planning ahead", title: `We'll find a good time for your ${vehicle.model} next week.`, body: "A little flexibility usually gives you more choice. Save the build and we'll show you matching openings.", cta: "See next week's openings ↗" }
          : { eyebrow: "No pressure", title: `Want to keep this ${vehicle.model} recommendation?`, body: "Save the service and price so you can come back without rebuilding everything when you're ready.", cta: `Save my ${totalDisplay} recommendation ↗` };

    const personalReason = concerns.has("selling")
      ? `Since you're getting the ${vehicle.model} ready to sell, we built this around presentation and value instead of adding work that will not meaningfully help.`
      : concernNames.length > 0
        ? `You told us the ${vehicle.model} is in ${conditionLabel.toLowerCase()} shape${firstConcern ? ` and mentioned ${firstConcern.toLowerCase()}` : ""}. This gives it the level of work it needs without automatically pushing you into more service than makes sense.`
        : `Based on the ${vehicle.model}'s ${conditionLabel.toLowerCase()} condition, this is the level of detail that makes the most sense without adding unnecessary work.`;

    function chooseTiming(value: typeof timingOptions[number]["value"]) {
      setDesiredTiming(value);
      setError(null);
      void recordBehavior("timing_selected", { desiredTiming: value });
      void recordBehavior("recommendation_viewed", { desiredTiming: value, recommendedService: activeService?.name ?? service, quoteAmount: total });
      window.setTimeout(() => document.getElementById("quote-personal-result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    }

    if (!desiredTiming) {
      return (
        <div ref={resultRef} className="quote-rec-result quote-rec-conversation">
          <button type="button" onClick={reset} className="quote-rec-back">← Start over</button>
          <section className="quote-rec-intent-stage">
            <div className="quote-rec-intent-context">
              <p className="eyebrow">Got it</p>
              <h2>One last thing about your {vehicle.model}.</h2>
              <p>When are you hoping to get it cleaned?</p>
              <div className="quote-rec-mini-summary">
                <span>{vehicleName}</span>
                <span>{conditionLabel} condition</span>
                {concernNames.slice(0, 2).map((item) => <span key={item}>{item}</span>)}
                {concernNames.length > 2 && <span>+{concernNames.length - 2} more</span>}
              </div>
            </div>
            <div className="quote-rec-intent-options">
              {timingOptions.map((item) => (
                <button key={item.value} type="button" className="quote-rec-intent-choice" onClick={() => chooseTiming(item.value)}>
                  <span><strong>{item.label}</strong><small>{item.sub}</small></span><b>→</b>
                </button>
              ))}
              <p className="quote-rec-intent-note">We'll shape the next step around your timing.</p>
            </div>
          </section>
        </div>
      );
    }

    return (
      <div ref={resultRef} className="quote-rec-result quote-rec-conversation" id="quote-personal-result">
        <button type="button" onClick={() => { setDesiredTiming(null); setSent(false); setError(null); }} className="quote-rec-back">← Change timing</button>

        <div className="quote-rec-reactive-confirm"><span>✓</span><p><strong>{timingOptions.find((item) => item.value === desiredTiming)?.label}.</strong> {desiredTiming === "exploring" ? "We'll keep this low pressure." : "We built the next step around that."}</p></div>

        <div className="quote-rec-result-grid quote-rec-result-grid-conversion is-revealed">
          <section className="quote-rec-result-main">
            <p className="eyebrow">Built for your {vehicle.model}</p>
            <h2>{activeService.name}</h2>
            <p className="quote-rec-personal-reason">{personalReason}</p>
            <p className="quote-rec-result-summary">{activeService.summary}</p>
            <div className="quote-rec-includes" aria-label="What is included">{included.map((item) => <span key={item}>✓ {item}</span>)}</div>
            <details className="quote-rec-why-details"><summary>See why we chose this</summary><p>{result.why}</p></details>
          </section>
          <aside className="quote-rec-price-card quote-rec-price-reveal" aria-live="polite">
            <span>Your personalized detail</span><strong>{totalDisplay}</strong><small>{vehicleName} · {vehicleLabel(vehicle.vehicle)}</small>
            {extrasSummary.length > 0 && <p>Includes recommended: {extrasSummary.join(", ")}</p>}
            <b>{totalNote}</b>
          </aside>
        </div>

        {!sent ? (
          <section className="quote-rec-reactive-contact">
            <div className="quote-rec-reactive-copy">
              <p className="eyebrow">{timingCopy.eyebrow}</p>
              <h3>{timingCopy.title}</h3>
              <p>{timingCopy.body}</p>
              <div className="quote-rec-build-recap"><strong>{activeService.name} · {totalDisplay}</strong><span>{vehicle.model} · {timingOptions.find((item) => item.value === desiredTiming)?.label}</span></div>
            </div>
            <div className="quote-rec-contact quote-rec-contact-personal">
              <div className="quote-rec-contact-heading">
                <span>{name.trim() ? `Got it, ${name.trim().split(/\s+/)[0]}.` : "Keep your recommendation together"}</span>
                <h4>{name.trim() ? "Where should we send the details?" : "Where should we send it?"}</h4>
              </div>
              <div className="quote-rec-contact-grid">
                <label><span>First name</span><input className="field" value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" placeholder="First name" required /></label>
                <label><span>Mobile number</span><input className="field" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" autoComplete="tel" placeholder="(404) 555-0123" required /></label>
                <label><span>Email</span><input className="field" value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" placeholder="you@email.com" required /></label>
              </div>
              {error && <p className="quote-rec-error" role="alert">{error}</p>}
              <button type="button" className="btn btn-primary quote-rec-save-button" onClick={sendBuild} disabled={sending}>
                {sending ? "Saving..." : timingCopy.cta}
              </button>
              <p className="quote-rec-save-note">Your recommendation stays saved. No payment required.</p>
            </div>
          </section>
        ) : (
          <>
            <section className="quote-rec-book-card" role="status">
              <div>
                <span>{name.trim() ? `Saved for ${name.trim().split(/\s+/)[0]}` : "Saved"}</span>
                <h3>{desiredTiming === "exploring" ? `Your ${vehicle.model} recommendation is saved.` : `Let's find the right time for your ${vehicle.model}.`}</h3>
                <p>{desiredTiming === "exploring" ? "You can come back when the timing is right. If you want, you can still look at current openings now." : "Your vehicle, service, price, and timing are already carried into booking."}</p>
              </div>
              <div className="quote-rec-book-actions">
                <Link className="btn btn-primary" href={selectedBookingHref()} onClick={() => { track("book_click", { location: "saved_quote", vehicle: vehicle.vehicle, service }); void recordBehavior("availability_viewed", { desiredTiming }); }}>
                  {desiredTiming === "exploring" ? "See current openings ↗" : timingCopy.cta}
                </Link>
                <button type="button" className="quote-rec-customize-toggle" onClick={() => setCustomizeExpanded((value) => !value)}>{customizeExpanded ? "Hide customization ↑" : "Customize my detail +"}</button>
              </div>
            </section>

            {customizeExpanded && (
              <section className="quote-rec-customize-panel">
                <div className="quote-rec-options-head"><div><p className="eyebrow">Optional</p><h3>Customize your saved quote</h3></div><span>Changes stay with this recommendation</span></div>
                {result.upgradeMessage && result.upgradeService && <button type="button" className="quote-rec-upgrade" onClick={applyUpgrade}><span>Consider upgrading</span><strong>{result.upgradeMessage}</strong><b>Upgrade to {services[result.upgradeService].name} ↗</b></button>}
                {result.addons.length > 0 && <div className="quote-rec-customize-group"><h4>Add-ons</h4><div className="quote-rec-addon-list">{result.addons.map((addon) => { const checked = checkedAddons.has(addon.id); return <button key={addon.id} type="button" className={`quote-rec-addon ${checked ? "is-selected" : ""}`} onClick={() => toggleAddon(addon.id)} aria-pressed={checked}><span className="quote-rec-check">{checked ? "✓" : ""}</span><strong>{addon.name}</strong>{addon.recommended && <small>Recommended</small>}<b>{addon.price}</b></button>; })}</div></div>}
                <div className="quote-rec-customize-group"><h4>Paint correction + protection</h4><div className="quote-rec-paint-grid">{(Object.keys(PAINT_UPGRADES) as PaintUpgradeId[]).map((id) => { const item = PAINT_UPGRADES[id]; const selected = paint.has(id); return <button key={id} type="button" className={`quote-rec-paint-card ${selected ? "is-selected" : ""}`} onClick={() => togglePaint(id)} aria-pressed={selected}><span>{item.tag}</span><strong>{item.name}</strong><b>${item.prices[vehicle.vehicle]}</b><p>{item.why}</p></button>; })}</div></div>
                <div className="quote-rec-customize-footer"><div><span>Updated estimate</span><strong>{totalDisplay}</strong><p>{totalNote}</p></div><button type="button" className="btn btn-primary" onClick={sendBuild} disabled={sending || !quoteDirty}>{sending ? "Saving..." : quoteDirty ? "Save changes ↗" : "Saved ✓"}</button></div>
                {error && <p className="quote-rec-error" role="alert">{error}</p>}
              </section>
            )}
          </>
        )}
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
              <input className="field quote-rec-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search RAV4, Honda Pilot, F-150..." autoComplete="off" aria-label="Search vehicle make or model" />
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
          <h2>What shape is your car in?</h2>
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
          <button type="button" className="btn btn-primary quote-rec-build" disabled={!vehicle || !condition} onClick={buildResult}>Build my recommendation ↗</button>
        </div>
      </section>
    </div>
  );
}
