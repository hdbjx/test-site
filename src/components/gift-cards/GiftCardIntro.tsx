"use client";

import styles from "./gift.module.css";
import { GiftCardFace } from "./GiftCardFace";

const QUICK = [100, 150, 250, 400];

/** Hero for /gift-cards. Quick amounts preselect the builder below via the "ed:gift-amount" event. */
export function GiftCardIntro() {
  const scrollToBuilder = () => {
    document.getElementById("gift-builder")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const chooseAmount = (amount: number) => {
    window.dispatchEvent(new CustomEvent("ed:gift-amount", { detail: amount }));
    scrollToBuilder();
  };

  return (
    <section className={styles.hero} data-header-tone="light" aria-labelledby="gc-hero-title">
      <div className={`${styles.shell} ${styles.heroGrid}`}>
        <div>
          <p className={styles.kicker}>Every Detail / Gift cards</p>
          <h1 id="gc-hero-title" className={styles.heroTitle}>
            <span>Give a</span>
            <span>cleaner car.</span>
          </h1>
          <p className={styles.heroLede}>A real Every Detail gift card for any detail, add-on or upgrade. Pay by Venmo or Zelle and we activate it as soon as payment is confirmed.</p>
          <p className={styles.quickLabel}>Pick an amount</p>
          <div className={styles.quick} role="group" aria-label="Gift card amounts">
            {QUICK.map((amount) => (
              <button key={amount} type="button" onClick={() => chooseAmount(amount)}>${amount}</button>
            ))}
            <button type="button" onClick={scrollToBuilder}>Custom</button>
          </div>
          <dl className={styles.heroFacts}>
            <div><dt>Value</dt><dd>Never expires</dd></div>
            <div><dt>Works on</dt><dd>Any service</dd></div>
            <div><dt>Pay with</dt><dd>Venmo / Zelle</dd></div>
          </dl>
        </div>
        <div className={styles.heroCard} aria-hidden="true">
          <GiftCardFace amount={250} />
        </div>
      </div>
    </section>
  );
}
