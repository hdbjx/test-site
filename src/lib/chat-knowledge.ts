import "server-only";

import { site } from "@/data/site";
import { PRICING, serviceList, vehicles } from "@/data/services";
import { serviceDetails } from "@/data/serviceDetails";
import { ADDON_INCLUDED_IN, ADDON_LABELS, ADDON_NOT_OFFERED_WITH, ADDON_PRICES, addonIds } from "@/data/quoteExtras";
import { PAINT_PRICING, ceramicDoes, ceramicDoesNot, paintDefects, paintProcess, paintServices } from "@/data/paint";
import { detailPlusBenefits, detailPlusGuarantee } from "@/data/detailplus";
import { ceramicFaqs, detailPlusFaqs, homeFaqs, paintCorrectionFaqs, paintFaqs, visible } from "@/data/faqs";
import { areas } from "@/data/areas";
import { tierMinutes } from "@/data/coverage";
import { GIFT_CARD_PRESETS } from "@/data/giftCards";
import { ensureLiveCatalog } from "@/lib/live-catalog-server";
import { getDetailPlusCatalog } from "@/lib/detailPlusCatalog";
import type { DetailPlusCatalog } from "@/lib/detailPlusPricing";
import { durationShort, usd } from "@/lib/format";
import { companyStory } from "@/data/companyStory";
import { clients, sponsorships } from "@/data/community";
import { reviews, serviceReviews } from "@/data/reviews";
import { workWall } from "@/data/work";
import { roleLabels, team } from "@/data/team";
import { getPublicTeamRoster } from "@/lib/team-roster";
import { getAllPosts, getPost } from "@/lib/blog";

const list = (items: string[]) => items.map((line) => `- ${line}`).join("\n");
const plain = (html: string) =>
  html
    .replace(/<\/(p|h\d|li)>/g, "\n")
    .replace(/<li>/g, "- ")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&rsquo;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

async function rosterText() {
  const live = await getPublicTeamRoster();
  const rows = live.length
    ? live.map((m) => `${m.name}: ${m.title}`)
    : team.map((m) => `${m.name}: ${roleLabels[m.role]}`);
  return rows.join("\n- ");
}

function blogText() {
  return getAllPosts()
    .map((meta) => {
      const post = getPost(meta.slug);
      return post ? `### ${post.title} (/post/${post.slug}, ${post.date})\n${plain(post.html)}` : "";
    })
    .filter(Boolean)
    .join("\n\n");
}

/**
 * Everything the website chat knows, built from the same data the site renders.
 * Change a price, FAQ or hour in Team HQ / src/data and the chat follows.
 */
