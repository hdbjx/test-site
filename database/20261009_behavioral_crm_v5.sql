-- Every Detail CRM v5: behavioral website + CRM sales system
-- Run after the existing CRM schema. Safe for existing leads.
begin;

create table if not exists public.quote_sessions (
  id uuid primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  vehicle_make text, vehicle_model text, vehicle_size text,
  condition_label text, concerns jsonb not null default '[]'::jsonb,
  recommended_service text, quote_amount numeric,
  desired_timing text,
  behavioral_stage text not null default 'assessment',
  availability_viewed_at timestamptz, slot_selected_at timestamptz,
  selected_slot timestamptz, contact_captured_at timestamptz,
  booking_started_at timestamptz, booking_completed_at timestamptz,
  lead_id uuid,
  metadata jsonb not null default '{}'::jsonb
);
create index if not exists quote_sessions_stage_idx on public.quote_sessions(behavioral_stage, updated_at desc);
create index if not exists quote_sessions_lead_idx on public.quote_sessions(lead_id);

alter table public.crm_leads
  add column if not exists quote_session_id uuid,
  add column if not exists desired_timing text,
  add column if not exists behavioral_stage text,
  add column if not exists availability_viewed_at timestamptz,
  add column if not exists slot_selected_at timestamptz,
  add column if not exists booking_started_at timestamptz,
  add column if not exists selected_slot timestamptz,
  add column if not exists lead_origin text,
  add column if not exists waiting_reason text,
  add column if not exists last_outcome text,
  add column if not exists nurture_at timestamptz;

update public.crm_leads set status='archived', lifecycle_stage='nurture', action_step=null,
 next_action_at=null,next_action_type=null,next_action_due_date=null,nurture_at=coalesce(nurture_at,updated_at,now())
where status='cold';
alter table public.crm_leads drop constraint if exists crm_leads_status_check;
alter table public.crm_leads add constraint crm_leads_status_check check(status is null or status in ('active','follow_up','booked','lost','archived'));

create or replace function public.crm_recalculate_lead(p_lead_id text)
returns void language plpgsql security definer set search_path=public as $$
declare l public.crm_leads; step text; label text; due timestamptz;
begin
 select * into l from public.crm_leads where id::text=p_lead_id for update; if not found then return; end if;
 if l.status in ('booked','lost','archived') or l.lifecycle_stage in ('won','lost','nurture') then
  update public.crm_leads set action_step=null,next_action_type=null,next_action_at=null,next_action_due_date=null where id::text=p_lead_id; return;
 end if;
 if l.lifecycle_stage='follow_up' or l.status='follow_up' then
  due:=coalesce(l.snoozed_until,(l.follow_up_date::timestamp at time zone 'America/New_York'));
  update public.crm_leads set lifecycle_stage='follow_up',action_step='custom_follow_up',next_action_type='Customer-requested follow-up',next_action_at=due,next_action_due_date=(due at time zone 'America/New_York')::date where id::text=p_lead_id; return;
 end if;
 if l.lifecycle_stage='waiting' or coalesce(l.answered,false) then
  due:=coalesce(l.next_action_at,coalesce(l.last_contact_at,l.updated_at,l.created_at)+interval '48 hours');
  update public.crm_leads set lifecycle_stage='waiting',action_step='decision_follow_up',next_action_type='Decision follow-up',next_action_at=due,next_action_due_date=(due at time zone 'America/New_York')::date where id::text=p_lead_id; return;
 end if;
 -- Behavioral recovery outranks a generic cadence.
 if l.selected_slot is not null or l.slot_selected_at is not null then step:='recover_slot'; label:='Recover selected time'; due:=now();
 elsif l.booking_started_at is not null then step:='recover_booking'; label:='Recover booking'; due:=now();
 elsif l.availability_viewed_at is not null then step:='availability_follow_up'; label:='Help them choose a time'; due:=now();
 elsif coalesce(l.text_attempts,0)=0 then
   step:='text_1'; label:=case when l.desired_timing='exploring' then 'Send saved quote' else 'Help them book' end; due:=now();
 elsif l.desired_timing='exploring' then step:='nurture_review'; label:='Move to nurture'; due:=coalesce(l.last_contact_at,l.updated_at,now())+interval '7 days';
 elsif coalesce(l.call_attempts,0)=0 then step:='call_1'; label:='Call if no reply'; due:=coalesce(l.last_contact_at,l.updated_at,now())+interval '4 hours';
 elsif coalesce(l.call_attempts,0)=1 and coalesce(l.text_attempts,0)=1 then step:='text_final'; label:='Final helpful text'; due:=coalesce(l.last_contact_at,l.updated_at,now())+interval '24 hours';
 else step:='nurture_review'; label:='Move to nurture'; due:=coalesce(l.last_contact_at,l.updated_at,now())+interval '72 hours'; end if;
 update public.crm_leads set lifecycle_stage=case when coalesce(call_attempts,0)+coalesce(text_attempts,0)>0 then 'working' else 'new' end,
  action_step=step,next_action_type=label,next_action_at=due,next_action_due_date=(due at time zone 'America/New_York')::date where id::text=p_lead_id;
