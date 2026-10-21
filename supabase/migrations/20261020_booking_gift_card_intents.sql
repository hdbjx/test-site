-- Every Detail website booking gift-card intent
-- Validates a card during booking, attaches it to the job, but does not redeem value until checkout.

create table if not exists public.job_gift_card_intents (
  job_id uuid primary key references public.jobs(id) on delete cascade,
  gift_card_id uuid not null references public.gift_cards(id) on delete restrict,
  balance_cents_at_booking integer not null check (balance_cents_at_booking >= 0),
  source text not null default 'website_booking',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists job_gift_card_intents_gift_card_idx
  on public.job_gift_card_intents(gift_card_id);

alter table public.job_gift_card_intents enable row level security;

revoke all on public.job_gift_card_intents from public, anon;

grant select on public.job_gift_card_intents to authenticated;

create or replace function public.team_get_job_booking_gift_card(p_job_id uuid)
returns table(
  gift_card_id uuid,
  code text,
  code_last4 text,
  recipient_name text,
  balance_cents integer,
  balance_cents_at_booking integer
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.ed_can_apply_job_credit(p_job_id) then
    raise exception 'Not assigned to this job.';
  end if;

  return query
    select
      gc.id,
      gc.code,
      right(gc.code, 4),
      gc.recipient_name,
      gc.balance_cents,
      i.balance_cents_at_booking
    from public.job_gift_card_intents i
    join public.gift_cards gc on gc.id = i.gift_card_id
    where i.job_id = p_job_id
      and gc.status = 'active'
      and gc.balance_cents > 0
      and (gc.expires_at is null or gc.expires_at > now())
    limit 1;
end;
$$;

revoke execute on function public.team_get_job_booking_gift_card(uuid) from public, anon;
grant execute on function public.team_get_job_booking_gift_card(uuid) to authenticated;

notify pgrst, 'reload schema';
