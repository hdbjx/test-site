"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { usePrefersReducedMotion } from "@/components/motion/useMotion";

function padPair(from: string, to: string) {
  const width = Math.max(from.length, to.length);
  return [from.padStart(width, " "), to.padStart(width, " ")] as const;
}

function FlapCharacter({ from, to, delay, reduced }: { from: string; to: string; delay: number; reduced: boolean }) {
  if (from === to || reduced) return <span className="sv90-flap-static">{to === " " ? "\u00A0" : to}</span>;

  return (
    <span className="sv90-flap-cell" style={{ "--sv90-flap-delay": `${delay}ms` } as CSSProperties}>
      <span className="sv90-flap-half sv90-flap-top"><i>{to}</i></span>
      <span className="sv90-flap-half sv90-flap-bottom"><i>{to}</i></span>
      <span className="sv90-flap-half sv90-flap-old"><i>{from}</i></span>
      <span className="sv90-flap-half sv90-flap-new"><i>{to}</i></span>
    </span>
  );
}

export function SplitFlapPrice({ value, rowIndex = 0 }: { value: string; rowIndex?: number }) {
  const previous = useRef(value);
  const [from, setFrom] = useState(value);
  const [version, setVersion] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (previous.current === value) return;
    setFrom(previous.current);
    previous.current = value;
    setVersion((current) => current + 1);
  }, [value]);

  const [paddedFrom, paddedTo] = padPair(from, value);

  return (
    <span className="sv90-flap-price" aria-label={value}>
      <span className="sr-only">{value}</span>
      <span className="sv90-flap-visual" aria-hidden="true" key={`${version}-${value}`}>
        {Array.from(paddedTo).map((char, index) => (
          <FlapCharacter
            key={`${index}-${char}-${version}`}
            from={paddedFrom[index] ?? " "}
            to={char}
            delay={rowIndex * 25 + index * 40}
            reduced={reduced}
          />
        ))}
      </span>
    </span>
  );
}
