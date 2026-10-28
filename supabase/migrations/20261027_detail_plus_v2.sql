-- ============================================================================
-- Every Detail · Detail+ v2 — one price sheet for the website, Team App and Van HQ
-- ============================================================================
-- Run once in the Supabase SQL editor. Safe to re-run.
--
-- What this does
--   1. Moves the Detail+ price sheet (tasks, rhythms, presets, $100 minimum)
--      into the database, seeded with the exact numbers from the website.
--   2. detail_plus_quote(): the one pricing formula every app calls.
--   3. Memberships remember the exact plan: vehicle type, rhythm and tasks.
--   4. manager_save_detail_plus_plan(): Team App create/edit; the price is
--      always recomputed server-side unless a manager sets a custom price.
--   5. website_start_detail_plus_plan(): website signups become Pending plans.
--   6. van_hq_detail_plus_plans(): what Van HQ shows and checks off on a
--      Detail+ job, plus a read policy so plan edits stream to the van live.
--   7. Next-due dates understand every rhythm ("Every 2 months" etc).
-- ============================================================================

begin;

-- ── 1. Price sheet ──────────────────────────────────────────────────────────
create table if not exists public.detail_plus_tasks (
  id text primary key,
  label text not null,
  note text not null default '',
  task_group text not null check (task_group in ('exterior','interior','reset','extras')),
  -- Which part of the crew SOP this task belongs to on a Detail+ visit.
  sop_scope text check (sop_scope in ('interior','exterior')),
  price_sedan numeric(8,2) not null,
  price_small_suv numeric(8,2) not null,
  price_small_truck numeric(8,2) not null,
  price_large_suv numeric(8,2) not null,
  price_minivan numeric(8,2) not null,
  price_large_truck numeric(8,2) not null,
  sort_order int not null default 0,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.detail_plus_rhythms (
  id text primary key,
  label text not null,
  short_label text not null,
  weeks int not null check (weeks > 0),
  discount numeric(5,4) not null check (discount >= 0 and discount < 1),
  hint text not null default '',
  sort_order int not null default 0,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.detail_plus_presets (
  id text primary key,
  label text not null,
  task_ids text[] not null,
  sort_order int not null default 0
);

create table if not exists public.detail_plus_settings (
  id boolean primary key default true check (id),
  minimum_per_visit numeric(8,2) not null default 100,
  updated_at timestamptz not null default now()
);

insert into public.detail_plus_settings (id, minimum_per_visit) values (true, 100)
on conflict (id) do nothing;

-- Seed = website src/data/detailplus.ts (2026-10-27). Re-running keeps any
-- price a manager has changed since; only missing rows are added.
insert into public.detail_plus_tasks
  (id, label, note, task_group, sop_scope, price_sedan, price_small_suv, price_small_truck, price_large_suv, price_minivan, price_large_truck, sort_order)
values
  ('wash','Hand wash and dry','Full exterior wash, hand dried.','exterior','exterior',45,51,54,57,60,63,10),
  ('wheels','Wheels and tires','Wheels, tires and wheel wells cleaned.','exterior','exterior',25,28,30,32,33,35,20),
  ('windows','Windows','Inside and outside glass.','exterior',null,20,23,24,25,27,28,30),
  ('sealant','Spray sealant protection','Paint protection that keeps the shine and makes the next wash easier.','exterior','exterior',40,38,38,40,43,43,40),
  ('jambs','Door jambs','Jambs and sills wiped clean. Extra: confirm price.','extras','interior',15,15,20,20,20,20,110),
  ('vacuum','Interior vacuum','Seats, carpets and floors.','interior','interior',30,34,36,38,40,42,50),
  ('dash','Dash, console, doors and cupholders','Wiped and cleaned.','interior','interior',20,23,24,25,27,28,60),
  ('mats','Floor mats','Mats pulled out and cleaned.','interior','interior',10,11,12,13,13,14,70),
  ('seats','Seat and upholstery clean','Deeper clean of seats and upholstery.','interior','interior',40,38,38,40,44,44,80),
  ('interior','Full interior deep clean','Extra time and detail brushwork throughout the cabin.','interior','interior',30,29,29,30,33,33,90),
  ('trunk','Trunk and cargo area','Vacuumed and wiped. Extra: confirm price.','extras','interior',15,15,20,20,20,20,120),
  ('petHair','Pet hair removal','Extra time on embedded hair. Extra: confirm price.','extras','interior',30,35,35,40,40,40,130),
  ('extract','Carpet and upholstery extraction','Hot-water extraction for stains and buildup.','reset','interior',60,64,66,73,73,73,100),
  ('clay','Paint decontamination and clay','Removes bonded grime the wash leaves behind.','reset','exterior',50,54,55,61,61,61,101),
  ('crevices','Every crevice, seam and vent','The slow, detailed work.','reset','interior',30,32,34,36,36,36,102)
on conflict (id) do nothing;

insert into public.detail_plus_rhythms (id, label, short_label, weeks, discount, hint, sort_order) values
  ('weekly','Every week','Weekly',1,0.20,'Always fresh',1),
  ('biweekly','Every 2 weeks','2 weeks',2,0.15,'Highest-frequency care',2),
  ('3weeks','Every 3 weeks','3 weeks',3,0.12,'Steady upkeep',3),
  ('monthly','Every 4 weeks','Monthly',4,0.10,'Most popular rhythm',4),
  ('6weeks','Every 6 weeks','6 weeks',6,0.07,'Lower-frequency upkeep',5),
  ('2months','Every 2 months','2 months',8,0.05,'Seasonal reset',6),
  ('quarterly','Every 3 months','3 months',13,0.03,'Quarterly refresh',7)
on conflict (id) do nothing;

insert into public.detail_plus_presets (id, label, task_ids, sort_order) values
  ('maintenance','Maintenance set',array['wash','wheels','windows','vacuum','dash','mats'],1),
  ('premium','Premium set',array['wash','wheels','windows','vacuum','dash','mats','seats','interior','sealant'],2),
  ('inside','Inside only',array['vacuum','dash','mats','windows','seats','interior'],3),
  ('outside','Outside only',array['wash','wheels','windows','sealant'],4)
on conflict (id) do nothing;

alter table public.detail_plus_tasks enable row level security;
alter table public.detail_plus_rhythms enable row level security;
alter table public.detail_plus_presets enable row level security;
alter table public.detail_plus_settings enable row level security;

-- The price sheet is public (it is printed on the website). Only managers edit it.
do $$
declare t text;
begin
  foreach t in array array['detail_plus_tasks','detail_plus_rhythms','detail_plus_presets','detail_plus_settings'] loop
    execute format('drop policy if exists "Anyone can read %1$s" on public.%1$I', t);
    execute format('create policy "Anyone can read %1$s" on public.%1$I for select to anon, authenticated using (true)', t);
    execute format('drop policy if exists "Managers edit %1$s" on public.%1$I', t);
    execute format('create policy "Managers edit %1$s" on public.%1$I for all to authenticated using (public.is_manager()) with check (public.is_manager())', t);
  end loop;
end $$;

-- ── 2. The formula ──────────────────────────────────────────────────────────
-- Accepts every vehicle-type spelling in use: website ids (smallSUV),
-- Team App labels (Small SUV) and Van HQ ids (ssuv / lsuv).
create or replace function public.detail_plus_vehicle_key(p_size text)
returns text language sql immutable set search_path=public as $$
  select case regexp_replace(lower(coalesce(p_size,'')), '[^a-z]', '', 'g')
    when 'sedan' then 'sedan'
    when 'coupe' then 'sedan'
    when 'smallsuv' then 'smallSUV'
    when 'ssuv' then 'smallSUV'
    when 'smalltruck' then 'smallTruck'
    when 'largesuv' then 'largeSUV'
    when 'lsuv' then 'largeSUV'
    when 'minivan' then 'minivan'
    when 'largetruck' then 'largeTruck'
    when 'truck' then 'largeTruck'
    else null end
$$;

create or replace function public.detail_plus_vehicle_label(p_size text)
returns text language sql immutable set search_path=public as $$
  select case public.detail_plus_vehicle_key(p_size)
    when 'sedan' then 'Sedan' when 'smallSUV' then 'Small SUV' when 'smallTruck' then 'Small Truck'
    when 'largeSUV' then 'Large SUV' when 'minivan' then 'Minivan' when 'largeTruck' then 'Large Truck'
    else null end
$$;

create or replace function public.detail_plus_task_price(t public.detail_plus_tasks, p_size text)
returns numeric language sql immutable set search_path=public as $$
  select case public.detail_plus_vehicle_key(p_size)
    when 'sedan' then t.price_sedan when 'smallSUV' then t.price_small_suv when 'smallTruck' then t.price_small_truck
    when 'largeSUV' then t.price_large_suv when 'minivan' then t.price_minivan when 'largeTruck' then t.price_large_truck
    else null end
$$;

-- Same math as the website's quoteDetailPlus():
--   per visit = max(minimum, round(subtotal × (1 − rhythm discount) to the nearest $5))
create or replace function public.detail_plus_quote(p_vehicle_size text, p_rhythm_id text, p_task_ids text[])
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare
  v_key text := public.detail_plus_vehicle_key(p_vehicle_size);
  r public.detail_plus_rhythms%rowtype;
  v_min numeric;
  v_ids text[];
  v_tasks jsonb;
  v_subtotal numeric;
  v_discounted numeric;
  v_per_visit numeric;
begin
  if v_key is null then return null; end if;
  select * into r from public.detail_plus_rhythms where id = p_rhythm_id;
  if not found then return null; end if;
  select coalesce(minimum_per_visit,100) into v_min from public.detail_plus_settings where id;
  v_min := coalesce(v_min, 100);

  select array_agg(t.id order by t.sort_order), coalesce(sum(public.detail_plus_task_price(t, v_key)),0),
         jsonb_agg(jsonb_build_object('id',t.id,'label',t.label,'group',t.task_group,'sopScope',t.sop_scope,'price',public.detail_plus_task_price(t, v_key)) order by t.sort_order)
    into v_ids, v_subtotal, v_tasks
  from public.detail_plus_tasks t
  where t.id = any(coalesce(p_task_ids,'{}'::text[]));

  if v_ids is null or array_length(v_ids,1) is null then return null; end if;

  v_discounted := round(v_subtotal * (1 - r.discount) / 5) * 5;
  v_per_visit := greatest(v_min, v_discounted);

  return jsonb_build_object(
    'vehicleKey', v_key,
    'vehicleLabel', public.detail_plus_vehicle_label(v_key),
    'rhythmId', r.id,
    'rhythmLabel', r.label,
    'rhythmShort', r.short_label,
    'weeks', r.weeks,
    'taskIds', to_jsonb(v_ids),
    'tasks', v_tasks,
    'subtotal', v_subtotal,
    'discountPct', round(r.discount * 100)::int,
    'discount', greatest(0, v_subtotal - v_per_visit),
    'perVisit', v_per_visit,
    'minimum', v_min,
    'minimumApplied', v_discounted < v_min,
    'visitsPer13Weeks', greatest(1, floor(13.0 / r.weeks))::int
  );
end $$;

-- One call that hands every app the whole sheet.
create or replace function public.detail_plus_catalog()
returns jsonb language sql stable security definer set search_path=public as $$
  select jsonb_build_object(
    'minimum', coalesce((select minimum_per_visit from public.detail_plus_settings where id), 100),
    'vehicleOrder', jsonb_build_array('sedan','smallSUV','smallTruck','largeSUV','minivan','largeTruck'),
    'tasks', coalesce((select jsonb_agg(jsonb_build_object(
        'id',t.id,'label',t.label,'note',t.note,'group',t.task_group,'sopScope',t.sop_scope,
        'prices',jsonb_build_array(t.price_sedan,t.price_small_suv,t.price_small_truck,t.price_large_suv,t.price_minivan,t.price_large_truck)
      ) order by t.sort_order) from public.detail_plus_tasks t where t.active), '[]'::jsonb),
    'groups', jsonb_build_array(
      jsonb_build_object('id','exterior','label','Exterior'), jsonb_build_object('id','interior','label','Interior'),
      jsonb_build_object('id','reset','label','Deep clean'), jsonb_build_object('id','extras','label','Extras')),
    'rhythms', coalesce((select jsonb_agg(jsonb_build_object(
        'id',r.id,'label',r.label,'short',r.short_label,'weeks',r.weeks,'discount',r.discount,'hint',r.hint
      ) order by r.sort_order) from public.detail_plus_rhythms r where r.active), '[]'::jsonb),
    'presets', coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'label',p.label,'tasks',to_jsonb(p.task_ids)) order by p.sort_order) from public.detail_plus_presets p), '[]'::jsonb)
  )
