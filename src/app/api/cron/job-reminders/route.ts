import { NextRequest, NextResponse } from "next/server";
import { sendJobReminderEmail } from "@/lib/email";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PER_RUN = 25;

type ReminderJob = {
  id: string;
  customer_name: string | null;
  email: string | null;
  address: string | null;
  service_name: string | null;
  vehicle: string | null;
  scheduled_start: string;
};

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const testEmail = request.nextUrl.searchParams.get("testEmail")?.trim();

  if (testEmail) {
    const result = await sendJobReminderEmail({
      name: "Wiley",
      email: testEmail,
      address: "123 Example Drive, Decatur, GA",
      service: "Premium Detail",
      vehicle: "Toyota RAV4",
      start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    if (!result.ok) {
      console.error("[job-reminders] test email failed", result);
      return NextResponse.json({ ok: false, test: true, error: "Email provider did not confirm delivery request" }, { status: 502 });
    }

    return NextResponse.json({ ok: true, test: true, sent: 1 });
  }

  const admin = supabaseAdmin();
  const { data, error } = await admin.rpc("claim_customer_email_reminders", {
    p_limit: MAX_PER_RUN,
  });

  if (error) {
    console.error("[job-reminders] claim", error);
    return NextResponse.json({ ok: false, error: "Could not claim reminders" }, { status: 500 });
  }

  const jobs = (data ?? []) as ReminderJob[];
  let sent = 0;
  let failed = 0;

  for (const job of jobs) {
    try {
      if (!job.email || !job.scheduled_start) throw new Error("Reminder job is missing email or scheduled start");

      const result = await sendJobReminderEmail({
        name: job.customer_name || "there",
        email: job.email,
        address: job.address || "Your scheduled service address",
        service: job.service_name || "Detail",
        vehicle: job.vehicle || "Your vehicle",
        start: job.scheduled_start,
      });

      if (!result.ok) throw new Error("Email provider did not confirm delivery request");

      const complete = await admin.rpc("finish_customer_email_reminder", {
        p_job_id: job.id,
        p_scheduled_start: job.scheduled_start,
        p_sent: true,
      });
      if (complete.error) throw complete.error;
      sent += 1;
    } catch (sendError) {
      failed += 1;
      console.error(`[job-reminders] ${job.id}`, sendError);
      const release = await admin.rpc("finish_customer_email_reminder", {
        p_job_id: job.id,
        p_scheduled_start: job.scheduled_start,
        p_sent: false,
      });
      if (release.error) console.error("[job-reminders] release", release.error);
    }
  }

  return NextResponse.json({ ok: true, claimed: jobs.length, sent, failed });
}
