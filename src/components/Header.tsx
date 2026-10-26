"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { site } from "@/data/site";
import { track } from "@/lib/analytics";
import { supabaseConfigured } from "@/lib/supabase/config";
import { siteVehicleLabel, useVehicle } from "@/components/vehicle/VehicleContext";
import { vehicleLabel } from "@/data/services";
import { catalogPrice, catalogService } from "@/data/serviceCatalog";
import { usd } from "@/lib/format";
import { useJourney } from "@/components/journey/JourneyContext";

type HeaderTone = "ink" | "light" | "brand";

const ROUTE_HEADER_TONE: Record<string, HeaderTone> = {
  "/": "brand",
  "/about-us": "light",
  "/account": "ink",
  "/account/sign-in": "ink",
  "/account/update-password": "ink",
  "/blog": "light",
  "/ceramic": "light",
  "/detailplus": "light",
  "/gift-cards": "light",
  "/info-form": "ink",
  "/mobile-car-detailing": "ink",
  "/our-services": "ink",
  "/our-work": "light",
  "/paint-correction": "light",
  "/privacy-policy": "light",
  "/service-areas": "light",
  "/terms": "light",
};

function routeTone(pathname: string): HeaderTone {
  if (pathname.startsWith("/detailplus/")) return "light";
  if (pathname.startsWith("/post/")) return "ink";
  if (pathname.startsWith("/service-areas/")) return "ink";
  return ROUTE_HEADER_TONE[pathname] ?? "ink";
}

function toneFromOwner(owner: HTMLElement, y: number): HeaderTone | null {
  const mobile = window.matchMedia("(max-width: 760px)").matches;
  const before = (mobile ? owner.dataset.headerToneMobile : undefined) ?? owner.dataset.headerTone;
  const after = (mobile ? owner.dataset.headerToneAfterMobile : undefined) ?? owner.dataset.headerToneAfter;
  const split = Number.parseFloat(owner.dataset.headerToneSplit ?? "");

  let raw = before;
  if (after && Number.isFinite(split)) {
    const rect = owner.getBoundingClientRect();
    const local = rect.height > 0 ? (y - rect.top) / rect.height : 0;
    if (local >= Math.max(0, Math.min(1, split))) raw = after;
  }

  return raw === "ink" || raw === "light" || raw === "brand" ? raw : null;
}

function declaredToneAtPoint(x: number, y: number): HeaderTone | null {
  const elements = document.elementsFromPoint(x, y);
  for (const element of elements) {
    const owner = element.closest<HTMLElement>("[data-header-tone]");
    if (!owner) continue;
    const tone = toneFromOwner(owner, y);
    if (tone) return tone;
  }

  const candidates = Array.from(document.querySelectorAll<HTMLElement>("[data-header-tone]"));
  const crossing = candidates
    .map((element) => ({ element, rect: element.getBoundingClientRect() }))
    .filter(({ rect }) => rect.top <= y && rect.bottom > y && rect.width > 0 && rect.height > 0)
    .sort((a, b) => a.rect.height - b.rect.height);

  return crossing[0] ? toneFromOwner(crossing[0].element, y) : null;
}

