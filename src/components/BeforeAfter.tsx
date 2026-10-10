"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { imageById } from "@/data/images";

/**
 * Before/after comparison. A native range input drives the split, so it works
 * with keyboard (arrows, Home/End), screen readers and touch without custom gestures.
 */
export function BeforeAfter({ before, after, caption }: { before: string; after: string; caption: string }) {
  const [pos, setPos] = useState(50);
  const id = useId();
  const b = imageById(before);
  const a = imageById(after);

  return (
    <figure>
      <div className="relative select-none overflow-hidden rounded-[var(--radius-photo)] bg-paper2" style={{ aspectRatio: `${a.w}/${a.h}` }}>
        <Image src={a.file} alt={`After: ${a.alt}`} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <Image src={b.file} alt={`Before: ${b.alt}`} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 w-0.5 bg-paper" style={{ left: `${pos}%` }}>
          <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-paper bg-red text-paper shadow-lg">
            <svg viewBox="0 0 20 20" className="h-5 w-5"><path d="M7 5l-4 5 4 5M13 5l4 5-4 5" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>
          </span>
        </div>
        <span aria-hidden="true" className="absolute left-3 top-3 rounded-full bg-ink/70 px-3 py-1 font-display text-xs font-semibold text-paper">Before</span>
        <span aria-hidden="true" className="absolute right-3 top-3 rounded-full bg-red px-3 py-1 font-display text-xs font-semibold text-paper">After</span>
        <label htmlFor={id} className="sr-only">
          Drag to compare before and after: {caption}
        </label>
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-valuetext={`${pos}% before`}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      <figcaption className="mt-3 text-sm text-muted">{caption}</figcaption>
    </figure>
  );
}
