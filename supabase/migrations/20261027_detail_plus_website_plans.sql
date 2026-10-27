-- Every Detail: website Detail+ plans in the team app
-- Run once in the Supabase SQL editor BEFORE installing the matching team app build.
-- Safe to re-run.

begin;

-- The website saves the customer's picked tasks and where the plan came from.
alter table public.detail_plus_memberships
  add column if not exists plan_tasks jsonb,
  add column if not exists source text;

comment on column public.detail_plus_memberships.plan_tasks is 'Tasks picked on the website plan builder: [{id,label}]';
comment on column public.detail_plus_memberships.source is 'website when the plan came from everydetail.co, null for manager-entered accounts';

-- Same date math as detail-plus-live-sync-v1.sql, plus "Every 2 Months".
create or replace function public.detail_plus_next_due(p_from date, p_frequency text)
returns date
language plpgsql
immutable
set search_path=public
as $$
declare f text := lower(trim(coalesce(p_frequency,'')));
begin
  if p_from is null then return null; end if;
  if f like '%bi-week%' or f like '%biweek%' or f like '%2 week%' then return p_from + 14; end if;
  if f like '%3 week%' then return p_from + 21; end if;
  if f like '%6 week%' then return p_from + 42; end if;
  if f like '%2 month%' then return (p_from + interval '2 months')::date; end if;
  if f like '%quarter%' or f like '%3 month%' then return (p_from + interval '3 months')::date; end if;
  if f like '%weekly%' then return p_from + 7; end if;
  if f like '%month%' then return (p_from + interval '1 month')::date; end if;
  return (p_from + interval '1 month')::date;
end;
$$;

commit;

select count(*) as website_plans from public.detail_plus_memberships where source = 'website';
