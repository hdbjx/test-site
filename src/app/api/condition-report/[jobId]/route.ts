import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { buildConditionReportPdf, hasConditionRecord, loadConditionReport } from "@/lib/condition-report";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Cache-Control": "no-store",
};
const fail = (status: number, error: string) => NextResponse.json({ ok: false, error }, { status, headers: cors });
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors });
}

// Short-lived signed links let staff apps open the PDF in a normal browser tab
// (Van HQ runs as a home-screen app and cannot show a downloaded PDF reliably).
const LINK_TTL_SECONDS = 10 * 60;
function linkSecret() { return process.env.REPORT_LINK_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || ""; }
function signLink(jobId: string) {
  const exp = Math.floor(Date.now() / 1000) + LINK_TTL_SECONDS;
  const sig = createHmac("sha256", linkSecret()).update(`condition-report:${jobId}:${exp}`).digest("base64url");
  return `${exp}.${sig}`;
}
function linkValid(jobId: string, token: string | null) {
  if (!token || !linkSecret()) return false;
  const [expRaw, sig] = token.split(".");
  const exp = Number(expRaw);
  if (!exp || !sig || exp < Math.floor(Date.now() / 1000)) return false;
  const want = createHmac("sha256", linkSecret()).update(`condition-report:${jobId}:${exp}`).digest();
  const got = Buffer.from(sig, "base64url");
  return got.length === want.length && timingSafeEqual(got, want);
}

type Admin = ReturnType<typeof supabaseAdmin>;
/** Managers, technicians on the job, and Van HQ devices on the job's rig, by Bearer token. */
async function staffAllowed(admin: Admin, jobId: string, rigId: string | null, token: string): Promise<boolean | "expired"> {
  const auth = await admin.auth.getUser(token);
  const userId = auth.data.user?.id;
  if (!userId) return "expired";
  const profile = await admin.from("profiles").select("role,active").eq("id", userId).maybeSingle();
  if (profile.data?.active && ["manager", "admin"].includes(String(profile.data.role))) return true;
  if (profile.data?.active) {
    const on = await admin.from("job_assignments").select("id").eq("job_id", jobId).eq("staff_id", userId).limit(1);
    if (on.data?.length) return true;
  }
  const device = await admin.from("van_hq_devices").select("rig_id").eq("user_id", userId).eq("active", true).maybeSingle();
  if (!device.data?.rig_id) return false;
  if (String(rigId) === String(device.data.rig_id)) return true;
  const rigs = await admin.from("job_rigs").select("rig_id").eq("job_id", jobId);
  return (rigs.data || []).some((r: { rig_id: string }) => String(r.rig_id) === String(device.data!.rig_id));
}

/** Staff apps: exchange a session for a 10-minute link to the PDF. */
export async function POST(req: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  if (!UUID.test(jobId)) return fail(400, "Invalid job.");
  let admin: Admin;
  try { admin = supabaseAdmin(); } catch { return fail(500, "Reports are not configured."); }
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return fail(401, "Sign in again.");
  const job = await admin.from("jobs").select("id,rig_id").eq("id", jobId).maybeSingle();
  if (job.error || !job.data) return fail(404, "Job not found.");
  const ok = await staffAllowed(admin, jobId, job.data.rig_id, token);
  if (ok === "expired") return fail(401, "Session expired. Sign in again.");
  if (!ok) return fail(403, "You don't have access to this report.");
  const report = await loadConditionReport(admin, jobId);
  if (!report || !hasConditionRecord(report)) return fail(404, "No arrival check was recorded for this visit.");
  const origin = new URL(req.url).origin;
  return NextResponse.json({ ok: true, url: `${origin}/api/condition-report/${jobId}?t=${encodeURIComponent(signLink(jobId))}` }, { headers: cors });
}

/**
 * Pre-service condition report PDF for one job.
 * - Customers: their website session (cookie), only for their own jobs.
 * - Staff apps: a signed link from POST, or a Bearer token.
 */
export async function GET(req: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  if (!UUID.test(jobId)) return fail(400, "Invalid job.");
  let admin: Admin;
  try { admin = supabaseAdmin(); } catch { return fail(500, "Reports are not configured."); }

  const job = await admin.from("jobs").select("id,client_id,rig_id").eq("id", jobId).maybeSingle();
  if (job.error || !job.data) return fail(404, "Job not found.");

  const url = new URL(req.url);
  const signed = url.searchParams.get("t");
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  let allowed = false;
  if (signed) {
    if (!linkValid(jobId, signed)) return fail(401, "This link is invalid or has expired. Open the report again from the app.");
    allowed = true;
  } else if (token) {
    const ok = await staffAllowed(admin, jobId, job.data.rig_id, token);
    if (ok === "expired") return fail(401, "Session expired. Sign in again.");
    allowed = ok;
  } else {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.redirect(new URL(`/account/sign-in?next=${encodeURIComponent(url.pathname)}`, url.origin));
    const acct = await supabase.rpc("get_my_account");
    const clientId = (acct.data as { client_id: string }[] | null)?.[0]?.client_id;
    allowed = !!clientId && String(clientId) === String(job.data.client_id);
  }
  if (!allowed) return fail(403, "You don't have access to this report.");

  const report = await loadConditionReport(admin, jobId);
  if (!report) return fail(404, "Job not found.");
  if (!hasConditionRecord(report)) return fail(404, "No arrival check was recorded for this visit.");
  const pdf = await buildConditionReportPdf(admin, report);
  const day = new Date(report.scheduledStart).toISOString().slice(0, 10);
  const name = `every-detail-condition-report-${day}.pdf`;
  const download = url.searchParams.get("download") === "1";
  return new NextResponse(Buffer.from(pdf), {
    status: 200,
    headers: { ...cors, "Content-Type": "application/pdf", "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${name}"` },
  });
}
