import styles from "./gift.module.css";

type Props = { amount: number; to?: string; message?: string; className?: string };

/** The printed-card look used in the hero and as the live preview while building a gift. */
export function GiftCardFace({ amount, to, message, className = "" }: Props) {
  return (
    <div className={`${styles.card} ed-paper ed-paper--coral ed-paper--crumpled ${className}`}>
      <div className={styles.cardTop}><span>Every Detail</span><b>Gift card</b></div>
      <p className={styles.cardAmount}>${Number.isFinite(amount) && amount > 0 ? amount : 0}</p>
      <dl className={styles.cardLines}>
        <dt>For</dt><dd>{to?.trim() || "Someone with a car"}</dd>
        <dt>Note</dt><dd>{message?.trim() || "A clean car is on me."}</dd>
        <dt>Good for</dt><dd>Any detail, add-on or upgrade</dd>
      </dl>
      <i className={styles.cardMark}>ED</i>
    </div>
  );
}
