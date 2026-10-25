import fs from "node:fs";

const ui = fs.readFileSync("src/components/vehicle/VehicleGlobalUI.tsx", "utf8");
const search = fs.readFileSync("src/components/vehicle/VehicleSearch.tsx", "utf8");
const context = fs.readFileSync("src/components/vehicle/VehicleContext.tsx", "utf8");
const css = fs.readFileSync("src/app/globals.css", "utf8");

const checks = [
  [ui.includes('const eligible = pathname === "/";'), "Automatic vehicle welcome must only run on the homepage."],
  [!ui.includes('"/mobile-car-detailing"'), "Mobile-detailing landing pages must not force the welcome interstitial."],
  [ui.includes('preserveAspectRatio="xMidYMid meet"'), "Welcome ribbons must preserve SVG aspect ratio."],
  [!ui.includes('preserveAspectRatio="none"'), "Welcome ribbon SVG text must never be stretched with preserveAspectRatio=none."],
  [ui.includes('veh-welcome-stage'), "Welcome ribbons must be anchored to the card stage."],
  [ui.includes('encodeURIComponent(pathname || "/")'), "Account entry must preserve the current route."],
  [!ui.toLowerCase().includes("quietly tune pricing"), "Welcome copy must not imply hidden pricing changes."],
  [context.includes('DISMISSED_UNTIL_KEY'), "Browsing dismissal must persist across tabs/sessions."],
  [context.includes('save_my_vehicle'), "Signed-in remember flow must persist selected vehicles to the account garage."],
  [(context.match(/\.auth\.getUser\(\)/g) ?? []).length === 1, "Vehicle context must own the single auth lookup."],
  [!context.split("async function hydrateVehicle()")[1].split("const persistSignedInVehicle")[0].includes('rpc("ensure_my_client"'), "Global vehicle hydration must not mutate/link the client record on every page load."],
  [context.includes('result.error?.message?.includes("no_client")') && context.includes('supabase.rpc("ensure_my_client"'), "Unlinked signed-in customers must be linked lazily only when saving their first vehicle."],
  [!context.includes('savedToAccount || true'), "Failed garage saves must never be reported as remembered."],
  [search.includes('role="combobox"') && search.includes('role="listbox"') && search.includes('role="option"'), "Vehicle search must expose combobox/listbox semantics."],
  [search.includes('event.key === "ArrowDown"') && search.includes('event.key === "Enter"'), "Vehicle search must support keyboard result navigation."],
  [/if \(event\.key === "Escape" && listOpen && hasQuery\) \{[\s\S]*?event\.stopPropagation\(\)[\s\S]*?setListOpen\(false\)/.test(search), "Escape must close empty search state before it can dismiss the dialog."],
  [css.includes('html.ed-vehicle-welcome-open .ed-tape'), "Homepage tape must hide behind the welcome composition."],
  [css.includes('.veh-welcome-ribbon{\n  position:absolute;'), "Welcome ribbons must be positioned relative to the card, not the viewport."],
  [css.includes('transform:translateX(-50%) translateX(78vw)') && css.includes('to{opacity:.97;transform:translateX(-50%)'), "Ribbon animation must retain horizontal centering at rest."],
  [css.includes('.veh-welcome-ribbon-bottom{\n  bottom:-86px;'), "Desktop lower ribbon must sit below the card controls rather than through them."],
  [!css.includes('@media(max-width:390px), (max-height:700px)'), "Short laptop viewports must not trigger the narrow-phone layout."],
  [css.includes('@media(min-width:761px) and (max-height:720px)'), "Short laptop viewports need a dedicated two-column tightening rule."],
  [css.includes('.veh-modal.is-welcome .veh-search-results{\n    position:relative!important;'), "Mobile search results must stay in the card flow rather than under the ribbon."],
  [css.includes('.veh-welcome-stage:has(.veh-search-results) .veh-modal.is-welcome'), "Desktop open results must layer above the foreground ribbon."],
  [css.includes('text-transform:none!important;') && css.includes('.veh-welcome-lede'), "Welcome support copy must stay sentence case."],
  [!['V92','V94','V101','V102','V103','V104 — ONE AUTHORITATIVE VEHICLE WELCOME SYSTEM'].some((tag) => css.includes(tag)), "Historical welcome-card CSS generations must stay removed."],
  [ui.includes('body.style.position = "fixed"'), "Modal scroll lock must use fixed-body locking for iOS Safari."],
  [!ui.includes('closeButton?.focus'), "Opening the card must not visually focus the close button on touch devices."],
];

const failures = checks.filter(([ok]) => !ok).map(([, message]) => message);
if (failures.length) {
  console.error("Welcome-card QA failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Welcome-card QA passed: ${checks.length} regression checks.`);
