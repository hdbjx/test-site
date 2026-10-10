"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
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
      cache: "no-store",
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

export function GoogleMapsAttribution({ className = "" }: { className?: string }) {
  return (
    <span className={`google-maps-attribution ${className}`.trim()} translate="no">
      Google Maps
    </span>
  );
}
