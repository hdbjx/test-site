"use client";

import { useInViewOnce } from "@/components/motion/useMotion";

type Props = {
  children: string;
  className?: string;
  animate?: boolean;
};

export function RubberStamp({ children, className = "", animate = false }: Props) {
  const { ref, inView } = useInViewOnce<HTMLSpanElement>({ threshold: 0.35 });

  return (
    <span
      ref={ref}
      className={`ed90-stamp ${animate ? "ed90-stamp--animated" : ""} ${inView ? "is-in-view" : ""} ${className}`.trim()}
      aria-label={children}
    >
      <span>{children}</span>
    </span>
  );
}
