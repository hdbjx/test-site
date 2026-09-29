"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export function CancelJobButton({ jobId, label }: { jobId: string; label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    if (!confirm(`Cancel your ${label}?`)) return;
    setBusy(true);
    const { error } = await supabaseBrowser().rpc("cancel_my_job", { p_job_id: jobId });
    setBusy(false);
    if (error) return setError("This can't be cancelled online anymore. Call or text us.");
    router.refresh();
  }

  return (
    <span>
      <button type="button" onClick={cancel} disabled={busy} className="link text-sm disabled:opacity-60">
        {busy ? "Cancelling…" : "Cancel"}
      </button>
      {error && <span className="field-error block">{error}</span>}
    </span>
  );
}
