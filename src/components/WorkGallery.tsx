import { Photo } from "./Photo";

/** Editorial gallery with natural-feeling landscape and portrait groupings. */
export function WorkGallery({ ids }: { ids: string[] }) {
  if (!ids.length) return null;
  const [lead, second, third, fourth, fifth, sixth, ...rest] = ids;

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="grid gap-3 md:grid-cols-12 md:gap-4">
        <Photo id={lead} ratio="3/2" sizes="(min-width: 768px) 58vw, 100vw" className="md:col-span-7 rounded-[var(--radius-photo)]" />
        {second && <Photo id={second} ratio="4/3" sizes="(min-width: 768px) 42vw, 100vw" className="md:col-span-5 rounded-[var(--radius-photo)]" />}
      </div>

      {(third || fourth || fifth) && (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-12 md:gap-4">
          {third && <Photo id={third} ratio="4/3" sizes="(min-width: 768px) 34vw, 50vw" className="md:col-span-4 rounded-[var(--radius-photo)]" />}
          {fourth && <Photo id={fourth} ratio="4/3" sizes="(min-width: 768px) 34vw, 50vw" className="md:col-span-4 rounded-[var(--radius-photo)]" />}
          {fifth && <Photo id={fifth} ratio="4/3" sizes="(min-width: 768px) 34vw, 100vw" className="sm:col-span-2 md:col-span-4 rounded-[var(--radius-photo)]" />}
        </div>
      )}

      {(sixth || rest.length > 0) && (
        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          {sixth && <Photo id={sixth} ratio="3/2" sizes="(min-width: 768px) 50vw, 100vw" className="rounded-[var(--radius-photo)]" />}
          {rest.map((id) => <Photo key={id} id={id} ratio="3/2" sizes="(min-width: 768px) 50vw, 100vw" className="rounded-[var(--radius-photo)]" />)}
        </div>
      )}
    </div>
  );
}
