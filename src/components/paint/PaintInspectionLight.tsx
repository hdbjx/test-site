import Image from "next/image";

export function PaintInspectionLight() {
  return (
    <div className="pc90-inspection-visual pc90-inspection-visual--fifty">
      <div className="pc90-inspection-photo ed90-photo-grade">
        <Image
          src="/images/paint-5050-single.jpg"
          alt="Real paint correction 50-50 test spot under an inspection light, corrected on the left and uncorrected on the right"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="pc90-inspection-darkness" aria-hidden="true" />
      <div className="pc90-hero-fifty-key" aria-hidden="true"><span>CORRECTED</span><span>AS ARRIVED</span></div>
    </div>
  );
}
