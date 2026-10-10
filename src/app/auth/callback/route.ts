import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Email confirmation and password-reset links land here. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const nextRaw = url.searchParams.get("next") ?? "/account";
  const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/account";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  return NextResponse.redirect(new URL("/account/sign-in?error=link", url.origin));
}
