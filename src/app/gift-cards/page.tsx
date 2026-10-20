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
      <section className="gift-showcase">
        <div className="container-ed gift-builder-grid">
          <aside className="gift-preview-wrap gift-preview-wrap-v2">
            <p className="eyebrow">Every Detail gift cards</p>
            <h1>Give them something they’ll actually use.</h1>
            <p className="gift-showcase-copy">
              Clean car energy, without guessing the package. Choose the amount, add the recipient,
              and we’ll turn it into an Every Detail gift card once payment is confirmed.
            </p>

            <div className="gift-card-preview gift-card-preview-lg">
              <div className="gift-card-top"><span>EVERY DETAIL</span><b>GIFT CARD</b></div>
              <div className="gift-card-center"><strong>A better kind<br />of clean.</strong></div>
              <div className="gift-card-bottom"><span>MOBILE DETAILING · DECATUR + ATLANTA</span><i>ED</i></div>
            </div>

            <div className="gift-points-grid">
              <div>
                <span>Any service</span>
                <p>Use it toward any detail, add-on, or upgrade.</p>
              </div>
              <div>
                <span>No account required</span>
                <p>The recipient can redeem the code without creating an account.</p>
              </div>
              <div>
                <span>Flexible balance</span>
                <p>If they do not use the full amount, the rest stays on the card.</p>
              </div>
              <div>
                <span>Clean delivery</span>
                <p>Send it to yourself or straight to the recipient once approved.</p>
              </div>
            </div>
          </aside>

          <div className="gift-form-shell">
            <div className="gift-form-shell-head">
              <div>
                <p className="eyebrow">Build the gift</p>
                <h2>Choose the amount. We’ll handle the rest.</h2>
              </div>
              <div className="gift-shell-badges">
                <span>Venmo or Zelle</span>
                <span>Activated after approval</span>
              </div>
            </div>

            <GiftCardPurchaseForm />

            <p className="gift-terms-note">
              Purchased gift-card value does not expire and has no inactivity fee. Terms are
              included with the gift card when it is activated.
            </p>
          </div>
        </div>
      </section>

      <section className="gift-how gift-how-v2">
        <div className="container-ed">
          <div className="gift-how-head">
            <div>
              <p className="eyebrow">How it works</p>
              <h2>Simple for the buyer. Clean for the recipient.</h2>
            </div>
            <p>
              The recipient does not need an account to use the card. If they later make an Every
              Detail account with the same email, the balance appears there automatically.
            </p>
          </div>

          <div className="gift-how-grid">
            <article>
              <b>01</b>
              <h3>Build it</h3>
              <p>Pick a preset or custom amount, add the recipient, and include an optional note.</p>
            </article>
            <article>
              <b>02</b>
              <h3>Pay it</h3>
              <p>Use Venmo or Zelle. We generate a unique reference so your payment matches the order.</p>
            </article>
            <article>
              <b>03</b>
              <h3>Send it</h3>
              <p>After approval, we can send the gift card to you or directly to the recipient by email.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="gift-rewards-bridge gift-rewards-bridge-v2">
        <div className="container-ed gift-rewards-grid">
          <div>
            <p className="eyebrow">Connected to the Every Detail account</p>
            <h2>Gift cards and rewards.<br /><span>One clean credit experience.</span></h2>
          </div>
          <div>
            <p>
              Purchased gift-card value and rewards stay separate behind the scenes, but the website
              and app can surface both in one clean available credit area at checkout.
            </p>
            <div className="gift-rewards-actions">
              <Link href="/account" className="btn btn-secondary">Open your account ↗</Link>
              <Link href="/book" className="btn btn-primary">Book a detail ↗</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
