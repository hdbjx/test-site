"use client";

import { useEffect, useState } from "react";
import { LiveReviewCount } from "@/components/GoogleReviewStats";
import { track } from "@/lib/analytics";
import styles from "./RecentGoogleReviews.module.css";

type RecentReview = { author: string; authorUrl: string | null; rating: number; text: string; when: string; publishedAt: string };

/**
 * The newest Google reviews with their real dates, so "170+ five-star reviews" can be
 * checked, not just claimed. Renders nothing until Google answers with at least one
 * review (no key, an error, or no written reviews all hide the strip).
 */
export function RecentGoogleReviews({ tone = "paper" }: { tone?: "paper" | "ink" }) {
  const [data, setData] = useState<{ reviews: RecentReview[]; profileUrl: string } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/google-reviews", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json && Array.isArray(json.reviews) && json.reviews.length) setData({ reviews: json.reviews, profileUrl: json.profileUrl });
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  if (!data) return null;
  const latest = data.reviews[0];

  return (
    <section className={`${styles.section} ${tone === "ink" ? styles.ink : ""}`} data-header-tone={tone === "ink" ? "light" : "ink"} aria-labelledby="recent-reviews-title">
      <div className={styles.shell}>
        <header className={styles.head}>
          <div>
            <p className={styles.kicker}>
              <span className={styles.dot} aria-hidden="true" /> Latest Google review · {latest.when}
            </p>
            <h2 id="recent-reviews-title" className={styles.title}>Fresh off Google.</h2>
          </div>
          <a
            className={styles.all}
            href={data.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("review_click", { location: "recent_reviews" })}
          >
            Read all <LiveReviewCount /> on Google <span aria-hidden="true">↗</span>
          </a>
        </header>
        <ol className={styles.list}>
          {data.reviews.map((review) => (
            <li key={`${review.author}-${review.publishedAt}`} className={styles.card}>
              <p className={styles.meta}>
                <span className={styles.stars} aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(review.rating)}</span>
                <time dateTime={review.publishedAt}>{review.when}</time>
              </p>
              <blockquote className={styles.quote}>“{review.text}”</blockquote>
              <p className={styles.author}>
                {review.authorUrl ? <a href={review.authorUrl} target="_blank" rel="noopener noreferrer">{review.author}</a> : review.author} · Google review
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
