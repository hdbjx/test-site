-- Every Detail gift cards v1
-- Website purchase requests + staff approval + recipient balances.
-- Purchased gift-card value has no expiration and no inactivity fee by default.

create extension if not exists pgcrypto;

create table if not exists public.gift_card_orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('GC-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  amount_cents integer not null check (amount_cents between 2500 and 200000),
  purchaser_name text not null,
  purchaser_email text not null,
  purchaser_phone text,
  recipient_name text not null,
  recipient_email text,
  message text,
  payment_method text not null check (payment_method in ('venmo','zelle')),
  delivery_mode text not null default 'purchaser' check (delivery_mode in ('purchaser','recipient')),
  status text not null default 'pending_payment' check (status in ('pending_payment','approved','cancelled','refunded')),
  approved_at timestamptz,
  approved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gift_card_orders_status_created_idx
  on public.gift_card_orders(status, created_at desc);
create index if not exists gift_card_orders_purchaser_email_idx
  on public.gift_card_orders(lower(purchaser_email));
create index if not exists gift_card_orders_recipient_email_idx
  on public.gift_card_orders(lower(recipient_email));

create table if not exists public.gift_cards (
  id uuid primary key default gen_random_uuid(),
  order_id uuid unique references public.gift_card_orders(id) on delete restrict,
  code text not null unique,
  initial_value_cents integer not null check (initial_value_cents > 0),
  balance_cents integer not null check (balance_cents >= 0),
  recipient_name text,
  recipient_email text,
  claimed_by_client_id uuid references public.clients(id) on delete set null,
  status text not null default 'active' check (status in ('active','depleted','void')),
  issued_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gift_cards_recipient_email_idx on public.gift_cards(lower(recipient_email));
create index if not exists gift_cards_claimed_client_idx on public.gift_cards(claimed_by_client_id);

create table if not exists public.gift_card_transactions (
  id uuid primary key default gen_random_uuid(),
  gift_card_id uuid not null references public.gift_cards(id) on delete restrict,
  amount_cents integer not null,
  transaction_type text not null check (transaction_type in ('issue','redeem','adjustment','refund')),
  job_id uuid references public.jobs(id) on delete set null,
  note text,
  actor_user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists gift_card_transactions_card_idx on public.gift_card_transactions(gift_card_id, created_at desc);

alter table public.gift_card_orders enable row level security;
alter table public.gift_cards enable row level security;
alter table public.gift_card_transactions enable row level security;

-- Staff app: managers can review/approve; active staff can read gift cards at checkout.
drop policy if exists "Managers manage gift card orders" on public.gift_card_orders;
create policy "Managers manage gift card orders" on public.gift_card_orders
  for all to authenticated using (public.is_manager()) with check (public.is_manager());

drop policy if exists "Staff read gift cards" on public.gift_cards;
create policy "Staff read gift cards" on public.gift_cards
  for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.active));

drop policy if exists "Managers manage gift cards" on public.gift_cards;
create policy "Managers manage gift cards" on public.gift_cards
  for all to authenticated using (public.is_manager()) with check (public.is_manager());

drop policy if exists "Staff read gift card transactions" on public.gift_card_transactions;
create policy "Staff read gift card transactions" on public.gift_card_transactions
  for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.active));

drop policy if exists "Managers manage gift card transactions" on public.gift_card_transactions;
create policy "Managers manage gift card transactions" on public.gift_card_transactions
  for all to authenticated using (public.is_manager()) with check (public.is_manager());

