"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { site } from "@/data/site";
import { track } from "@/lib/analytics";
import { supabaseConfigured } from "@/lib/supabase/config";

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [showAvailabilityBanner, setShowAvailabilityBanner] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // The school-hours scheduling ticker is only relevant while the team is in school.
  // Evaluate in Every Detail’s local timezone so visitors elsewhere see the same schedule.
  useEffect(() => {
    const updateAvailabilityBanner = () => {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).formatToParts(new Date());

      const value = (type: Intl.DateTimeFormatPartTypes) =>
        parts.find((part) => part.type === type)?.value ?? "";
      const weekday = value("weekday");
      const hour = Number(value("hour"));
      const minute = Number(value("minute"));
      const minutesAfterMidnight = hour * 60 + minute;
      const isWeekday = ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(weekday);

      setShowAvailabilityBanner(
        isWeekday && minutesAfterMidnight >= 7 * 60 + 30 && minutesAfterMidnight < 16 * 60,
      );
    };

    updateAvailabilityBanner();
    const timer = window.setInterval(updateAvailabilityBanner, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  // Close menus on navigation
  useEffect(() => {
    setMenuOpen(false);
    setAvailabilityOpen(false);
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


  useEffect(() => {
    if (!availabilityOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAvailabilityOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [availabilityOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const onHome = pathname === "/";
  const headerClass = "fixed inset-x-0 top-0 z-40 text-white site-shared-header";

  return (
    <header className={headerClass}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>

      {showAvailabilityBanner && !onHome && (
        <button
          type="button"
          className="availability-banner"
          onClick={() => setAvailabilityOpen(true)}
          aria-haspopup="dialog"
        >
          <span className="availability-banner-track" aria-hidden="true">
            <span>STUDENT-RUN TEAM&nbsp;&nbsp;•&nbsp;&nbsp;WEEKDAY APPOINTMENTS AFTER SCHOOL&nbsp;&nbsp;•&nbsp;&nbsp;WEEKEND AVAILABILITY&nbsp;&nbsp;•&nbsp;&nbsp;FULLY MOBILE&nbsp;&nbsp;•&nbsp;&nbsp;POWER + WATER INCLUDED&nbsp;&nbsp;•&nbsp;&nbsp;VIEW SCHEDULING DETAILS&nbsp;&nbsp;•&nbsp;&nbsp;</span>
            <span>STUDENT-RUN TEAM&nbsp;&nbsp;•&nbsp;&nbsp;WEEKDAY APPOINTMENTS AFTER SCHOOL&nbsp;&nbsp;•&nbsp;&nbsp;WEEKEND AVAILABILITY&nbsp;&nbsp;•&nbsp;&nbsp;FULLY MOBILE&nbsp;&nbsp;•&nbsp;&nbsp;POWER + WATER INCLUDED&nbsp;&nbsp;•&nbsp;&nbsp;VIEW SCHEDULING DETAILS&nbsp;&nbsp;•&nbsp;&nbsp;</span>
          </span>
          <span className="sr-only">View scheduling information for our student-run team</span>
        </button>
      )}
      {showAvailabilityBanner && onHome && (
        <button
          type="button"
          className="home-school-availability"
          onClick={() => setAvailabilityOpen(true)}
          aria-haspopup="dialog"
        >
          <span className="home-school-availability-dot" aria-hidden="true" />
          <span className="home-school-availability-copy">
            <strong>IN SCHOOL</strong>
            <span className="home-school-availability-desktop">AFTER-SCHOOL APPOINTMENTS</span>
            <span className="home-school-availability-mobile">TEXT US</span>
          </span>
          <i aria-hidden="true">↗</i>
        </button>
      )}
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
              <div className="site-shared-menu-utility">
                <Link href="/get-a-quote">Find My Detail</Link>
                <Link href="/paint-correction">Paint Correction</Link>
                <Link href="/ceramic">Ceramic</Link>
                <Link href="/service-areas">Service Areas</Link>
                <Link href="/blog">Shine On Blog</Link>
                {supabaseConfigured && <a href="/account" data-no-transition="true">Account</a>}
              </div>
              <div className="site-shared-menu-actions">
                <a href={site.phone.sms} onClick={() => track("text_click", { location: "shared_menu" })}>Text us</a>
                <Link href="/book" onClick={() => track("book_click", { location: "shared_menu" })}>Book a detail <span aria-hidden="true">↗</span></Link>
              </div>
            </nav>
          </div>
        </>
      )}

      {availabilityOpen && (
        <div className="availability-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setAvailabilityOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="availability-title" className="availability-modal">
            <button type="button" className="availability-modal-close" aria-label="Close scheduling information" onClick={() => setAvailabilityOpen(false)}>×</button>
            <p className="availability-modal-kicker">OUR AVAILABILITY</p>
            <h2 id="availability-title">Student-run, professionally scheduled.</h2>
            <p>Every Detail is operated by a student team. During the school year, weekday appointments are generally available in the afternoon and early evening, with broader availability on weekends.</p>
            <p>Because our team is in class during the school day, we cannot answer phone calls during school hours. Texting is the best way to reach us during the day, and we&rsquo;ll respond as soon as we&rsquo;re available.</p>
            <p>Our booking calendar shows the appointment times we can currently support. If you need a time that is not listed, text us and we&rsquo;ll let you know what we can accommodate.</p>
            <div className="availability-modal-actions">
              <Link href="/book" className="btn btn-primary" onClick={() => setAvailabilityOpen(false)}>View open appointments</Link>
              <a href={site.phone.sms} onClick={() => { track("text_click", { location: "availability_notice" }); setAvailabilityOpen(false); }}>Text us about a time</a>
            </div>
          </section>
        </div>
      )}
    </header>
  );
}
