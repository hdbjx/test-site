"use client";

import { useEffect, useRef, useState } from "react";

type TurnstileTarget = string | HTMLElement;

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  execute: (target: TurnstileTarget) => void;
  reset?: (target?: TurnstileTarget) => void;
  remove?: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadTurnstileScript() {
  if (typeof window === "undefined" || window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-ed-turnstile="true"]');
    if (existing) {
      if (window.turnstile) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Turnstile script failed to load")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.dataset.edTurnstile = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Turnstile script failed to load"));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

const SECURITY_ERROR = "We couldn't complete the security check. Check your connection and try again.";

export function TurnstileField({ action }: { action: string }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const readyRef = useRef<Promise<void> | null>(null);
  const bypassNextSubmitRef = useRef(false);
  const verifyingRef = useRef(false);
  const activeResolveRef = useRef<((value: string) => void) | null>(null);
  const activeRejectRef = useRef<((reason?: unknown) => void) | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;
    let cancelled = false;

    const ready = loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile || widgetIdRef.current) return;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action,
          execution: "execute",
          retry: "never",
          callback: (value: string) => {
            const token = String(value || "");
            if (inputRef.current) inputRef.current.value = token;
            activeResolveRef.current?.(token);
            activeResolveRef.current = null;
            activeRejectRef.current = null;
          },
          "expired-callback": () => {
            if (inputRef.current) inputRef.current.value = "";
          },
          "error-callback": () => {
            if (inputRef.current) inputRef.current.value = "";
            activeRejectRef.current?.(new Error("Turnstile challenge failed"));
            activeResolveRef.current = null;
            activeRejectRef.current = null;
          },
          "timeout-callback": () => {
            if (inputRef.current) inputRef.current.value = "";
            activeRejectRef.current?.(new Error("Turnstile challenge timed out"));
            activeResolveRef.current = null;
            activeRejectRef.current = null;
          },
        });
      })
      .catch((reason) => {
        console.error("[turnstile]", reason);
        throw reason;
      });

    readyRef.current = ready;

    return () => {
      cancelled = true;
      activeRejectRef.current?.(new Error("Turnstile unmounted"));
      activeResolveRef.current = null;
      activeRejectRef.current = null;
      if (widgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
      readyRef.current = null;
    };
  }, [action, siteKey]);

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;
    const form = containerRef.current.closest("form");
    if (!form) return;

    const getFreshToken = async () => {
      await readyRef.current;
      const widgetId = widgetIdRef.current;
      const turnstile = window.turnstile;
      if (!widgetId || !turnstile) throw new Error("Turnstile is not ready");

      for (let attempt = 0; attempt < 2; attempt += 1) {
        if (inputRef.current) inputRef.current.value = "";
        turnstile.reset?.(widgetId);

        try {
          const token = await new Promise<string>((resolve, reject) => {
            let settled = false;
            const finishResolve = (value: string) => {
              if (settled) return;
              settled = true;
              clearTimeout(timer);
              resolve(value);
            };
            const finishReject = (reason?: unknown) => {
              if (settled) return;
              settled = true;
              clearTimeout(timer);
              reject(reason);
            };
            const timer = window.setTimeout(() => finishReject(new Error("Turnstile timed out")), 12000);
            activeResolveRef.current = finishResolve;
            activeRejectRef.current = finishReject;
            turnstile.execute(widgetId);
          });

          if (token) return token;
          throw new Error("Turnstile returned an empty token");
        } catch (reason) {
          activeResolveRef.current = null;
          activeRejectRef.current = null;
          if (attempt === 1) throw reason;
          await new Promise((resolve) => window.setTimeout(resolve, 350));
        }
      }

      throw new Error("Turnstile failed");
    };

    const handleSubmit = (event: Event) => {
      if (bypassNextSubmitRef.current) {
        bypassNextSubmitRef.current = false;
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      if (verifyingRef.current) return;
      verifyingRef.current = true;
      form.dataset.turnstileVerifying = "true";
      setError(null);

      const submitEvent = event as SubmitEvent;
      const submitter = submitEvent.submitter;

      void getFreshToken()
        .then(() => {
          verifyingRef.current = false;
          delete form.dataset.turnstileVerifying;
          bypassNextSubmitRef.current = true;
          if (submitter instanceof HTMLButtonElement || submitter instanceof HTMLInputElement) {
            form.requestSubmit(submitter);
          } else {
            form.requestSubmit();
          }
        })
        .catch((reason) => {
          verifyingRef.current = false;
          delete form.dataset.turnstileVerifying;
          console.error("[turnstile] submit verification failed", reason);
          setError(SECURITY_ERROR);
        });
    };

    form.addEventListener("submit", handleSubmit, true);
    return () => form.removeEventListener("submit", handleSubmit, true);
  }, [siteKey]);

  return (
    <>
      {siteKey ? <div className="ed-turnstile" ref={containerRef} aria-hidden="true" /> : null}
      <input ref={inputRef} type="hidden" name="turnstileToken" defaultValue="" />
      {error ? <p className="ed-turnstile-error" role="alert">{error}</p> : null}
    </>
  );
}
