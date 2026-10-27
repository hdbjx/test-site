"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Honeypot } from "@/components/forms/parts";
import { TurnstileField } from "@/components/forms/TurnstileField";
import { track } from "@/lib/analytics";
import { GiftCardFace } from "./GiftCardFace";
import styles from "./gift.module.css";

const PRESETS = [100, 150, 250, 400];

type Result = { reference: string; amount: number; paymentMethod: "venmo" | "zelle"; paymentTarget?: string; paymentUrl?: string };

export function GiftCardPurchaseForm() {
  const [preset, setPreset] = useState<number | "custom">(250);
  const [custom, setCustom] = useState(250);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [deliveryMode, setDeliveryMode] = useState<"purchaser" | "recipient">("purchaser");
  // Live preview on the card while they type.
  const [to, setTo] = useState("");
  const [note, setNote] = useState("");
  const amount = useMemo(() => (preset === "custom" ? custom : preset), [preset, custom]);

  useEffect(() => {
    const onAmount = (event: Event) => {
      const amount = Number((event as CustomEvent<number>).detail);
      if (PRESETS.includes(amount)) setPreset(amount);
    };
    window.addEventListener("ed:gift-amount", onAmount);
    return () => window.removeEventListener("ed:gift-amount", onAmount);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEl = event.currentTarget; // currentTarget is gone after the await below
    setBusy(true);
    setError("");
    const form = new FormData(formEl);
    const body = Object.fromEntries(form.entries());

    try {
      const response = await fetch("/api/gift-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, amount }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "We couldn't create the gift card request.");
      track("gift_card_submit", { amount: data.amount ?? amount });
      setResult({
        reference: data.reference,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        paymentTarget: data.paymentTarget,
        paymentUrl: data.paymentUrl,
      });
      formEl.reset();
      setTo("");
      setNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    return (
      <div className={styles.success} role="status">
        <span className={styles.successKicker}>REQUEST CREATED · {result.reference}</span>
        <h2>Your gift card is waiting for payment.</h2>
        <p>
          Send <strong>${result.amount}</strong> by {result.paymentMethod === "venmo" ? "Venmo" : "Zelle"}
          {result.paymentTarget ? <> to <strong>{result.paymentTarget}</strong></> : " using the Every Detail payment details you already have"} and include <strong>{result.reference}</strong> in the note.
          Once the team confirms payment, the gift card becomes active. We normally review gift-card payments the same day during business hours.
        </p>

        <div className={styles.successMeta}>
          <div><span>Amount</span><strong>${result.amount}</strong></div>
          <div><span>Reference</span><strong>{result.reference}</strong></div>
          <div><span>Payment</span><strong>{result.paymentMethod === "venmo" ? "Venmo" : "Zelle"}</strong></div>
        </div>

        <div className={styles.successNote}>
          <b>What happens next</b>
          <span>If you chose recipient delivery, we do not send it early. The card is delivered only after payment is approved.</span>
          <span>The recipient does not need an account to use it.</span>
        </div>

        <div className={styles.successActions}>
          {result.paymentUrl && (
            <a href={result.paymentUrl} target="_blank" rel="noopener noreferrer" className={styles.submit}>
              Open Venmo ↗
            </a>
          )}
          <button type="button" className={styles.secondary} onClick={() => { setResult(null); setTo(""); setNote(""); }}>
            Buy another gift card
          </button>
        </div>

        {!result.paymentTarget && (
          <p className={styles.help}>
            Need payment details? Text <a href="sms:+14048550672">(404) 855-0672</a> and we’ll send them.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={styles.builder}>
      <aside className={styles.previewCol}>
        <p className={styles.kickerDark}>Live preview</p>
        <GiftCardFace amount={amount} to={to} message={note} className={styles.previewCard} />
        <ul className={styles.points}>
          <li><strong>Any service</strong><span>Use it on any detail, add-on or upgrade.</span></li>
          <li><strong>No account needed</strong><span>They can redeem the code without signing up.</span></li>
          <li><strong>Balance carries over</strong><span>Whatever they don&apos;t use stays on the card.</span></li>
        </ul>
      </aside>
    <form className={styles.form} onSubmit={submit}>
      <Honeypot />
      <TurnstileField action="gift_order" />
      <div className={styles.section}>
        <div className={styles.step}><b>01</b><span>Choose the value</span></div>
        <div className={styles.amounts}>
          {PRESETS.map((value) => (
            <button key={value} type="button" aria-pressed={preset === value} onClick={() => setPreset(value)}>
              ${value}
            </button>
          ))}
          <button type="button" aria-pressed={preset === "custom"} onClick={() => setPreset("custom")}>Custom</button>
        </div>
        {preset === "custom" && (
          <label className={styles.custom}>
            <span>Custom amount</span>
            <div><b>$</b><input type="number" min="25" max="2000" step="5" value={custom} onChange={(e) => setCustom(Number(e.target.value))} required /></div>
          </label>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.step}><b>02</b><span>Who is it for?</span></div>
        <div className={styles.fields}>
          <label><span>Recipient name</span><input name="recipientName" autoComplete="name" required placeholder="Their name" value={to} onChange={(e) => setTo(e.target.value)} /></label>
          <label><span>Recipient email <small>{deliveryMode === "recipient" ? "required for direct delivery" : "optional but recommended"}</small></span><input name="recipientEmail" type="email" autoComplete="email" required={deliveryMode === "recipient"} placeholder="For delivery and later account linking" /></label>
        </div>
        <label className={styles.field}><span>Gift message <small>optional</small></span><textarea name="message" maxLength={300} rows={3} placeholder="A clean car is on me." value={note} onChange={(e) => setNote(e.target.value)} /></label>
        <fieldset className={styles.choices}>
          <legend>When approved, send the gift card to</legend>
          <label><input type="radio" name="deliveryMode" value="purchaser" checked={deliveryMode === "purchaser"} onChange={() => setDeliveryMode("purchaser")} /><span>Me, so I can give it myself</span></label>
          <label><input type="radio" name="deliveryMode" value="recipient" checked={deliveryMode === "recipient"} onChange={() => setDeliveryMode("recipient")} /><span>The recipient by email</span></label>
        </fieldset>
      </div>

      <div className={styles.section}>
        <div className={styles.step}><b>03</b><span>Your details + payment</span></div>
        <div className={styles.fields}>
          <label><span>Your name</span><input name="purchaserName" autoComplete="name" required placeholder="Your full name" /></label>
          <label><span>Your email</span><input name="purchaserEmail" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
          <label><span>Your phone <small>optional</small></span><input name="purchaserPhone" type="tel" autoComplete="tel" placeholder="(404) 555-0123" /></label>
          <label>
            <span>Payment method</span>
            <select name="paymentMethod" defaultValue="venmo">
              <option value="venmo">Venmo</option>
              <option value="zelle">Zelle</option>
            </select>
          </label>
        </div>
      </div>

      <div className={styles.total}>
        <div>
          <span>Total</span>
          <strong>${Number.isFinite(amount) ? amount : 0}</strong>
          <small>Activation happens after we confirm payment, normally the same day during business hours.</small>
        </div>
        <button className={styles.submit} disabled={busy || amount < 25 || amount > 2000}>
          {busy ? "Creating…" : "Continue to payment ↗"}
        </button>
      </div>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <p className={styles.terms}>Purchased gift-card value does not expire and has no inactivity fee. Terms are included with the gift card when it is activated.</p>
    </form>
    </div>
  );
}
