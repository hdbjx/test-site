"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { moreNav, primaryNav } from "@/data/navigation";
import { logo } from "@/data/images";
import { site } from "@/data/site";
import { track } from "@/lib/analytics";
import { supabaseConfigured } from "@/lib/supabase/config";

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close menus on navigation
  useEffect(() => {
    setMenuOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  // "More" dropdown: close on outside click / Escape
  useEffect(() => {
    if (!moreOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!moreRef.current?.contains(e.target as Node)) setMoreOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMoreOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

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

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <div className="container-ed flex h-[4.5rem] items-center justify-between gap-6">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Every Detail home">
          <Image src={logo.mark.file} alt="Every Detail" width={logo.mark.w} height={logo.mark.h} priority className="h-11 w-auto" />
        </Link>

        {/* Desktop */}
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className="rounded px-3 py-2 font-display text-[0.9375rem] font-semibold text-ink/80 transition-colors hover:text-ink aria-[current=page]:text-ink aria-[current=page]:underline aria-[current=page]:decoration-red aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-8"
            >
              {item.label}
            </Link>
          ))}
          <div ref={moreRef} className="relative">
            <button
              type="button"
              aria-expanded={moreOpen}
              aria-controls="more-menu"
              onClick={() => setMoreOpen((v) => !v)}
              className="flex items-center gap-1 rounded px-3 py-2 font-display text-[0.9375rem] font-semibold text-ink/80 hover:text-ink"
            >
              More
              <svg aria-hidden="true" viewBox="0 0 12 12" className={`h-3 w-3 transition-transform ${moreOpen ? "rotate-180" : ""}`}>
                <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </button>
            {moreOpen && (
              <ul
                id="more-menu"
                className="absolute right-0 top-full mt-2 w-52 rounded-[var(--radius-panel)] border border-line bg-paper p-1.5 shadow-[0_12px_32px_rgb(17_17_17/0.12)]"
              >
                {moreNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      {...(item.external ? { target: "_blank", rel: "noopener" } : {})}
                      className="block rounded px-3 py-2.5 text-[0.9375rem] hover:bg-paper2"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-2">
          {supabaseConfigured && (
            <Link
              href="/account"
              aria-current={isActive("/account") ? "page" : undefined}
              className="hidden rounded px-3 py-2 font-display text-[0.9375rem] font-semibold text-ink/80 hover:text-ink lg:block"
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
          className="fixed inset-x-0 bottom-0 top-[4.5rem] z-40 overflow-y-auto bg-paper lg:hidden"
        >
          <nav aria-label="Mobile" className="container-ed flex flex-col py-6">
            {[...primaryNav, ...moreNav, ...(supabaseConfigured ? [{ label: "Account", href: "/account", external: false }] : [])].map((item) => (
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
