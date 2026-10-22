import Image from "next/image";
import Link from "next/link";

export function QuoteTopBar() {
  return (
    <div className="q51-top">
      <a href="#quote-tool" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:bg-paper focus:px-4 focus:py-2 focus:text-ink">
        Skip to quote tool
      </a>
      <div className="q51-top-row">
        <Link href="/" className="q51-top-logo" aria-label="Every Detail home">
          <Image src="/brand/every-detail-logo.png" alt="" width={120} height={120} priority />
        </Link>
        <p>Find your detail</p>
        <Link href="/book" className="q51-top-book">Know what you need? <span>Book now ↗</span></Link>
      </div>
    </div>
  );
}
