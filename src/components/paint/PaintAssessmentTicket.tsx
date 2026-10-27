"use client";

import { PaintLeadForm } from "@/components/PaintLeadForm";
import styles from "./PaintAssessmentTicket.module.css";

function ticketNumber() {
  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    timeZone: "America/New_York",
  }).format(new Date()).replace("/", "");
}

export function PaintAssessmentTicket() {
  return (
    <div className={`pc90-ticket ${styles.ticket}`}>
      <div className="pc90-ticket-head">
        <span>EVERY DETAIL · PAINT ASSESSMENT</span>
        <strong suppressHydrationWarning>Nº {ticketNumber()}</strong>
      </div>
      <PaintLeadForm kind="paint-correction" hideIntro />
    </div>
  );
}