$$;

revoke all on function public.detail_plus_quote(text,text,text[]) from public;
revoke all on function public.detail_plus_catalog() from public;
grant execute on function public.detail_plus_quote(text,text,text[]) to anon, authenticated, service_role;
grant execute on function public.detail_plus_catalog() to anon, authenticated, service_role;
grant execute on function public.detail_plus_vehicle_key(text) to anon, authenticated, service_role;
grant execute on function public.detail_plus_vehicle_label(text) to anon, authenticated, service_role;

-- ── 3. Memberships remember the plan ────────────────────────────────────────
alter table public.detail_plus_memberships
  add column if not exists vehicle_size text,
  add column if not exists rhythm_id text references public.detail_plus_rhythms(id),
  add column if not exists task_ids text[] not null default '{}',
  add column if not exists quote_subtotal numeric(8,2),
  add column if not exists quote_discount_pct int,
  add column if not exists minimum_applied boolean not null default false,
  add column if not exists custom_price boolean not null default false,
  add column if not exists plan_updated_at timestamptz,
  add column if not exists plan_updated_by uuid,
  add column if not exists source text;

create index if not exists detail_plus_memberships_client_vehicle_idx on public.detail_plus_memberships(client_id, vehicle_id);

-- Plain-English summary used anywhere a single line is shown ("plan" column).
create or replace function public.detail_plus_plan_summary(p_task_ids text[])
returns text language sql stable set search_path=public as $$
  select case
    when coalesce(array_length(p_task_ids,1),0) = 0 then null
    when (select array_agg(x order by x) from unnest(p_task_ids) x) = array['dash','mats','vacuum','wash','wheels','windows'] then 'Maintenance set'
    when (select array_agg(x order by x) from unnest(p_task_ids) x) = array['dash','interior','mats','sealant','seats','vacuum','wash','wheels','windows'] then 'Premium set'
    else coalesce((select string_agg(t.label, ', ' order by t.sort_order) from public.detail_plus_tasks t where t.id = any(p_task_ids)), 'Custom plan')
  end
