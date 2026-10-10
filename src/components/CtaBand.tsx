import { TrackedLink } from "./TrackedLink";

type Props = {
  title?: string;
  body?: string;
  location: string;
  quoteLabel?: string;
};

/** Closing conversion section used at the bottom of most pages. */
export function CtaBand({
  title = "Ready for a cleaner car?",
  body = "Pick your vehicle and service and we'll come to you. Not sure what you need? Send a quote request and we'll point you to the right one.",
  location,
  quoteLabel = "Get a quote",
}: Props) {
  return (
    <section className="bg-oxblood text-paper">
      <div className="container-ed grid gap-8 py-16 md:grid-cols-12 md:items-end md:py-24">
        <div className="md:col-span-7">
          <h2 className="t-h2">{title}</h2>
          <p className="mt-4 max-w-xl text-lg text-paper/80">{body}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row md:col-span-5 md:justify-end">
          <TrackedLink href="/book" event="book_click" params={{ location }} className="btn btn-on-dark">
            Book your detail
          </TrackedLink>
          <TrackedLink href="/get-a-quote" event="quote_start" params={{ location }} className="btn btn-outline-on-dark">
            {quoteLabel}
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}
