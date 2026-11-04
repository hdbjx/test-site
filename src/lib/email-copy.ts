/**
 * Customer email wording set in Team HQ → Settings. Kept apart from email.ts
 * so the browser bundle (which applies settings too) doesn't pull in the
 * email sender.
 */
export type EmailKind = "booking" | "reminder" | "day_of" | "after_job" | "detail_plus_week" | "rescheduled" | "cancelled";
export type EmailCopyOverride = { enabled?: boolean; subject?: string; headline?: string; intro?: string };

let overrides: Partial<Record<EmailKind, EmailCopyOverride>> = {};
let reviewUrl: string | null = null;

export function setEmailCopy(next: Partial<Record<EmailKind, EmailCopyOverride>> | null | undefined) {
  overrides = next ?? {};
}
export const emailOverride = (kind: EmailKind): EmailCopyOverride => overrides[kind] ?? {};

/** Google review link for the after-job email. */
export function setReviewUrl(url: string | null | undefined) {
  reviewUrl = url && /^https:\/\//.test(url) ? url : null;
}
export const liveReviewUrl = () => reviewUrl;
