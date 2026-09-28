import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { CancelJobButton } from "@/components/account/CancelJobButton";
import { ProfileForm } from "@/components/account/ProfileForm";
import { VehicleManager } from "@/components/account/VehicleManager";
import { site } from "@/data/site";
import { getMyJobs, getSession } from "@/lib/supabase/account";
import { supabaseConfigured } from "@/lib/supabase/config";
import { usd } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Your account | Every Detail", description: "Your vehicles and bookings.", path: "/account", noindex: true });
export const dynamic = "force-dynamic";

const TZ = "America/New_York";
const when = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(iso));

const CANCEL_NOTICE_MS = 24 * 3600 * 1000; // matches booking_settings.min_notice_hours

export default async function AccountPage() {
  if (!supabaseConfigured) redirect("/book");
  const session = await getSession();

  if (session.state === "signed-out") redirect("/account/sign-in");

  if (session.state === "unconfirmed" || session.state === "staff") {
    return (
      <>
        <PageHeader crumbs={[{ name: "Account", path: "/account" }]} title="Your account" />
        <section className="container-ed max-w-2xl pb-24">
          <div className="panel p-8">
            {session.state === "unconfirmed" ? (
              <p>Confirm your email to finish setting up. We sent a link to {session.email}.</p>
            ) : (
              <p>{session.email} is an Every Detail staff login. Use the Every Detail app for scheduling. Customer accounts need a separate email.</p>
            )}
            <form action="/auth/sign-out" method="post" className="mt-6">
              <button className="btn btn-secondary btn-sm">Sign out</button>
            </form>
          </div>
        </section>
      </>
    );
  }

  const { account, garage, email } = session;
  let jobs;
  try {
    jobs = await getMyJobs();
  } catch (error) {
    console.error("Account jobs failed to load", error);
    jobs = [];
  }
  const now = Date.now();
  const upcoming = jobs
    .filter((j) => j.status !== "cancelled" && j.status !== "complete" && Date.parse(j.scheduled_start) > now)
    .sort((a, b) => Date.parse(a.scheduled_start) - Date.parse(b.scheduled_start));
  const past = jobs.filter((j) => j.status === "complete" || (j.status !== "cancelled" && Date.parse(j.scheduled_start) <= now)).slice(0, 8);
  const first = account.full_name.split(" ")[0];

  return (
    <>
      <PageHeader crumbs={[{ name: "Account", path: "/account" }]} title={`Hi, ${first}`}>
        <Link href="/book" className="btn btn-primary">
          Book a detail
        </Link>
        <form action="/auth/sign-out" method="post">
          <button className="btn btn-secondary w-full">Sign out</button>
        </form>
      </PageHeader>

      <section className="container-ed grid gap-16 pb-24 lg:grid-cols-12">
        <div className="space-y-16 lg:col-span-7">
          <div>
            <h2 className="t-h2">Upcoming</h2>
            {upcoming.length === 0 ? (
              <p className="mt-4 text-ink/80">
                Nothing booked.{" "}
                <Link href="/book" className="link">
                  Pick a time
                </Link>
                .
              </p>
            ) : (
              <ul className="mt-6 border-t-2 border-ink">
                {upcoming.map((j) => (
                  <li key={j.id} className="flex flex-wrap items-start justify-between gap-4 border-b border-ink/15 py-5">
                    <div>
                      <p className="font-display text-lg font-semibold">{j.service_name}</p>
                      <p className="text-ink/80">{when(j.scheduled_start)}</p>
                      <p className="text-sm text-muted">
                        {j.vehicle}
                        {j.price ? ` · ${usd(Number(j.price))}` : ""}
                      </p>
                    </div>
                    {Date.parse(j.scheduled_start) - now > CANCEL_NOTICE_MS ? (
                      <CancelJobButton jobId={j.id} label={`${j.service_name} on ${when(j.scheduled_start)}`} />
                    ) : (
                      <a href={site.phone.href} className="link text-sm">
                        Call to change
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-sm text-muted">Need to reschedule? Cancel and book a new time, or call or text {site.phone.display}.</p>
          </div>

          <div>
            <h2 className="t-h2">Your vehicles</h2>
            <p className="mt-2 text-ink/80">Saved vehicles fill in your price when you book, and tell the crew what to expect.</p>
            <div className="mt-6">
              <VehicleManager garage={garage} />
            </div>
          </div>
        </div>

        <div className="space-y-16 lg:col-span-4 lg:col-start-9">
          <div>
            <h2 className="t-h3">Your details</h2>
            <div className="mt-5">
              <ProfileForm account={account} email={email} />
            </div>
          </div>
          {past.length > 0 && (
            <div>
              <h2 className="t-h3">History</h2>
              <ul className="mt-4 space-y-3 text-[0.9375rem]">
                {past.map((j) => (
                  <li key={j.id} className="border-b border-ink/15 pb-3">
                    <span className="font-semibold">{j.service_name}</span>
                    <span className="block text-muted">
                      {when(j.scheduled_start)} · {j.vehicle}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
