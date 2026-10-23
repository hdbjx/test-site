import Link from "next/link";
import { redirect } from "next/navigation";
import { LiveJobPortal } from "@/components/account/LiveJobPortal";
import type { PortalJob } from "@/lib/client-portal";
import { ProfileForm } from "@/components/account/ProfileForm";
import { VehicleManager } from "@/components/account/VehicleManager";
import { getMyGiftCards, getMyJobs, getMyPortalJobs, getMyRewardBalance, getSession, type ClientGiftCard, type ClientJob } from "@/lib/supabase/account";
import { supabaseConfigured } from "@/lib/supabase/config";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Your account | Every Detail", description: "Your vehicles, bookings, credit, and live detail status.", path: "/account", noindex: true });
export const dynamic = "force-dynamic";

const TZ = "America/New_York";
const when = (iso: string) => new Intl.DateTimeFormat("en-US", { timeZone: TZ, month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));

export default async function AccountPage() {
  if (!supabaseConfigured) redirect("/book");
  const session = await getSession();
  if (session.state === "signed-out") redirect("/account/sign-in");

  if (session.state === "unconfirmed" || session.state === "staff") {
    return (
      <div className="account68 account68-state">
        <section className="account68-state-card">
          <p className="account68-kicker">EVERY DETAIL ACCOUNT</p>
          <h1>{session.state === "unconfirmed" ? "CHECK YOUR EMAIL." : "STAFF ACCOUNT."}</h1>
          <p>{session.state === "unconfirmed" ? `Confirm ${session.email} to finish setting up your customer account.` : `${session.email} is connected to the Every Detail team. Use the team app for work scheduling.`}</p>
          <form action="/auth/sign-out" method="post"><button className="account68-secondary">SIGN OUT</button></form>
        </section>
      </div>
    );
  }

  const { account, garage, email } = session;
  let jobs: ClientJob[] = [];
  let portalJobs: PortalJob[] = [];
  let giftCards: ClientGiftCard[] = [];
  let rewards = { balance_cents: 0, lifetime_earned_cents: 0, lifetime_redeemed_cents: 0 };
  let portalLoadFailed = false;

  try {
    [jobs, portalJobs, giftCards, rewards] = await Promise.all([getMyJobs(), getMyPortalJobs(), getMyGiftCards(), getMyRewardBalance()]);
  } catch (error) {
    portalLoadFailed = true;
    console.error("Account data failed to load", error);
    try { [jobs, giftCards, rewards] = await Promise.all([getMyJobs(), getMyGiftCards(), getMyRewardBalance()]); }
    catch (jobsError) { console.error("Account history failed to load", jobsError); }
  }

  const now = Date.now();
  const past = jobs.filter((job) => job.status === "complete" || (job.status !== "cancelled" && Date.parse(job.scheduled_start) <= now)).slice(0, 8);
  const first = account.full_name.split(" ")[0];
  const giftBalance = giftCards.reduce((sum, card) => sum + card.balance_cents, 0);
  const totalCredit = rewards.balance_cents + giftBalance;
  const activeCount = portalJobs.length;

  return (
    <div className="account68">
      <section className="account68-hero">
        <div className="account68-shell account68-hero-grid">
          <div>
            <p className="account68-kicker">YOUR EVERY DETAIL ACCOUNT</p>
            <h1>HI, {first.toUpperCase()}.</h1>
            <p className="account68-lede">Your upcoming details, vehicles and account info are all here.</p>
          </div>
          <div className="account68-actions">
            <Link href="/book" className="account68-primary">BOOK A DETAIL ↗</Link>
            <form action="/auth/sign-out" method="post"><button className="account68-secondary">SIGN OUT</button></form>
          </div>
        </div>
        <div className="account68-shell account68-stats">
          <div><strong>{activeCount}</strong><span>ACTIVE / UPCOMING</span></div>
          <div><strong>{garage.length}</strong><span>SAVED VEHICLES</span></div>
          <div><strong>${(totalCredit / 100).toFixed(totalCredit % 100 ? 2 : 0)}</strong><span>AVAILABLE CREDIT</span></div>
        </div>
      </section>

      <main className="account68-main">
        <div className="account68-shell account68-grid">
          <div className="account68-primary-column">
            <section className="account68-section account68-live">
              <LiveJobPortal initialJobs={portalJobs} initialLoadFailed={portalLoadFailed} />
            </section>

            <section className="account68-section">
              <div className="account68-section-title"><div><p className="account68-kicker">GARAGE</p><h2>YOUR VEHICLES</h2></div><span>{garage.length} SAVED</span></div>
              <VehicleManager garage={garage} />
            </section>

            {past.length > 0 && (
              <section className="account68-section">
                <div className="account68-section-title"><div><p className="account68-kicker">HISTORY</p><h2>PAST DETAILS</h2></div></div>
                <div className="account68-history">
                  {past.map((job) => (
                    <article key={job.id}><div><strong>{job.service_name}</strong><span>{job.vehicle}</span></div><time dateTime={job.scheduled_start}>{when(job.scheduled_start)}</time></article>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="account68-side">
            <section className="account68-credit">
              <p className="account68-kicker">AVAILABLE CREDIT</p>
              <strong>${(totalCredit / 100).toFixed(totalCredit % 100 ? 2 : 0)}</strong>
              <div className="account68-credit-lines"><span>Rewards <b>${(rewards.balance_cents / 100).toFixed(2)}</b></span><span>Gift cards <b>${(giftBalance / 100).toFixed(2)}</b></span></div>
              {giftCards.length > 0 && <div className="account68-gift-codes">{giftCards.map((card) => <span key={card.id}>{card.code} · ${(card.balance_cents / 100).toFixed(card.balance_cents % 100 ? 2 : 0)}</span>)}</div>}
              <Link href="/gift-cards">BUY A GIFT CARD ↗</Link>
            </section>

            <details className="account68-settings">
              <summary><span>ACCOUNT DETAILS</span><b>+</b></summary>
              <div className="account68-settings-body"><ProfileForm account={account} email={email} /></div>
            </details>

            <div className="account68-email">SIGNED IN AS<br /><strong>{email}</strong></div>
          </aside>
        </div>
      </main>
    </div>
  );
}
