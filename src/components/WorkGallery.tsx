import { Photo } from "./Photo";

/** Simple portfolio strip. Consistent crops keep the photography from competing with itself. */
export function WorkGallery({ ids }: { ids: string[] }) {
  const visible = ids.slice(0, 3);
  if (!visible.length) return null;

  return (
    <div className="grid gap-4 md:grid-cols-3 md:gap-5">
      {visible.map((id) => (
        <Photo
          key={id}
          id={id}
          ratio="4/3"
          sizes="(min-width: 768px) 33vw, 100vw"
          className="rounded-xl"
        />
      ))}
    </div>
  );
}
