"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/data/site";
import { track } from "@/lib/analytics";

const HIDDEN_ON = ["/book", "/get-a-quote", "/detailplus/join"];

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
        <a
          href={site.phone.href}
          tabIndex={show ? 0 : -1}
          onClick={() => track("phone_click", { location: "mobile_bar" })}
          className="btn btn-secondary btn-sm shrink-0 px-4"
          aria-label={`Call ${site.phone.display}`}
        >
          Call
        </a>
        <Link
          href="/book"
          tabIndex={show ? 0 : -1}
          onClick={() => track("book_click", { location: "mobile_bar" })}
          className="btn btn-primary btn-sm flex-1"
        >
          Book your detail
        </Link>
      </div>
    </div>
  );
}
