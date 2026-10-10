import Link from "next/link";
import { TrackedLink } from "@/components/TrackedLink";

export default function NotFound() {
  return (
    <section className="container-ed py-24 md:py-32">
      <p className="t-numeral text-7xl text-oxblood">404</p>
      <h1 className="t-h2 mt-4 max-w-2xl">That page isn&rsquo;t here anymore.</h1>
      <p className="mt-4 max-w-xl text-lg text-ink/80">
        We rebuilt the site, so some old links moved. Here&rsquo;s where most people are headed:
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <TrackedLink href="/book" event="book_click" params={{ location: "404" }} className="btn btn-primary">
          Book your detail
        </TrackedLink>
        <Link href="/our-services" className="btn btn-secondary">
          See services and prices
        </Link>
      </div>
    </section>
  );
}
