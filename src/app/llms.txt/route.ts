import { areas } from "@/data/areas";
import { detailPlusMinimum } from "@/data/detailplus";
import { paintServices } from "@/data/paint";
import { PRICING, serviceList, startingPrice } from "@/data/services";
import { site } from "@/data/site";
import { ensureLiveCatalog } from "@/lib/live-catalog-server";
import { usd } from "@/lib/format";

/**
 * /llms.txt — a plain-text summary of the business for AI tools (llmstxt.org).
 * Built from the same data as the site, so prices and hours never drift.
 */
export const revalidate = 60;

const hoursText = (minutes: number) => {
  const h = minutes / 60;
  return `about ${Number.isInteger(h) ? h : h.toFixed(1)} hour${h === 1 ? "" : "s"}`;
};

export async function GET() {
  await ensureLiveCatalog();
  const url = site.url;
  const areaNames = areas.map((a) => a.name);
  const areaList = `${areaNames.slice(0, -1).join(", ")} and ${areaNames.at(-1)}`;

  const details = serviceList.map(
    (s) => `- ${s.name}: from ${usd(startingPrice(s.id))}, ${hoursText(PRICING.sedan[s.id].minutes)}. ${s.summary} Includes: ${s.includes.map((i) => i.charAt(0).toLowerCase() + i.slice(1)).join(", ")}.`,
  );
  const paint = paintServices.map((p) => `- ${p.name}: from ${usd(p.startingAt)}. ${p.summary}`);

  const body = `# ${site.name}

> Student-run mobile car detailing based in ${site.city}, Georgia. Our 100% electric rigs bring their own power and water, so the whole detail happens in your driveway. Prices are posted online.

${site.legalName}. Founded by Wiley, who started with one driveway job in eighth grade. Students run the detailing, scheduling, training and marketing. Named ${site.award.title}. Clients include Emory University and Cliff Valley School.

## Services and prices
"From" prices are for a sedan. Larger vehicles cost more; each service page shows the price for your vehicle.
${details.join("\n")}
${paint.join("\n")}
- Detail+ membership: recurring visits from every week to every 3 months. You pick the tasks and pay one flat price per visit, from ${usd(detailPlusMinimum)}. No contract; pause or change anytime.

## Limits
- Paint correction does not fix rock chips or dings. Deep scratches can be improved, not always removed.
- Ceramic coating does not make paint scratch-proof. Improper washing can still mar a coated car.

## Hours
${site.hours.display}. On school days, jobs start at 4:30pm.

## Where we work
Mobile only, from a home base in ${site.city}, GA. Service area: ${areaList}. Text your address to ${site.phone.display} to check if you're on the route.

## Contact
- Phone or text: ${site.phone.display}
- Email: ${site.email}
${site.social.map((s) => `- ${s.label}: ${s.href}`).join("\n")}
- Book a detail: ${url}/book
- Get a quote: ${url}/get-a-quote

## Key pages
- [Services and pricing](${url}/our-services)
- [Mobile car detailing](${url}/mobile-car-detailing)
- [Paint correction](${url}/paint-correction)
- [Ceramic coating](${url}/ceramic)
- [Detail+ membership](${url}/detailplus)
- [Service areas](${url}/service-areas)
- [About the crew](${url}/about-us)
- [Car care guides](${url}/blog)
`;

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
