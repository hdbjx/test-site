import { Photo } from "./Photo";

/** A deliberately uneven editorial sequence instead of a thumbnail grid. */
export function WorkGallery({ ids }: { ids: string[] }) {
  if (!ids.length) return null;
  const [a, b, c, d, e, f, g, h] = ids;
  return (
    <div className="work-editorial">
      <div className="work-editorial__lead">
        {a && <Photo id={a} ratio="4/5" sizes="(min-width: 900px) 42vw, 100vw" />}
      </div>
      <div className="work-editorial__side">
        {b && <Photo id={b} ratio="3/2" sizes="(min-width: 900px) 52vw, 100vw" />}
        <div className="work-editorial__pair">
          {c && <Photo id={c} ratio="4/5" sizes="(min-width: 900px) 25vw, 50vw" />}
          {d && <Photo id={d} ratio="4/5" sizes="(min-width: 900px) 25vw, 50vw" />}
        </div>
      </div>
      {(e || f) && <div className="work-editorial__wide">
        {e && <Photo id={e} ratio="16/9" sizes="(min-width: 900px) 62vw, 100vw" />}
        {f && <Photo id={f} ratio="4/5" sizes="(min-width: 900px) 32vw, 100vw" />}
      </div>}
      {(g || h) && <div className="work-editorial__tail">
        {g && <Photo id={g} ratio="3/2" sizes="(min-width: 900px) 48vw, 100vw" />}
        {h && <Photo id={h} ratio="3/2" sizes="(min-width: 900px) 48vw, 100vw" />}
      </div>}
    </div>
  );
}
