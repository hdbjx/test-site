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
  objectPosition?: string;
};

export function Photo({ id, sizes, priority, className = "", ratio, fill, alt, objectPosition = "center" }: Props) {
  const img = imageById(id);
  const common = {
    src: img.file,
    alt: alt ?? img.alt,
    sizes,
    priority,
    className: "object-cover transition-transform duration-700",
    style: { objectPosition },
  } as const;

  if (fill) {
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        <Image {...common} fill />
      </div>
    );
  }

  const width = img.w * 800;
  const height = img.h * 800;
  return (
    <div className={`relative overflow-hidden bg-paper2 ${className}`} style={{ aspectRatio: ratio ?? `${img.w}/${img.h}` }}>
      <Image {...common} width={width} height={height} className={`${common.className} h-full w-full`} />
    </div>
  );
}