create or replace function public.approve_gift_card_order(p_order_id uuid)
returns table(card_id uuid, card_code text, balance_cents integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  o public.gift_card_orders%rowtype;
  c public.gift_cards%rowtype;
  v_code text;
begin
  if not public.is_manager() then raise exception 'manager_required'; end if;

  select * into o from public.gift_card_orders where id = p_order_id for update;
  if not found then raise exception 'order_not_found'; end if;

  if o.status = 'approved' then
    select * into c from public.gift_cards where order_id = o.id;
    return query select c.id, c.code, c.balance_cents;
    return;
  end if;
  if o.status <> 'pending_payment' then raise exception 'order_not_pending'; end if;

  loop
    v_code := 'ED-' || upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 4)) || '-' ||
              upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 4)) || '-' ||
              upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 4));
    exit when not exists (select 1 from public.gift_cards where code = v_code);
  end loop;

  insert into public.gift_cards(order_id, code, initial_value_cents, balance_cents, recipient_name, recipient_email)
  values(o.id, v_code, o.amount_cents, o.amount_cents, o.recipient_name, nullif(lower(trim(o.recipient_email)), ''))
  returning * into c;

  insert into public.gift_card_transactions(gift_card_id, amount_cents, transaction_type, note, actor_user_id)
  values(c.id, o.amount_cents, 'issue', 'Gift card activated after payment approval', auth.uid());

  update public.gift_card_orders
  set status = 'approved', approved_at = now(), approved_by = auth.uid(), updated_at = now()
  where id = o.id;

  return query select c.id, c.code, c.balance_cents;
end;
$$;

revoke execute on function public.approve_gift_card_order(uuid) from public, anon;
grant execute on function public.approve_gift_card_order(uuid) to authenticated;

create or replace function public.claim_my_gift_cards()
returns table(id uuid, code text, balance_cents integer, initial_value_cents integer, recipient_name text, issued_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client uuid;
  v_email text;
begin
  select ca.client_id, lower(u.email)
  into v_client, v_email
  from public.client_accounts ca
  join auth.users u on u.id = ca.user_id
  where ca.user_id = auth.uid();

  if v_client is null then raise exception 'client_account_required'; end if;

  update public.gift_cards gc
  set claimed_by_client_id = v_client, updated_at = now()
  where gc.claimed_by_client_id is null
    and gc.status in ('active','depleted')
    and gc.recipient_email is not null
    and lower(gc.recipient_email) = v_email;

  return query
    select gc.id, gc.code, gc.balance_cents, gc.initial_value_cents, gc.recipient_name, gc.issued_at
    from public.gift_cards gc
    where gc.claimed_by_client_id = v_client
    order by gc.issued_at desc;
end;
$$;

revoke execute on function public.claim_my_gift_cards() from public, anon;
grant execute on function public.claim_my_gift_cards() to authenticated;

create or replace function public.redeem_gift_card(
  p_code text,
  p_amount_cents integer,
  p_job_id uuid default null,
  p_note text default null
)
returns table(gift_card_id uuid, remaining_balance_cents integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.gift_cards%rowtype;
begin
  if not public.is_manager() then raise exception 'manager_required'; end if;
  if p_amount_cents <= 0 then raise exception 'invalid_amount'; end if;

  select * into c
  from public.gift_cards
  where upper(code) = upper(trim(p_code))
  for update;

  if not found then raise exception 'gift_card_not_found'; end if;
  if c.status <> 'active' then raise exception 'gift_card_not_active'; end if;
  if c.balance_cents < p_amount_cents then raise exception 'insufficient_gift_card_balance'; end if;

  update public.gift_cards
  set balance_cents = balance_cents - p_amount_cents,
      status = case when balance_cents - p_amount_cents = 0 then 'depleted' else 'active' end,
      updated_at = now()
  where id = c.id
  returning balance_cents into c.balance_cents;

  insert into public.gift_card_transactions(gift_card_id, amount_cents, transaction_type, job_id, note, actor_user_id)
  values(c.id, -p_amount_cents, 'redeem', p_job_id, coalesce(p_note, 'Applied to service'), auth.uid());

  return query select c.id, c.balance_cents;
end;
$$;

revoke execute on function public.redeem_gift_card(text, integer, uuid, text) from public, anon;
grant execute on function public.redeem_gift_card(text, integer, uuid, text) to authenticated;
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
