import Image from "next/image";

/** 50/50 proof photo for /paint-correction: the real 50/50 test spot under an inspection light. */
export function PaintInspectionLight({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <Image
        src="/images/paint-5050-single.jpg"
        alt="Real paint correction 50-50 test spot under an inspection light, corrected on the left and uncorrected on the right"
        fill
        sizes="(max-width: 900px) 92vw, 46vw"
        className="object-cover"
      />
    </div>
  );
}
