"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Phase = "idle" | "cover" | "reveal";

export function RouteTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const pendingHref = useRef<string | null>(null);
  const navTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const failSafe = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousPathname = useRef<string | null>(null);

  const clearTimers = () => {
    if (navTimer.current) clearTimeout(navTimer.current);
    if (revealTimer.current) clearTimeout(revealTimer.current);
    if (failSafe.current) clearTimeout(failSafe.current);
    navTimer.current = null;
    revealTimer.current = null;
    failSafe.current = null;
  };

  const finishTransition = () => {
    clearTimers();
    pendingHref.current = null;
    setPhase("reveal");
    revealTimer.current = setTimeout(() => setPhase("idle"), 430);
  };

  useEffect(() => {
    if (phase !== "cover" || !pendingHref.current) return;

    const href = pendingHref.current;
    navTimer.current = setTimeout(() => router.push(href), 285);
    failSafe.current = setTimeout(finishTransition, 1800);

    return clearTimers;
  }, [phase, router]);

  // Pathname is sufficient for the site's page-to-page transitions and avoids
  // making the global layout dependent on useSearchParams during prerendering.
  useEffect(() => {
    if (previousPathname.current === null) {
      previousPathname.current = pathname;
      return;
    }

    if (pathname !== previousPathname.current) {
      previousPathname.current = pathname;
      if (phase === "cover" || pendingHref.current) finishTransition();
    }
  }, [pathname, phase]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) return;

      const target = event.target as Element | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        anchor.dataset.noTransition === "true"
      ) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;

      // Auth/account routes rely on server redirects and cookie refreshes. Let the
      // browser/Next handle them directly instead of delaying them behind the wipe.
      if (url.pathname.startsWith("/account") || url.pathname.startsWith("/auth")) return;

      // Same-page query/hash changes do not need a full-screen branded wipe.
      if (url.pathname === window.location.pathname) return;
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
        <Image
          src="/brand/every-detail-logo.png"
          alt=""
          width={1000}
          height={1000}
          className="route-transition__logo"
          priority
        />
      </div>
    </div>
  );
}
