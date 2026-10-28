import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Pre-service condition report: what each vehicle looked like before any work
 * started (arrival photos, damage photos, damage notes, who checked it). One
 * generator serves Van HQ, Team HQ and the customer portal so the report reads
 * the same everywhere. Nothing is stored; it is rebuilt from the saved records.
 */

type Photo = { label: string; path: string; bucket: string; note?: string | null; at?: string | null; by?: string | null };
type VehicleSection = {
  label: string
  detail: string
  status: "damage" | "none" | "unchecked"
  checkedBy: string | null
  checkedAt: string | null
  arrival: Photo[]
  damage: Photo[]
  notes: { text: string; by: string; stamp: string }[]
};
export type ConditionReport = {
  jobId: string
  clientId: string | null
  customer: string
  address: string | null
  service: string
  scheduledStart: string
  vehicles: VehicleSection[]
};

const TZ = "America/New_York";
const NOTE_RE = /PRE-EXISTING DAMAGE\s*\(([^,]+),\s*([^)]+)\):\s*([\s\S]*)/i;
const dayET = (iso: string) => new Intl.DateTimeFormat("en-US", { timeZone: TZ, month: "short", day: "numeric", year: "numeric" }).format(new Date(iso)).replace(",", "");
const whenET = (iso: string) => new Intl.DateTimeFormat("en-US", { timeZone: TZ, month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(iso));
const timeET = (iso: string) => new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" }).format(new Date(iso));

function damageNotes(raw: string | null | undefined, jobDay: string) {
  // Van HQ 11.8+ stamps "Oct 28 2026 9:14 AM". Only notes from this visit's day belong on this report.
  return String(raw || "").split(/\n| \| /).map((l) => l.trim().match(NOTE_RE)).filter((m): m is RegExpMatchArray => !!m)
    .map((m) => ({ by: m[1].trim(), stamp: m[2].trim(), text: m[3].trim() }))
    .filter((n) => n.text && n.stamp.startsWith(jobDay));
}

/** Everything the report needs for one job. Uses the service role; callers authorize first. */
export async function loadConditionReport(admin: SupabaseClient, jobId: string): Promise<ConditionReport | null> {
  const job = await admin.from("jobs").select("id,client_id,customer_name,address,service_name,vehicle,scheduled_start").eq("id", jobId).maybeSingle();
  if (job.error || !job.data) return null;
  const j = job.data as any;
  const [lines, arrival, media, reports] = await Promise.all([
    admin.from("job_vehicles").select("id,vehicle_id,vehicle_label,sort_order").eq("job_id", jobId).order("sort_order"),
    admin.from("van_hq_arrival_condition").select("*").eq("job_id", jobId),
    admin.from("job_media").select("id,job_vehicle_id,vehicle_id,storage_path,operator_name,created_at").eq("job_id", jobId).eq("media_type", "damage").order("created_at"),
    admin.from("job_condition_reports").select("*").eq("job_id", jobId),
  ]);
  const jvs = ((lines.data || []) as any[]).length ? (lines.data as any[]) : [{ id: null, vehicle_id: null, vehicle_label: j.vehicle || "Vehicle" }];
  const vehicleIds = jvs.map((x) => x.vehicle_id).filter(Boolean);
  const vehicles = vehicleIds.length ? ((await admin.from("vehicles").select("id,year,make,model,color,plate,tech_notes").in("id", vehicleIds)).data || []) as any[] : [];
  const reportRows = (reports.data || []) as any[];
  const condMedia = reportRows.length ? ((await admin.from("job_condition_media").select("*").in("report_id", reportRows.map((r) => r.id))).data || []) as any[] : [];
  let clientTech = "";
  if (j.client_id) {
    const cn = await admin.from("van_hq_client_notes").select("notes").eq("client_id", j.client_id).maybeSingle();
    try { const p = JSON.parse(String((cn.data as any)?.notes || "{}")); clientTech = typeof p?.techNotes === "string" ? p.techNotes : ""; } catch { clientTech = String((cn.data as any)?.notes || ""); }
  }
  const jobDay = dayET(j.scheduled_start);

  const sections: VehicleSection[] = jvs.map((jv, index) => {
    const v = vehicles.find((x) => x.id === jv.vehicle_id);
    const label = v ? [v.year, v.make, v.model].filter(Boolean).join(" ") || jv.vehicle_label : jv.vehicle_label || "Vehicle";
    const detail = v ? [v.color, v.plate].filter(Boolean).join(" · ") : "";
    const arrivalRows = (arrival.data || []) as any[];
    const a = arrivalRows.find((r) => r.job_vehicle_id && r.job_vehicle_id === jv.id) || (index === 0 ? arrivalRows.find((r) => !r.job_vehicle_id || !jvs.some((x) => x.id === r.job_vehicle_id)) : null) || null;
    const mine = (row: any) => row.job_vehicle_id ? row.job_vehicle_id === jv.id : index === 0;
    const arrivalPhotos: Photo[] = [];
    if (a?.driver_storage_path) arrivalPhotos.push({ label: "Driver area", path: a.driver_storage_path, bucket: "job-media", at: a.completed_at });
    if (a?.front34_storage_path) arrivalPhotos.push({ label: "Front 3/4", path: a.front34_storage_path, bucket: "job-media", at: a.completed_at });
    for (const m of condMedia.filter(mine)) arrivalPhotos.push({ label: String(m.angle || "Arrival").replace(/_/g, " "), path: m.storage_path, bucket: "job-completions", note: m.note, at: m.created_at });
    const damagePhotos: Photo[] = ((media.data || []) as any[]).filter(mine).map((m) => ({ label: "Pre-existing damage", path: m.storage_path, bucket: "job-media", at: m.created_at, by: m.operator_name }));
    const notes = [...damageNotes(v?.tech_notes, jobDay), ...(index === 0 && !v ? damageNotes(clientTech, jobDay) : [])];
    const teamReport = reportRows[0];
    const statusRaw = String(a?.damage_status || "").toLowerCase();
    const status: VehicleSection["status"] = statusRaw === "damage" || damagePhotos.length || notes.length || teamReport?.status === "noted" ? "damage" : statusRaw === "none" || teamReport?.status === "clear" ? "none" : "unchecked";
    if (teamReport?.note && index === 0) notes.push({ text: String(teamReport.note), by: "Team App", stamp: teamReport.created_at ? timeET(teamReport.created_at) : "" });
    return {
      label, detail, status,
      checkedBy: a?.damage_checked_by || a?.operator_name || damagePhotos[0]?.by || null,
      checkedAt: a?.damage_checked_at || a?.completed_at || teamReport?.created_at || null,
      arrival: arrivalPhotos, damage: damagePhotos, notes,
    };
  });

  return { jobId: j.id, clientId: j.client_id, customer: j.customer_name || "Customer", address: j.address, service: j.service_name || "Detail", scheduledStart: j.scheduled_start, vehicles: sections };
}

/** True when at least one vehicle was checked or photographed on arrival. */
export const hasConditionRecord = (r: ConditionReport) => r.vehicles.some((v) => v.status !== "unchecked" || v.arrival.length > 0);

// ── PDF ─────────────────────────────────────────────────────────────────────
const W = 612, H = 792, M = 42;
const INK = rgb(0.067, 0.067, 0.067), MUTED = rgb(0.42, 0.4, 0.38), OX = rgb(0.349, 0.051, 0.027), TAN = rgb(0.859, 0.78, 0.702);
const PAPER = rgb(0.953, 0.945, 0.925), LINE = rgb(0.82, 0.8, 0.77), GOOD = rgb(0.278, 0.439, 0.322), WARN = rgb(0.62, 0.16, 0.12);

/** Standard PDF fonts only cover Latin-1 plus a few typographic marks. */
function clean(s: string) {
  return String(s ?? "").replace(/[\u202F\u2009]/g, " ").replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[\u2013\u2014]/g, "-").replace(/\u2026/g, "...").replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\u00FF\u2022]/g, "");
}
function wrap(text: string, font: PDFFont, size: number, width: number) {
  const out: string[] = [];
  for (const para of clean(text).split(/\n/)) {
    let line = "";
    for (const word of para.split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) > width && line) { out.push(line); line = word; } else line = next;
    }
    out.push(line);
  }
  return out;
}

