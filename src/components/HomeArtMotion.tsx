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

    const updateScroll = () => {
      raf.current = null;
      const vh = Math.max(window.innerHeight, 1);
      const vw = Math.max(window.innerWidth, 1);

      let activeScene = "hero";
      let activeDistance = Number.POSITIVE_INFINITY;
      document.querySelectorAll<HTMLElement>("[data-v29-scene]").forEach((scene) => {
        const rect = scene.getBoundingClientRect();
        const center = rect.top + rect.height * .5;
        const distance = Math.abs(center - vh * .42);
        if (distance < activeDistance) {
          activeDistance = distance;
          activeScene = scene.dataset.v29Scene || activeScene;
        }
      });
      document.documentElement.dataset.homeScene = activeScene;

      document.querySelectorAll<HTMLElement>("[data-v29-scene]").forEach((scene) => {
        const r = scene.getBoundingClientRect();
        const p = clamp((vh - r.top) / Math.max(vh + r.height, 1));
        scene.style.setProperty("--scene", String(p));
      });

      const hero = document.querySelector<HTMLElement>("[data-v29-scene='hero']");
      if (hero) {
        const r = hero.getBoundingClientRect();
        const hp = clamp(-r.top / (vh * .9));
        hero.style.setProperty("--hero-scroll", String(hp));
        hero.style.setProperty("--hero-scale", String(1.02 + hp * .045));
        hero.style.setProperty("--sweep-width", `${8 + hp * 92}%`);
      }

      const bridge = document.querySelector<HTMLElement>("[data-v29-scene='bridge']");
      if (bridge) {
        const r = bridge.getBoundingClientRect();
        const bp = clamp((vh - r.top) / (vh + r.height));
        bridge.style.setProperty("--bridge", String(bp));
        bridge.style.setProperty("--bridge-x", `${-10 - bp * 18}%`);
      }

      const work = document.querySelector<HTMLElement>("[data-v29-work]");
      if (work && vw >= 900) {
        const r = work.getBoundingClientRect();
        const span = Math.max(1, r.height - vh);
        const p = clamp(-r.top / span);
        work.style.setProperty("--work", String(p));
        const headFade = clamp((0.50 - p) / 0.12);
        const endIn = clamp((p - 0.80) / 0.11);
        work.style.setProperty("--work-head-opacity", String(headFade));
        work.style.setProperty("--work-head-y", `${(1 - headFade) * -70}px`);
        work.style.setProperty("--work-head-scale", String(.94 + headFade * .06));
        work.style.setProperty("--work-end-opacity", String(endIn));
        work.style.setProperty("--work-end-y", `${(1 - endIn) * 54}px`);

        const track = work.querySelector<HTMLElement>("[data-v29-work-track]");
        if (track) {
          const travel = Math.max(0, track.scrollWidth - vw);
          work.style.setProperty("--work-travel", `${travel}px`);
          work.style.setProperty("--work-x", `${-p * travel}px`);
        }
      }

      const story = document.querySelector<HTMLElement>("[data-v29-story]");
      if (story) {
        const r = story.getBoundingClientRect();
        const p = clamp((vh * .86 - r.top) / Math.max(vh * .95, 1));
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

      const proof = document.querySelector<HTMLElement>("[data-v36-proof]");
      if (proof) {
        const r = proof.getBoundingClientRect();
        document.documentElement.dataset.proofActive = String(r.top <= vh * .18 && r.bottom >= vh * .82);
        const span = Math.max(1, r.height - vh);
        const pp = clamp(-r.top / span);
        const countOut = clamp((pp - .16) / .16);
        const review1 = clamp(1 - Math.abs(pp - .36) / .17);
        const review2 = clamp(1 - Math.abs(pp - .60) / .17);
        const review3 = clamp(1 - Math.abs(pp - .84) / .17);
        proof.style.setProperty("--proof", String(pp));
        proof.style.setProperty("--proof-count-out", String(countOut));
        proof.style.setProperty("--proof-r1", String(review1));
        proof.style.setProperty("--proof-r2", String(review2));
        proof.style.setProperty("--proof-r3", String(review3));
        proof.style.setProperty("--proof-progress", `${Math.max(4, pp * 100)}%`);
      }

      const beyond = document.querySelector<HTMLElement>("[data-v29-scene='beyond']");
      if (beyond) {
        const r = beyond.getBoundingClientRect();
        const p = clamp((vh - r.top) / Math.max(vh + r.height, 1));
        beyond.style.setProperty("--beyond-x", `${-5 - p * 9}%`);
        beyond.style.setProperty("--stamp-rot", `${-12 + p * 24}deg`);
        beyond.style.setProperty("--beyond-progress", String(p));
        beyond.style.setProperty("--beyond-lift", `${(1 - p) * 48}px`);
      }
      const close = document.querySelector<HTMLElement>("[data-v29-scene='close']");
      if (close) {
        const r = close.getBoundingClientRect();
        const p = clamp((vh - r.top) / Math.max(vh + r.height, 1));
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
      document.documentElement.style.setProperty("--v29-x5", `${pointer.current.x * 5}px`);
      document.documentElement.style.setProperty("--v29-x8", `${pointer.current.x * 8}px`);
      document.documentElement.style.setProperty("--v29-x10", `${pointer.current.x * 10}px`);
      document.documentElement.style.setProperty("--v29-x12", `${pointer.current.x * 12}px`);
      document.documentElement.style.setProperty("--v29-x15", `${pointer.current.x * 15}px`);
      document.documentElement.style.setProperty("--v29-y5", `${pointer.current.y * 5}px`);
      document.documentElement.style.setProperty("--v29-y9", `${pointer.current.y * 9}px`);
      document.documentElement.style.setProperty("--v29-y10", `${pointer.current.y * 10}px`);
      document.documentElement.style.setProperty("--v29-cx", `${50 + pointer.current.x * 28}%`);
      document.documentElement.style.setProperty("--v29-cy", `${50 + pointer.current.y * 24}%`);
      document.documentElement.style.setProperty("--hero-r1", `${pointer.current.x * -0.8}deg`);
      document.documentElement.style.setProperty("--hero-r2", `${pointer.current.x * 0.65}deg`);
      document.documentElement.style.setProperty("--hero-r3", `${pointer.current.x * -0.5}deg`);
      document.documentElement.style.setProperty("--hero-focus-x", `${pointer.current.x * 16}px`);
      document.documentElement.style.setProperty("--hero-focus-y", `${pointer.current.y * 10}px`);
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
    const animateRibbon = (time: number) => {
      const textPath = document.querySelector<SVGTextPathElement>("[data-v36-tape-text]");
      if (textPath && !reduced.matches) {
        const offset = -((time * .0038 + window.scrollY * .035) % 52);
        textPath.setAttribute("startOffset", `${offset}%`);
      }
      ribbonRaf.current = requestAnimationFrame(animateRibbon);
    };

    ribbonRaf.current = requestAnimationFrame(animateRibbon);
    window.addEventListener("scroll", requestScroll, { passive: true });
    window.addEventListener("resize", requestScroll);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave, true);

    return () => {
      window.removeEventListener("scroll", requestScroll);
      window.removeEventListener("resize", requestScroll);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave, true);
      if (raf.current != null) cancelAnimationFrame(raf.current);
      if (pointerRaf.current != null) cancelAnimationFrame(pointerRaf.current);
      if (ribbonRaf.current != null) cancelAnimationFrame(ribbonRaf.current);
      delete document.documentElement.dataset.homeScene;
      delete document.documentElement.dataset.proofActive;
    };
  }, []);

  return null;
}
