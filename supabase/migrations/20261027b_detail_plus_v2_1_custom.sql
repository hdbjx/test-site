-- ============================================================================
-- Detail+ v2.1 — custom tasks and custom rhythms (run AFTER DEPLOY-DETAIL-PLUS-V2.sql)
--
-- Managers can add one-off tasks to a client's plan (name, price, interior /
-- exterior) and set any rhythm in weeks. Custom tasks are checked off in the
-- Van HQ SOP like every other plan task.
--
-- Pricing stays the same formula:
--   per visit = max(minimum, round((list tasks + custom tasks) × (1 − discount) to $5))
-- A custom rhythm takes the discount of the next-longer standard rhythm
-- (5 weeks → the 6-week 7%); anything longer than 13 weeks gets the quarterly 3%.
-- Safe to run more than once.
-- ============================================================================

begin;

alter table public.detail_plus_memberships
  add column if not exists custom_tasks jsonb not null default '[]'::jsonb,
  add column if not exists custom_weeks int;

do $$ begin
  alter table public.detail_plus_memberships
    add constraint detail_plus_memberships_custom_weeks_check check (custom_weeks is null or custom_weeks between 1 and 52);
exception when duplicate_object then null; end $$;

-- Discount for a custom rhythm of p_weeks.
create or replace function public.detail_plus_custom_discount(p_weeks int)
returns numeric language sql stable set search_path=public as $$
  select coalesce(
    (select discount from public.detail_plus_rhythms where active and weeks >= p_weeks order by weeks asc limit 1),
    (select discount from public.detail_plus_rhythms where active order by weeks desc limit 1),
    0)
$$;

-- Cleans a custom task list: [{id,label,price,scope}] with a label, a price ≥ 0,
-- scope interior / exterior / null, and a stable id starting with "c-".
create or replace function public.detail_plus_clean_custom_tasks(p_tasks jsonb)
returns jsonb language sql immutable set search_path=public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
      'id', case when coalesce(e->>'id','') like 'c-%' then left(e->>'id', 40) else 'c-' || left(md5(trim(e->>'label') || n::text), 10) end,
      'label', left(trim(e->>'label'), 80),
      'price', greatest(0, round(coalesce(nullif(e->>'price','')::numeric, 0), 2)),
      'scope', case when e->>'scope' in ('interior','exterior') then e->>'scope' else null end
    ) order by n), '[]'::jsonb)
  from jsonb_array_elements(case when jsonb_typeof(p_tasks) = 'array' then p_tasks else '[]'::jsonb end) with ordinality as x(e, n)
  where coalesce(trim(e->>'label'),'') <> ''
$$;

-- Full quote for a plan: list tasks + custom tasks, standard or custom rhythm.
-- Same jsonb shape as detail_plus_quote() plus customTasks / customWeeks.
create or replace function public.detail_plus_plan_quote(
  p_vehicle_size text, p_rhythm_id text, p_custom_weeks int, p_task_ids text[], p_custom_tasks jsonb
) returns jsonb language plpgsql stable security definer set search_path=public as $$
declare
  v_key text := public.detail_plus_vehicle_key(p_vehicle_size);
  r public.detail_plus_rhythms%rowtype;
  v_weeks int; v_discount numeric; v_label text; v_short text; v_rhythm text;
  v_min numeric; v_ids text[]; v_tasks jsonb; v_list numeric; v_custom jsonb; v_custom_sum numeric;
  v_subtotal numeric; v_discounted numeric; v_per_visit numeric;