async function loadImage(doc: PDFDocument, admin: SupabaseClient, p: Photo): Promise<PDFImage | null> {
  try {
    const { data, error } = await admin.storage.from(p.bucket).download(p.path.replace(new RegExp(`^${p.bucket}/`), ""));
    if (error || !data) return null;
    const bytes = new Uint8Array(await data.arrayBuffer());
    if (bytes[0] === 0xff && bytes[1] === 0xd8) return await doc.embedJpg(bytes);
    if (bytes[0] === 0x89 && bytes[1] === 0x50) return await doc.embedPng(bytes);
    return null;
  } catch { return null; }
}

export async function buildConditionReportPdf(admin: SupabaseClient, r: ConditionReport): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Condition report - ${clean(r.customer)} - ${dayET(r.scheduledStart)}`);
  doc.setAuthor("Every Detail");
  const reg = await doc.embedFont(StandardFonts.Helvetica), bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const pages: PDFPage[] = [];
  let page!: PDFPage, y = 0;

  const newPage = (first = false) => {
    page = doc.addPage([W, H]); pages.push(page);
    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: PAPER });
    if (first) {
      page.drawRectangle({ x: M, y: H - 196, width: W - 2 * M, height: 160, color: OX });
      page.drawText("EVERY DETAIL", { x: M + 22, y: H - 66, size: 10, font: bold, color: TAN });
      page.drawText("PRE-SERVICE CONDITION REPORT", { x: M + 22, y: H - 104, size: 20, font: bold, color: rgb(1, 1, 1) });
      page.drawText(clean(`${r.customer}  ·  ${whenET(r.scheduledStart)}`), { x: M + 22, y: H - 128, size: 11, font: reg, color: PAPER });
      if (r.address) page.drawText(clean(r.address).slice(0, 90), { x: M + 22, y: H - 146, size: 10, font: reg, color: TAN });
      page.drawText(clean(`${r.service}`).slice(0, 80), { x: M + 22, y: H - 172, size: 10, font: bold, color: rgb(1, 1, 1) });
      y = H - 226;
    } else {
      page.drawText("EVERY DETAIL  ·  PRE-SERVICE CONDITION REPORT", { x: M, y: H - 40, size: 8, font: bold, color: OX });
      page.drawText(clean(`${r.customer}  ·  ${dayET(r.scheduledStart)}`), { x: M, y: H - 54, size: 8, font: reg, color: MUTED });
      y = H - 78;
    }
  };
  const need = (h: number) => { if (y - h < 64) newPage(); };
  const text = (s: string, size: number, font = reg, color = INK, x = M, width = W - 2 * M, lead = 1.35) => {
    for (const line of wrap(s, font, size, width)) { need(size * lead); page.drawText(line, { x, y: y - size, size, font, color }); y -= size * lead; }
  };

  newPage(true);
  text("This report shows each vehicle as it arrived, recorded by the Every Detail crew before any work started.", 10, reg, MUTED);
  y -= 8;

  for (const v of r.vehicles) {
    need(v.damage.length || v.arrival.length ? 300 : 90);
    page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.6, color: LINE });
    y -= 22;
    page.drawText(clean(v.label).slice(0, 60), { x: M, y, size: 15, font: bold, color: INK });
    const tag = v.status === "damage" ? "PRE-EXISTING DAMAGE LOGGED" : v.status === "none" ? "NO VISIBLE DAMAGE" : "NOT CHECKED";
    const tagW = bold.widthOfTextAtSize(tag, 8) + 16;
    page.drawRectangle({ x: W - M - tagW, y: y - 4, width: tagW, height: 17, color: v.status === "damage" ? rgb(0.95, 0.88, 0.86) : v.status === "none" ? rgb(0.88, 0.93, 0.89) : rgb(0.92, 0.91, 0.89) });
    page.drawText(tag, { x: W - M - tagW + 8, y: y + 1, size: 8, font: bold, color: v.status === "damage" ? WARN : v.status === "none" ? GOOD : MUTED });
    y -= 16;
    const meta = [v.detail, v.checkedAt ? `Checked ${whenET(v.checkedAt)}${v.checkedBy ? ` by ${v.checkedBy}` : ""}` : ""].filter(Boolean).join("  ·  ");
    if (meta) text(meta, 9, reg, MUTED);
    y -= 6;

    if (v.notes.length) {
      text("DAMAGE NOTES", 8, bold, OX); y -= 2;
      for (const n of v.notes) text(`•  ${n.text}  (${n.by}${n.stamp ? `, ${n.stamp}` : ""})`, 10.5, reg, INK, M + 4, W - 2 * M - 8);
      y -= 8;
    }

    const grid = async (title: string, photos: Photo[]) => {
      if (!photos.length) return;
      const colW = (W - 2 * M - 14) / 2, boxH = 190;
      need(16 + boxH + 30); text(title, 8, bold, OX); y -= 4;
      for (let i = 0; i < photos.length; i += 2) {
        need(boxH + 34);
        for (let c = 0; c < 2 && i + c < photos.length; c++) {
          const p = photos[i + c], x = M + c * (colW + 14);
          const img = await loadImage(doc, admin, p);
          page.drawRectangle({ x, y: y - boxH, width: colW, height: boxH, color: rgb(0.9, 0.89, 0.87) });
          if (img) {
            const s = Math.min(colW / img.width, boxH / img.height);
            const w = img.width * s, h = img.height * s;
            page.drawImage(img, { x: x + (colW - w) / 2, y: y - boxH + (boxH - h) / 2, width: w, height: h });
          } else page.drawText("Photo available in the Every Detail app", { x: x + 12, y: y - boxH / 2, size: 9, font: reg, color: MUTED });
          const cap = [p.label, p.at ? timeET(p.at) : "", p.by ? p.by : ""].filter(Boolean).join("  ·  ");
          page.drawText(clean(cap).slice(0, 60), { x, y: y - boxH - 13, size: 8.5, font: reg, color: MUTED });
        }
        y -= boxH + 26;
      }
    };
    await grid("DAMAGE PHOTOS", v.damage);
    await grid("ARRIVAL PHOTOS", v.arrival);
    if (!v.damage.length && !v.arrival.length && !v.notes.length) { text(v.status === "none" ? "The crew checked this vehicle and found no visible pre-existing damage." : "No arrival check was recorded for this vehicle.", 10, reg, MUTED); }
    y -= 10;
  }

  const generated = whenET(new Date().toISOString());
  pages.forEach((p, i) => {
    p.drawLine({ start: { x: M, y: 46 }, end: { x: W - M, y: 46 }, thickness: 0.5, color: LINE });
    p.drawText(clean(`Recorded before any work started  ·  Job ${r.jobId.slice(0, 8).toUpperCase()}  ·  Generated ${generated}`), { x: M, y: 32, size: 7.5, font: reg, color: MUTED });
    p.drawText(`Page ${i + 1} of ${pages.length}`, { x: W - M - 52, y: 32, size: 7.5, font: reg, color: MUTED });
  });
  return await doc.save();
}

/** Which of these jobs have an arrival check, so the portal only links real reports. */
export async function conditionReportJobIds(admin: SupabaseClient, jobIds: string[]): Promise<Set<string>> {
  if (!jobIds.length) return new Set();
  const [a, c, m] = await Promise.all([
    admin.from("van_hq_arrival_condition").select("job_id,damage_status,completed_at,driver_storage_path").in("job_id", jobIds),
    admin.from("job_condition_reports").select("job_id").in("job_id", jobIds),
    admin.from("job_media").select("job_id").in("job_id", jobIds).eq("media_type", "damage"),
  ]);
  const ids = new Set<string>();
  for (const r of (a.data || []) as any[]) if (r.damage_status || r.completed_at || r.driver_storage_path) ids.add(String(r.job_id));
  for (const r of [...((c.data || []) as any[]), ...((m.data || []) as any[])]) ids.add(String(r.job_id));
  return ids;
}
