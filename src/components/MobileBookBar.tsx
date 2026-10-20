"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";

const HIDDEN_ON = ["/book", "/get-a-quote", "/detailplus/join", "/info-form"];

/** Persistent mobile booking bar. Appears once the hero is scrolled past; never on form pages. */
export function MobileBookBar() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 560);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (HIDDEN_ON.includes(pathname) || pathname.startsWith("/account")) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 backdrop-blur transition-transform duration-300 lg:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-hidden={!show}
    >
      <div className="container-ed flex items-center gap-3 py-3">
        <Link
          href="/get-a-quote"
          tabIndex={show ? 0 : -1}
          onClick={() => track("quote_start", { location: "mobile_bar" })}
          className="btn btn-secondary btn-sm flex-1"
        >
          Find my detail
        </Link>
        <Link
          href="/book"
          tabIndex={show ? 0 : -1}
          onClick={() => track("book_click", { location: "mobile_bar" })}
          className="btn btn-primary btn-sm flex-1"
        >
          Book now
        </Link>
      </div>
    </div>
  );
}
