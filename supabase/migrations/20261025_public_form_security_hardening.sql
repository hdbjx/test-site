-- Every Detail public website security hardening
-- 2026-10-25
--
-- 1) Adds durable database-backed rate-limit buckets for public endpoints.
-- 2) Makes public contact capture non-destructive: unauthenticated forms may
--    fill blank CRM fields, but cannot overwrite an established customer's
--    name/email/address simply by knowing their phone number.

begin;

create table if not exists public.website_rate_limit_buckets (
  key_hash text not null,
  bucket_start timestamptz not null,
  hits integer not null default 1,
  expires_at timestamptz not null,
  primary key (key_hash, bucket_start)
);

create index if not exists website_rate_limit_buckets_expires_idx
  on public.website_rate_limit_buckets (expires_at);

alter table public.website_rate_limit_buckets enable row level security;
revoke all on table public.website_rate_limit_buckets from public, anon, authenticated;

create or replace function public.consume_website_rate_limit(
  p_key_hash text,
  p_window_seconds integer,
  p_limit integer
)
returns table (
  allowed boolean,
  retry_after_seconds integer,
  hits integer
)
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_window integer := greatest(10, least(coalesce(p_window_seconds, 60), 86400));
  v_limit integer := greatest(1, least(coalesce(p_limit, 10), 10000));
  v_bucket timestamptz;
  v_hits integer;
begin
  if nullif(trim(coalesce(p_key_hash, '')), '') is null then
    raise exception 'rate_limit_key_required';
  end if;

  v_bucket := to_timestamp(
    floor(extract(epoch from v_now) / v_window) * v_window
  );

  insert into public.website_rate_limit_buckets (
    key_hash,
    bucket_start,
    hits,
    expires_at
  ) values (
    left(trim(p_key_hash), 128),
    v_bucket,
    1,
    v_bucket + make_interval(secs => v_window * 2)
  )
  on conflict (key_hash, bucket_start)
  do update set
    hits = public.website_rate_limit_buckets.hits + 1,
    expires_at = excluded.expires_at
  returning website_rate_limit_buckets.hits into v_hits;

  -- Keep this tiny utility table self-cleaning without requiring another cron.
  delete from public.website_rate_limit_buckets
  where expires_at < v_now - interval '1 hour';

  return query
  select
    v_hits <= v_limit,
    greatest(1, ceil(extract(epoch from (v_bucket + make_interval(secs => v_window) - v_now)))::integer),
    v_hits;
end;
$$;

revoke all on function public.consume_website_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_website_rate_limit(text, integer, integer)
  to service_role;

create or replace function public.upsert_website_contact(
  p_full_name text,
  p_phone text,
  p_email text default null,
  p_address text default null,
  p_source text default 'website'
) returns uuid
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_name text := nullif(trim(p_full_name), '');
  v_phone text := nullif(trim(p_phone), '');
  v_phone_digits text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  v_phone_key text;
  v_email text := nullif(lower(trim(p_email)), '');
  v_address text := nullif(trim(p_address), '');
  v_source text := coalesce(nullif(trim(p_source), ''), 'website');
  v_client uuid;
  v_first text;
  v_last text;
begin
  if v_name is null or length(v_phone_digits) < 10 then
    raise exception 'contact_identity_required';
  end if;

  v_phone_key := right(v_phone_digits, 10);
  v_first := split_part(v_name, ' ', 1);
  v_last := nullif(trim(substr(v_name, length(v_first) + 1)), '');

  -- Email is the strongest public-form identity signal. Match it first.
  if v_email is not null then
    select c.id into v_client
    from public.clients c
    where lower(trim(coalesce(c.email, ''))) = v_email
    order by c.updated_at desc nulls last, c.id
    limit 1
    for update;
  end if;

  -- Phone may match an established contact only when the submitted email does
  -- not conflict with an email already on that contact. This prevents a public
  -- form from hijacking a real customer's record by knowing their phone number.
  if v_client is null then
    select c.id into v_client
    from public.clients c
    where right(regexp_replace(coalesce(c.phone, ''), '[^0-9]', '', 'g'), 10) = v_phone_key
      and (
        nullif(trim(coalesce(c.email, '')), '') is null
        or v_email is null
        or lower(trim(c.email)) = v_email
      )
    order by c.updated_at desc nulls last, c.id
    limit 1
    for update;
  end if;

  if v_client is null then
    insert into public.clients (
      full_name,
      first_name,
      last_name,
      phone,
      email,
      address,
      source
    ) values (
      v_name,
      v_first,
      v_last,
      v_phone,
      v_email,
      v_address,
      v_source
    )
    returning id into v_client;
  else
    -- Public forms are enrichment-only for an established contact. Staff tools
    -- and authenticated account flows remain the places to intentionally edit
    -- existing customer identity/address data.
    update public.clients c
    set
      full_name = case when nullif(trim(coalesce(c.full_name, '')), '') is null then v_name else c.full_name end,
      first_name = case when nullif(trim(coalesce(c.first_name, '')), '') is null then v_first else c.first_name end,
      last_name = case when nullif(trim(coalesce(c.last_name, '')), '') is null then v_last else c.last_name end,
      phone = case when nullif(trim(coalesce(c.phone, '')), '') is null then v_phone else c.phone end,
      email = case when nullif(trim(coalesce(c.email, '')), '') is null then v_email else c.email end,
      address = case when nullif(trim(coalesce(c.address, '')), '') is null then v_address else c.address end,
      source = coalesce(nullif(c.source, ''), v_source),
      updated_at = now()
    where c.id = v_client;
  end if;

  return v_client;
end;
$$;

revoke all on function public.upsert_website_contact(text, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.upsert_website_contact(text, text, text, text, text)
  to service_role;

commit;

notify pgrst, 'reload schema';
