/**
 * One quiet line under booking buttons. Every claim here is literal policy:
 * nothing is charged to reserve, and payment is due when the detail is finished
 * (see /terms). Change the copy only if the policy changes.
 */
export const BOOK_ASSURANCE = "No payment to book · Pay after the detail";

export function BookAssurance({ className = "", text = BOOK_ASSURANCE }: { className?: string; text?: string }) {
  return <p className={`ed-assurance ${className}`}>{text}</p>;
}
