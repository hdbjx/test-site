"use client";

import { useEffect, useRef } from "react";
import "./christmas.css";

/**
 * CHRISTMAS — small snow piles sitting on a few key buttons.
 * Each pile is an SVG shape lit with SVG lighting filters (rounded volume, cool shaded underside,
 * fine grain + glints) so it reads as real snow rather than a flat white shape.
 * Caps live in one fixed overlay layer and follow their buttons every frame, so nothing
 * inside the real buttons is touched (no clipping, no layout changes, no edits to other components).
 * A cap hides itself when its button is covered (menu open, modal, etc.) or not on screen.
 */
const TARGETS = [
  ".site-shared-menu-button", // header MENU
  ".v29-hero [data-hero-vehicle]", // hero "What do you drive?" field
  ".home-book-bar-cta", // mobile sticky "Book a detail"
  'button[aria-label="Chat with Every Detail"]', // "Ask us"
].join(",");

// Geometry (px). The SVG is placed so its button edge lines up with the real button's top edge.
const OV = 4; // snow overhangs each side of the button
const PAD = 8; // room for blur/lighting around the snow
const TOP = 24; // SVG height above the button's top edge
const BELOW = 12; // SVG height below it (lip sags + contact shadow)

type Cap = { el: HTMLElement; node: HTMLDivElement; width: number };

// Small seeded RNG so a given button always gets the same pile (no reshuffling on resize).
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

