"use client";

import { FormEvent, useMemo, useState } from "react";

const PRESETS = [100, 150, 250, 400];

type Result = { reference: string; amount: number; paymentMethod: "venmo" | "zelle"; paymentTarget?: string; paymentUrl?: string };

export function GiftCardPurchaseForm() {
  const [preset, setPreset] = useState<number | "custom">(250);
  const [custom, setCustom] = useState(250);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const amount = useMemo(() => preset === "custom" ? custom : preset, [preset, custom]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());

    try {
      const response = await fetch("/api/gift-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, amount }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "We couldn't create the gift card request.");
      setResult({ reference: data.reference, amount: data.amount, paymentMethod: data.paymentMethod, paymentTarget: data.paymentTarget, paymentUrl: data.paymentUrl });
      event.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    return (
      <div className="gift-success" role="status">
        <span className="gift-success-kicker">REQUEST CREATED / {result.reference}</span>
        <h2>${result.amount} gift card reserved.</h2>
        <p>
          Your card is waiting for payment confirmation. Send ${result.amount} by {result.paymentMethod === "venmo" ? "Venmo" : "Zelle"}{result.paymentTarget ? <> to <strong>{result.paymentTarget}</strong></> : " using the Every Detail payment details you already have"} and include <strong>{result.reference}</strong> in the note. Once the team confirms payment, the gift card becomes active.
        </p>
        {result.paymentUrl && <a href={result.paymentUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary gift-pay-link">Open Venmo ↗</a>}
        {!result.paymentTarget && <p className="gift-payment-help">First time paying us this way? Text <a href="sms:+14048550672">(404) 855-0672</a> and we’ll send the correct payment details.</p>}
        <div className="gift-success-note">
          <b>Nothing gets sent early.</b>
          <span>If you chose recipient delivery, the card is sent after payment is approved. They do not need an account to use it.</span>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => setResult(null)}>Buy another gift card</button>
      </div>
    );
  }

  return (
    <form className="gift-form" onSubmit={submit}>
      <div className="gift-form-section">
        <div className="gift-form-step"><b>01</b><span>Choose the value</span></div>
        <div className="gift-amount-grid">
          {PRESETS.map((value) => (
            <button key={value} type="button" className={preset === value ? "is-active" : ""} onClick={() => setPreset(value)}>${value}</button>
          ))}
          <button type="button" className={preset === "custom" ? "is-active" : ""} onClick={() => setPreset("custom")}>Custom</button>
        </div>
        {preset === "custom" && (
          <label className="gift-custom-amount"><span>Custom amount</span><div><b>$</b><input type="number" min="25" max="2000" step="5" value={custom} onChange={(e) => setCustom(Number(e.target.value))} required /></div></label>
        )}
      </div>

      <div className="gift-form-section">
        <div className="gift-form-step"><b>02</b><span>Who is it for?</span></div>
        <div className="gift-fields gift-fields-2">
          <label><span>Recipient name</span><input name="recipientName" autoComplete="name" required placeholder="Their name" /></label>
          <label><span>Recipient email <small>recommended</small></span><input name="recipientEmail" type="email" autoComplete="email" placeholder="For delivery + automatic account linking" /></label>
        </div>
        <label className="gift-message"><span>Gift message <small>optional</small></span><textarea name="message" maxLength={300} rows={3} placeholder="A clean car is on me." /></label>
        <fieldset className="gift-choice-row">
          <legend>When approved, send the gift card to</legend>
          <label><input type="radio" name="deliveryMode" value="purchaser" defaultChecked /><span>Me, so I can give it myself</span></label>
          <label><input type="radio" name="deliveryMode" value="recipient" /><span>The recipient by email</span></label>
        </fieldset>
      </div>

      <div className="gift-form-section">
        <div className="gift-form-step"><b>03</b><span>Your details + payment</span></div>
        <div className="gift-fields gift-fields-2">
          <label><span>Your name</span><input name="purchaserName" autoComplete="name" required /></label>
          <label><span>Your email</span><input name="purchaserEmail" type="email" autoComplete="email" required /></label>
          <label><span>Your phone <small>optional</small></span><input name="purchaserPhone" type="tel" autoComplete="tel" /></label>
          <label><span>Payment method</span><select name="paymentMethod" defaultValue="venmo"><option value="venmo">Venmo</option><option value="zelle">Zelle</option></select></label>
        </div>
      </div>

      <div className="gift-form-submit">
        <div><span>TOTAL</span><strong>${Number.isFinite(amount) ? amount : 0}</strong><small>Payment is confirmed manually before activation.</small></div>
        <button className="btn btn-primary" disabled={busy || amount < 25 || amount > 2000}>{busy ? "Creating…" : "Continue to payment ↗"}</button>
      </div>
      {error && <p className="gift-form-error" role="alert">{error}</p>}
    </form>
  );
}
