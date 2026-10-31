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

      const [{ data: vehicles, error: vehicleError }, { data: addons, error: addonError }, { data: media, error: mediaError }, { data: checkout }, { data: additions }] = await Promise.all([
        admin.from("job_vehicles").select("id,vehicle_label,vehicle_size,service_name,price,sort_order,created_at").eq("job_id", followup.job_id).order("sort_order", { ascending: true }).order("created_at", { ascending: true }),
        admin.from("job_vehicle_addons").select("job_vehicle_id,addon_name,price,status,created_at").eq("job_id", followup.job_id).neq("status", "removed").order("created_at", { ascending: true }),
        admin.from("job_media").select("job_vehicle_id,vehicle_id,media_type,storage_path,created_at").eq("job_id", followup.job_id).in("media_type", ["before", "after"]).order("created_at", { ascending: true }),
        admin.from("van_hq_job_checkout").select("price_override").eq("job_id", followup.job_id).maybeSingle(),
        // On-site work added by crew in the Team App (team_request_job_addition).
        admin.from("job_addition_requests").select("label,amount,created_at").eq("job_id", followup.job_id).eq("status", "approved").order("created_at", { ascending: true }),
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

      // Website bookings (/api/book and /api/book/addon) store job_vehicles.price
      // as service + add-ons, AND write each add-on to job_vehicle_addons. Strip
      // the add-ons back out of the vehicle line so they aren't counted twice.
      const priceIncludesAddons = String(job.source || "").toLowerCase() === "website";
      const addonSumByVehicle = new Map<string, number>();
      for (const addon of addonRows) {
        const key = String(addon.job_vehicle_id || "");
        addonSumByVehicle.set(key, (addonSumByVehicle.get(key) ?? 0) + n(addon.price));
      }
      const basePrice = (v: { id: string; price: unknown }) => {
        const stored = n(v.price);
        if (!priceIncludesAddons) return stored;
        return Math.max(0, stored - (addonSumByVehicle.get(String(v.id)) ?? 0));
      };

      const unassignedAddonSum = addonSumByVehicle.get("") ?? 0;
      const receiptLines: Array<{ label: string; amount: number }> = [];
      if (vehicleRows.length) {
        for (const v of vehicleRows) {
          receiptLines.push({ label: `${v.vehicle_label || "Vehicle"} - ${v.service_name || "Detail"}`, amount: basePrice(v) });
          for (const addon of addonRows.filter((a) => String(a.job_vehicle_id || "") === String(v.id))) {
            receiptLines.push({ label: `+ ${addon.addon_name || "Add-on"}`, amount: n(addon.price) });
          }
        }
      } else {
        const jobPrice = n(job.price ?? job.total_price);
        receiptLines.push({ label: String(job.service_name || "Detail"), amount: priceIncludesAddons ? Math.max(0, jobPrice - unassignedAddonSum) : jobPrice });
      }
      const vehicleIds = new Set(vehicleRows.map((v) => String(v.id)));
      for (const addon of addonRows.filter((a) => !vehicleIds.has(String(a.job_vehicle_id || "")))) {
        receiptLines.push({ label: `+ ${addon.addon_name || "Add-on"}`, amount: n(addon.price) });
      }

      for (const extra of additions ?? []) {
        receiptLines.push({ label: `+ ${extra.label || "Added work"}`, amount: n(extra.amount) });
      }

      const calculatedTotal = receiptLines.reduce((sum, item) => sum + item.amount, 0);
      const override = checkout?.price_override == null ? null : n(checkout.price_override);
      const total = override ?? (calculatedTotal || n(job.price ?? job.total_price));
      // Van HQ checkout override (discounts / price changes) — show it as a line
      // so the receipt lines add up to the total actually charged.
      const adjustment = Math.round((total - calculatedTotal) * 100) / 100;
      if (override != null && adjustment !== 0) {
        receiptLines.push({ label: adjustment < 0 ? "Discount" : "Adjustment", amount: adjustment });
      }

      // Never pitch Detail+ to someone who already has a membership.
      let alreadyMember = /detail\s*\+|detail\s+plus/i.test(String(job.service_name || ""))
        || vehicleRows.some((v) => /detail\s*\+|detail\s+plus/i.test(String(v.service_name || "")));
      if (!alreadyMember && followup.include_detail_plus && job.client_id) {
        const { data: memberships, error: memberError } = await admin
          .from("detail_plus_memberships")
          .select("status")
          .eq("client_id", job.client_id);
        if (memberError) throw memberError;
        alreadyMember = (memberships ?? []).some((m) => ["active", "paused", "pending"].includes(String(m.status || "").toLowerCase()));
      }

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
        includeDetailPlus: !!followup.include_detail_plus && !alreadyMember,
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
