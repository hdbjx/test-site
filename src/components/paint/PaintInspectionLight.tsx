import Image from "next/image";

/** Hero photo for /paint-correction: the real 50/50 test spot under an inspection light. */
export function PaintInspectionLight({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <Image
        src="/images/paint-5050-single.jpg"
        alt="Real paint correction 50-50 test spot under an inspection light, corrected on the left and uncorrected on the right"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
    </div>
  );
}
