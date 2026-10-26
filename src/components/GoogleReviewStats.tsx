"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { site } from "@/data/site";

type ReviewStats = {
  count: number;
  rating: number;
  live: boolean;
};

const fallbackStats: ReviewStats = {
  count: site.reviews.count,
  rating: site.reviews.rating,
  live: false,
};

const ReviewStatsContext = createContext<ReviewStats>(fallbackStats);

export function GoogleReviewStatsProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<ReviewStats>(fallbackStats);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/google-review-stats", {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!data || !Number.isFinite(Number(data.count))) return;
        setStats({
          count: Number(data.count),
          rating: Number.isFinite(Number(data.rating)) ? Number(data.rating) : site.reviews.rating,
          live: Boolean(data.live),
        });
      })
      .catch((error) => {
        if (error?.name !== "AbortError") console.error("Could not load live Google review count", error);
      });

    return () => controller.abort();
  }, []);

  const value = useMemo(() => stats, [stats]);
  return <ReviewStatsContext.Provider value={value}>{children}</ReviewStatsContext.Provider>;
}

const reviewCountFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export function LiveReviewCount({ plus = true }: { plus?: boolean }) {
  const { count } = useContext(ReviewStatsContext);
  const numericCount = Number(count);
  const safeCount = Number.isFinite(numericCount) ? numericCount : site.reviews.count;
  return <>{reviewCountFormatter.format(safeCount)}{plus ? "+" : ""}</>;
}

export function AnimatedReviewCount({ plus = true, duration = 700 }: { plus?: boolean; duration?: number }) {
  const { count } = useContext(ReviewStatsContext);
  const target = Number.isFinite(Number(count)) ? Number(count) : site.reviews.count;
  const [display, setDisplay] = useState(() => site.reviews.count);
  const ref = useRef<HTMLSpanElement>(null);
  const hasRun = useRef(false);
  const visibleRef = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || hasRun.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting) || hasRun.current) return;
      visibleRef.current = true;
      hasRun.current = true;
      observer.disconnect();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setDisplay(target);
        return;
      }
      const start = performance.now();
      const from = Math.max(0, Math.min(display, target));
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / Math.max(duration, 1));
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplay(Math.round(from + (target - from) * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.45 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [duration]);

  useEffect(() => {
    if (!hasRun.current || !visibleRef.current) return;
    setDisplay(target);
  }, [target]);

  return <span ref={ref}>{reviewCountFormatter.format(display)}{plus ? "+" : ""}</span>;
}

export function GoogleMapsAttribution({ className = "" }: { className?: string }) {
  return (
    <span className={`google-maps-attribution ${className}`.trim()} translate="no">
      Google Maps
    </span>
  );
}
