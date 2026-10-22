"use client";

import { useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import { Photo } from "@/components/Photo";

type Props = {
  id: string;
  photoId: string;
  className: string;
  sizes: string;
  label: string;
};

export function DraggableStoryPhoto({ id, photoId, className, sizes, label }: Props) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const drag = useRef({ active: false, pointerId: -1, startX: 0, startY: 0, baseX: 0, baseY: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const clampToStage = (x: number, y: number) => {
    const el = ref.current;
    const stage = el?.parentElement;
    if (!el || !stage) return { x, y };
    const er = el.getBoundingClientRect();
    const sr = stage.getBoundingClientRect();
    const pad = 18;
    const minX = sr.left + pad - (er.left - offset.x);
    const maxX = sr.right - pad - er.width - (er.left - offset.x);
    const minY = sr.top + pad - (er.top - offset.y);
    const maxY = sr.bottom - pad - er.height - (er.top - offset.y);
    return {
      x: Math.min(maxX, Math.max(minX, x)),
      y: Math.min(maxY, Math.max(minY, y)),
    };
  };

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    const el = ref.current;
    if (!el) return;
    drag.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      baseX: offset.x,
      baseY: offset.y,
    };
    el.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!drag.current.active || drag.current.pointerId !== event.pointerId) return;
    const next = clampToStage(
      drag.current.baseX + event.clientX - drag.current.startX,
      drag.current.baseY + event.clientY - drag.current.startY,
    );
    setOffset(next);
  };

  const stopDrag = (event: PointerEvent<HTMLButtonElement>) => {
    if (!drag.current.active || drag.current.pointerId !== event.pointerId) return;
    drag.current.active = false;
    setDragging(false);
    try { ref.current?.releasePointerCapture(event.pointerId); } catch {}
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const step = event.shiftKey ? 24 : 10;
    let dx = 0;
    let dy = 0;
    if (event.key === "ArrowLeft") dx = -step;
    else if (event.key === "ArrowRight") dx = step;
    else if (event.key === "ArrowUp") dy = -step;
    else if (event.key === "ArrowDown") dy = step;
    else if (event.key === "Home") {
      event.preventDefault();
      setOffset({ x: 0, y: 0 });
      return;
    } else return;
    event.preventDefault();
    setOffset((current) => clampToStage(current.x + dx, current.y + dy));
  };

  return (
    <button
      ref={ref}
      type="button"
      className={`${className}${dragging ? " is-dragging" : ""}`}
      style={{ "--drag-x": `${offset.x}px`, "--drag-y": `${offset.y}px` } as CSSProperties}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stopDrag}
      onPointerCancel={stopDrag}
      onKeyDown={onKeyDown}
      aria-label={`${label}. Drag to rearrange. Use arrow keys to move and Home to reset.`}
      data-story-drag={id}
    >
      <Photo id={photoId} sizes={sizes} fill />
    </button>
  );
}
