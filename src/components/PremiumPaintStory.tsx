"use client";
import { useEffect, useRef, type CSSProperties } from "react";
import Link from "next/link";

type Variant = "correction" | "ceramic";
const stories = {
  correction: {
    eyebrow:"Paint correction, explained", intro:"The damage is easiest to see in the light.", introBody:"Correction is not wax, filler or a temporary shine. We refine the clear coat itself so the finish looks deeper, cleaner and more even.",
    chapters:[
      ["01 / REVEAL","First, see what the wash was hiding.","Direct light exposes spider-web swirls, wash marring, haze and oxidation. We inspect before choosing a polishing process.","/images/mercedes-paint.jpg"],
      ["02 / REFINE","Remove defects. Don’t cover them.","Machine polishing levels microscopic imperfections in the clear coat. The goal is real clarity, not something that disappears after a few washes.","/images/red-paint-detail.jpg"],
      ["03 / FINISH","Gloss is what’s left when the defects are gone.","The final polishing stage refines the surface so reflections sharpen and the paint reads as one deep, even finish.","/images/black-truck-finished.jpg"]
    ],
    final:"Bring the paint back.", finalAccent:"Then decide how long you want to protect it.", finalBody:"Correction can stand on its own, or become the foundation for ceramic coating.", finalImage:"/images/finished-sedan-rig.jpg", href:"#correction-options", cta:"Choose your correction ↓"
  },
  ceramic: {
    eyebrow:"Ceramic coating, done properly", intro:"Protection starts before the coating bottle opens.", introBody:"A coating magnifies the finish underneath it. That is why our process starts with decontamination and paint refinement, then moves to protection.",
    chapters:[
      ["01 / PREP","Clean paint is not the same as prepared paint.","We wash, chemically decontaminate and clay as needed so bonded contamination is gone before polishing or coating.","/images/exterior-hand-wash.jpg"],
      ["02 / CORRECT","We protect the finish you actually want to keep.","Necessary paint correction happens before coating. Swirls and haze should not be sealed underneath years of protection.","/images/red-paint-detail.jpg"],
      ["03 / COAT","Now lock in the finish.","The coating bonds to prepared clear coat panel by panel, adding durable hydrophobic protection and making routine washing easier.","/images/red-car-rig.jpg"]
    ],
    final:"Corrected first.", finalAccent:"Protected for the long run.", finalBody:"The result is not just water beading. It is properly prepared paint with a durable layer built around keeping it that way.", finalImage:"/images/white-suv-finished.jpg", href:"#coating-package", cta:"See the coating package ↓"
  }
} as const;

export function PremiumPaintStory({variant}:{variant:Variant}){
  const root=useRef<HTMLElement>(null); const data=stories[variant];
  useEffect(()=>{const update=()=>{if(!root.current||window.innerWidth>800)return; const vh=window.innerHeight; root.current.querySelectorAll<HTMLElement>("[data-premium-story]").forEach(el=>{const r=el.getBoundingClientRect(); const p=Math.max(0,Math.min(1,(vh*.9-r.top)/(vh*.58))); el.style.setProperty("--ps-in",String(p));});}; update(); addEventListener("scroll",update,{passive:true}); addEventListener("resize",update); return()=>{removeEventListener("scroll",update);removeEventListener("resize",update)}} ,[]);
  return <section ref={root} className={`premium-story premium-story-${variant}`}>
    <div className="premium-story-intro" data-premium-story><p className="eyebrow">{data.eyebrow}</p><h2>{data.intro}</h2><p>{data.introBody}</p></div>
    {data.chapters.map((c,i)=><article className="premium-story-panel" data-premium-story key={c[0]} style={{"--ps-image":`url('${c[3]}')`} as CSSProperties}><div className="premium-story-bg"/><div className="premium-story-overlay"/><div className="premium-story-copy"><p className="eyebrow">{c[0]}</p><h2>{c[1]}</h2><p>{c[2]}</p><span className="premium-story-index">0{i+1}</span></div></article>)}
    <article className="premium-story-panel premium-story-final" data-premium-story style={{"--ps-image":`url('${data.finalImage}')`} as CSSProperties}><div className="premium-story-bg"/><div className="premium-story-overlay"/><div className="premium-story-copy"><p className="eyebrow">The result</p><h2>{data.final}<br/><span>{data.finalAccent}</span></h2><p>{data.finalBody}</p><Link className="btn btn-primary" href={data.href}>{data.cta}</Link></div></article>
  </section>
}
