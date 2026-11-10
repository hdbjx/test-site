"use client";

import { useEffect, useRef } from "react";

const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));
export function HomeArtMotion() {
  const raf = useRef<number | null>(null);
  const pointerRaf = useRef<number | null>(null);
  const ribbonRaf = useRef<number | null>(null);
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(pointer: fine)");

    // Elements are static for the life of the page; look them up once instead of every frame.
    const q = <T extends HTMLElement>(sel: string) => document.querySelector<T>(sel);
    const scenes = Array.from(document.querySelectorAll<HTMLElement>("[data-v29-scene]"));
    const hero = q("[data-v29-scene='hero']");
    const bridge = q("[data-v29-scene='bridge']");
    const work = q("[data-v29-work]");
    const workTrack = work?.querySelector<HTMLElement>("[data-v29-work-track]") ?? null;
    const story = q("[data-v29-story]");
    const proof = q("[data-v36-proof]");
    const proofRail = proof?.querySelector<HTMLElement>("[data-v41-proof-rail]") ?? null;
    const beyond = q("[data-v29-scene='beyond']");
    const cleanLife = q("[data-v39-life]");
    const close = q("[data-v29-scene='close']");

    // Track widths only change on resize, so measure them there, not on every scroll frame.
    let workTravelBase = 0;
    let proofTravelBase = 0;
    const measureTracks = () => {
      workTravelBase = workTrack?.scrollWidth ?? 0;
      proofTravelBase = proofRail?.scrollWidth ?? 0;
    };
    measureTracks();
    // Photos inside the rails can load after mount and change their width.
    const trackObserver = new ResizeObserver(() => { measureTracks(); requestScroll(); });
    [workTrack, proofRail].forEach((el) => el && trackObserver.observe(el));

    const updateScroll = () => {
      raf.current = null;
      const vh = Math.max(window.innerHeight, 1);
      const vw = Math.max(window.innerWidth, 1);

      // ---- read phase: every rect up front, so writes below never force a re-layout ----
      const sceneRects = scenes.map((scene) => scene.getBoundingClientRect());
      const heroR = hero?.getBoundingClientRect();
      const bridgeR = bridge?.getBoundingClientRect();
      const workR = work && vw >= 900 ? work.getBoundingClientRect() : undefined;
      const storyR = story?.getBoundingClientRect();
      const proofR = proof?.getBoundingClientRect();
      const beyondR = beyond?.getBoundingClientRect();
      const lifeR = cleanLife?.getBoundingClientRect();
      const closeR = close?.getBoundingClientRect();

      // ---- write phase ----
      let activeScene = "hero";
      let activeDistance = Number.POSITIVE_INFINITY;
      scenes.forEach((scene, i) => {
        const rect = sceneRects[i];
        const distance = Math.abs(rect.top + rect.height * .5 - vh * .42);
        if (distance < activeDistance) {
          activeDistance = distance;
          activeScene = scene.dataset.v29Scene || activeScene;
        }
      });
      if (document.documentElement.dataset.homeScene !== activeScene) document.documentElement.dataset.homeScene = activeScene;

      scenes.forEach((scene, i) => {
        const r = sceneRects[i];
        scene.style.setProperty("--scene", String(clamp((vh - r.top) / Math.max(vh + r.height, 1))));
      });

      if (hero && heroR) {
        const hp = clamp(-heroR.top / (vh * .9));
        hero.style.setProperty("--hero-scroll", String(hp));
        hero.style.setProperty("--hero-scale", String(1.02 + hp * .045));
        hero.style.setProperty("--sweep-width", `${8 + hp * 92}%`);
      }

      if (bridge && bridgeR) {
        const bp = clamp((vh - bridgeR.top) / (vh + bridgeR.height));
        bridge.style.setProperty("--bridge", String(bp));
        bridge.style.setProperty("--bridge-x", `${-10 - bp * 18}%`);
      }

      if (work && workR) {
        const span = Math.max(1, workR.height - vh);
        const p = clamp(-workR.top / span);
        work.style.setProperty("--work", String(p));
        const headFade = clamp((0.50 - p) / 0.12);
        const endIn = clamp((p - 0.80) / 0.11);
        work.style.setProperty("--work-head-opacity", String(headFade));
        work.style.setProperty("--work-head-y", `${(1 - headFade) * -70}px`);
        work.style.setProperty("--work-head-scale", String(.94 + headFade * .06));
        work.style.setProperty("--work-end-opacity", String(endIn));
        work.style.setProperty("--work-end-y", `${(1 - endIn) * 54}px`);
        if (workTrack) {
          const travel = Math.max(0, workTravelBase - vw);
          work.style.setProperty("--work-travel", `${travel}px`);
          work.style.setProperty("--work-x", `${-p * travel}px`);
        }
      }

      if (story && storyR) {
        const p = clamp((vh * .86 - storyR.top) / Math.max(vh * .95, 1));
        const inv = 1 - p;
        story.style.setProperty("--story", String(p));
        story.style.setProperty("--story-a-x", `${inv * -vw * .55}px`);
        story.style.setProperty("--story-a-y", `${inv * vh * .24}px`);
        story.style.setProperty("--story-b-x", `${inv * vw * .55}px`);
        story.style.setProperty("--story-b-y", `${inv * -vh * .18}px`);
        story.style.setProperty("--story-c-x", `${inv * vw * .40}px`);
        story.style.setProperty("--story-c-y", `${inv * vh * .20}px`);
        story.style.setProperty("--story-a-rot", `${-11 + p * 7}deg`);
        story.style.setProperty("--story-b-rot", `${12 - p * 8}deg`);
        story.style.setProperty("--story-c-rot", `${-8 + p * 5}deg`);
        story.style.setProperty("--story-slot-a-x", `${inv * -vw * .38}px`);
        story.style.setProperty("--story-slot-a-y", `${inv * vh * .18}px`);
        story.style.setProperty("--story-slot-b-x", `${inv * vw * .38}px`);
        story.style.setProperty("--story-slot-b-y", `${inv * -vh * .14}px`);
        story.style.setProperty("--story-float-x", `${inv * vw * .26}px`);
        story.style.setProperty("--story-float-y", `${inv * vh * .16}px`);
        story.style.setProperty("--story-photo-opacity", String(clamp((p - .12) / .35)));
        story.style.setProperty("--story-photo-scale", String(.72 + clamp((p - .08) / .5) * .28));
        story.style.setProperty("--story-gap", `${clamp((p - .05) / .65) * 1.0}em`);
      }

      if (proof && proofR) {
        const pp = clamp(-proofR.top / Math.max(1, proofR.height - vh));
        if (proofRail && vw >= 901) {
          proof.style.setProperty("--proof-x", `${-pp * Math.max(0, proofTravelBase - vw)}px`);
        } else {
          proof.style.setProperty("--proof-x", "0px");
        }
      }

      if (beyond && beyondR) {
        const p = clamp((vh - beyondR.top) / Math.max(vh + beyondR.height, 1));
        beyond.style.setProperty("--beyond-x", `${-5 - p * 9}%`);
        beyond.style.setProperty("--stamp-rot", `${-12 + p * 24}deg`);
        beyond.style.setProperty("--beyond-progress", String(p));
        beyond.style.setProperty("--beyond-lift", `${(1 - p) * 48}px`);
        beyond.style.setProperty("--maintain-wipe-scale", String(Math.max(0, 1 - Math.min(1, p * 1.35))));
        beyond.style.setProperty("--maintain-lift", `${(1 - p) * 46}px`);
      }

      if (cleanLife && lifeR) {
        const p = clamp((vh * .9 - lifeR.top) / Math.max(vh + lifeR.height * .45, 1));
        cleanLife.style.setProperty("--life", String(p));
        cleanLife.style.setProperty("--life-a-x", `${(1 - p) * -6}vw`);
        cleanLife.style.setProperty("--life-b-x", `${(1 - p) * 7}vw`);
        cleanLife.style.setProperty("--life-c-y", `${(1 - p) * 28}px`);
        cleanLife.style.setProperty("--life-d-x", `${(1 - p) * -4}vw`);
      }

      if (close && closeR) {
        const p = clamp((vh - closeR.top) / Math.max(vh + closeR.height, 1));
        close.style.setProperty("--close-scale", String(1.03 + p * .025));
        close.style.setProperty("--close-x", `${(p - .5) * -18}px`);
      }
    };

    const requestScroll = () => {
      if (raf.current == null) raf.current = requestAnimationFrame(updateScroll);
    };

    const animatePointer = () => {
      pointerRaf.current = null;
      pointer.current.x += (pointer.current.tx - pointer.current.x) * .14;
      pointer.current.y += (pointer.current.ty - pointer.current.y) * .14;
      // Only the variables globals.css reads (x8, x12, x15, y5, y9, y10). Each write on <html>
      // restyles the whole page, so unused ones were pure cost.
      const rs = document.documentElement.style;
      rs.setProperty("--v29-x8", `${pointer.current.x * 8}px`);
      rs.setProperty("--v29-x12", `${pointer.current.x * 12}px`);
      rs.setProperty("--v29-x15", `${pointer.current.x * 15}px`);
      rs.setProperty("--v29-y5", `${pointer.current.y * 5}px`);
      rs.setProperty("--v29-y9", `${pointer.current.y * 9}px`);
      rs.setProperty("--v29-y10", `${pointer.current.y * 10}px`);
      if (Math.abs(pointer.current.tx - pointer.current.x) > .001 || Math.abs(pointer.current.ty - pointer.current.y) > .001) {
        pointerRaf.current = requestAnimationFrame(animatePointer);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (reduced.matches || !fine.matches) return;
      pointer.current.tx = event.clientX / Math.max(window.innerWidth, 1) - .5;
      pointer.current.ty = event.clientY / Math.max(window.innerHeight, 1) - .5;
      if (pointerRaf.current == null) pointerRaf.current = requestAnimationFrame(animatePointer);

      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-v29-tilt],[data-v29-magnetic],.v15-service");
      if (!target) return;
      const r = target.getBoundingClientRect();
      const nx = clamp((event.clientX - r.left) / Math.max(1, r.width)) - .5;
      const ny = clamp((event.clientY - r.top) / Math.max(1, r.height)) - .5;
      target.style.setProperty("--mx", String(nx));
      target.style.setProperty("--my", String(ny));
      target.style.setProperty("--mx5", `${nx * 5}px`);
      target.style.setProperty("--mx7", `${nx * 7}px`);
      target.style.setProperty("--mx11n", `${nx * -11}px`);
      target.style.setProperty("--mx13n", `${nx * -13}px`);
      target.style.setProperty("--my7", `${ny * 7}px`);
      target.style.setProperty("--my9n", `${ny * -9}px`);
      target.style.setProperty("--my11n", `${ny * -11}px`);
      if (target.matches("[data-v29-tilt]")) {
        target.style.setProperty("--rx", `${ny * -4.5}deg`);
        target.style.setProperty("--ry", `${nx * 5.5}deg`);
      }
      if (target.matches("[data-v29-magnetic]")) {
        target.style.setProperty("--mag-x", `${nx * 11}px`);
        target.style.setProperty("--mag-y", `${ny * 8}px`);
      }
    };

    const onPointerLeave = (event: PointerEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-v29-tilt],[data-v29-magnetic],.v15-service");
      if (!target) return;
      target.style.setProperty("--mx", "0");
      target.style.setProperty("--my", "0");
      target.style.setProperty("--mx5", "0px");
      target.style.setProperty("--mx7", "0px");
      target.style.setProperty("--mx11n", "0px");
      target.style.setProperty("--mx13n", "0px");
      target.style.setProperty("--my7", "0px");
      target.style.setProperty("--my9n", "0px");
      target.style.setProperty("--my11n", "0px");
      target.style.setProperty("--rx", "0deg");
      target.style.setProperty("--ry", "0deg");
      target.style.setProperty("--mag-x", "0px");
      target.style.setProperty("--mag-y", "0px");
    };

    updateScroll();
    const ribbonTrack = q("[data-v41-tape-track]");
    let ribbonLoop = Math.max(1, (ribbonTrack?.scrollWidth ?? 2) / 2);
    const animateRibbon = (time: number) => {
      if (ribbonTrack && !reduced.matches) {
        const offset = -((time * .055 + window.scrollY * .075) % ribbonLoop);
        ribbonTrack.style.transform = `translate3d(${offset}px,0,0)`;
      }
      ribbonRaf.current = requestAnimationFrame(animateRibbon);
    };

    const dragCleanups = Array.from(document.querySelectorAll<HTMLElement>("[data-v41-drag]")).map((photo) => {
      let dragging = false;
      let pointerId = -1;
      let startX = 0;
      let startY = 0;
      let baseX = Number(photo.dataset.dragX || 0);
      let baseY = Number(photo.dataset.dragY || 0);

      const down = (event: PointerEvent) => {
        if (reduced.matches || !fine.matches || event.pointerType === "touch") return;
        dragging = true;
        pointerId = event.pointerId;
        startX = event.clientX;
        startY = event.clientY;
        baseX = Number(photo.dataset.dragX || 0);
        baseY = Number(photo.dataset.dragY || 0);
        photo.setPointerCapture(pointerId);
        photo.dataset.dragging = "true";
        event.preventDefault();
      };

      const move = (event: PointerEvent) => {
        if (!dragging || event.pointerId !== pointerId) return;
        const nextX = Math.max(-240, Math.min(240, baseX + event.clientX - startX));
        const nextY = Math.max(-180, Math.min(180, baseY + event.clientY - startY));
        photo.style.setProperty("--drag-x", `${nextX}px`);
        photo.style.setProperty("--drag-y", `${nextY}px`);
        photo.dataset.dragX = String(nextX);
        photo.dataset.dragY = String(nextY);
      };

      const up = (event: PointerEvent) => {
        if (!dragging || event.pointerId !== pointerId) return;
        dragging = false;
        if (photo.hasPointerCapture(pointerId)) photo.releasePointerCapture(pointerId);
        delete photo.dataset.dragging;
      };

      photo.addEventListener("pointerdown", down);
      photo.addEventListener("pointermove", move);
      photo.addEventListener("pointerup", up);
      photo.addEventListener("pointercancel", up);
      return () => {
        photo.removeEventListener("pointerdown", down);
        photo.removeEventListener("pointermove", move);
        photo.removeEventListener("pointerup", up);
        photo.removeEventListener("pointercancel", up);
      };
    });

    if (ribbonTrack) ribbonRaf.current = requestAnimationFrame(animateRibbon);
    const onResize = () => {
      measureTracks();
      if (ribbonTrack) ribbonLoop = Math.max(1, ribbonTrack.scrollWidth / 2);
      requestScroll();
    };
    window.addEventListener("scroll", requestScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave, true);

    return () => {
      window.removeEventListener("scroll", requestScroll);
      window.removeEventListener("resize", onResize);
      trackObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave, true);
      if (raf.current != null) cancelAnimationFrame(raf.current);
      if (pointerRaf.current != null) cancelAnimationFrame(pointerRaf.current);
      if (ribbonRaf.current != null) cancelAnimationFrame(ribbonRaf.current);
      dragCleanups.forEach((cleanup) => cleanup());
      delete document.documentElement.dataset.homeScene;
    };
  }, []);

  return null;
}
