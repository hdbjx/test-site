// CHRISTMAS — day-of email headshots with a Santa/elf hat baked in (see scripts/christmas-email-hats.py).
// Returns null for anyone without a baked image, so the email falls back to the normal photo/initials.
const BAKED = new Set(["wiley", "davis", "grady", "mateo", "will", "nathan", "thomas", "rex"]);

export function xmasEmailPhoto(name: string): string | null {
  const key = (name.trim().split(/\s+/)[0] || "").toLowerCase();
  return BAKED.has(key) ? `https://www.everydetail.co/christmas/email/${key}.png` : null;
}
