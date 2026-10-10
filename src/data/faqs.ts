import { site } from "./site";

/**
 * FAQs. `confirmed: false` items are hidden from the live site until
 * someone checks the answer and flips the flag.
 */

export type Faq = { q: string; a: string; confirmed: boolean };

const payments = site.paymentMethods.slice(0, -1).join(", ") + " or " + site.paymentMethods.at(-1);

export const homeFaqs: Faq[] = [
  {
    q: "Which service should I book?",
    a: "If it's your first time with us, book a Premium Detail. It's our most booked service and gets most cars fully caught up. Choose Maintenance if your car is already detailed regularly, and Factory Reset if it's heavily soiled: lots of pet hair, stains, odor or years of buildup.",
    confirmed: true,
  },
  {
    q: "What's the difference between Maintenance and Premium?",
    a: "Maintenance is a wash, interior vacuum and wipe-down, and windows and wheels. It keeps a clean car clean. Premium adds a full interior deep clean, spray sealant paint protection, and conditioning for trim, leather and interior surfaces.",
    confirmed: true,
  },
  {
    q: "Do you bring your own power and water?",
    a: "Yes. We're fully mobile and bring our own water and battery power in a 100% electric setup, so there is no generator or outlet needed. All we need is room to work around the car.",
    confirmed: true,
  },
  {
    q: "Do I need to be home?",
    a: "CONFIRM: answer about access, keys and unlocked vehicles.",
    confirmed: false,
  },
  {
    q: "How long does a detail take?",
    a: "Roughly 2 to 4 hours depending on the service and the vehicle. A Maintenance Detail on a sedan is about 2 hours; a Factory Reset is about 4. You'll see the time for your exact vehicle when you pick a service.",
    confirmed: true,
  },
  {
    q: "What happens if it rains?",
    a: "We work through light rain. If weather is bad enough that we have to move your appointment, you get priority rescheduling.",
    confirmed: true,
  },
  {
    q: "Can you detail my car at work?",
    a: "CONFIRM: whether workplace lots / parking decks are OK and any requirements.",
    confirmed: false,
  },
  {
    q: "Do you charge extra for pet hair or really dirty cars?",
    a: "Prices are set by vehicle size and service. If your car has heavy pet hair, stains or odor, Factory Reset is built for that. Not sure where your car falls? Send us a quote request with a few details and we'll tell you before anything is booked.",
    confirmed: true,
  },
  {
    q: "What forms of payment do you accept?",
    a: `${payments}.`,
    confirmed: true,
  },
  {
    q: "What is your satisfaction guarantee?",
    a: "CONFIRM: 24-hour satisfaction guarantee — exact terms (how to report an issue, what we do about it).",
    confirmed: false,
  },
];

export const paintFaqs: Faq[] = [
  {
    q: "Enhancement polish or full correction — which one do I need?",
    a: "An enhancement polish suits newer paint or paint that has lost its gloss. Full correction is for visible swirls, scratches and neglected paint. If you're not sure, request a quote. We'll look at the paint in person and match the process to the car.",
    confirmed: true,
  },
  {
    q: "Why is paint correction included with ceramic coating?",
    a: "A coating locks in whatever is underneath it, swirls included. Correcting first means the coating bonds to clean, refined paint and the gloss you see is the gloss you keep.",
    confirmed: true,
  },
  {
    q: "Is a ceramic coating the same as wax?",
    a: "No. Wax sits on top of the paint and wears off in weeks. A ceramic coating bonds to the clear coat and lasts years when it's maintained properly.",
    confirmed: true,
  },
  {
    q: "Will a ceramic coating stop scratches and rock chips?",
    a: "No. It adds some resistance to light marring, but it does not make paint scratch-proof and it won't stop rock chips. For chip protection you'd want paint protection film.",
    confirmed: true,
  },
  {
    q: "What's the free follow-up detail?",
    a: "Every 2-year ceramic coating includes a complimentary follow-up detail after installation. We come back, clean the car the right way for a coated finish, and check how the coating is holding up.",
    confirmed: true,
  },
  {
    q: "How do I take care of a coated car?",
    a: "Keep washing it, just gently: a pH-neutral soap, clean mitts and soft drying towels, and no automatic brush washes. Regular maintenance details, or a Detail+ plan, keep a coating performing.",
    confirmed: true,
  },
];

export const detailPlusFaqs: Faq[] = [
  {
    q: "How much does Detail+ cost?",
    a: "Every plan is quoted as a flat rate based on your vehicle, how often we come, and what gets cleaned. Build your plan and we'll send your price.",
    confirmed: true,
  },
  {
    q: "How often can visits be?",
    a: "Every 2 weeks, monthly, every 6 weeks, every 2 months, or quarterly.",
    confirmed: true,
  },
  {
    q: "Is there a contract?",
    a: "No. Change your frequency, pause, or cancel whenever you need to.",
    confirmed: true,
  },
  {
    q: "What if my car is extra dirty one visit?",
    a: "If it's in your plan, it's covered. Spills, stains, crumbs and pet hair are handled on that visit with no add-on charge.",
    confirmed: true,
  },
  {
    q: "Should I get a full detail before joining?",
    a: "CONFIRM: whether new members need a Premium / Factory Reset first visit.",
    confirmed: false,
  },
];

export const visible = (faqs: Faq[]) => faqs.filter((f) => f.confirmed);