export function Header() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const { vehicle, hydrated: vehicleHydrated, openPicker } = useVehicle();
  const { serviceIntent, openDrawer } = useJourney();
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerTone, setHeaderTone] = useState<HeaderTone>(() => routeTone(pathname));
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close menus on navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    setHeaderTone(routeTone(pathname));
    let frame = 0;

    const updateTone = () => {
      frame = 0;
      if (menuOpen) {
        setHeaderTone("light");
        return;
      }

      const sampleY = Math.min(window.innerHeight - 1, window.innerWidth <= 760 ? 54 : 72);
      const sampleX = Math.round(window.innerWidth * 0.5);
      const next = declaredToneAtPoint(sampleX, sampleY) ?? routeTone(pathname);
      setHeaderTone((current) => current === next ? current : next);
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateTone);
    };

    updateTone();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["class", "style", "data-header-tone", "data-header-tone-mobile", "data-header-tone-after", "data-header-tone-after-mobile", "data-header-tone-split"],
    });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
    };
  }, [pathname, menuOpen]);

  // Mobile panel: lock scroll, Escape closes, keep focus inside
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>("a,button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
      if (e.key === "Tab" && panel) {
        const els = panel.querySelectorAll<HTMLElement>("a,button");
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || menuButtonRef.current?.contains(target)) return;
      setMenuOpen(false);
      window.requestAnimationFrame(() => menuButtonRef.current?.focus());
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [menuOpen]);




  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const headerClass = "fixed inset-x-0 top-0 z-40 site-shared-header";

  // The booking funnel renders its own compact header; keep exits to a minimum there.
  if (pathname === "/book" || pathname === "/get-a-quote") return null;

  return (
    <header className={headerClass} data-tone={headerTone} data-menu-open={menuOpen ? "true" : "false"}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>

      <div className="site-shared-nav-shell">
        <Link href="/" className={`site-shared-logo-control ${onHome ? "home-logo-control" : ""}`} aria-label="Every Detail home">
          <span className={`site-shared-logo-mark ${onHome ? "home-logo-mark" : ""}`} aria-hidden="true" />
          <span className="sr-only">Every Detail home</span>
        </Link>

        <div className="site-shared-nav-actions">
          {vehicleHydrated && (
            <button
              type="button"
              className={`site-context-pill ${vehicle ? "is-set" : ""}`}
              onClick={() => (vehicle ? openDrawer() : openPicker())}
              aria-label={vehicle ? "Open your vehicle and service" : "Add your vehicle"}
            >
              <span>{vehicle ? siteVehicleLabel(vehicle) : "+ ADD YOUR VEHICLE"}</span>
              {vehicle && serviceIntent ? <small>{catalogService(serviceIntent).name}{catalogPrice(serviceIntent, vehicle.vehicle) != null ? ` · ${usd(catalogPrice(serviceIntent, vehicle.vehicle)!)}` : ""}</small> : vehicle ? <small>{vehicleLabel(vehicle.vehicle)}</small> : null}
              <i aria-hidden="true">⌄</i>
            </button>
          )}

        <button
          ref={menuButtonRef}
          type="button"
          className={`site-shared-menu-button ${onHome ? "v29-menu-button" : ""}`}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="site-shared-menu-label">{menuOpen ? "CLOSE" : "MENU"}<i aria-hidden="true">{menuOpen ? "×" : "↘"}</i></span>
        </button>
        </div>
      </div>

      {/* Shared menu panel */}
      {menuOpen && (
        <>
          <button
            type="button"
            className="site-shared-menu-backdrop"
            aria-label="Close menu"
            onClick={() => { setMenuOpen(false); menuButtonRef.current?.focus(); }}
          />
          <div
            id="mobile-menu"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="site-shared-menu-panel"
          >
            <button
              type="button"
              className="site-shared-menu-panel-close"
              aria-label="Close menu"
              onClick={() => { setMenuOpen(false); window.requestAnimationFrame(() => menuButtonRef.current?.focus()); }}
            >
              <span>CLOSE</span><i aria-hidden="true">×</i>
            </button>
            <nav aria-label="Main menu" className="site-shared-menu-shell">
              <div className="site-shared-menu-main">
                {[
                  { n: "01", label: "Services", href: "/our-services" },
                  { n: "02", label: "Our Work", href: "/our-work" },
                  { n: "03", label: "Detail+", href: "/detailplus" },
                  { n: "04", label: "About", href: "/about-us" },
                  { n: "05", label: "Gift Cards", href: "/gift-cards" },
                ].map((item) => (
                  <Link key={item.href} href={item.href} className="site-shared-menu-link" aria-current={isActive(item.href) ? "page" : undefined}>
                    <span>{item.n}</span><strong>{item.label}</strong><i aria-hidden="true">↗</i>
                  </Link>
                ))}
              </div>

              <div className="site-shared-menu-side">
                <button type="button" className="site-shared-menu-vehicle" onClick={() => { setMenuOpen(false); vehicle ? openDrawer() : openPicker(); }}>
                  <span>{vehicle && serviceIntent ? "YOUR DETAIL" : "YOUR VEHICLE"}</span>
                  <strong>{vehicle ? siteVehicleLabel(vehicle) : "Add your vehicle"}</strong>
                  <small>{vehicle && serviceIntent ? catalogService(serviceIntent).name : vehicle ? vehicleLabel(vehicle.vehicle) : "Exact pricing starts here"}</small>
                  <i aria-hidden="true">↗</i>
                </button>

                <div className="site-shared-menu-explore">
                  <p>EXPLORE</p>
                  <div className="site-shared-menu-utility">
                    <Link href="/get-a-quote">Find My Detail <span>↗</span></Link>
                    <Link href="/ceramic">Ceramic Coating <span>↗</span></Link>
                    <Link href="/paint-correction">Paint Correction <span>↗</span></Link>
                    <Link href="/service-areas">Service Areas <span>↗</span></Link>
                    <Link href="/blog">Shine On Blog <span>↗</span></Link>
                    {supabaseConfigured && <a href="/account" data-no-transition="true">Account <span>↗</span></a>}
                  </div>
                </div>

                <div className="site-shared-menu-actions">
                  <a href={site.phone.sms} onClick={() => track("text_click", { location: "shared_menu" })}>Text us</a>
                  <Link href="/book" onClick={() => track("book_click", { location: "shared_menu" })}>Book a detail <span aria-hidden="true">↗</span></Link>
                </div>
              </div>
            </nav>
          </div>
        </>
      )}


    </header>
  );
}
