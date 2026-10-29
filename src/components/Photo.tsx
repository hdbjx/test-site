import Image from "next/image";
import { imageById } from "@/data/images";

type Props = {
  id: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  ratio?: string;
  fill?: boolean;
  alt?: string;
  /** Lower for photos that sit under a heavy shade (hero). Must be listed in next.config images.qualities. */
  quality?: number;
};

/** Shared responsive photo component. Non-fill images receive real dimensions so Next can render them reliably. */
export function Photo({ id, sizes, priority, className = "", ratio, fill = false, alt, quality }: Props) {
  const img = imageById(id);

  if (fill) {
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        <Image
          src={img.file}
          alt={alt ?? img.alt}
          fill
          sizes={sizes}
          priority={priority}
          quality={quality}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-paper2 ${className}`}
      style={{ aspectRatio: ratio ?? `${img.w}/${img.h}` }}
    >
      <Image
        src={img.file}
        alt={alt ?? img.alt}
        width={img.w * 800}
        height={img.h * 800}
        sizes={sizes}
        priority={priority}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}
