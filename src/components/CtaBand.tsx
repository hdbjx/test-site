import { TrackedLink } from "./TrackedLink";

type Props = {
  title?: string;
  body?: string;
  location: string;
  quoteLabel?: string;
};

export function CtaBand({
  title = "Ready for a cleaner car?",
  body = "Pick your vehicle and service and we’ll come to you. Not sure what you need? We’ll point you to the right one.",
  location,
  quoteLabel = "Find my detail",
}: Props) {
  return (
    <section className="site-cta-band">
      <div className="site-cta-word" aria-hidden="true">CLEAN CAR / GOOD DAY / CLEAN CAR / GOOD DAY</div>
      <div className="container-ed site-cta-inner">
        <div>
          <p className="site-cta-kicker">YOUR DRIVEWAY / OUR DETAIL SHOP</p>
          <h2>{title}</h2>
          <p>{body}</p>
        </div>
        <div className="site-cta-actions">
          <TrackedLink href="/book" event="book_click" params={{ location }} className="site-cta-primary">Book your detail <span>↗</span></TrackedLink>
          <TrackedLink href="/get-a-quote" event="quote_start" params={{ location }} className="site-cta-secondary">{quoteLabel} <span>↗</span></TrackedLink>
        </div>
      </div>
    </section>
  );
}
