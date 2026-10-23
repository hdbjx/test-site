# Every Detail Supabase Auth email templates

These templates match the V98 customer email system. Hosted Supabase projects manage Auth email templates in the Supabase Dashboard, not through the website deploy.

Recommended mapping:

- Confirm sign up: `confirmation.html`
- Reset password: `recovery.html`
- Magic link: `magic_link.html`
- Invite user: `invite.html`
- Change email address: `email_change.html`

All templates use the supported `{{ .ConfirmationURL }}` variable. Paste the HTML into the corresponding Auth email template in Supabase. Keep production email-link tracking disabled if your SMTP provider rewrites authentication links.
