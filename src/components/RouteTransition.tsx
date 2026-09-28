"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function RouteTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<"idle" | "cover" | "reveal">("idle");
  const pendingHref = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (phase === "cover" && pendingHref.current) {
      const href = pendingHref.current;
      timer.current = setTimeout(() => router.push(href), 260);
    }
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [phase, router]);

  useEffect(() => {
    if (phase === "cover") {
      pendingHref.current = null;
      setPhase("reveal");
      const id = setTimeout(() => setPhase("idle"), 430);
      return () => clearTimeout(id);
    }
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target as Element | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download") || anchor.dataset.noTransition === "true") return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      event.preventDefault();
      pendingHref.current = url.pathname + url.search + url.hash;
      setPhase("cover");
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return (
    <div className={`route-transition route-transition--${phase}`} aria-hidden="true">
      <div className="route-transition__panel">
        <Image src="/brand/every-detail-logo.png" alt="" width={1000} height={1000} className="route-transition__logo" priority />
      </div>
    </div>
  );
}
