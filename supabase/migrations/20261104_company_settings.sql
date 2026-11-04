-- Every Detail: company settings managers edit in Team HQ → Settings.
-- Contact info, payment methods, service-area drive times, meet-at-van timing
-- and the rebooking discount. The website, Van HQ and the meet-at-van
-- automation read these. Seeded with today's values, so nothing changes until
-- someone edits. Safe to re-run (never overwrites an edited value).

begin;

create table if not exists public.company_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

insert into public.company_settings (key, value) values
  ('contact',         '{"phone": "(404) 855-0672", "email": "hello@everydetail.co"}'),
  ('payment_methods', '["Cash", "Check", "Venmo", "Zelle"]'),
  -- Upper limit of each tier, in one-way drive minutes from the shop.
  ('service_area',    '{"core": 15, "route": 25, "fee": 35, "premium": 45}'),
  -- Meet at van = start − (drive + bufferMinutes); fallbackMinutes until the drive is known.
  ('meet_at',         '{"bufferMinutes": 20, "fallbackMinutes": 25}'),
  ('rebooking',       '{"nextVisitDiscountPct": 10}')
on conflict (key) do nothing;

alter table public.company_settings enable row level security;
drop policy if exists "company settings read" on public.company_settings;
create policy "company settings read" on public.company_settings for select to anon, authenticated using (true);
drop policy if exists "company settings manager write" on public.company_settings;
create policy "company settings manager write" on public.company_settings for all to authenticated
  using (public.is_manager()) with check (public.is_manager());
grant select on public.company_settings to anon, authenticated;
grant insert, update on public.company_settings to authenticated;

create or replace function public.company_settings_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end $$;
drop trigger if exists company_settings_touch on public.company_settings;
create trigger company_settings_touch before update on public.company_settings
for each row execute function public.company_settings_touch();

-- Everything in one call: {"contact": {...}, "service_area": {...}, ..., "updatedAt": ...}
create or replace function public.company_settings_public()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_object_agg(key, value), '{}'::jsonb)
         || jsonb_build_object('updatedAt', (select max(updated_at) from public.company_settings))
  from public.company_settings
$$;
revoke all on function public.company_settings_public() from public;
grant execute on function public.company_settings_public() to anon, authenticated, service_role;

-- Meet-at-van timing now comes from the settings (was a fixed 20 / 25 minutes).
create or replace function public.ed_auto_meet_time(p_start timestamptz, p_drive int)
returns timestamptz language sql stable set search_path = public as $$
  select case
    when p_drive is null then p_start - make_interval(mins => coalesce(
      (select (value->>'fallbackMinutes')::int from public.company_settings where key = 'meet_at'), 25))
    else p_start - make_interval(mins => p_drive + coalesce(
      (select (value->>'bufferMinutes')::int from public.company_settings where key = 'meet_at'), 20))
  end
$$;

-- Changing the meet-at timing re-times every upcoming automatic meet time.
-- Meet times someone set by hand are left alone.
create or replace function public.company_settings_retime_meet_at()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.key = 'meet_at' and new.value is distinct from old.value then
    perform set_config('ed.meet_auto', 'on', true);
    update public.jobs
      set meet_at_time = public.ed_auto_meet_time(scheduled_start, drive_minutes)
      where meet_at_auto
        and scheduled_start > now()
        and status::text not in ('complete', 'cancelled');
    perform set_config('ed.meet_auto', 'off', true);
  end if;
  return new;
end $$;
drop trigger if exists company_settings_retime_meet_at on public.company_settings;
create trigger company_settings_retime_meet_at after update on public.company_settings
for each row execute function public.company_settings_retime_meet_at();

notify pgrst, 'reload schema';
commit;
