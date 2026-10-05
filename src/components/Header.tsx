"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { moreNav, primaryNav, serviceNav } from "@/data/navigation";
import { site } from "@/data/site";
import { track } from "@/lib/analytics";
import { supabaseConfigured } from "@/lib/supabase/config";

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [showAvailabilityBanner, setShowAvailabilityBanner] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
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
    setMoreOpen(false);
    setServicesOpen(false);
    setAvailabilityOpen(false);
  }, [pathname]);

  // Desktop dropdowns: close on outside click / Escape
  useEffect(() => {
    if (!moreOpen && !servicesOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!moreRef.current?.contains(e.target as Node)) setMoreOpen(false);
      if (!servicesRef.current?.contains(e.target as Node)) setServicesOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMoreOpen(false);
        setServicesOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen, servicesOpen]);

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
  const onDarkHero = onHome || pathname === "/paint-correction" || pathname === "/ceramic";

  return (
    <header className={onDarkHero ? "fixed inset-x-0 top-0 z-40 text-white home-header" : "sticky inset-x-0 top-0 z-40 text-white inner-header"}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>

      {showAvailabilityBanner && (
        <button
          type="button"
          className="availability-banner"
          onClick={() => setAvailabilityOpen(true)}
          aria-haspopup="dialog"
        >
          <span className="availability-banner-track" aria-hidden="true">
            <span>STUDENT-RUN SCHEDULING&nbsp;&nbsp;•&nbsp;&nbsp;WEEKDAY APPOINTMENTS BEGIN AFTER SCHOOL&nbsp;&nbsp;•&nbsp;&nbsp;PHONE AVAILABILITY IS LIMITED DURING SCHOOL HOURS&nbsp;&nbsp;•&nbsp;&nbsp;TEXTING IS BEST DURING THE SCHOOL DAY&nbsp;&nbsp;•&nbsp;&nbsp;WEEKEND AVAILABILITY AVAILABLE&nbsp;&nbsp;•&nbsp;&nbsp;VIEW SCHEDULING DETAILS&nbsp;&nbsp;•&nbsp;&nbsp;</span>
            <span>STUDENT-RUN SCHEDULING&nbsp;&nbsp;•&nbsp;&nbsp;WEEKDAY APPOINTMENTS BEGIN AFTER SCHOOL&nbsp;&nbsp;•&nbsp;&nbsp;PHONE AVAILABILITY IS LIMITED DURING SCHOOL HOURS&nbsp;&nbsp;•&nbsp;&nbsp;TEXTING IS BEST DURING THE SCHOOL DAY&nbsp;&nbsp;•&nbsp;&nbsp;WEEKEND AVAILABILITY AVAILABLE&nbsp;&nbsp;•&nbsp;&nbsp;VIEW SCHEDULING DETAILS&nbsp;&nbsp;•&nbsp;&nbsp;</span>
          </span>
          <span className="sr-only">View scheduling information for our student-run team</span>
        </button>
      )}
      <div className={onDarkHero ? "home-nav-shell flex items-center justify-between gap-6" : "inner-nav-shell flex items-center justify-between gap-6"}>
        <Link href="/" className={onDarkHero ? "home-logo-control flex shrink-0 items-center" : "inner-logo-control flex shrink-0 items-center"} aria-label="Every Detail home">
          <Image src="/brand/every-detail-logo.png" alt="Every Detail" width={1000} height={1000} className={onDarkHero ? "h-[4.15rem] w-[4.15rem] object-contain" : "inner-logo object-contain"} priority />
        </Link>

        {/* Desktop */}
        <nav aria-label="Main" className={onDarkHero ? "home-nav-links hidden items-center gap-1 lg:flex" : "inner-nav-links hidden items-center gap-1 lg:flex"}>
          <div
            ref={servicesRef}
            className="services-menu relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
            onFocus={() => setServicesOpen(true)}
            onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setServicesOpen(false); }}
          >
            <button
              type="button"
              className={`rounded px-3 py-2 font-display text-[0.9375rem] font-semibold transition-colors ${onDarkHero ? "text-white/90 hover:text-white" : "text-ink/80 hover:text-ink"}`}
              aria-expanded={servicesOpen}
              aria-haspopup="menu"
              onClick={() => setServicesOpen((v) => !v)}
            >
              Services <span aria-hidden="true" className="ml-1 text-[.7em]">▾</span>
            </button>
            {servicesOpen && (
              <div role="menu" className={`services-dropdown absolute left-1/2 top-[calc(100%+.75rem)] min-w-[14rem] -translate-x-1/2 overflow-hidden rounded-xl border p-2 shadow-2xl ${onDarkHero ? "border-white/15 bg-[#111]/95 text-white" : "border-line bg-paper text-ink"}`}>
                {serviceNav.map((item) => (
                  <Link key={item.href} role="menuitem" href={item.href} className="block rounded-lg px-4 py-3 font-display text-[.98rem] font-semibold transition-colors hover:bg-white/10">
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          {primaryNav.filter((item) => item.label !== "Services").map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`rounded px-3 py-2 font-display text-[0.9375rem] font-semibold transition-colors aria-[current=page]:underline aria-[current=page]:decoration-red aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-8 ${onDarkHero ? "text-white/90 hover:text-white" : "text-ink/80 hover:text-ink aria-[current=page]:text-ink"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={onDarkHero ? "home-nav-actions flex items-center gap-3" : "inner-nav-actions flex items-center gap-3"}>
          {supabaseConfigured && (
            <a
              href="/account"
              data-no-transition="true"
              aria-current={isActive("/account") ? "page" : undefined}
              className={`account-link hidden px-3 py-2 font-display text-[0.9375rem] font-semibold lg:block ${onDarkHero ? "text-white/85 hover:text-white" : "text-ink/80 hover:text-ink"}`}
            >
              Account
            </a>
          )}
          <Link
            href="/book"
            onClick={() => track("book_click", { location: "header" })}
            className="btn btn-primary btn-sm"
          >
            Book now
          </Link>
          <button
            ref={menuButtonRef}
            type="button"
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6">
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" />
              ) : (
                <path d="M4 8h16M4 16h16" stroke="currentColor" strokeWidth="1.8" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {menuOpen && (
        <div
          id="mobile-menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={`mobile-menu-panel fixed inset-x-0 bottom-0 z-40 overflow-y-auto bg-paper text-ink lg:hidden ${onHome ? "mobile-menu-home" : "mobile-menu-inner"}`}
        >
          <nav aria-label="Mobile" className="mobile-menu-nav">
            <p className="mobile-menu-label">Services</p>
            <div className="mobile-menu-primary">
              {serviceNav.map((item, index) => (
                <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? "page" : undefined} className="mobile-menu-service">
                  <span>0{index + 1}</span>{item.label}
                </Link>
              ))}
            </div>

            <p className="mobile-menu-label mobile-menu-label-more">Explore</p>
            <div className="mobile-menu-secondary">
              {primaryNav.filter((item) => item.label !== "Services").map((item) => (
                <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? "page" : undefined}>{item.label}</Link>
              ))}
              {supabaseConfigured && <a href="/account" data-no-transition="true" aria-current={isActive("/account") ? "page" : undefined}>Account</a>}
              {moreNav.map((item) => item.external ? (
                <a key={item.href} href={item.href} target="_blank" rel="noopener">{item.label}</a>
              ) : (
                <Link key={item.href} href={item.href}>{item.label}</Link>
              ))}
            </div>

            <div className="mobile-menu-actions">
              <Link href="/book" className="btn btn-primary" onClick={() => track("book_click", { location: "mobile_menu" })}>Book your detail</Link>
              <a href={site.phone.sms} className="mobile-menu-phone" onClick={() => track("text_click", { location: "mobile_menu" })}>Text {site.phone.display}</a>
            </div>
          </nav>
        </div>
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
