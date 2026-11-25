import type { CSSProperties } from "react";
import { getImageProps } from "next/image";
import { imageById } from "@/data/images";

/**
 * Reeded / fluted glass over a photo. Each flute is its own strip showing a
 * slightly magnified slice of the photo centred on that strip, so the picture
 * refracts across the ribs instead of just blurring. Pure CSS (container
 * units), so it works in Safari without SVG filters.
 *
 * `ratio` is the photo's real width / height (used for the cover math).
 */
const MAX_FLUTES = 40;

export function FlutedGlassPhoto({ id, ratio }: { id: string; ratio: number }) {
  const img = imageById(id);
  const { props } = getImageProps({ src: img.file, alt: "", width: 800, height: Math.round(800 / ratio), quality: 75 });
  // No `sizes`: src resolves to the 2x (1600w) variant, enough for a full-bleed cover.

  const style = { "--fx-img": `url("${props.src}")`, "--r": ratio } as CSSProperties;

  return (
    <div className="fx-reeded" style={style} role="img" aria-label={img.alt}>
      {Array.from({ length: MAX_FLUTES }, (_, i) => (
        <i key={i} style={{ "--i": i } as CSSProperties} />
      ))}
    </div>
  );
}