$$;

-- ── 4. Team App: create / edit a plan ───────────────────────────────────────
-- p_plan keys: client_id, vehicle_id, vehicle_size, rhythm_id, task_ids[],
-- status, next_detail_date, last_detail_date, special_requests, notes,
-- custom_price (number or null — null means "use the price sheet").
create or replace function public.manager_save_detail_plus_plan(p_membership_id uuid, p_plan jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
  v_id uuid := p_membership_id;
  v_client uuid := nullif(p_plan->>'client_id','')::uuid;
  v_vehicle text := nullif(p_plan->>'vehicle_id','');
  v_size text := nullif(p_plan->>'vehicle_size','');
  v_rhythm text := nullif(p_plan->>'rhythm_id','');
  v_tasks text[] := coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(p_plan->'task_ids','[]'::jsonb)) x), '{}');
  v_custom numeric := nullif(p_plan->>'custom_price','')::numeric;
  v_status text := coalesce(nullif(trim(p_plan->>'status'),''), 'Active');
  q jsonb;
  v_price numeric;
begin
  if auth.uid() is null or not public.is_manager() then raise exception 'Manager access required.'; end if;
  if v_client is null then raise exception 'Choose the client.'; end if;
  if v_size is null and v_vehicle is not null then select vehicle_size into v_size from public.vehicles where id = v_vehicle; end if;
  if public.detail_plus_vehicle_key(v_size) is null then raise exception 'Choose the vehicle type.'; end if;

  q := public.detail_plus_quote(v_size, v_rhythm, v_tasks);
  if q is null then raise exception 'Pick a rhythm and at least one task.'; end if;
  if v_custom is not null and v_custom <= 0 then raise exception 'Custom price must be more than $0.'; end if;
  v_price := coalesce(v_custom, (q->>'perVisit')::numeric);

  if v_id is null then
    if exists (select 1 from public.detail_plus_memberships m where m.client_id = v_client and m.vehicle_id is not distinct from v_vehicle) then
      raise exception 'This client and vehicle already have a Detail+ plan. Open it to edit.';
    end if;
    insert into public.detail_plus_memberships (client_id, vehicle_id, status, start_date)
    values (v_client, v_vehicle, v_status, (now() at time zone 'America/New_York')::date)
    returning id into v_id;
  elsif not exists (select 1 from public.detail_plus_memberships where id = v_id) then
    raise exception 'Detail+ plan not found.';
  end if;

  update public.detail_plus_memberships set
    client_id = v_client,
    vehicle_id = v_vehicle,
    vehicle_size = public.detail_plus_vehicle_label(v_size),
    rhythm_id = v_rhythm,
    task_ids = array(select jsonb_array_elements_text(q->'taskIds')),
    quote_subtotal = (q->>'subtotal')::numeric,
    quote_discount_pct = (q->>'discountPct')::int,
    minimum_applied = (q->>'minimumApplied')::boolean and v_custom is null,
    custom_price = v_custom is not null,
    service_price = v_price,
    frequency = q->>'rhythmLabel',
    plan = public.detail_plus_plan_summary(array(select jsonb_array_elements_text(q->'taskIds'))),
    status = v_status,
    next_detail_date = case when p_plan ? 'next_detail_date' then nullif(p_plan->>'next_detail_date','')::date else next_detail_date end,
    last_detail_date = case when p_plan ? 'last_detail_date' then nullif(p_plan->>'last_detail_date','')::date else last_detail_date end,
    special_requests = case when p_plan ? 'special_requests' then nullif(trim(p_plan->>'special_requests'),'') else special_requests end,
    notes = case when p_plan ? 'notes' then nullif(trim(p_plan->>'notes'),'') else notes end,
    legacy_vehicle_text = coalesce((select concat_ws(' ', v.year, v.make, v.model) from public.vehicles v where v.id = v_vehicle), legacy_vehicle_text),
    plan_updated_at = now(),
    plan_updated_by = auth.uid()
  where id = v_id;

  return jsonb_build_object('id', v_id, 'quote', q, 'perVisit', v_price);
