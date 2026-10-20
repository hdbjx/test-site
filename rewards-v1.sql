-- Every Detail rewards wallet v1
-- Keeps promotional/earned rewards separate from purchased gift-card value.

create table if not exists public.reward_wallets (
  client_id uuid primary key references public.clients(id) on delete cascade,
  balance_cents integer not null default 0 check (balance_cents >= 0),
  lifetime_earned_cents integer not null default 0 check (lifetime_earned_cents >= 0),
  lifetime_redeemed_cents integer not null default 0 check (lifetime_redeemed_cents >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.reward_transactions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  amount_cents integer not null,
  transaction_type text not null check (transaction_type in ('earn','redeem','adjustment','expire')),
  job_id uuid references public.jobs(id) on delete set null,
  note text,
  actor_user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists reward_transactions_client_idx
  on public.reward_transactions(client_id, created_at desc);

alter table public.reward_wallets enable row level security;
alter table public.reward_transactions enable row level security;

drop policy if exists "Staff read reward wallets" on public.reward_wallets;
create policy "Staff read reward wallets" on public.reward_wallets
  for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.active));

drop policy if exists "Managers manage reward wallets" on public.reward_wallets;
create policy "Managers manage reward wallets" on public.reward_wallets
  for all to authenticated using (public.is_manager()) with check (public.is_manager());

drop policy if exists "Staff read reward transactions" on public.reward_transactions;
create policy "Staff read reward transactions" on public.reward_transactions
  for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.active));

drop policy if exists "Managers manage reward transactions" on public.reward_transactions;
create policy "Managers manage reward transactions" on public.reward_transactions
  for all to authenticated using (public.is_manager()) with check (public.is_manager());

create or replace function public.get_my_reward_balance()
returns table(balance_cents integer, lifetime_earned_cents integer, lifetime_redeemed_cents integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client uuid;
begin
  select ca.client_id into v_client
  from public.client_accounts ca
  where ca.user_id = auth.uid();

  if v_client is null then raise exception 'client_account_required'; end if;

  insert into public.reward_wallets(client_id)
  values(v_client)
  on conflict (client_id) do nothing;

  return query
    select rw.balance_cents, rw.lifetime_earned_cents, rw.lifetime_redeemed_cents
    from public.reward_wallets rw
    where rw.client_id = v_client;
end;
$$;

revoke execute on function public.get_my_reward_balance() from public, anon;
grant execute on function public.get_my_reward_balance() to authenticated;

create or replace function public.award_rewards(
  p_client_id uuid,
  p_amount_cents integer,
  p_note text default null,
  p_job_id uuid default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
begin
  if not public.is_manager() then raise exception 'manager_required'; end if;
  if p_amount_cents <= 0 then raise exception 'invalid_amount'; end if;

  insert into public.reward_wallets(client_id, balance_cents, lifetime_earned_cents)
  values(p_client_id, p_amount_cents, p_amount_cents)
  on conflict (client_id) do update
    set balance_cents = reward_wallets.balance_cents + excluded.balance_cents,
        lifetime_earned_cents = reward_wallets.lifetime_earned_cents + excluded.lifetime_earned_cents,
        updated_at = now()
  returning balance_cents into v_balance;

  insert into public.reward_transactions(client_id, amount_cents, transaction_type, job_id, note, actor_user_id)
  values(p_client_id, p_amount_cents, 'earn', p_job_id, coalesce(p_note, 'Reward earned'), auth.uid());

  return v_balance;
end;
$$;

revoke execute on function public.award_rewards(uuid, integer, text, uuid) from public, anon;
grant execute on function public.award_rewards(uuid, integer, text, uuid) to authenticated;

create or replace function public.redeem_rewards(
  p_client_id uuid,
  p_amount_cents integer,
  p_job_id uuid default null,
  p_note text default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_wallet public.reward_wallets%rowtype;
begin
  if not public.is_manager() then raise exception 'manager_required'; end if;
  if p_amount_cents <= 0 then raise exception 'invalid_amount'; end if;

  select * into v_wallet
  from public.reward_wallets
  where client_id = p_client_id
  for update;

  if not found then raise exception 'reward_wallet_not_found'; end if;
  if v_wallet.balance_cents < p_amount_cents then raise exception 'insufficient_reward_balance'; end if;

  update public.reward_wallets
  set balance_cents = balance_cents - p_amount_cents,
      lifetime_redeemed_cents = lifetime_redeemed_cents + p_amount_cents,
      updated_at = now()
  where client_id = p_client_id
  returning * into v_wallet;

  insert into public.reward_transactions(client_id, amount_cents, transaction_type, job_id, note, actor_user_id)
  values(p_client_id, -p_amount_cents, 'redeem', p_job_id, coalesce(p_note, 'Applied at checkout'), auth.uid());

  return v_wallet.balance_cents;
end;
$$;

revoke execute on function public.redeem_rewards(uuid, integer, uuid, text) from public, anon;
grant execute on function public.redeem_rewards(uuid, integer, uuid, text) to authenticated;

create or replace function public.get_checkout_credit(p_client_id uuid)
returns table(reward_balance_cents integer, gift_card_balance_cents bigint, total_credit_cents bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.profiles p where p.id = auth.uid() and p.active) then
    raise exception 'staff_required';
  end if;

  return query
    select
      coalesce((select rw.balance_cents from public.reward_wallets rw where rw.client_id = p_client_id), 0),
      coalesce((select sum(gc.balance_cents)::bigint from public.gift_cards gc where gc.claimed_by_client_id = p_client_id and gc.status = 'active'), 0),
      coalesce((select rw.balance_cents::bigint from public.reward_wallets rw where rw.client_id = p_client_id), 0)
        + coalesce((select sum(gc.balance_cents)::bigint from public.gift_cards gc where gc.claimed_by_client_id = p_client_id and gc.status = 'active'), 0);
end;
$$;

revoke execute on function public.get_checkout_credit(uuid) from public, anon;
grant execute on function public.get_checkout_credit(uuid) to authenticated;
