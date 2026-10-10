/**
 * Two-column rows: term on the left, explanation on the right, a rule between each.
 * Used instead of card grids for lists of benefits, standards and definitions.
 */
export function RowList({ items, dark = false }: { items: { title: string; body: string }[]; dark?: boolean }) {
  const line = dark ? "border-paper/25" : "border-ink/20";
  return (
    <dl className={`border-t-2 ${dark ? "border-paper" : "border-ink"}`}>
      {items.map((it) => (
        <div key={it.title} className={`grid gap-1 border-b py-5 md:grid-cols-12 md:gap-8 ${line}`}>
          <dt className="font-display text-lg font-semibold md:col-span-4">{it.title}</dt>
          <dd className={`md:col-span-8 ${dark ? "text-paper/75" : "text-ink/75"}`}>{it.body}</dd>
        </div>
      ))}
    </dl>
  );
}
