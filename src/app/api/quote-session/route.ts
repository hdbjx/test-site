import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const ALLOWED = new Set(["assessment","recommendation_viewed","timing_selected","contact_captured","availability_viewed","slot_selected","booking_started","booking_completed"]);
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b || typeof b.sessionId !== "string" || !/^[0-9a-f-]{36}$/i.test(b.sessionId)) return NextResponse.json({ok:false},{status:400});
  const stage = ALLOWED.has(String(b.stage)) ? String(b.stage) : "assessment";
  const patch: Record<string, unknown> = { id:b.sessionId, updated_at:new Date().toISOString(), behavioral_stage:stage };
  for (const k of ["vehicleMake","vehicleModel","vehicleSize","conditionLabel","recommendedService","desiredTiming"] as const) if (typeof b[k] === "string") patch[{vehicleMake:"vehicle_make",vehicleModel:"vehicle_model",vehicleSize:"vehicle_size",conditionLabel:"condition_label",recommendedService:"recommended_service",desiredTiming:"desired_timing"}[k]] = b[k];
  if (Number.isFinite(Number(b.quoteAmount))) patch.quote_amount = Number(b.quoteAmount);
  if (Array.isArray(b.concerns)) patch.concerns = b.concerns.slice(0,20);
  const now = new Date().toISOString();
  if (stage==="availability_viewed") patch.availability_viewed_at=now;
  if (stage==="slot_selected") { patch.slot_selected_at=now; if (typeof b.selectedSlot==="string" && !Number.isNaN(Date.parse(b.selectedSlot))) patch.selected_slot=b.selectedSlot; }
  if (stage==="booking_started") patch.booking_started_at=now;
  if (stage==="booking_completed") patch.booking_completed_at=now;
  const {error}=await supabaseAdmin().from("quote_sessions").upsert(patch,{onConflict:"id"});
  if(error){console.error("[quote-session]",error);return NextResponse.json({ok:false},{status:500});}
  const {error:syncError}=await supabaseAdmin().rpc("crm_apply_quote_session_to_lead",{p_session_id:b.sessionId});
  if(syncError) console.error("[quote-session sync]",syncError);
  return NextResponse.json({ok:true});
}