begin
  if v_key is null then return null; end if;
  if p_custom_weeks is not null then
    if p_custom_weeks < 1 or p_custom_weeks > 52 then return null; end if;
    select * into r from public.detail_plus_rhythms where active and weeks = p_custom_weeks order by sort_order limit 1;
    if found then
      v_rhythm := r.id; v_weeks := r.weeks; v_discount := r.discount; v_label := r.label; v_short := r.short_label;
    else
      v_rhythm := null; v_weeks := p_custom_weeks; v_discount := public.detail_plus_custom_discount(p_custom_weeks);
      v_label := 'Every ' || p_custom_weeks || case when p_custom_weeks = 1 then ' week' else ' weeks' end;
      v_short := p_custom_weeks || (case when p_custom_weeks = 1 then ' week' else ' weeks' end);
    end if;
  else
    select * into r from public.detail_plus_rhythms where id = p_rhythm_id;
    if not found then return null; end if;
    v_rhythm := r.id; v_weeks := r.weeks; v_discount := r.discount; v_label := r.label; v_short := r.short_label;
  end if;

  select coalesce(minimum_per_visit,100) into v_min from public.detail_plus_settings where id;
  v_min := coalesce(v_min, 100);

  select coalesce(array_agg(t.id order by t.sort_order), '{}'), coalesce(sum(public.detail_plus_task_price(t, v_key)),0),
         coalesce(jsonb_agg(jsonb_build_object('id',t.id,'label',t.label,'group',t.task_group,'sopScope',t.sop_scope,'price',public.detail_plus_task_price(t, v_key)) order by t.sort_order), '[]')
    into v_ids, v_list, v_tasks
  from public.detail_plus_tasks t
  where t.id = any(coalesce(p_task_ids,'{}'::text[]));

  v_custom := public.detail_plus_clean_custom_tasks(p_custom_tasks);
  select coalesce(sum((e->>'price')::numeric),0) into v_custom_sum from jsonb_array_elements(v_custom) e;
  if coalesce(array_length(v_ids,1),0) = 0 and jsonb_array_length(v_custom) = 0 then return null; end if;

  v_subtotal := v_list + v_custom_sum;
  v_discounted := round(v_subtotal * (1 - v_discount) / 5) * 5;
  v_per_visit := greatest(v_min, v_discounted);

  return jsonb_build_object(
    'vehicleKey', v_key, 'vehicleLabel', public.detail_plus_vehicle_label(v_key),
    'rhythmId', v_rhythm, 'rhythmLabel', v_label, 'rhythmShort', v_short, 'weeks', v_weeks,
    'customWeeks', case when v_rhythm is null then v_weeks end,
    'taskIds', to_jsonb(v_ids), 'tasks', v_tasks, 'customTasks', v_custom,
    'subtotal', v_subtotal, 'discountPct', round(v_discount * 100)::int,
    'discount', greatest(0, v_subtotal - v_per_visit), 'perVisit', v_per_visit,
    'minimum', v_min, 'minimumApplied', v_discounted < v_min,
    'visitsPer13Weeks', greatest(1, floor(13.0 / v_weeks))::int
  );
end $$;
revoke all on function public.detail_plus_plan_quote(text,text,int,text[],jsonb) from public;
grant execute on function public.detail_plus_plan_quote(text,text,int,text[],jsonb) to authenticated, service_role;

-- One-line summary including custom tasks ("Maintenance set + Engine bay").
create or replace function public.detail_plus_plan_summary(p_task_ids text[], p_custom_tasks jsonb)
returns text language sql stable set search_path=public as $$
  select nullif(concat_ws(' + ',
    public.detail_plus_plan_summary(p_task_ids),
    (select string_agg(e->>'label', ', ' order by n) from jsonb_array_elements(coalesce(p_custom_tasks,'[]'::jsonb)) with ordinality x(e,n))
  ), '')
$$;

-- Team App save: now accepts custom_tasks [{id,label,price,scope}] and custom_weeks.
create or replace function public.manager_save_detail_plus_plan(p_membership_id uuid, p_plan jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
  v_id uuid := p_membership_id;
  v_client uuid := nullif(p_plan->>'client_id','')::uuid;
  v_vehicle text := nullif(p_plan->>'vehicle_id','');
  v_size text := nullif(p_plan->>'vehicle_size','');
  v_rhythm text := nullif(p_plan->>'rhythm_id','');
  v_weeks int := nullif(p_plan->>'custom_weeks','')::int;
  v_tasks text[] := coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(p_plan->'task_ids','[]'::jsonb)) x), '{}');
  v_custom_tasks jsonb := coalesce(p_plan->'custom_tasks','[]'::jsonb);
  v_custom numeric := nullif(p_plan->>'custom_price','')::numeric;
  v_status text := coalesce(nullif(trim(p_plan->>'status'),''), 'Active');
  q jsonb; v_price numeric; v_ids text[];
