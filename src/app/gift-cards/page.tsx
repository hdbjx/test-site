import Link from "next/link";
import { GiftCardPurchaseForm } from "@/components/gift-cards/GiftCardPurchaseForm";
import { GiftCardIntro } from "@/components/gift-cards/GiftCardIntro";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Gift Cards | Every Detail", description: "Give an Every Detail mobile detailing gift card for birthdays, holidays, new cars, thank-yous, and everything in between.", path: "/gift-cards" });

export default function GiftCardsPage() {
  return (
    <div className="gift-page info80-page">
      <GiftCardIntro />

      <section className="gift-showcase info80-section" id="gift-builder">
        <div className="container-ed gift-builder-grid info80-gift-grid">
          <aside className="gift-preview-wrap gift-preview-wrap-v2">
            <p className="eyebrow">GIFT CARD</p>
            <h1>CHOOSE THE AMOUNT.<br />WE’LL HANDLE THE REST.</h1>
            <div className="info80-gift-points">
              <span>Use it toward any Every Detail service.</span>
              <span>No account required to redeem.</span>
              <span>Unused balance stays on the card.</span>
            </div>
          </aside>

          <div className="gift-form-shell">
            <div className="gift-form-shell-head info80-form-head">
              <div><p className="eyebrow">BUILD THE GIFT</p><h2>Who’s it for?</h2></div>
              <div className="gift-shell-badges"><span>Venmo or Zelle</span></div>
            </div>
            <GiftCardPurchaseForm />
            <p className="gift-terms-note">Purchased gift-card value does not expire and has no inactivity fee.</p>
          </div>
        </div>
      </section>

      <section className="info80-simple-band">
        <div className="container-ed info80-simple-band-inner">
          <div><p className="eyebrow">REDEEMING</p><h2>Simple for the recipient.</h2></div>
          <p>They can use the code without creating an account. If they later create one with the same email, the balance can appear there automatically.</p>
          <div className="gift-rewards-actions"><Link href="/account" className="btn btn-secondary">Account ↗</Link><Link href="/book" className="btn btn-primary">Book a detail ↗</Link></div>
        </div>
      </section>
    </div>
  );
}
