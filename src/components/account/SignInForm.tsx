"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { FormError, Success, TextField } from "@/components/forms/parts";

type Mode = "signin" | "signup" | "reset";
type SocialProvider = "google" | "apple";

const friendly = (m: string) =>
  /invalid login/i.test(m)
    ? "That email and password don't match."
    : /already registered|already exists/i.test(m)
      ? "There's already an account with that email. Sign in instead."
      : /password should be/i.test(m)
        ? "Use at least 8 characters for your password."
        : /email not confirmed/i.test(m)
          ? "Confirm your email first. Check your inbox for the link."
          : m;

export function SignInForm({
  initialMode = "signin",
  next = "/account",
  linkError = false,
}: {
  initialMode?: Mode;
  next?: string;
  linkError?: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [busy, setBusy] = useState(false);
  const [socialBusy, setSocialBusy] = useState<SocialProvider | null>(null);
  const [error, setError] = useState<string | null>(
    linkError
      ? "That link expired or was already used. Sign in, or request a new one."
      : null,
  );
  const [sent, setSent] = useState<null | "confirm" | "reset">(null);

  const callback = (to: string) =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(to)}`;

  async function socialSignIn(provider: SocialProvider) {
    setError(null);
    setSocialBusy(provider);

    const supabase = supabaseBrowser();

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: callback(next),
      },
    });

    if (error) {
      setSocialBusy(null);
      setError(
        `We couldn't connect to ${provider === "google" ? "Google" : "Apple"}. ${friendly(error.message)}`,
      );
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const supabase = supabaseBrowser();

    setBusy(true);
    setError(null);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      setBusy(false);

      if (error) return setError(friendly(error.message));

      router.push(next);
      router.refresh();
      return;
    }

    if (mode === "signup") {
      const full_name = String(fd.get("name") ?? "").trim();
      const phone = String(fd.get("phone") ?? "").trim();

      if (password.length < 8) {
        setBusy(false);
        return setError("Use at least 8 characters for your password.");
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            phone,
          },
          emailRedirectTo: callback(next),
        },
      });

      setBusy(false);

      if (error) return setError(friendly(error.message));

      if (data.user && data.user.identities?.length === 0) {
        return setError(friendly("already registered"));
      }

      if (data.session) {
        router.push(next);
        router.refresh();
        return;
      }

      return setSent("confirm");
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: callback("/account/update-password"),
    });

    setBusy(false);

    if (error) return setError(friendly(error.message));

    setSent("reset");
  }

  if (sent) {
    return (
      <Success
        title={sent === "confirm" ? "Check your email" : "Reset link sent"}
      >
        <p>
          {sent === "confirm"
            ? "We sent you a link to confirm your email. Open it on this device and you'll be signed in."
            : "If there's an account with that email, you'll get a link to set a new password."}
        </p>
      </Success>
    );
  }

  return (
    <div>
      {mode !== "reset" && (
        <>
          <div className="grid gap-3">
            <button
              type="button"
              onClick={() => socialSignIn("google")}
              disabled={Boolean(socialBusy)}
              className="choice flex min-h-14 w-full items-center justify-center gap-3 font-display font-semibold disabled:opacity-60"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M21.35 12.2c0-.71-.06-1.23-.2-1.77H12v3.32h5.37a4.58 4.58 0 0 1-1.99 3.01v2.16h3.22c1.88-1.73 2.75-4.29 2.75-6.72Z"
                />
                <path
                  fill="currentColor"
                  d="M12 21.7c2.69 0 4.94-.89 6.59-2.42l-3.22-2.16c-.89.6-2.03.96-3.37.96-2.59 0-4.79-1.75-5.58-4.1H3.09v2.23A9.96 9.96 0 0 0 12 21.7Z"
                  opacity=".78"
                />
                <path
                  fill="currentColor"
                  d="M6.42 13.98A5.98 5.98 0 0 1 6.1 12c0-.69.12-1.36.32-1.98V7.79H3.09A9.95 9.95 0 0 0 2 12c0 1.51.36 2.94 1.09 4.21l3.33-2.23Z"
                  opacity=".56"
                />
                <path
                  fill="currentColor"
                  d="M12 5.92c1.46 0 2.77.5 3.8 1.49l2.86-2.86C16.93 2.94 14.69 2 12 2a9.96 9.96 0 0 0-8.91 5.79l3.33 2.23c.79-2.35 2.99-4.1 5.58-4.1Z"
                  opacity=".9"
                />
              </svg>

              {socialBusy === "google"
                ? "Connecting…"
                : "Continue with Google"}
            </button>

            <button
              type="button"
              onClick={() => socialSignIn("apple")}
              disabled={Boolean(socialBusy)}
              className="choice flex min-h-14 w-full items-center justify-center gap-3 font-display font-semibold disabled:opacity-60"
            >
              <svg
                width="19"
                height="23"
                viewBox="0 0 24 29"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M19.67 15.43c.03 3.28 2.88 4.37 2.91 4.39-.02.08-.45 1.56-1.5 3.08-.91 1.31-1.85 2.61-3.34 2.64-1.46.03-1.93-.86-3.6-.86-1.67 0-2.19.83-3.57.89-1.43.05-2.52-1.43-3.44-2.73-1.87-2.67-3.3-7.55-1.38-10.84.95-1.64 2.66-2.68 4.52-2.71 1.41-.03 2.74.95 3.6.95.86 0 2.47-1.18 4.17-1.01.71.03 2.71.28 3.99 2.15-.1.06-2.39 1.39-2.36 4.05ZM16.93 7.45c.76-.92 1.27-2.2 1.13-3.48-1.1.04-2.43.73-3.22 1.65-.71.81-1.33 2.11-1.16 3.36 1.23.1 2.49-.62 3.25-1.53Z" />
              </svg>

              {socialBusy === "apple"
                ? "Connecting…"
                : "Continue with Apple"}
            </button>
          </div>

          <div className="my-7 flex items-center gap-4" aria-hidden="true">
            <div className="h-px flex-1 bg-ink/15" />
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">
              or
            </span>
            <div className="h-px flex-1 bg-ink/15" />
          </div>

          <div role="tablist" className="mb-8 grid grid-cols-2 gap-2">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className="choice items-center font-display font-semibold"
                aria-pressed={mode === m}
              >
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>
        </>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-6">
        {mode === "signup" && (
          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              label="Name"
              name="name"
              autoComplete="name"
            />
            <TextField
              label="Phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
            />
          </div>
        )}

        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
        />

        {mode !== "reset" && (
          <TextField
            label="Password"
            name="password"
            type="password"
            autoComplete={
              mode === "signup" ? "new-password" : "current-password"
            }
            hint={
              mode === "signup"
                ? "At least 8 characters. Same login works in the Every Detail app."
                : undefined
            }
          />
        )}

        <FormError message={error} />

        <button
          type="submit"
          disabled={busy}
          className="btn btn-primary w-full disabled:opacity-60"
        >
          {busy
            ? "One sec…"
            : mode === "signin"
              ? "Sign in"
              : mode === "signup"
                ? "Create account"
                : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink/80">
        {mode === "reset" ? (
          <button
            type="button"
            className="link"
            onClick={() => setMode("signin")}
          >
            Back to sign in
          </button>
        ) : (
          <button
            type="button"
            className="link"
            onClick={() => setMode("reset")}
          >
            Forgot your password?
          </button>
        )}

        <span className="mx-2 text-ink/30">/</span>

        <Link href="/book" className="link">
          Book without an account
        </Link>
      </p>
    </div>
  );
}
