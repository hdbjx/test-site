import styles from "./gift.module.css";

type Props = { amount: number; to?: string; message?: string; className?: string };

/**
 * The printed gift card, used in the hero and as the live preview while building a gift.
 * Retro ticket layout: the main face (logo, amount, who it's for) and a perforated stub on the right.
 * Everything is sized in container units (cqw), so it scales cleanly from a phone preview to the hero.
 */
export function GiftCardFace({ amount, to, message, className = "" }: Props) {
  const value = Number.isFinite(amount) && amount > 0 ? amount : 0;
  return (
    <div className={`${styles.card} ed-paper ed-paper--coral ed-paper--crumpled ${className}`}>
      <div className={styles.cardMain}>
        <div className={styles.cardTop}>
          <span className={styles.cardLogo} role="img" aria-label="Every Detail" />
        </div>
        <p className={styles.cardAmount}><sup>$</sup>{value}</p>
        <dl className={styles.cardLines}>
          <dt>For</dt><dd>{to?.trim() || "Someone with a car"}</dd>
          <dt>Note</dt><dd>{message?.trim() || "A clean car is on me."}</dd>
        </dl>
      </div>
      <div className={styles.cardStub}>
        <span>Gift card</span>
        <small>Decatur · ATL</small>
      </div>
    </div>
  );
}
