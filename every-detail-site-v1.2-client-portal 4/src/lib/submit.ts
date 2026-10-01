export type SubmitResult = { ok: true } | { ok: false; error: string; missing?: string[] };

export async function submitLead(data: Record<string, string>): Promise<SubmitResult> {
  try {
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, page: window.location.pathname }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.ok) return { ok: true };
    return { ok: false, error: json.error ?? "Something went wrong.", missing: json.missing };
  } catch {
    return { ok: false, error: "No connection. Check your signal and try again, or call us." };
  }
}
