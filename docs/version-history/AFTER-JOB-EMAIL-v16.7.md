# After-job email v16.7

- Adds `/api/cron/after-job-followups` using the existing CRON_SECRET + Resend infrastructure.
- Claims due `after_job_followups` atomically and retries failures up to 3 attempts.
- Uses durable `job_media` before/after photos in a branded 50/50 email split.
- Generates and attaches a dependency-free PDF receipt when enabled.
- Review and Detail+ remain optional modules controlled by the Van HQ follow-up record.
- Review defaults ON. Existing-review status is not inferred from checkout because the current source of truth is the external sheet.
- SQL migration cancels pre-worker historical backfill rows before enabling the sender, preventing old completed jobs from receiving surprise emails.
- Cron reuses `customer_reminder_cron_secret` and runs every 5 minutes.
