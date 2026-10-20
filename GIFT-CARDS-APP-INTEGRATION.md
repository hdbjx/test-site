# Every Detail Gift Cards + Rewards: app integration contract

The website and app should use the same Supabase source of truth. Purchased gift-card value and earned rewards are intentionally separate ledgers, but the app can present them together as **Available credit**.

## Recipient behavior

A gift-card recipient does **not** get an account created automatically.

- The active gift card works by code immediately.
- `recipient_email` is stored on the card.
- If the recipient later creates/signs into an Every Detail customer account with that same email, `claim_my_gift_cards()` automatically attaches the card to their client record.
- This avoids creating fake customer accounts for people who have never used Every Detail.

## Manager gift-card queue

Read `gift_card_orders` where `status = 'pending_payment'`, newest first. Primary action: **Approve payment**.

```ts
supabase.rpc('approve_gift_card_order', { p_order_id: order.id })
```

The RPC is idempotent and returns the new `ED-XXXX-XXXX-XXXX` card code.

After approval, send the activation message to:

- `recipient_email` when `delivery_mode = 'recipient'`
- otherwise `purchaser_email`

Include the card code, value, gift message, and booking link.

## Checkout credit UI

For a job with a known `client_id`, call:

```ts
supabase.rpc('get_checkout_credit', { p_client_id: job.client_id })
```

Recommended UI:

```text
Available credit     $185.00
Rewards               $35.00
Gift cards            $150.00

[ Apply rewards ]
[ Apply gift card ]
```

Rewards and gift cards remain separate transactions even though they are shown together.

## Redeem rewards at checkout

```ts
supabase.rpc('redeem_rewards', {
  p_client_id: job.client_id,
  p_amount_cents: amountToApply,
  p_job_id: job.id,
  p_note: 'Applied at checkout'
})
```

The RPC locks the wallet, rejects insufficient balances, updates lifetime redeemed value, and writes `reward_transactions`.

Managers can add earned/promotional credit with:

```ts
supabase.rpc('award_rewards', {
  p_client_id: client.id,
  p_amount_cents: rewardAmount,
  p_note: 'Referral reward',
  p_job_id: null
})
```

## Redeem gift cards at checkout

```ts
supabase.rpc('redeem_gift_card', {
  p_code: code,
  p_amount_cents: amountToApply,
  p_job_id: job.id,
  p_note: 'Applied at checkout'
})
```

## Recommended payment order

Use promotional rewards first, then gift-card value, then the customer's normal payment method. Each source should remain separately itemized on the receipt.
