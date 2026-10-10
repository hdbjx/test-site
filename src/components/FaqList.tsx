import type { Faq } from "@/data/faqs";
import { visible } from "@/data/faqs";

/** Accordion built on <details>: answers are in the HTML (crawlable), keyboard accessible, no JS. */
export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="faq border-t border-line">
      {visible(faqs).map((f) => (
        <details key={f.q} className="group border-b border-line">
          <summary className="flex items-start justify-between gap-6 py-5 font-display text-lg font-semibold leading-snug md:text-xl">
            <span>{f.q}</span>
            <svg aria-hidden="true" viewBox="0 0 20 20" className="faq-icon mt-1 h-5 w-5 shrink-0 text-red">
              <path d="M10 3v14M3 10h14" stroke="currentColor" strokeWidth="2" />
            </svg>
          </summary>
          <div className="max-w-2xl pb-6 text-ink/80">{f.a}</div>
        </details>
      ))}
    </div>
  );
}
