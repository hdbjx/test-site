import Link from "next/link";
import { GiftCardPurchaseForm } from "@/components/gift-cards/GiftCardPurchaseForm";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Gift Cards | Every Detail",
  description: "Give an Every Detail mobile detailing gift card for birthdays, holidays, new cars, thank-yous, and everything in between.",
  path: "/gift-cards",
});

export default function GiftCardsPage() {
  return (
    <div className="gift-page">
      <section className="gift-hero">
        <div className="container-ed gift-hero-grid">
          <div>
            <p className="eyebrow">Every Detail gift cards</p>
            <h1>Give them a car<br /><span>they actually want<br />to get back into.</span></h1>
          </div>
          <div className="gift-hero-copy">
            <p>Pick the value. We’ll handle the rest. Every Detail gift cards work toward any detailing service and the unused balance stays on the card for later.</p>
            <div className="gift-hero-points"><span>ANY SERVICE</span><span>NO EXPIRATION</span><span>PARTIAL BALANCES STAY ACTIVE</span></div>
          </div>
        </div>
      </section>

      <section className="gift-builder">
        <div className="container-ed gift-builder-grid">
          <aside className="gift-preview-wrap">
            <div className="gift-card-preview">
              <div className="gift-card-top"><span>EVERY DETAIL</span><b>GIFT CARD</b></div>
              <div className="gift-card-center"><strong>A better kind<br />of clean.</strong></div>
              <div className="gift-card-bottom"><span>MOBILE DETAILING · DECATUR + ATLANTA</span><i>ED</i></div>
            </div>
            <p>Gift cards are activated after payment is confirmed. The recipient can use the code without creating an account. If they later create an Every Detail account with the same email, the card automatically appears there.</p>
          </aside>
          <div>
            <GiftCardPurchaseForm />
            <p className="gift-terms-note">Gift cards are redeemable for Every Detail services. Purchased value does not expire and has no inactivity fee. Terms are provided with the card when activated.</p>
          </div>
        </div>
      </section>

      <section className="gift-how">
        <div className="container-ed">
          <p className="eyebrow">How it works</p>
          <div className="gift-how-grid">
            <article><b>01</b><h2>Build the gift.</h2><p>Choose a value from $25 to $2,000, add the recipient, and decide whether we send it to you or directly to them.</p></article>
            <article><b>02</b><h2>Pay the way you already know.</h2><p>Choose Venmo or Zelle. Your request gets a unique reference so the team can match your payment instantly.</p></article>
            <article><b>03</b><h2>We activate it.</h2><p>Once payment is verified, the card becomes usable. Any amount left after a detail stays available for the next visit.</p></article>
          </div>
        </div>
      </section>

      <section className="gift-rewards-bridge">
        <div className="container-ed gift-rewards-grid">
          <div><p className="eyebrow">Built for the Every Detail account</p><h2>Gift cards now.<br /><span>One credit wallet later.</span></h2></div>
          <div><p>The system keeps purchased gift value separate from earned rewards behind the scenes, but your app can surface both in one clean “Available credit” area. That means the staff checkout flow can apply a gift card, rewards, or both without turning them into the same accounting bucket.</p><Link href="/account" className="btn btn-secondary">Open your account ↗</Link></div>
        </div>
      </section>
    </div>
  );
}
