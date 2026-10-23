import { NextRequest, NextResponse } from "next/server";
import {
  sendDayOfJobConfirmationEmail,
  sendJobCancellationEmail,
  sendJobReminderEmail,
  sendJobRescheduledEmail,
  type DayOfTeamMember,
} from "@/lib/email";
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

type JobChangeEvent = {
  id: string;
  job_id: string;
  event_kind: "rescheduled" | "cancelled";
  customer_name: string | null;
  email: string;
  address: string | null;
  service_name: string | null;
  vehicle: string | null;
  previous_scheduled_start: string | null;
  scheduled_start: string | null;
};

type WorkerResult = {
  claimed: number;
  sent: number;
  failed: number;
  skipped: number;
};

type AssignmentRow = {
  staff_id: string | null;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  can_lead_jobs: boolean | null;
};

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

async function loadAssignedTeam(admin: ReturnType<typeof supabaseAdmin>, jobId: string): Promise<DayOfTeamMember[]> {
  const { data: assignments, error: assignmentError } = await admin
    .from("job_assignments")
    .select("staff_id")
    .eq("job_id", jobId);

  if (assignmentError) throw assignmentError;

  const assignmentRows = (assignments ?? []) as AssignmentRow[];
  const staffIds = [...new Set(assignmentRows.map((row) => String(row.staff_id || "")).filter(Boolean))];
  if (!staffIds.length) return [];

  const { data: profiles, error: profileError } = await admin
    .from("profiles")
    .select("id,full_name,can_lead_jobs")
    .in("id", staffIds);

  if (profileError) throw profileError;

  const profileRows = (profiles ?? []) as ProfileRow[];

  return profileRows
    .filter((profile) => typeof profile.full_name === "string" && profile.full_name.trim())
    .map((profile): DayOfTeamMember => ({
      name: String(profile.full_name).trim(),
      isLead: Boolean(profile.can_lead_jobs),
    }))
    .sort((a, b) => {
      if (a.isLead !== b.isLead) return a.isLead ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}


function localDateKey(value: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);

  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

async function loadTodayTestJob(
  admin: ReturnType<typeof supabaseAdmin>,
  requestedJobId?: string | null,
): Promise<ReminderJob | null> {
  const timeZone = process.env.BOOKING_TIMEZONE || "America/New_York";
  const now = new Date();
  const todayKey = localDateKey(now, timeZone);

  let query = admin
    .from("jobs")
    .select("id,customer_name,email,address,service_name,vehicle,scheduled_start,status")
    .not("scheduled_start", "is", null)
    .neq("status", "cancelled")
    .gte("scheduled_start", new Date(now.getTime() - 30 * 60 * 60 * 1000).toISOString())
    .lte("scheduled_start", new Date(now.getTime() + 30 * 60 * 60 * 1000).toISOString())
    .order("scheduled_start", { ascending: true });

  if (requestedJobId) query = query.eq("id", requestedJobId);

  const { data, error } = await query.limit(50);
  if (error) throw error;

  const jobs = ((data ?? []) as Array<ReminderJob & { status?: string | null }>).filter((job) =>
    Boolean(job.scheduled_start) && localDateKey(new Date(job.scheduled_start), timeZone) === todayKey,
  );

  if (!jobs.length) return null;
  if (requestedJobId) return jobs[0] ?? null;

  // Prefer the next appointment today. If all of today's jobs have started,
  // use the most recent one so the test still reflects a real same-day job.
  const upcoming = jobs.find((job) => new Date(job.scheduled_start).getTime() >= now.getTime());
  return upcoming ?? jobs[jobs.length - 1] ?? null;
}

async function processJobChangeEmails(admin: ReturnType<typeof supabaseAdmin>): Promise<WorkerResult> {
  const { data, error } = await admin.rpc("claim_customer_job_change_emails", {
    p_limit: MAX_PER_RUN,
  });

  if (error) {
    if (String(error.code || "") === "PGRST202" || /claim_customer_job_change_emails/i.test(String(error.message || ""))) {
      console.warn("[job-reminders] customer job change email migration is not installed yet");
      return { claimed: 0, sent: 0, failed: 0, skipped: 0 };
    }
    throw error;
  }

  const events = (data ?? []) as JobChangeEvent[];
  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const event of events) {
    try {
      if (!event.email || !event.scheduled_start) throw new Error("Customer job change event is missing email or appointment time");

      // Re-read the job so a rapid second reschedule/cancellation cannot send an
      // outdated lifecycle email that was already claimed by this worker.
      const { data: currentJob, error: validationError } = await admin
        .from("jobs")
        .select("id,status,email,scheduled_start")
        .eq("id", event.job_id)
        .maybeSingle();
      if (validationError) throw validationError;

      const emailStillMatches = String(currentJob?.email || "").trim().toLowerCase() === event.email.trim().toLowerCase();
      const stillCurrent = event.event_kind === "cancelled"
        ? Boolean(currentJob && String(currentJob.status) === "cancelled" && emailStillMatches)
        : Boolean(currentJob && String(currentJob.status) !== "cancelled" && currentJob.scheduled_start === event.scheduled_start && emailStillMatches);

      if (!stillCurrent) {
        skipped += 1;
        const discard = await admin.rpc("discard_customer_job_change_email", {
          p_event_id: event.id,
          p_reason: "Skipped stale customer lifecycle email event",
        });
        if (discard.error) console.error("[job-reminders] lifecycle discard", discard.error);
        continue;
      }

      const input = {
        name: event.customer_name || "there",
        email: event.email,
        address: event.address || "Your scheduled service address",
        service: event.service_name || "Detail",
        vehicle: event.vehicle || "Your vehicle",
        start: event.scheduled_start,
        previousStart: event.previous_scheduled_start,
      };

      const result = event.event_kind === "cancelled"
        ? await sendJobCancellationEmail(input)
        : await sendJobRescheduledEmail(input);

      if (!result.ok) throw new Error("Email provider did not confirm customer job change delivery request");

      const complete = await admin.rpc("finish_customer_job_change_email", {
        p_event_id: event.id,
        p_sent: true,
        p_provider_message_id: "id" in result ? result.id || null : null,
        p_error: null,
      });
      if (complete.error) throw complete.error;
      sent += 1;
    } catch (sendError) {
      failed += 1;
      console.error(`[job-reminders] lifecycle ${event.id}`, sendError);
      const release = await admin.rpc("finish_customer_job_change_email", {
        p_event_id: event.id,
        p_sent: false,
        p_provider_message_id: null,
        p_error: sendError instanceof Error ? sendError.message : String(sendError),
      });
      if (release.error) console.error("[job-reminders] lifecycle release", release.error);
    }
  }

  return { claimed: events.length, sent, failed, skipped };
}

async function processDayOfConfirmations(admin: ReturnType<typeof supabaseAdmin>): Promise<WorkerResult> {
  const { data, error } = await admin.rpc("claim_customer_day_of_email_confirmations", {
    p_limit: MAX_PER_RUN,
  });

  if (error) {
    // Allows the website to be deployed before the migration without breaking
    // the existing 24-hour reminder worker.
    if (String(error.code || "") === "PGRST202" || /claim_customer_day_of_email_confirmations/i.test(String(error.message || ""))) {
      console.warn("[job-reminders] day-of confirmation migration is not installed yet");
      return { claimed: 0, sent: 0, failed: 0, skipped: 0 };
    }
    throw error;
  }

  const jobs = (data ?? []) as ReminderJob[];
  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const job of jobs) {
    try {
      if (!job.email || !job.scheduled_start) throw new Error("Day-of job is missing email or scheduled start");

      const { data: currentJob, error: validationError } = await admin
        .from("jobs")
        .select("id,status,email,scheduled_start,customer_day_of_email_claimed_at")
        .eq("id", job.id)
        .maybeSingle();

      if (validationError) throw validationError;

      const stillCurrent =
        currentJob &&
        ["booked", "assigned"].includes(String(currentJob.status)) &&
        currentJob.customer_day_of_email_claimed_at &&
        currentJob.scheduled_start === job.scheduled_start &&
        String(currentJob.email || "").trim().toLowerCase() === job.email.trim().toLowerCase();

      if (!stillCurrent) {
        skipped += 1;
        console.info(`[job-reminders] skipped stale day-of claim ${job.id}`);
        const release = await admin.rpc("finish_customer_day_of_email_confirmation", {
          p_job_id: job.id,
          p_scheduled_start: job.scheduled_start,
          p_sent: false,
        });
        if (release.error) console.error("[job-reminders] day-of stale release", release.error);
        continue;
      }

      const team = await loadAssignedTeam(admin, job.id);
      if (!team.length) {
        skipped += 1;
        console.info(`[job-reminders] day-of crew disappeared before send ${job.id}`);
        const release = await admin.rpc("finish_customer_day_of_email_confirmation", {
          p_job_id: job.id,
          p_scheduled_start: job.scheduled_start,
          p_sent: false,
        });
        if (release.error) console.error("[job-reminders] day-of crew release", release.error);
        continue;
      }

      const result = await sendDayOfJobConfirmationEmail({
        name: job.customer_name || "",
        email: job.email,
        address: job.address || "Your scheduled service address",
        service: job.service_name || "Detail",
        vehicle: job.vehicle || "Your vehicle",
        start: job.scheduled_start,
        team,
      });

      if (!result.ok) throw new Error("Email provider did not confirm day-of delivery request");

      const complete = await admin.rpc("finish_customer_day_of_email_confirmation", {
        p_job_id: job.id,
        p_scheduled_start: job.scheduled_start,
        p_sent: true,
      });
      if (complete.error) throw complete.error;
      sent += 1;
    } catch (sendError) {
      failed += 1;
      console.error(`[job-reminders] day-of ${job.id}`, sendError);
      const release = await admin.rpc("finish_customer_day_of_email_confirmation", {
        p_job_id: job.id,
        p_scheduled_start: job.scheduled_start,
        p_sent: false,
      });
      if (release.error) console.error("[job-reminders] day-of release", release.error);
    }
  }

  return { claimed: jobs.length, sent, failed, skipped };
}

