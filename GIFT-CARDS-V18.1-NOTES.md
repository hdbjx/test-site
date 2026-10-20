# Gift Cards v18.1

- Venmo fallback is now `@Every-Detail` with `https://venmo.com/u/Every-Detail`.
- Zelle fallback is now `404-268-7748 · Joseph Perreault`.
- Payment destinations are returned only after a gift-card order is successfully created.
- Recipient copy now makes clear that no customer account is required to receive or redeem a gift card.
- Cards automatically link later if the recipient creates an account using the same email.
- Added `rewards-v1.sql` for a separate rewards wallet/ledger.
- Customer account now shows rewards + gift-card value as combined Available credit while retaining separate balances.
- Added checkout RPCs for app use: `get_checkout_credit`, `redeem_rewards`, and `award_rewards`.
