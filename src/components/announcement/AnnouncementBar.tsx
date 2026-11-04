"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./announcement.module.css";

type Props = { text: string; linkText?: string; linkUrl?: string };

/**
 * Site-wide notice set in Team HQ → Settings (holiday closure, booked-out
 * week). Floats at the bottom so it never fights the fixed header, and stays
 * dismissed for that message once closed.
 */
export function AnnouncementBar({ text, linkText, linkUrl }: Props) {
  const key = `ed-announcement:${text}`;
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = window.localStorage.getItem(key) === "1";
    } catch {}
    setOpen(!dismissed);
  }, [key]);

  // The booking flow has its own sticky controls along the bottom.
  if (!open || pathname === "/book" || pathname === "/get-a-quote") return null;

  const close = () => {
    setOpen(false);
    try {
      window.localStorage.setItem(key, "1");
    } catch {}
  };
  const internal = linkUrl?.startsWith("/");

  return (
    <aside className={styles.bar} role="status" aria-label="Announcement">
      <span className={styles.dot} aria-hidden="true" />
      <p className={styles.text}>
        {text}
        {linkUrl && linkText ? (
          internal ? (
            <Link href={linkUrl} className={styles.link}>{linkText} <span aria-hidden="true">↗</span></Link>
          ) : (
            <a href={linkUrl} className={styles.link} target="_blank" rel="noreferrer">{linkText} <span aria-hidden="true">↗</span></a>
          )
        ) : null}
      </p>
      <button type="button" className={styles.close} onClick={close} aria-label="Dismiss announcement">×</button>
    </aside>
  );
}
