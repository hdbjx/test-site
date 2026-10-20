import { createClient } from "./server";
import { supabaseConfigured } from "./config";
import type { PortalJob } from "@/lib/client-portal";

export type AccountInfo = { client_id: string; full_name: string; phone: string | null; email: string | null; address: string | null };
export type GarageVehicle = {
  id: string;
  year: number | null;
  make: string | null;
  model: string | null;
  color: string | null;
  vehicle_size: string | null;
  pet_hair: string | null;
  odor_issues: string | null;
  problem_areas: string | null;
  is_primary: boolean;
  ceramic_installed: boolean;
  recommended_next: string | null;
};

export type ClientGiftCard = {
  id: string;
  code: string;
  balance_cents: number;
  initial_value_cents: number;
  recipient_name: string | null;
  issued_at: string;
};


export type ClientRewardBalance = {
  balance_cents: number;
  lifetime_earned_cents: number;
  lifetime_redeemed_cents: number;
};

export type ClientJob = {
  id: string;
  service_name: string;
  vehicle: string;
  scheduled_start: string;
  status: string;
  address: string | null;
  price: number | null;
};

export type SessionState =
  | { state: "signed-out" }
  | { state: "unconfirmed"; email: string }
  | { state: "staff"; email: string }
  | { state: "customer"; email: string; account: AccountInfo; garage: GarageVehicle[] };

/** Who is visiting, and their customer record if they have one. Links/creates the client on first sign-in. */
export async function getSession(): Promise<SessionState> {
  if (!supabaseConfigured) return { state: "signed-out" };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { state: "signed-out" };
  const email = user.email ?? "";
  if (!user.email_confirmed_at) return { state: "unconfirmed", email };

  const meta = (user.user_metadata ?? {}) as { full_name?: string; phone?: string };
  const ensured = await supabase.rpc("ensure_my_client", { p_full_name: meta.full_name ?? null, p_phone: meta.phone ?? null });
  if (ensured.error) {
    if (ensured.error.message.includes("staff_account")) return { state: "staff", email };
    throw ensured.error;
  }

  const [acct, garage] = await Promise.all([supabase.rpc("get_my_account"), supabase.rpc("get_my_garage")]);
  if (acct.error) throw acct.error;
  if (garage.error) throw garage.error;
  const account = (acct.data as AccountInfo[])[0];
  return { state: "customer", email, account, garage: (garage.data as GarageVehicle[]) ?? [] };
}

export async function getMyJobs(): Promise<ClientJob[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_my_client_jobs");
  if (error) throw error;
  return (data as ClientJob[]) ?? [];
}

export async function getMyPortalJobs(): Promise<PortalJob[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_my_client_portal_jobs");
  if (error) throw error;
  return (data as PortalJob[]) ?? [];
}

export async function getMyGiftCards(): Promise<ClientGiftCard[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("claim_my_gift_cards");
  if (error) {
    // Keep accounts usable before the gift-card migration has been applied.
    if (error.message.includes("claim_my_gift_cards") || error.code === "PGRST202") return [];
    throw error;
  }
  return (data as ClientGiftCard[]) ?? [];
}

export async function getMyRewardBalance(): Promise<ClientRewardBalance> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_my_reward_balance");
  if (error) {
    if (error.message.includes("get_my_reward_balance") || error.code === "PGRST202") {
      return { balance_cents: 0, lifetime_earned_cents: 0, lifetime_redeemed_cents: 0 };
    }
    throw error;
  }
  return ((data as ClientRewardBalance[]) ?? [])[0] ?? { balance_cents: 0, lifetime_earned_cents: 0, lifetime_redeemed_cents: 0 };
}

export const vehicleName = (v: Pick<GarageVehicle, "year" | "make" | "model">) =>
  [v.year, v.make, v.model].filter(Boolean).join(" ") || "Vehicle";