export async function buildChatKnowledge(): Promise<{ text: string; detailPlus: DetailPlusCatalog }> {
  await ensureLiveCatalog(); // applies live prices, add-ons, hours and payments to the shared objects
  const [detailPlus, roster] = await Promise.all([getDetailPlusCatalog(), rosterText()]);

  const vehicleHeader = vehicles.map((v) => v.label).join(" | ");
  const priceRows = serviceList
    .map((s) => `${s.name} (id: ${s.id}) | ${vehicles.map((v) => `${usd(PRICING[v.id][s.id].price)} · ${durationShort(PRICING[v.id][s.id].minutes)}`).join(" | ")}`)
    .join("\n");

  const serviceBlocks = serviceList
    .map((s) => {
      const d = serviceDetails[s.id];
      return [
        `### ${s.name}${s.recommended ? " (most booked)" : ""}`,
        s.summary,
        `Who it's for: ${s.whoFor}`,
        `Best rhythm: ${s.cadence}`,
        d.intro,
        `Exterior: ${d.exterior.join("; ")}`,
        `Interior: ${d.interior.join("; ")}`,
        `Finish: ${d.finish}`,
        `Book link: /book?service=${s.id} (add &vehicle=<vehicle id> when the size is known)`,
      ].join("\n");
    })
    .join("\n\n");

  const addons = addonIds
    .map((id) => {
      const price = ADDON_PRICES[id];
      const included = ADDON_INCLUDED_IN[id];
      const blocked = ADDON_NOT_OFFERED_WITH[id];
      return `- ${ADDON_LABELS[id]}: ${price == null ? "price on request" : usd(price)}${included.length ? ` · already included in ${included.join(", ")}` : ""}${blocked.length ? ` · not offered with ${blocked.join(", ")}` : ""}`;
    })
    .join("\n");

  const paintRows = paintServices
    .map((p) => `### ${p.name}\n${p.summary}\nBest for: ${p.bestFor}\nIncludes: ${p.includes.join("; ")}\nPrices: ${vehicles.map((v) => `${v.label} ${usd(PAINT_PRICING[v.id][p.id])}`).join(", ")}`)
    .join("\n\n");

  const dpTasks = detailPlus.tasks
    .map((t) => `- ${t.label} (id: ${t.id}, ${t.group}): ${t.note.replace(/\s*Extra: confirm price\.?/i, " (extra; price still being finalized, say the team will confirm)")} Prices: ${detailPlus.vehicleOrder.map((v, i) => `${v} ${usd(Number(t.prices[i] ?? 0))}`).join(", ")}`)
    .join("\n");
  const dpRhythms = detailPlus.rhythms.map((r) => `- ${r.label} (id: ${r.id}): ${Math.round(r.discount * 100)}% off the task total`).join("\n");
  const dpPresets = detailPlus.presets.map((p) => `- ${p.label}: ${p.tasks.join(", ")}`).join("\n");

  const faqs = [...visible(homeFaqs), ...visible(paintFaqs), ...visible(paintCorrectionFaqs), ...visible(ceramicFaqs), ...visible(detailPlusFaqs)];
  const seen = new Set<string>();
  const faqText = faqs
    .filter((f) => (seen.has(f.q) ? false : (seen.add(f.q), true)))
    .map((f) => `Q: ${f.q}\nA: ${f.a}`)
    .join("\n\n");

  const text = `# EVERY DETAIL — COMPANY KNOWLEDGE

## The business
- ${site.name} (${site.legalName}). ${site.tagline}
- ${site.description}
- Student-run crew, trained in-house. Fully mobile: 100% electric rigs carry their own water and battery power, so no hose, outlet or generator is needed. They just need room to work around the car.
- ${site.reviews.count}+ Google reviews, ${site.reviews.rating}-star average. Award: ${site.award.title}.
- Home base: ${site.city}, ${site.region}. No public street address (service-area business). Never give out a street address.
- Phone / text: ${site.phone.display}. Email: ${site.email}. Hiring / joining the crew: ${site.teamEmail}. Instagram: @everydetail.atl.
- Hours: ${site.hours.weekdays} (school days). ${site.hours.weekends}. ${site.hours.breaks}.
- Payment: ${site.paymentMethods.join(", ")}.
${site.announcement ? `- CURRENT NOTICE: ${site.announcement.text}` : ""}

## Our story
${list(companyStory.origin)}

## The team (current roster, live from the Team App — this list is the source of truth)
- ${roster}
Public info is first names and titles only. Never share last names, ages, schools, phone numbers, schedules or anything personal about team members. People named in older reviews may no longer be on the crew; only this roster is current.

## How we run it
${list(companyStory.howWeRunIt)}

## Equipment & rigs
${list(companyStory.equipment)}

## Community
${list(companyStory.community)}
Clients: ${clients.map((c) => c.name).join(", ")}. Sponsorships: ${sponsorships.map((s) => s.name + (s.note ? ` (${s.note})` : "")).join(", ")}.

## Careers / joining the crew
${list(companyStory.careers)}

## Booking, appointment day and after
${list(companyStory.appointmentDay)}

## Customer accounts
${list(companyStory.accounts)}

## Detailing packages
Vehicle size ids: ${vehicles.map((v) => `${v.id} = ${v.label} (${v.hint})`).join("; ")}.

Price · time on site, by vehicle:
Service | ${vehicleHeader}
${priceRows}

${serviceBlocks}

## Add-ons (picked during booking)
${addons}

## Paint correction & ceramic coating (separate appointments, inspected in person first)
${paintRows}

Defects correction addresses: ${paintDefects.map((d) => `${d.name} (${d.detail})`).join("; ")}
Ceramic does: ${ceramicDoes.join("; ")}
Ceramic does not: ${ceramicDoesNot.join("; ")}
Process: ${paintProcess.map((p) => `${p.title}: ${p.body}`).join(" ")}
Pages: /paint-correction and /ceramic. Paint work starts with a quote request on those pages, not the regular booking flow.

## Detail+ membership (recurring visits)
Customers build their own plan by picking tasks and a rhythm. Per-visit price = sum of the picked tasks for their vehicle, minus the rhythm discount, rounded to the nearest $5, never below the ${usd(detailPlus.minimum)} per-visit minimum. ALWAYS use the quote_detail_plus tool for a Detail+ price; never do this math yourself.
Tasks:
${dpTasks}
Rhythms:
${dpRhythms}
Starting sets:
${dpPresets}
Benefits: ${detailPlusBenefits.map((b) => `${b.title}: ${b.body}`).join(" ")}
Guarantee: ${detailPlusGuarantee}
Page: /detailplus (customers build and request their plan there).

## Service area
Areas served: ${areas.map((a) => a.name).join(", ")}. Coverage is based on one-way drive time from Decatur: within about ${tierMinutes("fee")} minutes can usually book online (the farther part of that may carry a travel fee); ${tierMinutes("fee")}–${tierMinutes("premium")} minutes is case by case for bigger jobs; beyond that, text us. Customers can check an exact address on /service-areas. Pricing does not depend on neighborhood.

## Gift cards
Preset amounts: ${GIFT_CARD_PRESETS.map(usd).join(", ")}.
${list(companyStory.giftCards)}

## Real Google reviews (verbatim — quote only these, attributed to the reviewer)
${reviews.map((r) => `- ${r.author}: "${r.text}"`).join("\n")}
${Object.entries(serviceReviews).map(([id, r]) => `- ${r.author} (${id}): "${r.quote}"`).join("\n")}
${workWall.flatMap((w) => (w.kind === "review" ? [`- ${w.author}: "${w.quote}"${w.crew ? ` (crew: ${w.crew})` : ""}`] : [])).join("\n")}
More photos and reviews: /our-work. All reviews: Google (${site.reviews.count}+).

## Shine On blog (our own articles — use for car-care questions, link the post)
${blogText()}

## FAQ (approved answers — prefer this wording)
${faqText}

## Website pages
/book (book a detail, live calendar) · /get-a-quote (not sure what you need — we'll recommend) · /our-services · /detailplus · /paint-correction · /ceramic · /service-areas · /gift-cards · /our-work (photos + reviews) · /about-us (story, crew, careers) · /blog (Shine On articles) · /account (sign in, saved vehicles, bookings)
`;
  return { text, detailPlus };
}
