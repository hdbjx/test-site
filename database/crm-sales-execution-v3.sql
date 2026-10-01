-- Every Detail CRM Sales Execution v3
-- Additive migration for the existing crm-v1.sql schema.
-- Keeps legacy status values intact so current clients and RLS continue to work.
-- Communication cadence:
--   Days 0-3: 2 calls + 1 text each day
--   Days 4-5: 1 text each day
--   Day 6: email
--   Day 7+: manager outcome / nurture decision

create extension if not exists pgcrypto;

alter table public.crm_leads
  add column if not exists normalized_phone text,
  add column if not exists normalized_email text,
  add column if not exists lifecycle_stage text not null default 'new',
  add column if not exists action_step text default 'call_1',
  add column if not exists next_action_at timestamptz,
  add column if not exists snoozed_until timestamptz,
  add column if not exists last_contact_at timestamptz,
  add column if not exists booked_at timestamptz,
  add column if not exists lost_at timestamptz;

create or replace function public.crm_normalize_phone(value text)
returns text language sql immutable as $$
  select case when value is null then null else nullif(right(regexp_replace(value, '[^0-9]', '', 'g'), 10), '') end
$$;
create or replace function public.crm_normalize_email(value text)
returns text language sql immutable as $$ select nullif(lower(trim(value)), '') $$;

create table if not exists public.crm_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id text not null,
  actor text,
  activity_type text not null,
  outcome text,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists crm_activities_lead_created_idx on public.crm_activities(lead_id, created_at desc);
create index if not exists crm_leads_normalized_phone_idx on public.crm_leads(normalized_phone);
create index if not exists crm_leads_normalized_email_idx on public.crm_leads(normalized_email);
create index if not exists crm_leads_action_queue_idx on public.crm_leads(lifecycle_stage, next_action_at);

alter table public.crm_activities enable row level security;
drop policy if exists "Managers can view CRM activities" on public.crm_activities;
create policy "Managers can view CRM activities" on public.crm_activities for select to authenticated using (public.is_manager());
drop policy if exists "Managers can create CRM activities" on public.crm_activities;
create policy "Managers can create CRM activities" on public.crm_activities for insert to authenticated with check (public.is_manager());

create or replace function public.crm_sync_identity()
returns trigger language plpgsql as $$
begin
  new.normalized_phone := public.crm_normalize_phone(new.phone);
  new.normalized_email := public.crm_normalize_email(new.email);
  new.updated_at := now();
  return new;
end; $$;
drop trigger if exists crm_sync_identity_trigger on public.crm_leads;
create trigger crm_sync_identity_trigger before insert or update on public.crm_leads for each row execute function public.crm_sync_identity();

