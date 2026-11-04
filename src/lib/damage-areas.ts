/**
 * Damage check v2 vocabulary, shared with Van HQ (components/damage-map.js).
 * Outline boxes are [x, y, w, h] in a 220 x 360 top-down car, front at the top,
 * driver side on the left.
 */
export const DAMAGE_AREAS: Record<string, { label: string; box?: [number, number, number, number] }> = {
  front_bumper: { label: "Front bumper", box: [55, 20, 110, 22] },
  hood: { label: "Hood", box: [70, 44, 80, 66] },
  windshield: { label: "Windshield", box: [70, 112, 80, 26] },
  roof: { label: "Roof", box: [70, 140, 80, 82] },
  rear_window: { label: "Rear window", box: [70, 224, 80, 26] },
  trunk: { label: "Trunk / tailgate", box: [70, 252, 80, 64] },
  rear_bumper: { label: "Rear bumper", box: [55, 318, 110, 22] },
  lf_fender: { label: "Driver front fender", box: [45, 44, 24, 66] },
  lf_door: { label: "Driver front door", box: [45, 112, 24, 60] },
  lr_door: { label: "Driver rear door", box: [45, 174, 24, 60] },
  lr_quarter: { label: "Driver rear quarter", box: [45, 236, 24, 80] },
  rf_fender: { label: "Passenger front fender", box: [151, 44, 24, 66] },
  rf_door: { label: "Passenger front door", box: [151, 112, 24, 60] },
  rr_door: { label: "Passenger rear door", box: [151, 174, 24, 60] },
  rr_quarter: { label: "Passenger rear quarter", box: [151, 236, 24, 80] },
  lf_wheel: { label: "Driver front wheel", box: [20, 58, 22, 46] },
  lr_wheel: { label: "Driver rear wheel", box: [20, 262, 22, 46] },
  rf_wheel: { label: "Passenger front wheel", box: [178, 58, 22, 46] },
  rr_wheel: { label: "Passenger rear wheel", box: [178, 262, 22, 46] },
  interior_front: { label: "Inside, front seats" },
  interior_rear: { label: "Inside, rear seats" },
  cargo: { label: "Cargo area" },
  other: { label: "Other" },
};
export const DAMAGE_KINDS: Record<string, string> = { scratch: "Scratch", scuff: "Scuff", dent: "Dent", chip: "Chip", crack: "Crack", curb_rash: "Curb rash", stain: "Stain", tear: "Tear", burn: "Burn", other: "Other" };
export const DAMAGE_SEVERITIES: Record<string, string> = { minor: "Minor", moderate: "Moderate", major: "Major" };

export function damageSpotTitle(d: { area?: string | null; kind?: string | null; source?: string | null }) {
  const area = d.area && d.area !== "other" ? DAMAGE_AREAS[d.area]?.label || "" : "";
  const kind = d.kind && d.kind !== "other" ? DAMAGE_KINDS[d.kind] || "" : "";
  if (!area && !kind) return d.source === "legacy_note" ? "Note from an earlier visit" : "Damage";
  return [area, kind].filter(Boolean).join(" - ");
}