async function processTomorrowReminders(admin: ReturnType<typeof supabaseAdmin>): Promise<WorkerResult> {
  const { data, error } = await admin.rpc("claim_customer_email_reminders", {
    p_limit: MAX_PER_RUN,
  });

  if (error) throw error;

  const jobs = (data ?? []) as ReminderJob[];
  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const job of jobs) {
    try {
      if (!job.email || !job.scheduled_start) throw new Error("Reminder job is missing email or scheduled start");

      // Re-read the job immediately before sending. A reschedule trigger clears
      // customer_reminder_email_claimed_at, so a stale claim is rejected here.
      const { data: currentJob, error: validationError } = await admin
        .from("jobs")
        .select("id,status,email,scheduled_start,customer_reminder_email_claimed_at")
        .eq("id", job.id)
        .maybeSingle();

      if (validationError) throw validationError;

      const stillCurrent =
        currentJob &&
        ["booked", "assigned"].includes(String(currentJob.status)) &&
        currentJob.customer_reminder_email_claimed_at &&
        currentJob.scheduled_start === job.scheduled_start &&
        String(currentJob.email || "").trim().toLowerCase() === job.email.trim().toLowerCase();

      if (!stillCurrent) {
        skipped += 1;
        console.info(`[job-reminders] skipped stale claim ${job.id}`);
        const release = await admin.rpc("finish_customer_email_reminder", {
          p_job_id: job.id,
          p_scheduled_start: job.scheduled_start,
          p_sent: false,
        });
        if (release.error) console.error("[job-reminders] stale release", release.error);
        continue;
      }

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

  return { claimed: jobs.length, sent, failed, skipped };
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const testEmail = request.nextUrl.searchParams.get("testEmail")?.trim();
  const testType = request.nextUrl.searchParams.get("type")?.trim().toLowerCase();

  if (testEmail) {
    if (testType === "dayof") {
      const admin = supabaseAdmin();
      const useTodayJob = request.nextUrl.searchParams.get("useToday") === "1";
      const requestedJobId = request.nextUrl.searchParams.get("jobId")?.trim() || null;

      let input = {
        name: "Wiley",
        email: testEmail,
        address: "123 Example Drive, Decatur, GA",
        service: "Premium Detail",
        vehicle: "Toyota RAV4",
        start: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        team: [
          { name: "Wiley", isLead: true },
          { name: "Davis", isLead: false },
        ] as DayOfTeamMember[],
      };
      let sourceJob: ReminderJob | null = null;

      if (useTodayJob || requestedJobId) {
        sourceJob = await loadTodayTestJob(admin, requestedJobId);
        if (!sourceJob) {
          return NextResponse.json(
            { ok: false, test: true, type: "dayOf", error: requestedJobId ? "That job is not scheduled for today" : "No job scheduled for today was found" },
            { status: 404 },
          );
        }

        const team = await loadAssignedTeam(admin, sourceJob.id);
        if (!team.length) {
          return NextResponse.json(
            { ok: false, test: true, type: "dayOf", jobId: sourceJob.id, error: "Today's job has no assigned team yet" },
            { status: 409 },
          );
        }

        input = {
          name: sourceJob.customer_name || "there",
          email: testEmail,
          address: sourceJob.address || "Your scheduled service address",
          service: sourceJob.service_name || "Detail",
          vehicle: sourceJob.vehicle || "Your vehicle",
          start: sourceJob.scheduled_start,
          team,
        };
      }

      const result = await sendDayOfJobConfirmationEmail(input);

      if (!result.ok) {
        console.error("[job-reminders] day-of test email failed", result);
        return NextResponse.json({ ok: false, test: true, type: "dayOf", error: "Email provider did not confirm delivery request" }, { status: 502 });
      }

      return NextResponse.json({
        ok: true,
        test: true,
        type: "dayOf",
        sent: 1,
        recipient: testEmail,
        usedLiveJob: Boolean(sourceJob),
        ...(sourceJob ? {
          jobId: sourceJob.id,
          customerName: sourceJob.customer_name,
          scheduledStart: sourceJob.scheduled_start,
          service: sourceJob.service_name,
          vehicle: sourceJob.vehicle,
          team: input.team.map((member) => member.name),
        } : {}),
      });
    }

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
      return NextResponse.json({ ok: false, test: true, type: "tomorrow", error: "Email provider did not confirm delivery request" }, { status: 502 });
    }

    return NextResponse.json({ ok: true, test: true, type: "tomorrow", sent: 1 });
  }

  const admin = supabaseAdmin();

  try {
    // Lifecycle changes go first so a cancellation or reschedule confirmation
    // gets out before routine reminder work. Day-of stays ahead of tomorrow.
    const lifecycle = await processJobChangeEmails(admin);
    const dayOf = await processDayOfConfirmations(admin);
    const tomorrow = await processTomorrowReminders(admin);

    return NextResponse.json({
      ok: true,
      lifecycle,
      dayOf,
      tomorrow,
      claimed: lifecycle.claimed + dayOf.claimed + tomorrow.claimed,
      sent: lifecycle.sent + dayOf.sent + tomorrow.sent,
      failed: lifecycle.failed + dayOf.failed + tomorrow.failed,
      skipped: lifecycle.skipped + dayOf.skipped + tomorrow.skipped,
    });
  } catch (error) {
    console.error("[job-reminders] worker", error);
    return NextResponse.json({ ok: false, error: "Could not process customer reminders" }, { status: 500 });
  }
}
