import { Photo } from "./Photo";

/**
 * Editorial photo sequence.
 * Uses wide, natural-feeling crops instead of a square masonry wall.
 * The layout intentionally changes rhythm as it moves down the page.
 */
export function WorkGallery({ ids }: { ids: string[] }) {
  if (!ids.length) return null;

  const first = ids[0];
  const second = ids[1];
  const middle = ids.slice(2, 5);
  const final = ids.slice(5, 7);
  const overflow = ids.slice(7);

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="grid gap-3 md:grid-cols-12 md:gap-4">
        {first && (
          <Photo
            id={first}
            ratio="3/2"
            sizes="(min-width: 768px) 62vw, 100vw"
            className="md:col-span-7 rounded-[var(--radius-photo)]"
          />
        )}
        {second && (
          <Photo
            id={second}
            ratio="3/2"
            sizes="(min-width: 768px) 38vw, 100vw"
            className="md:col-span-5 rounded-[var(--radius-photo)]"
          />
        )}
      </div>

      {middle.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
          {middle.map((id) => (
            <Photo
              key={id}
              id={id}
              ratio="4/3"
              sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="rounded-[var(--radius-photo)]"
            />
          ))}
        </div>
      )}

      {final.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          {final.map((id) => (
            <Photo
              key={id}
              id={id}
              ratio="16/10"
              sizes="(min-width: 768px) 50vw, 100vw"
              className="rounded-[var(--radius-photo)]"
            />
          ))}
        </div>
      )}

      {overflow.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
          {overflow.map((id) => (
            <Photo
              key={id}
              id={id}
              ratio="4/3"
              sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="rounded-[var(--radius-photo)]"
            />
          ))}
        </div>
      )}
    </div>
  );
}
