import fs from 'node:fs';

const read = (p) => fs.readFileSync(p, 'utf8');
const failures = [];
const live = read('src/components/forms/LiveBooking.tsx');
const header = read('src/components/Header.tsx');
const footer = read('src/components/Footer.tsx');
const css = read('src/app/globals.css');
const nav = read('src/data/navigation.ts');
const home = read('src/components/HomeBookingFlow.tsx');
const servicesPage = read('src/app/our-services/page.tsx');
const detailPlus = read('src/app/detailplus/page.tsx');
const giftIntro = read('src/components/gift-cards/GiftCardIntro.tsx');
const giftForm = read('src/components/gift-cards/GiftCardPurchaseForm.tsx');
const workPage = read('src/app/our-work/page.tsx');
const paintPage = read('src/app/paint-correction/page.tsx');
const paintHero = read('src/components/paint/PaintInspectionLight.tsx');
const quote = read('src/components/QuoteRecommender.tsx');
const ceramicPage = read('src/app/ceramic/page.tsx');
const blogPage = read('src/app/blog/page.tsx');
const terms = read('src/app/terms/page.tsx');
const privacy = read('src/app/privacy-policy/page.tsx');

if (!live.includes('const PACKAGE_ORDER: ServiceId[] = ["maintenance", "premium", "factoryReset"]')) failures.push('booking tier order');
if (!live.includes('<div className="bk-security-fields">')) failures.push('booking security controls must be wrapped');
if (!css.includes('.bk-security-fields{display:contents}')) failures.push('booking security wrapper must not become a grid item');
// Disabled step-1 CTA must tell people what to do (shortened so the price label beside it isn't cut off on phones).
if (!live.includes('"Pick a detail"') && !live.includes('Pick a service to continue')) failures.push('booking disabled CTA guidance');
if (!live.includes('services.maintenance.includes') || !home.includes('services.maintenance.includes')) failures.push('detail inclusions must share the canonical service data');
if (header.includes('site-desktop-nav')) failures.push('unexpected desktop navigation');
if (header.includes('is-scrolled')) failures.push('unexpected full-width scrolled header surface');
if (header.includes('serviceIntent ? catalogService(serviceIntent).name : "+ ADD YOUR VEHICLE"')) failures.push('stale service intent still replaces vehicle pill');
if (!footer.includes('funnel-footer')) failures.push('minimal booking/quote footer');
if (!css.includes('.v90-hero-word{opacity:1!important')) failures.push('home hero content immediate visibility');
if (!css.includes('.v29-hero-photo img{opacity:1!important;animation:none!important}')) failures.push('hero photography immediate visibility');
if (!nav.includes('Ceramic Coating')) failures.push('ceramic naming consistency');
if (!servicesPage.includes('BOOK DIRECTLY') || !servicesPage.includes('svc-audit-quiz-link')) failures.push('services primary/secondary CTA hierarchy');
if (!css.includes('V111.4 / SERVICES CORE COMPOSITION')) failures.push('services desktop condition composition');
if (!detailPlus.includes('custom flat rate') || !detailPlus.includes('exact member rate')) failures.push('Detail+ pricing disclosure');
if (!giftIntro.includes('ed:gift-amount') || !giftForm.includes('ed:gift-amount')) failures.push('gift-card first-screen amount selection');
if (!workPage.includes('work-audit-before-after')) failures.push('Our Work before/after proof');
if (!paintHero.includes('/images/paint-5050-single.jpg') || paintPage.includes('<PaintFiftyFifty />')) failures.push('paint 50/50 proof must be the hero without duplicate section');
if (paintPage.includes('PaintDefectFieldGuide') || paintPage.includes('PaintResultBridge')) failures.push('paint page still contains removed long-form sections');
if (!ceramicPage.includes('FULL CORRECTION STARTS AT $695')) failures.push('ceramic value relationship');
if (!blogPage.includes('alt={`Every Detail article: ${post.title}`}')) failures.push('blog thumbnail alt text');
if (!quote.includes('Four quick steps, about a minute') || !quote.includes('Honda Civic') || !quote.includes('Toyota RAV4')) failures.push('Find My Detail first-step guidance and quick vehicle chips');
if (!css.includes('.q53-page .q51-top{position:sticky!important')) failures.push('quote and booking funnel header consistency');
// Location pages share the service-page module (uppercase display titles) with paint + ceramic.
if (!read('src/app/service-areas/[slug]/page.tsx').includes('@/styles/servicePage.module.css')) failures.push('location page visual-system consistency');
if (!terms.includes('Terms of Service | Every Detail') || !terms.includes('00 / Agreement')) failures.push('terms title/TOC');
if (!privacy.includes('Privacy Policy | Every Detail') || !privacy.includes('07 / Your choices') || !privacy.includes('10 / Contact')) failures.push('privacy title/TOC');

if (failures.length) {
  console.error('Audit QA failed:\n- ' + failures.join('\n- '));
  process.exit(1);
}
console.log('Audit QA passed: corrective checks complete.');
