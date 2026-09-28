"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Phase = "idle" | "cover" | "reveal";

export function RouteTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<Phase>("idle");
  const pendingHref = useRef<string | null>(null);
  const navTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const failSafe = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousLocation = useRef<string | null>(null);

  const clearTimers = () => {
    if (navTimer.current) clearTimeout(navTimer.current);
    if (failSafe.current) clearTimeout(failSafe.current);
    navTimer.current = null;
    failSafe.current = null;
  };

  // Once the cover is in place, perform the route change. A failsafe always
  // clears the overlay even if a redirect or route error behaves unexpectedly.
  useEffect(() => {
    if (phase !== "cover" || !pendingHref.current) return;

    const href = pendingHref.current;
    navTimer.current = setTimeout(() => router.push(href), 285);
    failSafe.current = setTimeout(() => {
      pendingHref.current = null;
      setPhase("reveal");
      setTimeout(() => setPhase("idle"), 430);
    }, 1800);

    return clearTimers;
  }, [phase, router]);

  // Reveal only after the URL actually changes. This also handles server
  // redirects such as /account/sign-in -> /account for signed-in customers.
  useEffect(() => {
    const current = `${pathname}?${searchParams.toString()}`;
    if (previousLocation.current === null) {
      previousLocation.current = current;
      return;
    }

    if (current !== previousLocation.current) {
      previousLocation.current = current;
      if (phase === "cover" || pendingHref.current) {
        clearTimers();
        pendingHref.current = null;
        setPhase("reveal");
        const id = setTimeout(() => setPhase("idle"), 430);
        return () => clearTimeout(id);
      }
    }
  }, [pathname, searchParams, phase]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target as Element | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download") || anchor.dataset.noTransition === "true") return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash === window.location.hash) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      event.preventDefault();
      clearTimers();
      pendingHref.current = `${url.pathname}${url.search}${url.hash}`;
      setPhase("cover");
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      clearTimers();
    };
  }, []);

  return (
    <div className={`route-transition route-transition--${phase}`} aria-hidden="true">
      <div className="route-transition__panel">
        <Image src="/brand/every-detail-logo.png" alt="" width={1000} height={1000} className="route-transition__logo" priority />
      </div>
    </div>
  );
}
