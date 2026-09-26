import Image from "next/image";
import { imageById } from "@/data/images";

type Props = {
  id: string;
  sizes: string; // required so every image ships responsive srcsets
  priority?: boolean;
  className?: string; // wrapper classes (radius, etc.)
  /** Override the stored aspect ratio, e.g. "4/5" for a crop. */
  ratio?: string;
  /** Fill the parent instead of reserving an aspect-ratio box. Parent must be positioned with a size. */
  fill?: boolean;
  alt?: string;
};

/** Every photo on the site goes through here: reserved space (no layout shift), lazy by default, responsive sizes. */
export function Photo({ id, sizes, priority, className = "", ratio, fill, alt }: Props) {
  const img = imageById(id);
  const image = (
    <Image
      src={img.file}
      alt={alt ?? img.alt}
      fill
      sizes={sizes}
      priority={priority}
      className="object-cover"
    />
  );
  if (fill) return <div className={`absolute inset-0 overflow-hidden ${className}`}>{image}</div>;
  return (
    <div
      className={`relative overflow-hidden bg-paper2 ${className}`}
      style={{ aspectRatio: ratio ?? `${img.w}/${img.h}` }}
    >
      {image}
    </div>
  );
}
