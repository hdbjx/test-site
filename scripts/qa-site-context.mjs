import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const fail = (message) => { console.error(`Site context QA failed: ${message}`); process.exitCode = 1; };

const layout = read('src/app/layout.tsx');
for (const name of ['MobileBookBar', 'RouteTransition', 'SitewideMotion']) {
  if (layout.includes(name)) fail(`${name} is still mounted globally.`);
}

const quote = read('src/components/QuoteRecommender.tsx');
if (/q\.set\(["']vehicle["']/.test(quote)) fail('Quote handoff still serializes only a pricing class into Booking.');
if (quote.includes('setBookingResumeHref')) fail('Quote still creates fake booking resume state.');

const home = read('src/components/HomeBookingFlow.tsx');
if (home.includes('setBookingResumeHref')) fail('Homepage still creates fake booking resume state.');

const journey = read('src/components/journey/JourneyGlobalUI.tsx');
if (/q\.set\(["']vehicle["']/.test(journey)) fail('Global booking handoff still downgrades exact vehicle identity to a pricing class.');
if (journey.includes('recentServices')) fail('Removed recent-services UI has returned.');

const live = read('src/components/forms/LiveBooking.tsx');
if (!live.includes('BOOKING_DRAFT_KEY')) fail('Booking draft recovery is missing.');
if (!live.includes('setBookingResumeHref("/book?from=resume")')) fail('Real Booking is not the owner of resume state.');

const header = read('src/components/Header.tsx');
if (header.includes('showAvailabilityBanner') || header.includes('availabilityOpen')) fail('Pseudo-live school-hours header UI is still mounted.');

const vehicleUi = read('src/components/vehicle/VehicleGlobalUI.tsx');
if (!vehicleUi.includes('dynamic(')) fail('Vehicle search is no longer lazy-loaded.');

if (!process.exitCode) console.log('Site context QA passed.');
