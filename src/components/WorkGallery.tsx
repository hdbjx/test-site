import { Photo } from "./Photo";

/** Editorial photo grid: one large lead image, supporting images around it. */
export function WorkGallery({ ids }: { ids: string[] }) {
  const [lead, ...rest] = ids;
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
      <Photo id={lead} ratio="1/1" sizes="(min-width: 768px) 50vw, 100vw" className="col-span-2 row-span-2 rounded-[var(--radius-photo)]" />
      {rest.map((id) => (
        <Photo key={id} id={id} ratio="1/1" sizes="(min-width: 768px) 25vw, 50vw" className="rounded-[var(--radius-photo)]" />
      ))}
    </div>
  );
}
