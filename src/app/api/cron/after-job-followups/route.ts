import { NextRequest, NextResponse } from "next/server";
import { sendAfterJobEmail } from "@/lib/email";
import { buildReceiptPdfBase64 } from "@/lib/receipt-pdf";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PER_RUN = 15;

type ClaimedFollowup = {
  id: string;
  job_id: string;
  include_receipt: boolean;
  include_review: boolean;
  include_detail_plus: boolean;
  attempt_count: number;
  recipient_override?: string | null;
};

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  return !!secret && request.headers.get("authorization") === `Bearer ${secret}`;
}

function n(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const admin = supabaseAdmin();
  await admin.rpc("recover_stuck_after_job_followups");

  const { data: dueData, error: dueError } = await admin.rpc("get_due_after_job_followups", { p_limit: MAX_PER_RUN });
  if (dueError) {
    console.error("[after-job-followups] due", dueError);
    return NextResponse.json({ ok: false, error: "Could not load due follow-ups" }, { status: 500 });
  }

  const dueRows = (dueData ?? []) as ClaimedFollowup[];
  let claimed = 0;
  let sent = 0;
  let failed = 0;

  for (const due of dueRows) {
    const { data: claimedData, error: claimError } = await admin.rpc("claim_after_job_followup", { p_followup_id: due.id });
    if (claimError) {
      console.error(`[after-job-followups] claim ${due.id}`, claimError);
      continue;
    }
    const followup = claimedData as ClaimedFollowup | null;
    if (!followup?.id) continue;
    claimed += 1;

    try {
      const { data: job, error: jobError } = await admin.from("jobs").select("*").eq("id", followup.job_id).maybeSingle();
      if (jobError) throw jobError;
      if (!job || String(job.status).toLowerCase() !== "complete") throw new Error("Job is no longer complete");
      const recipientEmail = String(followup.recipient_override || job.email || "").trim();
      if (!recipientEmail) throw new Error("Completed job has no customer email");

      const [{ data: vehicles, error: vehicleError }, { data: addons, error: addonError }, { data: media, error: mediaError }, { data: checkout }] = await Promise.all([
        admin.from("job_vehicles").select("id,vehicle_label,vehicle_size,service_name,price,sort_order,created_at").eq("job_id", followup.job_id).order("sort_order", { ascending: true }).order("created_at", { ascending: true }),
        admin.from("job_vehicle_addons").select("job_vehicle_id,addon_name,price,status,created_at").eq("job_id", followup.job_id).neq("status", "removed").order("created_at", { ascending: true }),
        admin.from("job_media").select("job_vehicle_id,vehicle_id,media_type,storage_path,created_at").eq("job_id", followup.job_id).in("media_type", ["before", "after"]).order("created_at", { ascending: true }),
        admin.from("van_hq_job_checkout").select("price_override").eq("job_id", followup.job_id).maybeSingle(),
      ]);
      if (vehicleError) throw vehicleError;
      if (addonError) throw addonError;
      if (mediaError) throw mediaError;

      const vehicleRows = vehicles ?? [];
      const addonRows = addons ?? [];
      const firstVehicle = vehicleRows[0];
      const vehicleLabel = vehicleRows.length > 1
        ? `${firstVehicle?.vehicle_label || job.vehicle || "Vehicle"} + ${vehicleRows.length - 1} more`
        : firstVehicle?.vehicle_label || job.vehicle || "Vehicle";
      const serviceLabel = vehicleRows.length > 1
        ? vehicleRows.map((v) => v.service_name).filter(Boolean).join(" + ") || job.service_name || "Detail"
        : firstVehicle?.service_name || job.service_name || "Detail";

      const receiptLines = vehicleRows.length
        ? vehicleRows.map((v) => ({ label: `${v.vehicle_label || "Vehicle"} - ${v.service_name || "Detail"}`, amount: n(v.price) }))
        : [{ label: String(job.service_name || "Detail"), amount: n(job.price ?? job.total_price) }];
      for (const addon of addonRows) receiptLines.push({ label: String(addon.addon_name || "Add-on"), amount: n(addon.price) });
      const calculatedTotal = receiptLines.reduce((sum, item) => sum + item.amount, 0);
      const override = checkout?.price_override == null ? null : n(checkout.price_override);
      const total = override ?? (calculatedTotal || n(job.price ?? job.total_price));

      const mediaRows = media ?? [];
      const primaryVehicleId = firstVehicle?.id || null;
      const relevantMedia = primaryVehicleId ? mediaRows.filter((m) => m.job_vehicle_id === primaryVehicleId) : mediaRows;
      const before = [...relevantMedia].reverse().find((m) => m.media_type === "before") || [...mediaRows].reverse().find((m) => m.media_type === "before");
      const after = [...relevantMedia].reverse().find((m) => m.media_type === "after") || [...mediaRows].reverse().find((m) => m.media_type === "after");
      const signed = async (path?: string | null) => {
        if (!path) return null;
        const { data: signedData, error: signedError } = await admin.storage.from("job-media").createSignedUrl(path, 60 * 60 * 24 * 365);
        if (signedError) throw signedError;
        return signedData.signedUrl;
      };
      const [beforeUrl, afterUrl] = await Promise.all([signed(before?.storage_path), signed(after?.storage_path)]);

      const completedAt = String(job.completed_at || new Date().toISOString());
      const receiptNumber = `ED-${String(followup.job_id).replace(/-/g, "").slice(0, 8).toUpperCase()}`;
      const receiptBase64 = followup.include_receipt ? buildReceiptPdfBase64({
        receiptNumber,
        customerName: String(job.customer_name || "Customer"),
        vehicle: vehicleLabel,
        service: serviceLabel,
        completedAt,
        lines: receiptLines,
        total,
      }) : undefined;

      const result = await sendAfterJobEmail({
        name: String(job.customer_name || "there"),
        email: recipientEmail,
        vehicle: vehicleLabel,
        service: serviceLabel,
        completedAt,
        total,
        receiptNumber,
        lines: receiptLines,
        beforeUrl,
        afterUrl,
        includeReceipt: !!followup.include_receipt,
        includeReview: !!followup.include_review,
        includeDetailPlus: !!followup.include_detail_plus,
      }, receiptBase64);
      if (!result.ok) throw new Error("Email provider did not confirm delivery request");

      const finish = await admin.rpc("complete_after_job_followup", {
        p_followup_id: followup.id,
        p_provider_message_id: result.id || null,
      });
      if (finish.error) throw finish.error;
      sent += 1;
    } catch (sendError) {
      failed += 1;
      const message = sendError instanceof Error ? sendError.message : String(sendError);
      console.error(`[after-job-followups] ${followup.id}`, sendError);
      const finish = await admin.rpc("fail_after_job_followup", {
        p_followup_id: followup.id,
        p_error: message.slice(0, 1500),
      });
      if (finish.error) console.error("[after-job-followups] release", finish.error);
    }
  }

  return NextResponse.json({ ok: true, due: dueRows.length, claimed, sent, failed });
}