end $$;

revoke all on function public.manager_save_detail_plus_plan(uuid, jsonb) from public, anon;
grant execute on function public.manager_save_detail_plus_plan(uuid, jsonb) to authenticated;

-- ── 5. Website / Van HQ signups → Pending plan (server secret key only) ────
-- The website join form and Van HQ's "start Detail+" rebooking both land here.
-- A manager confirms the plan in the Team App and sets it Active.
drop function if exists public.website_start_detail_plus_plan(uuid,text,text,text[],text,text);
create or replace function public.website_start_detail_plus_plan(
  p_client_id uuid, p_vehicle_size text, p_rhythm_id text, p_task_ids text[],
  p_vehicle_text text default null, p_notes text default null,
  p_vehicle_id text default null, p_source text default 'website'
) returns jsonb language plpgsql security definer set search_path=public as $$
declare q jsonb; v_id uuid; v_status text;
begin
  if p_client_id is null then raise exception 'Client required.'; end if;
  q := public.detail_plus_quote(p_vehicle_size, p_rhythm_id, p_task_ids);
  if q is null then raise exception 'Pick a rhythm and at least one task.'; end if;

  -- A plan the team already runs for this client + vehicle is never changed
  -- from outside the Team App; return it so the caller can show its price.
  select id, status into v_id, v_status from public.detail_plus_memberships
  where client_id = p_client_id and vehicle_id is not distinct from nullif(p_vehicle_id,'')
    and lower(coalesce(status,'')) in ('active','paused')
  order by updated_at desc nulls last limit 1;
  if v_id is not null then
    return jsonb_build_object('id', v_id, 'quote', q, 'existing', true, 'status', v_status);
  end if;

  -- One pending plan per client + vehicle: a second submission updates it
  -- instead of stacking duplicates.
  select id into v_id from public.detail_plus_memberships
  where client_id = p_client_id and vehicle_id is not distinct from nullif(p_vehicle_id,'') and lower(status) = 'pending'
  order by updated_at desc nulls last limit 1;

  if v_id is null then
    insert into public.detail_plus_memberships (client_id, vehicle_id, status, start_date, source)
    values (p_client_id, nullif(p_vehicle_id,''), 'Pending', (now() at time zone 'America/New_York')::date, coalesce(nullif(p_source,''),'website'))
    returning id into v_id;
  end if;

  update public.detail_plus_memberships set
    vehicle_size = q->>'vehicleLabel',
    rhythm_id = q->>'rhythmId',
    task_ids = array(select jsonb_array_elements_text(q->'taskIds')),
    quote_subtotal = (q->>'subtotal')::numeric,
    quote_discount_pct = (q->>'discountPct')::int,
    minimum_applied = (q->>'minimumApplied')::boolean,
    custom_price = false,
    service_price = (q->>'perVisit')::numeric,
    frequency = q->>'rhythmLabel',
    plan = public.detail_plus_plan_summary(array(select jsonb_array_elements_text(q->'taskIds'))),
    legacy_vehicle_text = coalesce(nullif(trim(p_vehicle_text),''), legacy_vehicle_text),
    special_requests = coalesce(nullif(trim(p_notes),''), special_requests),
    source = coalesce(nullif(p_source,''),'website'),
    plan_updated_at = now()
  where id = v_id;

  return jsonb_build_object('id', v_id, 'quote', q, 'existing', false, 'status', 'Pending');
