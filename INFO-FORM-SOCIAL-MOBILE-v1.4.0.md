# v1.4.0 social sharing, mobile text CTA, and client info form

- Uses `public/images/every-detail-social.png` as the default Open Graph/Twitter share image.
- Homepage share copy is conversion-focused and uses the new social image.
- Mobile sticky CTA and mobile menu now open SMS instead of a phone call.
- Adds unlinked, noindex `/info-form` with full name, phone, email, and service address.
- Adds `/api/contact`, which validates the four fields and upserts the canonical `public.clients` contact through the existing `upsert_website_contact` RPC.
- `/info-form` is intentionally absent from navigation and the sitemap.
