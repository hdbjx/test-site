import { GoogleMapsAttribution, LiveReviewCount } from "@/components/GoogleReviewStats";
import { site } from "@/data/site";

/** Red band of proof points — the same device as the ticker on the current Detail+ page, but static. */
export function TrustStrip() {
  return (
    <section aria-label="Why people book Every Detail" className="border-y-2 border-ink bg-red text-paper">
      <ul className="container-ed flex flex-wrap items-center gap-x-8 gap-y-1 py-3.5 font-numeral text-xl tracking-[0.06em] md:justify-between md:text-2xl">
        <li>{site.award.title}</li>
        <li><LiveReviewCount /> five-star reviews <GoogleMapsAttribution className="google-maps-attribution-on-dark" /></li>
        <li>We bring our own power and water</li>
        <li>Trained student crew</li>
      </ul>
    </section>
  );
}