// Catmull-Rom through the points, as cubic Bézier segments.
function smooth(pts: number[][]) {
  let d='';
  for(let i=0;i<pts.length-1;i++){
    const p0=pts[i-1]||pts[i],p1=pts[i],p2=pts[i+1],p3=pts[i+2]||p2;
    const c1=[p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6],c2=[p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6];
    d+=` C${c1[0].toFixed(2)} ${c1[1].toFixed(2)} ${c2[0].toFixed(2)} ${c2[1].toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d;
}
function snowSvg(w: number, seed: number) {
  const r=rng(seed);
  
  const W=w+OV*2+PAD*2, H=TOP+BELOW;
  const B=TOP, L=PAD, R=PAD+w+OV*2; // snow spans L..R, button spans L+OV..R-OV
  const span=R-L;
  const hmax=Math.max(11,Math.min(9+w*0.014,18));
  const ph=[r()*6.28,r()*6.28,r()*6.28], fr=[Math.max(0.9,span/280)*(0.8+r()*0.5),Math.max(1.8,span/120)*(0.8+r()*0.5),Math.max(3.5,span/45)];
  const n=Math.max(16,Math.round(span/3.5));
  const endR=hmax*1.25;
  const top: number[][] = [];
  for(let i=0;i<=n;i++){
    const t=i/n, x=L+t*span;
    const dist=Math.min(x-L,R-x), u=Math.min(dist/endR,1);
    const env=Math.sqrt(1-(1-u)*(1-u))*(0.9+0.1*Math.sin(Math.PI*t));
    const wob=0.66+0.22*Math.sin(fr[0]*t*6.28+ph[0])+0.08*Math.sin(fr[1]*t*6.28+ph[1])+0.04*Math.sin(fr[2]*t*6.28+ph[2]);
    top.push([x, B+2-env*hmax*wob-(env>0?1.2:0)]);
  }
  // underside lip, right->left, with sags
  const sags=Array.from({length:w>140?3:w>70?2:1},()=>({c:L+OV+8+r()*(w-16),wd:7+r()*8,dp:0.8+r()*1.6}));
  const bot: number[][] = [];
  for(let i=n;i>=0;i--){
    const t=i/n,x=L+t*span;
    let y=B+2.2;
    for(const s of sags) y+=s.dp*Math.exp(-(((x-s.c)/s.wd)**2));
    // ends curl down a touch past the edge
    const e=Math.min(t,1-t); y+= e<0.04? (0.04-e)*30:0;
    bot.push([x,y]);
  }
  const d=`M${top[0][0]} ${top[0][1]}`+smooth(top)+` L${bot[0][0]} ${bot[0][1]}`+smooth(bot)+' Z';
  const id='s'+seed;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="overflow:visible">
<defs>
<filter id="${id}" x="-5%" y="-30%" width="110%" height="160%" color-interpolation-filters="sRGB">
 <feGaussianBlur in="SourceAlpha" stdDeviation="3.2" result="blur"/>
 <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="${seed%97}" result="noise"/>
 <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="na"/>
 <feComposite in="blur" in2="na" operator="arithmetic" k2="1" k3="0.07" result="height"/>
 <feDiffuseLighting in="height" surfaceScale="7" diffuseConstant="1.1" lighting-color="#ffffff" result="diff"><feDistantLight azimuth="255" elevation="52"/></feDiffuseLighting>
 <feComponentTransfer in="diff" result="tint"><feFuncR type="linear" slope=".26" intercept=".76"/><feFuncG type="linear" slope=".22" intercept=".80"/><feFuncB type="linear" slope=".15" intercept=".87"/></feComponentTransfer>
 <feSpecularLighting in="height" surfaceScale="7" specularConstant=".55" specularExponent="35" lighting-color="#ffffff" result="spec"><feDistantLight azimuth="255" elevation="60"/></feSpecularLighting>
 <feComposite in="tint" in2="spec" operator="arithmetic" k2="1" k3=".45" result="lit"/>
 <feGaussianBlur in="SourceAlpha" stdDeviation=".55" result="soft"/>
 <feComposite in="lit" in2="soft" operator="in"/>
</filter>
<filter id="${id}sh" x="-10%" y="-100%" width="120%" height="300%"><feGaussianBlur stdDeviation="2.2"/></filter>
</defs>
<rect x="${L+OV}" y="${B}" width="${w}" height="5" fill="#1a2430" opacity=".13" filter="url(#${id}sh)"/>
<path d="${d}" fill="#fff" filter="url(#${id})"/>
</svg>`;
}

export function SnowCaps() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    const caps = new Map<HTMLElement, Cap>();
    let raf = 0;

    const collect = () => {
      const found = new Set(document.querySelectorAll<HTMLElement>(TARGETS));
      for (const [el, cap] of caps) if (!found.has(el) || !el.isConnected) { cap.node.remove(); caps.delete(el); }
      found.forEach((el) => {
        if (caps.has(el)) return;
        const node = document.createElement("div");
        node.className = "xmas-snowcap";
        layer.appendChild(node);
        caps.set(el, { el, node, width: 0 });
      });
    };

    const seedFor = (el: HTMLElement) => {
      const s = (el.className || "") + (el.textContent || "");
      let h = 7;
      for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 2147483647;
      return h || 1;
    };

    const tick = () => {
      for (const cap of caps.values()) {
        const r = cap.el.getBoundingClientRect();
        const onScreen = r.width > 20 && r.height > 10 && r.bottom > 0 && r.top < innerHeight && getComputedStyle(cap.el).visibility !== "hidden";
        // Hidden if something is covering the button's top edge (menu panel, modal, etc.)
        let covered = false;
        if (onScreen) {
          const hit = document.elementFromPoint(r.left + r.width / 2, Math.max(r.top + 3, 1));
          covered = !!hit && !cap.el.contains(hit) && !hit.contains(cap.el);
        }
        const show = onScreen && !covered && parseFloat(getComputedStyle(cap.el).opacity) > 0.5;
        cap.node.style.opacity = show ? "1" : "0";
        if (!onScreen) continue;
        const w = Math.round(r.width);
        if (w !== cap.width) {
          cap.width = w;
          cap.node.innerHTML = snowSvg(w, seedFor(cap.el));
        }
        cap.node.style.transform = `translate3d(${r.left - OV - PAD}px, ${r.top - TOP}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    collect();
    const poll = window.setInterval(collect, 600);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(poll);
      caps.forEach((c) => c.node.remove());
    };
  }, []);

  return <div ref={layerRef} className="xmas-snowcaps" aria-hidden="true" />;
}
