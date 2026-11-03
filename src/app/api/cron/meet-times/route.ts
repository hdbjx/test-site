import { NextRequest, NextResponse } from "next/server";
import { refreshMeetTimes } from "@/lib/meet-times";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Every 15 minutes (Supabase pg_cron): give upcoming jobs a meet-at-van time
 * from the real drive, including jobs made in the Team App, Van HQ and by
 * Detail+ auto-booking. Hand-set meet times are never changed.
 */
function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  return !!secret && request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ ok: false }, { status: 401 });
  try {
    const updated = await refreshMeetTimes();
    return NextResponse.json({ ok: true, updated });
  } catch (error) {
    console.error("[meet-times] cron", error);
    return NextResponse.json({ ok: false, error: "Meet time refresh failed." }, { status: 500 });
  }
}
