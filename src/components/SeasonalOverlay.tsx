"use client";

import { useEffect, useState } from "react";
import styles from "./SeasonalOverlay.module.css";

const leaves = [
  { left: "6%", delay: "-1s", duration: "13s", size: 18, drift: "42px", glyph: "🍂" },
  { left: "18%", delay: "-8s", duration: "17s", size: 15, drift: "-36px", glyph: "🍁" },
  { left: "36%", delay: "-4s", duration: "15s", size: 17, drift: "50px", glyph: "🍂" },
  { left: "57%", delay: "-11s", duration: "19s", size: 14, drift: "-42px", glyph: "🍁" },
  { left: "74%", delay: "-6s", duration: "16s", size: 18, drift: "34px", glyph: "🍂" },
  { left: "91%", delay: "-14s", duration: "20s", size: 15, drift: "-48px", glyph: "🍁" },
];

export function SeasonalOverlay() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Keep the seasonal layer easy to remove, and avoid changing the site's
    // server-rendered structure or layout behavior.
    setEnabled(true);
  }, []);

  if (!enabled) return null;

  return (
    <div className={styles.overlay} aria-hidden="true">
      <div className={`${styles.web} ${styles.webLeft}`} />
      <div className={`${styles.web} ${styles.webRight}`} />

      <div className={`${styles.cornerCluster} ${styles.bottomLeft}`}>
        <span className={styles.pumpkin}>🎃</span>
        <span className={styles.leafPile}>🍂</span>
        <span className={styles.leafPileSmall}>🍁</span>
      </div>

      <div className={`${styles.cornerCluster} ${styles.bottomRight}`}>
        <span className={styles.leafPile}>🍁</span>
        <span className={styles.pumpkinSmall}>🎃</span>
        <span className={styles.leafPileSmall}>🍂</span>
      </div>

      <span className={styles.batOne}>🦇</span>
      <span className={styles.batTwo}>🦇</span>

      <div className={styles.fallingLeaves}>
        {leaves.map((leaf, index) => (
          <span
            key={index}
            className={styles.fallingLeaf}
            style={{
              left: leaf.left,
              animationDelay: leaf.delay,
              animationDuration: leaf.duration,
              fontSize: `${leaf.size}px`,
              ["--leaf-drift" as string]: leaf.drift,
            }}
          >
            {leaf.glyph}
          </span>
        ))}
      </div>
    </div>
  );
}
