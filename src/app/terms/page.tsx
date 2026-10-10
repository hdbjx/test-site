import Link from "next/link";
import { site } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Terms of Service",
  description: "Terms that apply when you use the Every Detail website, request a quote, book a mobile detailing service or use a customer account.",
  path: "/terms",
});

const updated = "October 7, 2026";

export default function TermsPage() {
  return (
    <div className="legal-v1">
      <header className="legal-v1-hero legal-v1-hero-terms">
        <div className="legal-v1-shell">
          <p className="legal-v1-kicker">EVERY DETAIL / LEGAL</p>
          <h1>Terms of<br/><span>Service.</span></h1>
          <div className="legal-v1-intro">
            <p>These terms cover use of our website and what customers can expect when booking mobile detailing with Every Detail.</p>
            <p className="legal-v1-date">LAST UPDATED / {updated.toUpperCase()}</p>
          </div>
        </div>
      </header>

      <section className="legal-v1-body">
        <div className="legal-v1-shell legal-v1-grid">
          <aside className="legal-v1-aside">
            <p>QUICK READ</p>
            <strong>Book the right service, give us safe access to the vehicle, tell us about unusual conditions, and contact us early if plans change. We will communicate before doing work that materially changes the agreed price.</strong>
            <nav aria-label="Terms of service sections">
              <a href="#booking">01 / Booking + pricing</a>
              <a href="#appointment">02 / Your appointment</a>
              <a href="#cancellations">03 / Changes + cancellations</a>
              <a href="#results">04 / Results + vehicle condition</a>
              <a href="#website">05 / Website + accounts</a>
              <a href="#contact">06 / Contact</a>
            </nav>
          </aside>

          <article className="legal-v1-copy">
            <section>
              <p className="legal-v1-num">00</p>
              <h2>Agreement to these terms</h2>
              <p>These Terms of Service apply when you use the Every Detail website, request a quote, book a detailing appointment, use a customer account, or purchase services from Every Detail. By doing so, you agree to these terms. If you are booking for someone else or for a vehicle you do not own, you represent that you have permission to authorize the service.</p>
              <p>If you are under 18, you should have permission from a parent or legal guardian before entering into a paid service arrangement.</p>
            </section>

            <section id="booking">
              <p className="legal-v1-num">01</p>
              <h2>Bookings, quotes and pricing</h2>
              <p>An appointment is confirmed when our booking system confirms it or we confirm it with you directly. Website pricing is based on the vehicle size, service and options selected. Quotes depend on the information available when the quote is given.</p>
              <p>Vehicle condition can affect the labor required. Heavy contamination, unusual cleanup needs, inaccurate vehicle information, inaccessible areas or requested work outside the selected package may require a different service, additional time or an adjusted price. When a material price change is needed, we will communicate it before performing the additional work.</p>
              <p>Unless we agree otherwise, payment is due when the service is completed. Current accepted methods are {site.paymentMethods.join(", ")}.</p>
            </section>

            <section id="appointment">
              <p className="legal-v1-num">02</p>
              <h2>What we need on detail day</h2>
              <p>Every Detail is a mobile service. You are responsible for providing an accurate service address and a location where our crew can safely and legally work around the vehicle. You must have authority to allow detailing at that location.</p>
              <ul>
                <li>The vehicle must be accessible at the scheduled time, including keys or unlocked access when needed for the service.</li>
                <li>Please remove cash, valuables, important documents, weapons and other sensitive personal property before the appointment.</li>
                <li>Tell us in advance about known hazards, fragile or damaged components, aftermarket modifications, leaks, biohazards, pests, sharp objects or other conditions that could affect safe service.</li>
                <li>We may decline or pause work when conditions are unsafe, illegal, materially different from what was booked, or likely to damage the vehicle or our equipment.</li>
              </ul>
              <p>Appointment times are estimates affected by traffic, weather, the condition of earlier jobs and the condition of your vehicle. We will make reasonable efforts to communicate meaningful delays.</p>
            </section>

            <section id="cancellations">
              <p className="legal-v1-num">03</p>
              <h2>Rescheduling, cancellations and weather</h2>
              <p>Customer accounts currently allow eligible appointments to be cancelled online when more than 24 hours remain before the scheduled start time. If you need to change or cancel an appointment within 24 hours, call or text us at <a href={site.phone.href}>{site.phone.display}</a>.</p>
              <p>Because detailing is performed outdoors and our crews travel between appointments, weather or unsafe working conditions may require us to delay, reschedule or modify an appointment. We may also reschedule for operational or safety reasons. If we need to make a significant change, we will contact you using the information provided with the booking.</p>
            </section>

            <section id="results">
              <p className="legal-v1-num">04</p>
              <h2>Service results and pre-existing condition</h2>
              <p>We aim for professional results, but detailing cannot guarantee that every stain, odor, scratch, etching, defect or form of contamination can be fully removed. Results depend on the material, age, prior damage, previous repairs or products, and how deeply a condition has affected the surface.</p>
              <p>Normal detailing can reveal pre-existing defects that were hidden by dirt or buildup. Older, deteriorated, loose, cracked, repainted, repaired or aftermarket components can also be more vulnerable than factory surfaces in good condition. We are not responsible for pre-existing damage or failures that are not caused by our failure to use reasonable care.</p>
              <p>If we identify a condition that makes a requested process inappropriate, we may recommend a different approach or decline that portion of the service.</p>
            </section>

            <section>
              <p className="legal-v1-num">05</p>
              <h2>Customer property and claims</h2>
              <p>Please remove valuable or irreplaceable personal property before service. We are not responsible for items left in the vehicle that are lost, discarded with ordinary trash, or damaged unless the loss or damage results from our failure to use reasonable care.</p>
              <p>If you believe our service caused damage or another material problem, contact us as soon as reasonably possible with details and photos if available. Prompt notice gives us a fair opportunity to inspect the issue and determine an appropriate response.</p>
            </section>

            <section>
              <p className="legal-v1-num">06</p>
              <h2>Paint correction, coatings and specialized work</h2>
              <p>Paint correction and ceramic-coating results depend on paint type, remaining clear coat, prior repairs, existing defects and vehicle condition. Some defects may be unsafe or impractical to remove completely. When appropriate, we may recommend preserving paint rather than pursuing maximum defect removal.</p>
              <p>Any durability estimate for a coating or protective product assumes reasonable maintenance and normal use. Environmental exposure, washing methods, abrasion, accidents and chemical exposure can affect longevity.</p>
            </section>

            <section id="website">
              <p className="legal-v1-num">07</p>
              <h2>Website and customer accounts</h2>
              <p>You agree to provide accurate information when using our forms and booking tools. If you create an account, you are responsible for maintaining the confidentiality of your sign-in credentials and for activity conducted through your account.</p>
              <p>You may not misuse the website, attempt to gain unauthorized access, interfere with its operation, submit fraudulent bookings, scrape protected systems, or use the site in a way that violates applicable law or the rights of others.</p>
              <p>The website, Every Detail branding, original copy, graphics and other site content are owned by or licensed to Every Detail and may not be copied or commercially reused without permission, except as allowed by law.</p>
            </section>

            <section>
              <p className="legal-v1-num">08</p>
              <h2>Availability and website accuracy</h2>
              <p>We work to keep pricing, availability, service descriptions and other website information accurate, but errors or temporary technical issues can occur. We may correct errors, update information, or decline a booking affected by an obvious pricing, scheduling or technical error. If that affects a confirmed appointment, we will contact you.</p>
            </section>

            <section>
              <p className="legal-v1-num">09</p>
              <h2>Disclaimers and limitation of liability</h2>
              <p>To the extent permitted by law, the website is provided on an “as available” basis. We do not guarantee uninterrupted access to the website or that every website feature will always be error-free.</p>
              <p>Nothing in these terms excludes responsibility that cannot legally be excluded. To the extent permitted by applicable law, Every Detail will not be liable for indirect, incidental, special or consequential losses arising from use of the website or services. Any responsibility for direct loss will be limited to loss reasonably connected to the service or conduct giving rise to the claim.</p>
            </section>

            <section>
              <p className="legal-v1-num">10</p>
              <h2>Privacy</h2>
              <p>Our <Link href="/privacy-policy">Privacy Policy</Link> explains how we collect and use information through the website, bookings and customer accounts. It is incorporated into these terms by reference.</p>
            </section>

            <section>
              <p className="legal-v1-num">11</p>
              <h2>Georgia law and changes</h2>
              <p>These terms are governed by the laws of the State of Georgia, without regard to conflict-of-law rules, except where another law must apply. We may update these terms as our services or operations change. The “Last updated” date at the top identifies the current version.</p>
            </section>

            <section id="contact" className="legal-v1-contact">
              <p className="legal-v1-num">12</p>
              <h2>Questions?</h2>
              <p>Contact Every Detail at <a href={`mailto:${site.email}`}>{site.email}</a> or <a href={site.phone.href}>{site.phone.display}</a>. We are based in {site.city}, {site.region}.</p>
            </section>
          </article>
        </div>
      </section>
    </div>
  );
}
