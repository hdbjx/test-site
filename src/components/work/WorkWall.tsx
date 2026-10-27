"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Photo } from "@/components/Photo";
import { imageById } from "@/data/images";
import { workFilters, workWall, type WorkFilter, type WorkPhoto } from "@/data/work";
import styles from "./WorkWall.module.css";

type FilterId = "all" | WorkFilter;
const FILTER_IDS = workFilters.map((f) => f.id) as FilterId[];

function readHash(): FilterId {
  if (typeof window === "undefined") return "all";
  const raw = window.location.hash.replace("#", "");
  return (FILTER_IDS as string[]).includes(raw) ? (raw as FilterId) : "all";
}

/** Photo-first wall of real jobs with Google reviews mixed in. Filter chips + a lightbox. */
export function WorkWall({ anchorId }: { anchorId: string }) {
  const [filter, setFilter] = useState<FilterId>("all");
  const [open, setOpen] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    setFilter(readHash());
    const onHash = () => setFilter(readHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const items = useMemo(
    () => (filter === "all" ? workWall : workWall.filter((item) => item.tags.includes(filter))),
    [filter],
  );
  const photos = useMemo(() => items.filter((item): item is WorkPhoto => item.kind === "photo"), [items]);

  const counts = useMemo(() => {
    const out: Record<string, number> = { all: workWall.filter((i) => i.kind === "photo").length };
    for (const f of workFilters) {
      if (f.id !== "all") out[f.id] = workWall.filter((i) => i.kind === "photo" && i.tags.includes(f.id as WorkFilter)).length;
    }
    return out;
  }, []);

  const choose = (id: FilterId) => {
    setFilter(id);
    const url = id === "all" ? window.location.pathname + window.location.search : `#${id}`;
    window.history.replaceState(null, "", url);
  };

  const show = (photoIndex: number) => {
    setOpen(photoIndex);
    dialogRef.current?.showModal();
  };

  const close = useCallback(() => dialogRef.current?.close(), []);
  const step = useCallback(
    (delta: number) => setOpen((i) => (i === null ? i : (i + delta + photos.length) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    const onClose = () => setOpen(null);
    dialog.addEventListener("keydown", onKey);
    dialog.addEventListener("close", onClose);
    return () => {
      dialog.removeEventListener("keydown", onKey);
      dialog.removeEventListener("close", onClose);
    };
  }, [step]);

  const current = open === null ? null : photos[open];

  return (
    <section id={anchorId} className={styles.wall} data-header-tone="ink" aria-labelledby="ww-title">
      <div className={styles.shell}>
        <div className={styles.head}>
          <div>
            <p className={styles.kicker}>The wall / Real jobs, real reviews</p>
            <h2 id="ww-title" className={styles.title}>
              <span>Every photo.</span>
              <span>A real driveway.</span>
            </h2>
          </div>
          <p className={styles.note}>No stock photos. Everything here is our crew on a customer&apos;s car, next to what customers wrote on Google.</p>
        </div>

        <div className={styles.chips} role="group" aria-label="Filter the work">
          {workFilters.map((f) => (
            <button
              key={f.id}
              type="button"
              className={styles.chip}
              aria-pressed={filter === f.id}
              onClick={() => choose(f.id)}
            >
              {f.label}
              <span className={styles.count}>{counts[f.id]}</span>
            </button>
          ))}
        </div>

        <ul className={styles.grid} aria-live="polite">
          {items.map((item) => {
            if (item.kind === "review") {
              const dark = workWall.filter((i) => i.kind === "review").indexOf(item) % 3 === 1;
              return (
                <li key={`r-${item.author}`} className={`${styles.review} ${dark ? styles.reviewDark : ""}`}>
                  <figure>
                    <p className={styles.stars} aria-label="5 out of 5 stars">★★★★★</p>
                    <blockquote className={styles.quote}>“{item.quote}”</blockquote>
                    <figcaption className={styles.author}>
                      <span>{item.author}</span>
                      {item.crew ? <span className={styles.crew}>Crew: {item.crew}</span> : <span className={styles.source}>Google review</span>}
                    </figcaption>
                  </figure>
                </li>
              );
            }
            const photoIndex = photos.indexOf(item);
            const img = imageById(item.id);
            return (
              <li key={`p-${item.id}`} className={styles.tile}>
                <button type="button" className={styles.tileButton} onClick={() => show(photoIndex)} aria-label={`Open photo: ${item.caption}`}>
                  <Photo
                    id={item.id}
                    ratio={img.w > img.h ? "3/2" : "2/3"}
                    sizes="(max-width: 640px) 48vw, (max-width: 1024px) 32vw, 300px"
                  />
                  <span className={styles.caption}>{item.caption}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <dialog ref={dialogRef} className={styles.lightbox} aria-label="Photo viewer" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
        {current ? (
          <div className={styles.lbInner}>
            <div className={styles.lbPhoto}>
              <Photo key={current.id} id={current.id} sizes="(max-width: 900px) 94vw, 70vw" />
            </div>
            <div className={styles.lbBar}>
              <p className={styles.lbCaption}>
                <span>{String((open ?? 0) + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}</span>
                {current.caption}
              </p>
              <div className={styles.lbNav}>
                <button type="button" onClick={() => step(-1)} aria-label="Previous photo">←</button>
                <button type="button" onClick={() => step(1)} aria-label="Next photo">→</button>
                <button type="button" onClick={close} aria-label="Close photo viewer">✕</button>
              </div>
            </div>
          </div>
        ) : null}
      </dialog>
    </section>
  );
}
