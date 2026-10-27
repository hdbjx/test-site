import Link from "next/link";
import { Photo } from "@/components/Photo";
import { TrackedLink } from "@/components/TrackedLink";
import { GiftCardIntro } from "@/components/gift-cards/GiftCardIntro";
import { GiftCardPurchaseForm } from "@/components/gift-cards/GiftCardPurchaseForm";
import styles from "@/components/gift-cards/gift.module.css";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Gift Cards | Every Detail",
  description: "Give an Every Detail mobile detailing gift card for birthdays, holidays, new cars, thank-yous, and everything in between.",
  path: "/gift-cards",
});

const steps = [
  { n: "01", title: "Build it", body: "Pick an amount, add who it's for and an optional note." },
  { n: "02", title: "Pay it", body: "Venmo or Zelle. You get a unique reference so your payment matches the order." },
  { n: "03", title: "Send it", body: "Once payment is approved, we email the card to you or straight to them." },
];

export default function GiftCardsPage() {
  return (
    <main className={styles.page}>
      <GiftCardIntro />

      <section id="gift-builder" className={styles.builderSection} data-header-tone="ink" aria-labelledby="gc-builder-title">
        <div className={styles.shell}>
          <div className={styles.sectionHead}>
            <p className={styles.kickerDark}>Build the gift</p>
            <h2 id="gc-builder-title" className={styles.sectionTitle}>
              <span>Choose the amount.</span>
              <span>We&apos;ll handle the rest.</span>
            </h2>
          </div>
          <GiftCardPurchaseForm />
        </div>
      </section>

      <section className={styles.how} data-header-tone="light" aria-labelledby="gc-how-title">
        <div className={styles.shell}>
          <div className={styles.howGrid}>
            <div>
              <p className={styles.kicker}>How it works</p>
              <h2 id="gc-how-title" className={styles.sectionTitle}>
                <span>Simple to give.</span>
                <span>Easy to use.</span>
              </h2>
              <p className={styles.howNote}>They don&apos;t need an account to use it. If they make an Every Detail account later with the same email, the balance shows up there on its own.</p>
            </div>
            <ol className={styles.howSteps}>
              {steps.map((step) => (
                <li key={step.n}><span>{step.n}</span><div><h3>{step.title}</h3><p>{step.body}</p></div></li>
              ))}
            </ol>
          </div>
          <figure className={styles.howPhoto}><Photo id="work-05" ratio="16/6" sizes="(max-width: 1240px) 94vw, 1200px" /></figure>
        </div>
      </section>

      <section className={styles.rewards} data-header-tone="brand" aria-labelledby="gc-rewards-title">
        <div className={`${styles.shell} ${styles.rewardsGrid}`}>
          <h2 id="gc-rewards-title" className={styles.rewardsTitle}>
            <span>Gift cards + rewards.</span>
            <span>One account.</span>
          </h2>
          <div>
            <p>Gift-card and reward balances stay separate, but both are ready to use when you check out.</p>
            <div className={styles.rewardsActions}>
              <TrackedLink href="/book" event="book_click" params={{ location: "gift_rewards" }} className={styles.lightCta}>Book a detail <span aria-hidden="true">↗</span></TrackedLink>
              <Link href="/account" className={styles.lightLink}>Open your account ↗</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
