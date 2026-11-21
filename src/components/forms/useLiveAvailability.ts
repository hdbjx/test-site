"use client";

import { useEffect, useRef } from "react";
import { supabaseConfigured } from "@/lib/supabase/config";
import { supabaseBrowser } from "@/lib/supabase/browser";

/** Public Realtime topic the database pings whenever schedule capacity changes. */
export const AVAILABILITY_TOPIC = "availability";
const POLL_MS = 30_000;
const DEBOUNCE_MS = 700;

/**
 * Calls `onChange` whenever open times may have changed:
 * - instantly, via a Supabase Realtime broadcast fired by database triggers
 *   (jobs, staff availability, overrides, rigs, settings),
 * - when the tab regains focus or comes back online,
 * - every 30s while the tab is visible, as a fallback if the socket drops.
 * The broadcast carries no customer data — only "something changed".
 */
export function useLiveAvailability(enabled: boolean, onChange: () => void) {
  const callback = useRef(onChange);
  useEffect(() => {
    callback.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!enabled) return;
    let debounce: number | undefined;
    const fire = () => {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(() => callback.current(), DEBOUNCE_MS);
    };

    let channel: { unsubscribe: () => unknown } | null = null;
    let client: ReturnType<typeof supabaseBrowser> | null = null;
    if (supabaseConfigured) {
      try {
        client = supabaseBrowser();
        channel = client
          .channel(AVAILABILITY_TOPIC, { config: { private: false } })
          .on("broadcast", { event: "changed" }, fire)
          .subscribe();
      } catch {
        channel = null;
      }
    }

    const poll = window.setInterval(() => {
      if (document.visibilityState === "visible") fire();
    }, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") fire();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    window.addEventListener("online", fire);

    return () => {
      window.clearTimeout(debounce);
      window.clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      window.removeEventListener("online", fire);
      if (channel && client) {
        try {
          void client.removeChannel(channel as Parameters<typeof client.removeChannel>[0]);
        } catch {}
      }
    };
  }, [enabled]);
}
