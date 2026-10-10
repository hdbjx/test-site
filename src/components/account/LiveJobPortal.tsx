"use client";

import { useEffect, useMemo, useState } from "react";
import { CancelJobButton } from "@/components/account/CancelJobButton";
import { site } from "@/data/site";
import { usd } from "@/lib/format";
import { supabaseBrowser } from "@/lib/supabase/browser";
import type { PortalJob, PortalVehicle, ProgressEvent } from "@/lib/client-portal";

const TZ = "America/New_York";
const CANCEL_NOTICE_MS = 24 * 3600 * 1000;
const REFRESH_MS = 15_000;

function dateTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function timeOnly(iso: string) {
  return new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

function norm(value: string) {
  return value.trim().toLowerCase();
}

function productionStages(serviceName: string) {
  const service = serviceName.toLowerCase();
  if (/ceramic|coating/.test(service)) return ["Wash", "Decontamination", "Paint Correction", "Panel Prep", "Coating", "Final Inspection", "Done"];
  if (/paint|polish|correction/.test(service)) return ["Wash", "Decontamination", "Paint Correction", "Final Inspection", "Done"];
  const hasInterior = /interior/.test(service);
  const hasExterior = /exterior|wash/.test(service);
  if (hasInterior && !hasExterior) return ["Interior", "Final inspection", "Done"];
  if (hasExterior && !hasInterior) return ["Exterior", "Final inspection", "Done"];
  return ["Interior", "Exterior", "Final inspection", "Done"];
}

function latest(events: ProgressEvent[]) {
  return [...events].sort((a, b) => Date.parse(a.at) - Date.parse(b.at)).at(-1) ?? null;
}

function roleLabel(role: string) {
  const key = role.toLowerCase();
  if (key === "admin" || key === "manager") return "Manager";
  if (key === "technician") return "Technician";
  return role ? role.charAt(0).toUpperCase() + role.slice(1) : "Technician";
}

function StageTracker({ job, vehicle }: { job: PortalJob; vehicle?: PortalVehicle }) {
  const travel = job.jobProgress.filter((event) => ["on the way", "arrived"].includes(norm(event.stage)));
  const production = vehicle?.progress ?? job.jobProgress.filter((event) => !["on the way", "arrived"].includes(norm(event.stage)));
  const events = [...travel, ...production];
  const reached = new Map(events.map((event) => [norm(event.stage), event]));
  const current = latest(events);
  const stages = ["Booked", "On the Way", "Arrived", ...productionStages(vehicle?.serviceName ?? job.serviceName)];
  const finished = job.status === "complete" || norm(current?.stage ?? "") === "done";
  const currentKey = finished ? "done" : norm(current?.stage ?? "booked");

  return (
    <div className="mt-5 border-t border-ink/15 pt-5">
      <div className="space-y-0">
        {stages.map((stage, index) => {
          const key = norm(stage);
          const event = reached.get(key);
          const isCurrent = key === currentKey;
          const isDone = key === "booked" ? currentKey !== "booked" : Boolean(event) && !isCurrent;
          const isLast = index === stages.length - 1;
          return (
            <div key={stage} className="grid grid-cols-[1.5rem_1fr] gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 text-[0.65rem] font-bold ${
                    isCurrent
                      ? "border-red bg-red text-white"
                      : isDone
                        ? "border-oxblood bg-sand text-ink"
                        : "border-ink/20 bg-white text-transparent"
                  }`}
                >
                  {isDone ? "✓" : isCurrent ? "•" : ""}
                </span>
                {!isLast && <span className={`min-h-7 w-px flex-1 ${isDone ? "bg-sand" : "bg-ink/15"}`} />}
              </div>
              <div className="pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`font-display text-[0.95rem] font-semibold ${isCurrent ? "text-ink" : isDone ? "text-oxblood" : "text-muted"}`}>
                    {stage}
                  </span>
                  {isCurrent && <span className="rounded-full border border-red/30 bg-red/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-red">Happening now</span>}
                </div>
                {event && <p className="mt-0.5 text-xs text-muted">{timeOnly(event.at)}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function JobCard({ job, primary }: { job: PortalJob; primary: boolean }) {
  const now = Date.now();
  const canCancel = Date.parse(job.scheduledStart) - now > CANCEL_NOTICE_MS && job.status !== "in_progress";
  const multiVehicle = job.vehicles.length > 1;
  const live = job.status === "in_progress" || job.jobProgress.length > 0 || job.vehicles.some((vehicle) => vehicle.progress.length > 0);

  return (
    <article className={`panel p-5 sm:p-6 ${primary && live ? "panel-red" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="kicker">{live ? "LIVE APPOINTMENT" : primary ? "NEXT APPOINTMENT" : "UPCOMING"}</p>
          <h3 className="mt-1 font-display text-xl font-semibold">{job.serviceName}</h3>
          <p className="mt-1 text-ink/80">{dateTime(job.scheduledStart)}</p>
          <p className="mt-1 text-sm text-muted">
            {job.vehicle}
            {job.price ? ` · ${usd(Number(job.price))}` : ""}
          </p>
          {job.address && <p className="mt-1 text-sm text-muted">{job.address}</p>}
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${live ? "bg-red text-white" : "bg-sand text-ink"}`}>
          {live ? (job.status === "in_progress" ? "In progress" : latest(job.jobProgress)?.stage ?? "Booked") : "Booked"}
        </span>
      </div>

      {job.crew.length > 0 && (
        <div className="mt-5 border-t border-ink/15 pt-4">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.08em] text-muted">Your crew</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {job.crew.map((person) => (
              <div key={person.id} className="rounded-lg border border-ink/15 bg-paper2 px-3 py-2">
                <p className="font-display text-sm font-semibold">{person.name}</p>
                <p className="text-xs text-muted">{roleLabel(person.role)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {primary && (
        multiVehicle ? (
          <div className="mt-5 space-y-4 border-t border-ink/15 pt-5">
            {job.vehicles.map((vehicle) => (
              <div key={vehicle.id} className="rounded-lg border border-ink/15 bg-paper2 p-4">
                <p className="font-display font-semibold">{vehicle.label}</p>
                <p className="text-sm text-muted">{vehicle.serviceName}</p>
                <StageTracker job={job} vehicle={vehicle} />
              </div>
            ))}
          </div>
        ) : (
          <StageTracker job={job} vehicle={job.vehicles[0]} />
        )
      )}

      {!job.crew.length && primary && <p className="mt-5 border-t border-ink/15 pt-4 text-sm text-muted">Your technicians will appear here once the crew is assigned.</p>}

      {primary && !live && (
        <div className="mt-5 border-t border-ink/15 pt-4">
          <p className="font-display text-sm font-semibold">Before we arrive</p>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            <li>Park with enough working room around the vehicle.</li>
            <li>Remove valuables or paperwork you do not want moved.</li>
            <li>Leave the vehicle unlocked or make the keys accessible.</li>
          </ul>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-ink/15 pt-4">
        {canCancel ? (
          <CancelJobButton jobId={job.id} label={`${job.serviceName} on ${dateTime(job.scheduledStart)}`} />
        ) : job.status !== "in_progress" ? (
          <a href={site.phone.href} className="link text-sm">Call or text to change</a>
        ) : null}
      </div>
    </article>
  );
}

export function LiveJobPortal({ initialJobs, initialLoadFailed = false }: { initialJobs: PortalJob[]; initialLoadFailed?: boolean }) {
  const [jobs, setJobs] = useState(initialJobs);
  const [refreshError, setRefreshError] = useState(initialLoadFailed);

  useEffect(() => {
    setJobs(initialJobs);
  }, [initialJobs]);

  const sorted = useMemo(
    () => [...jobs].filter((job) => job.status !== "cancelled" && job.status !== "complete").sort((a, b) => Date.parse(a.scheduledStart) - Date.parse(b.scheduledStart)),
    [jobs],
  );

  useEffect(() => {
    let active = true;
    async function refresh() {
      const { data, error } = await supabaseBrowser().rpc("get_my_client_portal_jobs");
      if (!active) return;
      if (error) {
        setRefreshError(true);
        return;
      }
      setRefreshError(false);
      setJobs((data as PortalJob[]) ?? []);
    }
    const timer = window.setInterval(refresh, REFRESH_MS);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  if (!sorted.length) {
    return (
      <div>
        <h2 className="t-h2">Upcoming</h2>
        {refreshError ? (
          <div className="panel mt-5 p-5">
            <p className="font-display font-semibold">We could not load your bookings.</p>
            <p className="mt-2 text-sm text-muted">Your account is signed in, but the live booking feed is unavailable. Refresh the page in a moment. If this keeps happening, contact Every Detail.</p>
          </div>
        ) : (
          <p className="mt-4 text-ink/80">Nothing booked right now.</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="t-h2">Your detail</h2>
          <p className="mt-2 max-w-xl text-ink/80">Follow your crew from the drive over through final inspection. This page updates automatically while you watch.</p>
        </div>
        {refreshError && <p className="text-xs text-muted">Live refresh paused. Showing the latest saved status.</p>}
      </div>
      <div className="mt-6 space-y-5">
        {sorted.map((job, index) => <JobCard key={job.id} job={job} primary={index === 0} />)}
      </div>
      <p className="mt-4 text-sm text-muted">Need to reschedule? Cancel at least 24 hours ahead, or call or text {site.phone.display}.</p>
    </div>
  );
}
