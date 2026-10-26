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
    a: "Not necessarily. As long as we can access the vehicle and have a safe place to work, you can go about your day. If the car is locked, behind a gate, or inside a garage, arrange key or access details with us before the appointment.",
    confirmed: true,
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
    a: "Yes, if the property allows detailing and there is enough safe space around the vehicle for our crew and equipment. For office lots, apartments, or parking decks, check the property rules first and let us know about access or clearance limits.",
    confirmed: true,
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
    a: "If something included in your booked service was missed, contact us within 24 hours with the details and, when helpful, a photo. We’ll review it and work with you on a reasonable correction. New messes, new damage, or issues outside the booked service are not covered.",
    confirmed: true,
  },
];

export const paintFaqs: Faq[] = [
  {
    q: "Enhancement polish or full correction: which one do I need?",
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


export const paintCorrectionFaqs: Faq[] = [
  {
    q: "Enhancement polish or full correction: which one do I need?",
    a: "Enhancement polish is for lighter swirls, haze and lost gloss. Full correction is for more visible swirls, wash marring, scratches and neglected paint. We confirm the right level after seeing the finish.",
    confirmed: true,
  },
  {
    q: "Will paint correction remove every scratch?",
    a: "No. Correction works in the clear coat, so many swirls and lighter scratches can be removed or significantly reduced. Damage that is too deep to correct safely may remain visible.",
    confirmed: true,
  },
  {
    q: "Does paint correction permanently improve the finish?",
    a: "Correction changes the surface of the clear coat rather than temporarily filling defects. New swirls can still be introduced later by poor washing, which is why careful maintenance matters after correction.",
    confirmed: true,
  },
  {
    q: "How do I protect the paint after correction?",
    a: "You can protect the corrected finish with proper washing and paint protection. Our 2-year ceramic package includes correction before coating for clients who want longer-term protection.",
    confirmed: true,
  },
];

export const ceramicFaqs: Faq[] = [
  {
    q: "Why is paint correction included with ceramic coating?",
    a: "A coating locks in the finish underneath it. Correcting first means the coating bonds over clean, refined paint instead of sealing in swirls and haze.",
    confirmed: true,
  },
  {
    q: "Is ceramic coating scratch-proof?",
    a: "No. Ceramic helps with chemical resistance, UV exposure, water behavior and routine maintenance, but improper washing can still mar the paint and the coating does not stop rock chips.",
    confirmed: true,
  },
  {
    q: "How long does the coating last?",
    a: "This package uses a professional two-year ceramic coating. Real-world durability depends on how the vehicle is used, washed and maintained.",
    confirmed: true,
  },
  {
    q: "What is the complimentary follow-up detail?",
    a: "Every 2-year ceramic coating includes a complimentary follow-up detail after installation. We clean the vehicle correctly for a coated finish and check how the coating is behaving.",
    confirmed: true,
  },
  {
    q: "How should I wash a coated car?",
    a: "Use a gentle hand wash, clean wash media and soft drying towels. Avoid automatic brush washes. Regular maintenance helps the coating keep performing and keeps the finish looking its best.",
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
    a: "Bi-weekly, monthly, every 6 weeks, or a custom interval from weekly to quarterly in one-week steps.",
    confirmed: true,
  },
  {
    q: "Is there a contract?",
    a: "No. Change your frequency, pause, or cancel whenever you need to.",
    confirmed: true,
  },
  {
    q: "What if my car is extra dirty one visit?",
    a: "Spills, stains, crumbs and pet hair that are included in your plan are handled on that visit with no add-on charge.",
    confirmed: true,
  },
  {
    q: "Should I get a full detail before joining?",
    a: "Not automatically. Detail+ is meant to maintain a vehicle that is already in a manageable condition. If the car is too far behind for maintenance, we may recommend a Premium Detail or Factory Reset first, and we’ll tell you before setting up the plan.",
    confirmed: true,
  },
];

export const visible = (faqs: Faq[]) => faqs.filter((f) => f.confirmed);