-- Calculates the next automated task from the documented cadence.
create or replace function public.crm_recalculate_lead(p_lead_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  l public.crm_leads;
  today_et date := (now() at time zone 'America/New_York')::date;
  day_num integer;
  calls_target integer;
  texts_target integer;
  next_step text;
  next_label text;
  next_at timestamptz;
begin
  select * into l from public.crm_leads where id::text = p_lead_id for update;
  if not found then return; end if;

  if l.status in ('booked','lost','archived') or l.lifecycle_stage in ('won','lost','nurture') then
    update public.crm_leads set action_step=null,next_action_type=null,next_action_due_date=null,next_action_at=null where id::text=p_lead_id;
    return;
  end if;
  if l.status='follow_up' or l.lifecycle_stage='follow_up' then
    update public.crm_leads set lifecycle_stage='follow_up',action_step='custom_follow_up',next_action_type='Follow up',next_action_at=coalesce(l.snoozed_until,(l.follow_up_date::timestamp at time zone 'America/New_York')),next_action_due_date=coalesce((l.snoozed_until at time zone 'America/New_York')::date,l.follow_up_date) where id::text=p_lead_id;
    return;
  end if;
  if coalesce(l.answered,false) or l.lifecycle_stage='waiting' then
    update public.crm_leads set lifecycle_stage='waiting',action_step=null,next_action_type=null,next_action_due_date=null,next_action_at=null where id::text=p_lead_id;
    return;
  end if;

  day_num := greatest(0, today_et - ((l.created_at at time zone 'America/New_York')::date));
  next_step := null; next_label := null; next_at := null;
  if day_num <= 3 then
    calls_target := (day_num + 1) * 2;
    texts_target := day_num + 1;
    if coalesce(l.call_attempts,0) < calls_target then
      next_step := case when mod(coalesce(l.call_attempts,0),2)=0 then 'call_1' else 'call_2' end;
      next_label := case when next_step='call_1' then 'Call 1 of 2' else 'Call 2 of 2' end;
      next_at := now();
    elsif coalesce(l.text_attempts,0) < texts_target then
      next_step := 'text'; next_label := 'Text'; next_at := now();
    end if;
  elsif day_num between 4 and 5 then
    texts_target := day_num + 1;
    if coalesce(l.text_attempts,0) < texts_target then next_step:='text';next_label:='Text';next_at:=now();end if;
  elsif day_num = 6 then
    if coalesce(l.email_attempts,0) < 1 then next_step:='email';next_label:='Email';next_at:=now();end if;
  else
    next_step := 'decision'; next_label := 'Move to Follow-Up'; next_at := now();
  end if;

  update public.crm_leads set
    lifecycle_stage = case when coalesce(l.call_attempts,0)+coalesce(l.text_attempts,0)+coalesce(l.email_attempts,0)>0 then 'working' else 'new' end,
    action_step=next_step,next_action_type=next_label,next_action_at=next_at,
    next_action_due_date=case when next_at is null then null else (next_at at time zone 'America/New_York')::date end
  where id::text=p_lead_id;
end; $$;

create or replace function public.crm_refresh_next_actions()
returns void language plpgsql security invoker set search_path=public as $$
declare r record;
begin
  if not public.is_manager() then raise exception 'Manager access required'; end if;
  for r in select id::text id from public.crm_leads where status in ('active','follow_up') loop
    perform public.crm_recalculate_lead(r.id);
  end loop;
end; $$;
grant execute on function public.crm_refresh_next_actions() to authenticated;
revoke all on function public.crm_recalculate_lead(text) from public;

create or replace function public.crm_record_outcome(
  p_lead_id text,
  p_outcome text,
  p_actor text default 'Every Detail',
  p_note text default null,
  p_follow_up_at timestamptz default null
)
returns public.crm_leads
language plpgsql
security definer
set search_path = public
as $$
declare l public.crm_leads; activity text;
begin
  if auth.role() <> 'service_role' and not public.is_manager() then raise exception 'Manager access required'; end if;
  select * into l from public.crm_leads where id::text=p_lead_id for update;
  if not found then raise exception 'Lead not found'; end if;

  if p_outcome='booked' then
    update public.crm_leads set lifecycle_stage='won',status='booked',answered=true,action_step=null,next_action_at=null,next_action_type=null,next_action_due_date=null,booked_at=now(),last_contact_at=now() where id::text=p_lead_id;
    activity:='outcome';
  elsif p_outcome='not_interested' then
    update public.crm_leads set lifecycle_stage='lost',status='lost',answered=true,action_step=null,next_action_at=null,next_action_type=null,next_action_due_date=null,lost_at=now(),last_contact_at=now() where id::text=p_lead_id;
    activity:='outcome';
  elsif p_outcome='follow_up_later' then
    if p_follow_up_at is null then raise exception 'follow_up_later requires p_follow_up_at'; end if;
    update public.crm_leads set lifecycle_stage='follow_up',status='follow_up',answered=true,action_step='custom_follow_up',next_action_at=p_follow_up_at,next_action_type='Follow up',next_action_due_date=(p_follow_up_at at time zone 'America/New_York')::date,follow_up_date=(p_follow_up_at at time zone 'America/New_York')::date,snoozed_until=p_follow_up_at,last_contact_at=now() where id::text=p_lead_id;
    activity:='follow_up';
  elsif p_outcome in ('talked','customer_responded','quote_sent') then
    update public.crm_leads set lifecycle_stage='waiting',status='active',answered=true,action_step=null,next_action_at=null,next_action_type=null,next_action_due_date=null,last_contact_at=now() where id::text=p_lead_id;
    activity:='outcome';
  elsif p_outcome='no_answer' then
    update public.crm_leads set lifecycle_stage='working',status='active',answered=false,call_attempts=coalesce(call_attempts,0)+1,last_contact_date=now() where id::text=p_lead_id;
    perform public.crm_recalculate_lead(p_lead_id); activity:='call';
  elsif p_outcome='text_sent' then
    update public.crm_leads set lifecycle_stage='working',status='active',answered=false,text_attempts=coalesce(text_attempts,0)+1,last_contact_date=now() where id::text=p_lead_id;
    perform public.crm_recalculate_lead(p_lead_id); activity:='text';
  elsif p_outcome='email_sent' then
    update public.crm_leads set lifecycle_stage='working',status='active',answered=false,email_attempts=coalesce(email_attempts,0)+1,last_contact_date=now() where id::text=p_lead_id;
    perform public.crm_recalculate_lead(p_lead_id); activity:='email';
  else
    raise exception 'Unsupported CRM outcome: %',p_outcome;
  end if;

  insert into public.crm_activities(lead_id,actor,activity_type,outcome,note) values(p_lead_id,p_actor,activity,p_outcome,p_note);
  select * into l from public.crm_leads where id::text=p_lead_id;
  return l;
end; $$;
grant execute on function public.crm_record_outcome(text,text,text,text,timestamptz) to authenticated;

-- Backfill existing rows without changing terminal statuses.
update public.crm_leads set
  normalized_phone=public.crm_normalize_phone(phone),
  normalized_email=public.crm_normalize_email(email),
  lifecycle_stage=case when status='booked' then 'won' when status='lost' then 'lost' when status='archived' then 'nurture' when status='follow_up' then 'follow_up' when answered then 'waiting' when call_attempts+text_attempts+email_attempts>0 then 'working' else 'new' end;
select public.crm_recalculate_lead(id::text) from public.crm_leads where status in ('active','follow_up');

create or replace view public.crm_needs_action as
select l.*,
  case when l.lifecycle_stage='new' and l.created_at>=now()-interval '30 minutes' then 0 when l.next_action_at<now()-interval '1 minute' then 1 when l.lifecycle_stage='new' then 2 when l.lifecycle_stage='follow_up' then 3 else 4 end as queue_priority
from public.crm_leads l
where l.lifecycle_stage in ('new','working','follow_up') and l.next_action_at is not null and l.next_action_at<=now()
order by queue_priority asc,case when l.lifecycle_stage='new' then l.created_at end desc nulls last,l.next_action_at asc;
grant select on public.crm_needs_action to authenticated;
grant select,insert on public.crm_activities to authenticated;

create or replace function public.crm_mark_booked_by_identity(p_phone text,p_email text default null,p_actor text default 'Website booking')
returns integer language plpgsql security definer set search_path=public as $$
declare n integer;ph text:=public.crm_normalize_phone(p_phone);em text:=public.crm_normalize_email(p_email);
begin
  with matched as (
    update public.crm_leads set lifecycle_stage='won',status='booked',answered=true,action_step=null,next_action_at=null,next_action_type=null,next_action_due_date=null,booked_at=coalesce(booked_at,now())
    where lifecycle_stage not in ('won','lost') and ((ph is not null and normalized_phone=ph) or (em is not null and normalized_email=em)) returning id::text id
  ),logged as (
    insert into public.crm_activities(lead_id,actor,activity_type,outcome,note) select id,p_actor,'booking','booked','Matched automatically from website booking' from matched returning 1
  ) select count(*) into n from logged;
  return coalesce(n,0);
end; $$;

create or replace function public.crm_upsert_website_quote(
  p_full_name text,p_phone text,p_email text,p_address text,p_vehicle_year integer,p_vehicle_make text,p_vehicle_model text,p_vehicle_size text,p_requested_service text,p_message text
)
returns text language plpgsql security definer set search_path=public as $$
declare v_id text;ph text:=public.crm_normalize_phone(p_phone);em text:=public.crm_normalize_email(p_email);repeat boolean:=false;
begin
  select id::text into v_id from public.crm_leads where lifecycle_stage not in ('won','lost') and ((ph is not null and normalized_phone=ph) or (em is not null and normalized_email=em)) order by created_at desc limit 1 for update;
  if v_id is null then
    insert into public.crm_leads(full_name,phone,email,address,vehicle_year,vehicle_make,vehicle_model,vehicle_size,requested_service,message,source,status,lifecycle_stage,action_step,next_action_at,next_action_type,next_action_due_date,answered,call_attempts,text_attempts,email_attempts)
    values(p_full_name,p_phone,p_email,p_address,p_vehicle_year,p_vehicle_make,p_vehicle_model,p_vehicle_size,p_requested_service,p_message,'New Website','active','new','call_1',now(),'Call 1 of 2',(now() at time zone 'America/New_York')::date,false,0,0,0) returning id::text into v_id;
  else
    repeat:=true;
    update public.crm_leads set full_name=coalesce(nullif(p_full_name,''),full_name),phone=coalesce(nullif(p_phone,''),phone),email=coalesce(nullif(p_email,''),email),address=coalesce(nullif(p_address,''),address),vehicle_year=coalesce(p_vehicle_year,vehicle_year),vehicle_make=coalesce(nullif(p_vehicle_make,''),vehicle_make),vehicle_model=coalesce(nullif(p_vehicle_model,''),vehicle_model),vehicle_size=coalesce(nullif(p_vehicle_size,''),vehicle_size),requested_service=coalesce(nullif(p_requested_service,''),requested_service),message=coalesce(nullif(p_message,''),message),source='New Website',status='active',lifecycle_stage='new',answered=false,action_step='call_1',next_action_at=now(),next_action_type='Call 1 of 2',next_action_due_date=(now() at time zone 'America/New_York')::date,snoozed_until=null where id::text=v_id;
  end if;
  insert into public.crm_activities(lead_id,actor,activity_type,outcome,note) values(v_id,'Website',case when repeat then 'repeat_inquiry' else 'lead_created' end,case when repeat then 'repeat_quote' else 'new_quote' end,case when repeat then 'Customer submitted another website quote' else 'Quote submitted through website' end);
  return v_id;
end; $$;
grant execute on function public.crm_upsert_website_quote(text,text,text,text,integer,text,text,text,text,text) to service_role;
grant execute on function public.crm_mark_booked_by_identity(text,text,text) to service_role;
