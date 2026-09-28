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
  const moreRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close menus on navigation
  useEffect(() => {
    setMenuOpen(false);
    setMoreOpen(false);
    setServicesOpen(false);
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

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const onHome = pathname === "/";

  return (
    <header className={onHome ? "fixed inset-x-0 top-0 z-40 text-white home-header" : "sticky inset-x-0 top-0 z-40 text-white inner-header"}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <div className={onHome ? "home-nav-shell flex items-center justify-between gap-6" : "inner-nav-shell flex items-center justify-between gap-6"}>
        <Link href="/" className={onHome ? "home-logo-control flex shrink-0 items-center" : "inner-logo-control flex shrink-0 items-center"} aria-label="Every Detail home">
          <Image src="/brand/every-detail-logo.png" alt="Every Detail" width={1000} height={1000} className={onHome ? "h-[4.15rem] w-[4.15rem] object-contain" : "inner-logo object-contain"} priority />
        </Link>

        {/* Desktop */}
        <nav aria-label="Main" className={onHome ? "home-nav-links hidden items-center gap-1 lg:flex" : "inner-nav-links hidden items-center gap-1 lg:flex"}>
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
              className={`rounded px-3 py-2 font-display text-[0.9375rem] font-semibold transition-colors ${onHome ? "text-white/90 hover:text-white" : "text-ink/80 hover:text-ink"}`}
              aria-expanded={servicesOpen}
              aria-haspopup="menu"
              onClick={() => setServicesOpen((v) => !v)}
            >
              Services <span aria-hidden="true" className="ml-1 text-[.7em]">▾</span>
            </button>
            {servicesOpen && (
              <div role="menu" className={`services-dropdown absolute left-1/2 top-[calc(100%+.75rem)] min-w-[14rem] -translate-x-1/2 overflow-hidden rounded-xl border p-2 shadow-2xl ${onHome ? "border-white/15 bg-[#111]/95 text-white" : "border-line bg-paper text-ink"}`}>
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
              className={`rounded px-3 py-2 font-display text-[0.9375rem] font-semibold transition-colors aria-[current=page]:underline aria-[current=page]:decoration-red aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-8 ${onHome ? "text-white/90 hover:text-white" : "text-ink/80 hover:text-ink aria-[current=page]:text-ink"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={onHome ? "home-nav-actions flex items-center gap-3" : "inner-nav-actions flex items-center gap-3"}>
          {supabaseConfigured && (
            <Link
              href="/account"
              aria-current={isActive("/account") ? "page" : undefined}
              className={`account-link hidden px-3 py-2 font-display text-[0.9375rem] font-semibold lg:block ${onHome ? "text-white/85 hover:text-white" : "text-ink/80 hover:text-ink"}`}
            >
              Account
            </Link>
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
          className="fixed inset-x-0 bottom-0 top-[4.5rem] z-40 overflow-y-auto bg-paper text-ink lg:hidden"
        >
          <nav aria-label="Mobile" className="container-ed flex flex-col py-6">
            {[...serviceNav, ...primaryNav.filter((item) => item.label !== "Services"), ...moreNav, ...(supabaseConfigured ? [{ label: "Account", href: "/account", external: false }] : [])].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                {...(item.external ? { target: "_blank", rel: "noopener" } : {})}
                aria-current={isActive(item.href) ? "page" : undefined}
                className="border-b border-line py-4 font-display text-2xl font-semibold tracking-tight aria-[current=page]:text-red"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-8 flex flex-col gap-3">
              <Link href="/book" className="btn btn-primary" onClick={() => track("book_click", { location: "mobile_menu" })}>
                Book your detail
              </Link>
              <a
                href={site.phone.href}
                className="btn btn-secondary"
                onClick={() => track("phone_click", { location: "mobile_menu" })}
              >
                Call {site.phone.display}
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
