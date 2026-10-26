/** Accept only same-origin relative paths. Protocol-relative and backslash forms are rejected. */
export function safeInternalPath(value: string | null | undefined, fallback = "/account") {
  const raw = value?.trim();
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return fallback;
  if (/[\\\u0000-\u001f\u007f]/.test(raw)) return fallback;

  try {
    const decoded = decodeURIComponent(raw);
    if (decoded.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(decoded)) return fallback;
  } catch {
    return fallback;
  }

  try {
    const base = new URL("https://internal.everydetail.invalid");
    const parsed = new URL(raw, base);
    if (parsed.origin !== base.origin) return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}` || fallback;
  } catch {
    return fallback;
  }
}
