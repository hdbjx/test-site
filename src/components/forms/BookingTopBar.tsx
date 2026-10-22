import Image from "next/image";
import Link from "next/link";
import { site } from "@/data/site";

export const BOOKING_STAGES = ["Detail", "Car", "Schedule", "Confirm"] as const;
const MOBILE_LABELS = ["Your detail", "Your vehicle", "Time + place", "Confirm"];

/** Compact funnel header: logo, title, text-us link, and a 4-stage progress rail. */
export function BookingTopBar({ stage = -1 }: { stage?: number }) {
  const showProgress = stage >= 0;
  const pct = showProgress ? ((stage + 1) / BOOKING_STAGES.length) * 100 : 0;
  return (
    <div className="bk-top">
      <a href="#booking-main" className="bk-skip">Skip to booking</a>
      <div className="bk-top-row">
        <Link href="/" className="bk-top-logo" aria-label="Every Detail home">
          <Image src="/brand/every-detail-logo.png" alt="" width={120} height={120} priority />
        </Link>
        <p className="bk-top-title">Book your detail</p>
        <a href={site.phone.sms} className="bk-top-help">
          <span className="bk-top-help-long">Need help? </span>Text us <span aria-hidden="true">↗</span>
        </a>
      </div>
      {showProgress && (
        <>
          <ol className="bk-progress" aria-label="Booking progress">
            {BOOKING_STAGES.map((label, index) => (
              <li
                key={label}
                className={index === stage ? "is-current" : index < stage ? "is-done" : ""}
                aria-current={index === stage ? "step" : undefined}
              >
                <b>{index + 1}</b> {label}
              </li>
            ))}
          </ol>
          <div className="bk-progress-mobile" aria-hidden="true">
            <p>Step {stage + 1} of {BOOKING_STAGES.length} · {MOBILE_LABELS[stage]}</p>
            <span><i style={{ width: `${pct}%` }} /></span>
          </div>
        </>
      )}
    </div>
  );
}