begin
  if auth.uid() is null or not public.is_manager() then raise exception 'Manager access required.'; end if;
  if v_client is null then raise exception 'Choose the client.'; end if;
  if v_size is null and v_vehicle is not null then select vehicle_size into v_size from public.vehicles where id = v_vehicle; end if;
  if public.detail_plus_vehicle_key(v_size) is null then raise exception 'Choose the vehicle type.'; end if;
  if v_weeks is not null and (v_weeks < 1 or v_weeks > 52) then raise exception 'Custom rhythm must be 1 to 52 weeks.'; end if;

  q := public.detail_plus_plan_quote(v_size, v_rhythm, v_weeks, v_tasks, v_custom_tasks);
  if q is null then raise exception 'Pick a rhythm and at least one task.'; end if;
  if v_custom is not null and v_custom <= 0 then raise exception 'Custom price must be more than $0.'; end if;
  v_price := coalesce(v_custom, (q->>'perVisit')::numeric);
  v_ids := array(select jsonb_array_elements_text(q->'taskIds'));

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
    rhythm_id = q->>'rhythmId',
    custom_weeks = nullif(q->>'customWeeks','')::int,
    task_ids = v_ids,
    custom_tasks = q->'customTasks',
    quote_subtotal = (q->>'subtotal')::numeric,
    quote_discount_pct = (q->>'discountPct')::int,
    minimum_applied = (q->>'minimumApplied')::boolean and v_custom is null,
    custom_price = v_custom is not null,
    service_price = v_price,
    frequency = q->>'rhythmLabel',
    plan = coalesce(public.detail_plus_plan_summary(v_ids, q->'customTasks'), 'Custom plan'),
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

-- Van HQ: custom tasks come through as plan tasks (group "custom") so the
-- crew can check them off in the SOP.
create or replace function public.van_hq_detail_plus_plans(p_job_ids uuid[])
returns table (
  job_id uuid, job_vehicle_id uuid, membership_id uuid, status text,
  rhythm_label text, per_visit numeric, custom_price boolean,
  task_ids text[], tasks jsonb, special_requests text, notes text, updated_at timestamptz
) language sql stable security definer set search_path=public as $$
  select jv.job_id, jv.id, m.id, m.status, coalesce(r.label, m.frequency), m.service_price, m.custom_price,
         m.task_ids || coalesce((select array_agg(e->>'id' order by n) from jsonb_array_elements(coalesce(m.custom_tasks,'[]'::jsonb)) with ordinality c(e,n)), '{}'),
         coalesce((select jsonb_agg(jsonb_build_object('id',t.id,'label',t.label,'note',t.note,'group',t.task_group,'sopScope',t.sop_scope) order by t.sort_order)
                   from public.detail_plus_tasks t where t.id = any(m.task_ids)), '[]'::jsonb)
         || coalesce((select jsonb_agg(jsonb_build_object('id',e->>'id','label',e->>'label','note','','group','custom','sopScope',e->'scope') order by n)
                   from jsonb_array_elements(coalesce(m.custom_tasks,'[]'::jsonb)) with ordinality c(e,n)), '[]'::jsonb),
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

commit;

-- Check: Small SUV, Maintenance set + a $40 engine bay, every 5 weeks (7% off):
--   select public.detail_plus_plan_quote('Small SUV', null, 5,
--     array['wash','wheels','windows','vacuum','dash','mats'],
--     '[{"label":"Engine bay","price":40,"scope":"exterior"}]');
--   $170 + $40 = $210 × 0.93 = $195.30 → perVisit 195, rhythmLabel "Every 5 weeks".