end $$;

create or replace function public.crm_refresh_next_actions() returns void language plpgsql security invoker set search_path=public as $$
declare r record; begin if not public.is_manager() then raise exception 'Manager access required'; end if;
 for r in select id::text id from public.crm_leads where status in ('active','follow_up') loop perform public.crm_recalculate_lead(r.id); end loop; end $$;
grant execute on function public.crm_refresh_next_actions() to authenticated;

create or replace function public.crm_upsert_website_quote(
 p_full_name text,p_phone text,p_email text,p_address text,p_vehicle_year integer,p_vehicle_make text,p_vehicle_model text,p_vehicle_size text,
 p_requested_service text,p_message text,p_quote_amount numeric,p_internal_notes text,p_source text default 'Website Recommender',
 p_quote_session_id uuid default null,p_desired_timing text default null)
returns text language plpgsql security definer set search_path=public as $$
declare v_id text; ph text:=public.crm_normalize_phone(p_phone); em text:=public.crm_normalize_email(p_email); repeat boolean:=false; qs public.quote_sessions;
begin
 if p_address is not null and btrim(p_address)<>'' then raise exception 'Quote-only lead must not require/store an address'; end if;
 if p_quote_session_id is not null then select * into qs from public.quote_sessions where id=p_quote_session_id; end if;
 select id::text into v_id from public.crm_leads where lifecycle_stage not in ('won','lost') and ((ph is not null and normalized_phone=ph) or (em is not null and normalized_email=em)) order by created_at desc limit 1 for update;
 if v_id is null then
  insert into public.crm_leads(full_name,phone,email,address,vehicle_year,vehicle_make,vehicle_model,vehicle_size,requested_service,message,quote_amount,internal_notes,source,lead_origin,status,lifecycle_stage,action_step,next_action_at,next_action_type,next_action_due_date,answered,call_attempts,text_attempts,email_attempts,quote_session_id,desired_timing,behavioral_stage,availability_viewed_at,slot_selected_at,booking_started_at,selected_slot,last_outcome)
  values(p_full_name,p_phone,p_email,null,p_vehicle_year,p_vehicle_make,p_vehicle_model,p_vehicle_size,p_requested_service,p_message,p_quote_amount,p_internal_notes,coalesce(nullif(p_source,''),'Website Recommender'),'website_recommender','active','new','text_1',now(),case when p_desired_timing='exploring' then 'Send saved quote' else 'Help them book' end,(now() at time zone 'America/New_York')::date,false,0,0,0,p_quote_session_id,p_desired_timing,coalesce(qs.behavioral_stage,'contact_captured'),qs.availability_viewed_at,qs.slot_selected_at,qs.booking_started_at,qs.selected_slot,'website_quote') returning id::text into v_id;
 else repeat:=true;
  update public.crm_leads set full_name=p_full_name,phone=p_phone,email=p_email,address=null,vehicle_make=coalesce(nullif(p_vehicle_make,''),vehicle_make),vehicle_model=coalesce(nullif(p_vehicle_model,''),vehicle_model),vehicle_size=coalesce(nullif(p_vehicle_size,''),vehicle_size),requested_service=coalesce(nullif(p_requested_service,''),requested_service),message=coalesce(nullif(p_message,''),message),quote_amount=coalesce(p_quote_amount,quote_amount),internal_notes=coalesce(nullif(p_internal_notes,''),internal_notes),source='Website Recommender',lead_origin='website_recommender',status='active',lifecycle_stage='new',answered=false,call_attempts=0,text_attempts=0,email_attempts=0,quote_session_id=p_quote_session_id,desired_timing=p_desired_timing,behavioral_stage=coalesce(qs.behavioral_stage,'contact_captured'),availability_viewed_at=qs.availability_viewed_at,slot_selected_at=qs.slot_selected_at,booking_started_at=qs.booking_started_at,selected_slot=qs.selected_slot,last_outcome='repeat_website_quote' where id::text=v_id;
  perform public.crm_recalculate_lead(v_id);
 end if;
 if p_quote_session_id is not null then update public.quote_sessions set lead_id=v_id::uuid,contact_captured_at=now(),behavioral_stage='contact_captured',updated_at=now() where id=p_quote_session_id; end if;
 insert into public.crm_activities(lead_id,actor,activity_type,outcome,note,metadata) values(v_id,'Website',case when repeat then 'repeat_inquiry' else 'lead_created' end,case when repeat then 'repeat_quote' else 'new_quote' end,'Website recommender contact captured',jsonb_build_object('desired_timing',p_desired_timing,'quote_session_id',p_quote_session_id));
 return v_id;
