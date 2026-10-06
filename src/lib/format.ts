export const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

export function duration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

/** Short form for tight layouts: "2½ hr", "2 hr 45". */
export function durationShort(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!m) return `${h} hr`;
  if (m === 30) return `${h}½ hr`;
  return `${h} hr ${m}`;
}