end $$;

revoke all on function public.website_start_detail_plus_plan(uuid,text,text,text[],text,text,text,text) from public, anon, authenticated;
grant execute on function public.website_start_detail_plus_plan(uuid,text,text,text[],text,text,text,text) to service_role;

-- ── 6. Van HQ: the plan behind each Detail+ vehicle on today's jobs ─────────
create or replace function public.van_hq_detail_plus_plans(p_job_ids uuid[])
returns table (
  job_id uuid, job_vehicle_id uuid, membership_id uuid, status text,
  rhythm_label text, per_visit numeric, custom_price boolean,
  task_ids text[], tasks jsonb, special_requests text, notes text, updated_at timestamptz
) language sql stable security definer set search_path=public as $$
  select jv.job_id, jv.id, m.id, m.status, coalesce(r.label, m.frequency), m.service_price, m.custom_price,
         m.task_ids,
         coalesce((select jsonb_agg(jsonb_build_object('id',t.id,'label',t.label,'note',t.note,'group',t.task_group,'sopScope',t.sop_scope) order by t.sort_order)
                   from public.detail_plus_tasks t where t.id = any(m.task_ids)), '[]'::jsonb),
         m.special_requests, m.notes, coalesce(m.plan_updated_at, m.updated_at)
  from public.job_vehicles jv
  join public.jobs j on j.id = jv.job_id
  join lateral (
    select * from public.detail_plus_memberships dm
    where dm.client_id = j.client_id
      and (dm.vehicle_id = jv.vehicle_id or dm.vehicle_id is null)
      and lower(coalesce(dm.status,'')) in ('active','pending','paused')
    order by (dm.vehicle_id is not distinct from jv.vehicle_id) desc, (lower(dm.status) = 'active') desc, dm.updated_at desc nulls last
    limit 1
  ) m on true
  left join public.detail_plus_rhythms r on r.id = m.rhythm_id
  where jv.job_id = any(p_job_ids)
    and (lower(coalesce(jv.service_name,'')) like 'detail+%' or lower(coalesce(j.service_name,'')) like 'detail+%')
    and (
      (public.is_van_hq_device() and public.van_hq_can_access_job(j.id))
      or exists (select 1 from public.profiles p where p.id = auth.uid() and p.active)
    )
