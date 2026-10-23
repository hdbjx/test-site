"use client";

import Image from "next/image";
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

export function Header() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const { vehicle, hydrated: vehicleHydrated, openPicker } = useVehicle();
  const { serviceIntent, openDrawer } = useJourney();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close menus on navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

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
  const headerClass = "fixed inset-x-0 top-0 z-40 text-white site-shared-header";

  // The booking funnel renders its own compact header; keep exits to a minimum there.
  if (pathname === "/book" || pathname === "/get-a-quote") return null;

  return (
    <header className={headerClass}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>

      <div className="site-shared-nav-shell">
        <Link href="/" className={`site-shared-logo-control ${onHome ? "home-logo-control" : ""}`} aria-label="Every Detail home">
          {onHome ? (
            <>
              <span className="home-logo-mark" aria-hidden="true" />
              <span className="sr-only">Every Detail home</span>
            </>
          ) : (
            <Image src="/brand/every-detail-logo.png" alt="Every Detail" width={1000} height={1000} className="site-shared-logo" priority />
          )}
        </Link>

        <div className="site-shared-nav-actions">
          {vehicleHydrated && (
            <button
              type="button"
              className={`site-context-pill ${vehicle || serviceIntent ? "is-set" : ""}`}
              onClick={() => (vehicle || serviceIntent ? openDrawer() : openPicker())}
              aria-label={vehicle || serviceIntent ? "Open your vehicle and service" : "Add your vehicle"}
            >
              <span>{vehicle ? siteVehicleLabel(vehicle) : serviceIntent ? catalogService(serviceIntent).name : "+ ADD YOUR VEHICLE"}</span>
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
                <button type="button" className="site-shared-menu-vehicle" onClick={() => { setMenuOpen(false); vehicle || serviceIntent ? openDrawer() : openPicker(); }}>
                  <span>{serviceIntent ? "YOUR DETAIL" : "YOUR VEHICLE"}</span>
                  <strong>{vehicle ? siteVehicleLabel(vehicle) : serviceIntent ? catalogService(serviceIntent).name : "Add your vehicle"}</strong>
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
