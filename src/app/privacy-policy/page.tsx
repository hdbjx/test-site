import Link from "next/link";
import { site } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How Every Detail collects, uses, stores and shares information when you use our website, request a quote, book a detail or manage your account.",
  path: "/privacy-policy",
});

const updated = "October 7, 2026";

export default function PrivacyPolicyPage() {
  return (
    <div className="legal-v1">
      <header className="legal-v1-hero">
        <div className="legal-v1-shell">
          <p className="legal-v1-kicker">EVERY DETAIL / LEGAL</p>
          <h1>Privacy<br/><span>Policy.</span></h1>
          <div className="legal-v1-intro">
            <p>This policy explains what information Every Detail collects through our website and services, why we use it, and the choices you have.</p>
            <p className="legal-v1-date">LAST UPDATED / {updated.toUpperCase()}</p>
          </div>
        </div>
      </header>

      <section className="legal-v1-body">
        <div className="legal-v1-shell legal-v1-grid">
          <aside className="legal-v1-aside">
            <p>QUICK READ</p>
            <strong>We use customer information to quote, schedule, perform and support detailing services. We do not sell your personal information.</strong>
            <nav aria-label="Privacy policy sections">
              <a href="#collect">01 / What we collect</a>
              <a href="#use">02 / How we use it</a>
              <a href="#share">03 / How we share it</a>
              <a href="#cookies">04 / Cookies + analytics</a>
              <a href="#choices">05 / Your choices</a>
              <a href="#contact">06 / Contact</a>
            </nav>
          </aside>

          <article className="legal-v1-copy">
            <section>
              <p className="legal-v1-num">00</p>
              <h2>Who this policy covers</h2>
              <p>This Privacy Policy applies to information collected by Every Detail through {site.url.replace("https://", "")}, our booking and quote forms, customer accounts, and communications connected to those services. It does not control the privacy practices of third-party websites or services that we do not operate.</p>
            </section>

            <section id="collect">
              <p className="legal-v1-num">01</p>
              <h2>Information we collect</h2>
              <p>We collect information you give us when you request information, ask for a quote, book a service, create or use an account, save a vehicle, or contact us. Depending on what you use, this may include:</p>
              <ul>
                <li>Your name, phone number and email address.</li>
                <li>Your service address and related access information you choose to provide.</li>
                <li>Vehicle information, including year, make, model, size and saved vehicles.</li>
                <li>The service, add-ons, appointment time and other booking details you select.</li>
                <li>Notes about the vehicle or appointment, such as stains, pet hair, parking information or areas you want us to focus on.</li>
                <li>How you heard about Every Detail and any referral detail you choose to provide.</li>
                <li>Account and authentication information needed to sign you in and maintain your customer portal.</li>
              </ul>
              <p>We may also receive basic technical information automatically when you use the site, such as device/browser information, pages viewed, referral information and interactions with the website. The exact analytics data collected depends on the tools enabled on the site at the time of your visit.</p>
            </section>

            <section id="use">
              <p className="legal-v1-num">02</p>
              <h2>How we use information</h2>
              <p>We use information when reasonably necessary to operate Every Detail and serve customers. That includes to:</p>
              <ul>
                <li>Provide quotes, show availability, schedule and perform detailing services.</li>
                <li>Send booking confirmations, reminders and service-related communications.</li>
                <li>Maintain customer accounts, saved vehicles and appointment history.</li>
                <li>Respond to questions, support requests and feedback.</li>
                <li>Plan staffing, routes and service operations.</li>
                <li>Understand which marketing sources and website pages are useful.</li>
                <li>Protect the website, customers and our systems from misuse, fraud or security problems.</li>
                <li>Maintain business records and comply with applicable legal obligations.</li>
              </ul>
              <p>We may use contact information to follow up about a quote, booking or prior service. You can ask us to stop non-essential promotional communications at any time. Transactional messages about an active booking or account may still be necessary.</p>
            </section>

            <section id="share">
              <p className="legal-v1-num">03</p>
              <h2>How we share information</h2>
              <p>We do not sell your personal information. We may share information with service providers that help us run the website and business, only as needed for their role. Our current website infrastructure may include:</p>
              <ul>
                <li><strong>Supabase</strong> for database, account authentication and customer-portal infrastructure.</li>
                <li><strong>Resend</strong> for transactional email such as booking confirmations.</li>
                <li><strong>Google Analytics</strong> when analytics is enabled, to understand website traffic and usage.</li>
                <li>Hosting, security and other technical providers necessary to operate the website.</li>
              </ul>
              <p>We may also disclose information if reasonably necessary to comply with law, respond to valid legal process, protect the rights or safety of Every Detail, our customers or others, investigate misuse, or as part of a business reorganization or transfer.</p>
            </section>

            <section id="cookies">
              <p className="legal-v1-num">04</p>
              <h2>Cookies, accounts and analytics</h2>
              <p>The site may use cookies or similar browser storage that are necessary for account sign-in, security and site functionality. If Google Analytics is enabled, Google may also use cookies or similar technologies to measure site usage.</p>
              <p>You can control cookies through your browser settings. Blocking necessary cookies may prevent account sign-in or other website features from working correctly.</p>
            </section>

            <section>
              <p className="legal-v1-num">05</p>
              <h2>Payments</h2>
              <p>Our website does not currently ask you to enter payment-card information to book a standard detailing appointment. Payment for detailing services is handled separately using the payment methods we make available. If we add online payment processing later, this policy may be updated to describe the payment provider and information involved.</p>
            </section>

            <section>
              <p className="legal-v1-num">06</p>
              <h2>Retention and security</h2>
              <p>We keep personal information for as long as reasonably necessary for the purposes described in this policy, including providing services, maintaining customer and business records, resolving disputes, preventing abuse and meeting legal obligations. Different records may be kept for different periods.</p>
              <p>We use reasonable administrative and technical measures designed to protect information. No website, database or transmission method can be guaranteed to be completely secure, so we cannot promise absolute security.</p>
            </section>

            <section id="choices">
              <p className="legal-v1-num">07</p>
              <h2>Your choices</h2>
              <p>You may contact us to ask about the personal information we maintain about you, request a correction, or ask us to delete information that we no longer need to keep. Some information may need to be retained for legitimate business, security or legal reasons.</p>
              <p>If you have an Every Detail customer account, some account and vehicle information can also be managed through the <Link href="/account">customer portal</Link>.</p>
            </section>

            <section>
              <p className="legal-v1-num">08</p>
              <h2>Children&apos;s privacy</h2>
              <p>Our customer website and booking services are not directed to children under 13, and we do not knowingly collect personal information from children under 13 through these services. If you believe a child under 13 has provided personal information to us, contact us so we can review the situation.</p>
            </section>

            <section>
              <p className="legal-v1-num">09</p>
              <h2>Changes to this policy</h2>
              <p>We may update this Privacy Policy as our website, services or legal obligations change. The “Last updated” date at the top shows when this version took effect. Material changes may also be communicated in another reasonable way when appropriate.</p>
            </section>

            <section id="contact" className="legal-v1-contact">
              <p className="legal-v1-num">10</p>
              <h2>Questions about privacy?</h2>
              <p>Contact Every Detail at <a href={`mailto:${site.email}`}>{site.email}</a> or <a href={site.phone.href}>{site.phone.display}</a>. We are based in {site.city}, {site.region}.</p>
            </section>
          </article>
        </div>
      </section>
    </div>
  );
}
