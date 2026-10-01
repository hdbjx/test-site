"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { FormError, Success, TextField } from "@/components/forms/parts";

type Mode = "signin" | "signup" | "reset";
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
  const [error, setError] = useState<string | null>(
    linkError
      ? "That link expired or was already used. Sign in, or request a new one."
      : null,
  );
  const [sent, setSent] = useState<null | "confirm" | "reset">(null);

  const callback = (to: string) =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(to)}`;

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