end $$;
revoke execute on function public.crm_upsert_website_quote(text,text,text,text,integer,text,text,text,text,text,numeric,text,text,uuid,text) from public,anon,authenticated;
grant execute on function public.crm_upsert_website_quote(text,text,text,text,integer,text,text,text,text,text,numeric,text,text,uuid,text) to service_role;

create or replace view public.crm_needs_action as
select l.*, case when l.action_step in ('recover_slot','recover_booking') then 0 when l.lifecycle_stage='follow_up' then 1 when l.availability_viewed_at is not null then 2 when l.lifecycle_stage='new' then 3 else 4 end queue_priority
from public.crm_leads l where l.lifecycle_stage in ('new','working','waiting','follow_up') and l.next_action_at is not null and l.next_action_at<=now()
order by queue_priority,l.next_action_at;
grant select on public.crm_needs_action to authenticated;

-- Website event ingestion is service-role only. It keeps anonymous behavior separate until contact is captured.
create or replace function public.crm_apply_quote_session_to_lead(p_session_id uuid) returns void language plpgsql security definer set search_path=public as $$
declare q public.quote_sessions; begin select * into q from public.quote_sessions where id=p_session_id; if not found or q.lead_id is null then return; end if;
 update public.crm_leads set behavioral_stage=q.behavioral_stage,desired_timing=coalesce(q.desired_timing,desired_timing),availability_viewed_at=q.availability_viewed_at,slot_selected_at=q.slot_selected_at,booking_started_at=q.booking_started_at,selected_slot=q.selected_slot where id=q.lead_id;
 perform public.crm_recalculate_lead(q.lead_id::text); end $$;
revoke all on function public.crm_apply_quote_session_to_lead(uuid) from public,anon,authenticated;
grant execute on function public.crm_apply_quote_session_to_lead(uuid) to service_role;

select public.crm_recalculate_lead(id::text) from public.crm_leads where status in ('active','follow_up');
commit;
