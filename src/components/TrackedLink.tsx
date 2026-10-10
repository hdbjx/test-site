"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { track, type EventName } from "@/lib/analytics";

type Props = ComponentProps<typeof Link> & {
  event: EventName;
  params?: Record<string, string | number | undefined>;
};

/** A Link that fires an analytics event on click. Use for every conversion-path link. */
export function TrackedLink({ event, params, onClick, ...rest }: Props) {
  return (
    <Link
      {...rest}
      onClick={(e) => {
        track(event, params);
        onClick?.(e);
      }}
    />
  );
}
