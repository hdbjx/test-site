# Gift Cards v18.4 - End-to-End Delivery Pass

## Website
- Refined the gift-card page around the red Every Detail card visual instead of the oversized black hero.
- Improved form hierarchy, spacing, direct-delivery validation, success state, legal disclosure, and rewards/account messaging.
- The initial request email now uses the same visual system as the gift card.
- Added a protected `/api/gift-cards/activated` endpoint for final delivery after manager approval.

## Final delivery
- Endpoint requires a valid Supabase bearer token and an active `manager` or `admin` profile.
- Purchaser delivery sends the activated card to the purchaser.
- Recipient delivery sends the activated card to the recipient and sends a delivery confirmation to the purchaser.
- Final email includes the gift card design, value, code, gift message, booking/account actions, and balance behavior.

## Team app contract
- Build 79 calls the protected delivery endpoint after `approve_gift_card_order` succeeds.
- If email delivery fails, activation remains valid and the manager sees a clear failure message.
- Managers can retry from the active-card directory with `EMAIL CARD`.

## SQL
No new SQL is required for v18.4/Build 79. This pass uses the existing gift card schema and approval RPC.