$$;
revoke all on function public.van_hq_detail_plus_plans(uuid[]) from public, anon;
grant execute on function public.van_hq_detail_plus_plans(uuid[]) to authenticated;

-- Realtime: let a van iPad receive change events for the plans of clients it
-- is serving today, so an edit in the Team App reaches the SOP immediately.
drop policy if exists "Van HQ reads plans for its jobs" on public.detail_plus_memberships;
create policy "Van HQ reads plans for its jobs" on public.detail_plus_memberships
  for select to authenticated
  using (
    public.is_van_hq_device()
    and exists (select 1 from public.jobs j where j.client_id = detail_plus_memberships.client_id and public.van_hq_can_access_job(j.id))
  );

do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'detail_plus_memberships') then
    execute 'alter publication supabase_realtime add table public.detail_plus_memberships';
  end if;
end $$;

-- ── 7. Next-due dates for every rhythm ──────────────────────────────────────
create or replace function public.detail_plus_next_due(p_from date, p_frequency text)
returns date language plpgsql immutable set search_path=public as $$
declare f text := lower(trim(coalesce(p_frequency,''))); n int;
begin
  if p_from is null then return null; end if;
  n := nullif(substring(f from '(\d+)\s*week'), '')::int;
  if n is not null then return p_from + n * 7; end if;
  n := nullif(substring(f from '(\d+)\s*month'), '')::int;
  if n is not null then return (p_from + make_interval(months => n))::date; end if;
  if f like '%bi-week%' or f like '%biweek%' then return p_from + 14; end if;
  if f like '%quarter%' then return (p_from + interval '3 months')::date; end if;
  if f like '%week%' then return p_from + 7; end if;
  if f like '%month%' then return (p_from + interval '1 month')::date; end if;
  return (p_from + interval '1 month')::date;
end $$;

commit;

-- Check (Maintenance set, Small SUV, every 4 weeks):
--   select public.detail_plus_quote('Small SUV','monthly',array['wash','wheels','windows','vacuum','dash','mats']);
--   tasks $170, 10% off = $153 → nearest $5 → perVisit 155. The website shows the same number.
