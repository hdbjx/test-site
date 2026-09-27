"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { FormError, TextField } from "@/components/forms/parts";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password") ?? "");
    if (password.length < 8) return setError("Use at least 8 characters.");
    setBusy(true);
    const { error } = await supabaseBrowser().auth.updateUser({ password });
    setBusy(false);
    if (error) return setError(error.message);
    router.push("/account");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <TextField label="New password" name="password" type="password" autoComplete="new-password" hint="At least 8 characters." />
      <FormError message={error} />
      <button type="submit" disabled={busy} className="btn btn-primary w-full disabled:opacity-60">
        {busy ? "Saving…" : "Save password"}
      </button>
    </form>
  );
}
