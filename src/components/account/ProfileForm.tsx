"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { AccountInfo } from "@/lib/supabase/account";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { FormError, TextField } from "@/components/forms/parts";

export function ProfileForm({ account, email }: { account: AccountInfo; email: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) ?? "").trim();
    setBusy(true);
    setSaved(false);
    setError(null);
    const { error } = await supabaseBrowser().rpc("update_my_account", {
      p_full_name: get("name"),
      p_phone: get("phone"),
      p_address: get("address"),
    });
    setBusy(false);
    if (error) return setError("Couldn't save. Try again.");
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Name" name="name" autoComplete="name" defaultValue={account.full_name} />
        <TextField label="Phone" name="phone" type="tel" autoComplete="tel" defaultValue={account.phone ?? ""} />
      </div>
      <TextField label="Address" name="address" autoComplete="street-address" optional defaultValue={account.address ?? ""} hint="Where we usually detail your car." />
      <p className="text-sm text-muted">Signed in as {email}</p>
      <FormError message={error} />
      <div className="flex items-center gap-4">
        <button type="submit" disabled={busy} className="btn btn-secondary btn-sm disabled:opacity-60">
          {busy ? "Saving…" : "Save details"}
        </button>
        {saved && <span role="status" className="text-sm">Saved.</span>}
      </div>
    </form>
  );
}
