-- Every Detail Integration Hardening v1.5
-- Canonical bridge patch for Website + Team app + Van HQ.
-- Run after Team HQ v1.4 and Van HQ v11.4.1. Safe to re-run.

begin;

-- 1. A Van HQ device can see any job that includes its rig, whether that rig
-- is the primary jobs.rig_id or an additional job_rigs assignment.
create or replace function public.van_hq_can_access_job(p_job_id uuid) returns boolean
language sql stable security definer set search_path=public as $$
  select exists(
    select 1
    from public.jobs j
    join public.van_hq_devices d on d.user_id=auth.uid() and d.active=true
    where j.id=p_job_id
      and (
        j.rig_id=d.rig_id
        or exists(select 1 from public.job_rigs jr where jr.job_id=j.id and jr.rig_id=d.rig_id)
      )
  );
$$;

create or replace function public.van_hq_today_jobs(p_day date default null) returns jsonb
language plpgsql stable security definer set search_path=public as $$
declare v_day date:=coalesce(p_day,(now() at time zone 'America/New_York')::date); v_jobs jsonb;
begin
  if not public.is_van_hq_device() then raise exception 'Registered Van HQ device required.'; end if;
  select coalesce(jsonb_agg(x.payload order by x.start_sort),'[]'::jsonb) into v_jobs from (
    select j.scheduled_start start_sort, jsonb_build_object(
      'key',j.id::text,'id',j.id::text,
      'title',coalesce(nullif(j.service_name,''),'Detail')||case when nullif(j.vehicle,'') is not null then ' — '||j.vehicle else '' end,
      'address',coalesce(j.address,''),'startTime',extract(epoch from j.scheduled_start)::bigint,'endTime',extract(epoch from j.scheduled_end)::bigint,
      'crew',coalesce((select jsonb_agg(p.full_name order by p.full_name) from public.job_assignments ja join public.profiles p on p.id=ja.staff_id where ja.job_id=j.id),'[]'::jsonb),
      'price',j.price,'contactId',j.client_id::text,
      'client',jsonb_build_object('name',coalesce(j.customer_name,''),'phone',coalesce(j.phone,''),'email',coalesce(j.email,''),'contactId',j.client_id::text,'service',coalesce(j.service_name,'')),
      'history',jsonb_build_object(
        'isNew',not exists(select 1 from public.jobs h where h.client_id=j.client_id and h.id<>j.id and h.status='complete'),
        'count',(select count(*) from public.jobs h where h.client_id=j.client_id and h.id<>j.id and h.status='complete'),
        'lastDate',(select to_char(max(h.scheduled_start at time zone 'America/New_York'),'MM/DD/YYYY') from public.jobs h where h.client_id=j.client_id and h.id<>j.id and h.status='complete'),
        'lastService',(select h2.service_name from public.jobs h2 where h2.client_id=j.client_id and h2.id<>j.id and h2.status='complete' order by h2.scheduled_start desc nulls last limit 1)),
      'vehicles',coalesce((select jsonb_agg(jsonb_build_object(
        'jobVehicleId',jv.id::text,'vehicleId',jv.vehicle_id,'contactId',j.client_id::text,
        'year',coalesce(v.year::text,''),'make',coalesce(v.make,''),'model',coalesce(v.model,jv.vehicle_label,''),'color',coalesce(v.color,''),'plate',coalesce(v.plate,''),
        'isPrimary',case when coalesce(v.is_primary,false) then 'Yes' else 'No' end,'interiorMaterial',coalesce(v.interior_material,''),'floorMats',coalesce(v.floor_mats,''),
        'paintCondition',coalesce(v.paint_condition::text,''),'petHair',coalesce(v.pet_hair,'None'),'odorIssues',coalesce(v.odor_issues,''),'problemAreas',coalesce(v.problem_areas,''),
        'techNotes',coalesce(v.tech_notes,''),'recommendedNext',coalesce(v.recommended_next,''),'service',coalesce(jv.service_name,j.service_name,''),
        'stage',coalesce((select e.stage from public.job_progress_events e where e.job_id=j.id and e.job_vehicle_id=jv.id and e.undone_at is null order by e.occurred_at desc,e.id desc limit 1),''),
        'stageHistory',coalesce((select jsonb_agg(jsonb_build_object('stage',e.stage,'tech',e.actor_name,'at',e.occurred_at,'reason',e.reason) order by e.occurred_at,e.id) from public.job_progress_events e where e.job_id=j.id and e.job_vehicle_id=jv.id and e.undone_at is null),'[]'::jsonb)
      ) order by jv.sort_order,jv.created_at) from public.job_vehicles jv left join public.vehicles v on v.id=jv.vehicle_id where jv.job_id=j.id),'[]'::jsonb),
      'stage',coalesce((select e.stage from public.job_progress_events e where e.job_id=j.id and e.job_vehicle_id is null and e.undone_at is null order by e.occurred_at desc,e.id desc limit 1),''),
      'stageHistory',coalesce((select jsonb_agg(jsonb_build_object('stage',e.stage,'tech',e.actor_name,'at',e.occurred_at,'reason',e.reason) order by e.occurred_at,e.id) from public.job_progress_events e where e.job_id=j.id and e.job_vehicle_id is null and e.undone_at is null),'[]'::jsonb),
      'needsProfile',exists(select 1 from public.job_vehicles jv where jv.job_id=j.id and jv.vehicle_id is null),
      'rigTags',coalesce((select jsonb_agg(r.name order by r.sort_order,r.name) from public.rigs r where r.id=j.rig_id or exists(select 1 from public.job_rigs jr where jr.job_id=j.id and jr.rig_id=r.id)),'[]'::jsonb),
      'status',j.status,'bookingNotes',coalesce(j.notes,''),'operator',(select s.operator_name from public.van_hq_job_sessions s where s.job_id=j.id)
    ) payload from public.jobs j
    where (j.scheduled_start at time zone 'America/New_York')::date=v_day
      and j.status<>'cancelled'
      and public.van_hq_can_access_job(j.id)
  ) x;
  return jsonb_build_object('ok',true,'jobs',v_jobs,'rig_id',public.van_hq_device_rig_id());
end $$;


create or replace function public.van_hq_job_lifecycle_snapshot(p_day date default null)
returns table(job_id uuid,status text,started_at timestamptz,completed_at timestamptz)
language plpgsql stable security definer set search_path=public as $$
declare v_day date := coalesce(p_day,(now() at time zone 'America/New_York')::date);
begin
  if not public.is_van_hq_device() then raise exception 'Registered Van HQ device required.'; end if;
  return query
    select j.id,j.status::text,j.started_at,j.completed_at
    from public.jobs j
    where public.van_hq_can_access_job(j.id)
      and (j.scheduled_start at time zone 'America/New_York')::date=v_day
      and j.status<>'cancelled'
    order by j.scheduled_start;
end $$;

-- Keep the jobs RLS policy aligned with the same multi-rig access rule.
drop policy if exists "Van HQ device reads own rig jobs" on public.jobs;
create policy "Van HQ device reads own rig jobs" on public.jobs for select to authenticated
using (public.is_van_hq_device() and public.van_hq_can_access_job(id));

-- Start Job is only legal after the shared Arrived travel event.
create or replace function public.start_assigned_job(p_job_id uuid)
returns table(started_at timestamptz, status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  j public.jobs%rowtype;
  v_staff record;
  v_started_at timestamptz;
  v_label text;
begin
  if not public.ed_can_work_job(p_job_id) then
    raise exception 'You are not assigned to this job.';
  end if;

  select * into j from public.jobs where id = p_job_id for update;
  if not found then raise exception 'Job not found.'; end if;
  if j.status = 'cancelled' then raise exception 'Cancelled jobs cannot be started.'; end if;
  if j.status = 'complete' then raise exception 'This job is already complete.'; end if;
  if not exists(select 1 from public.job_progress_events e where e.job_id=p_job_id and e.job_vehicle_id is null and e.undone_at is null and e.stage='Arrived') then
    raise exception 'Mark the crew Arrived before starting the job.';
  end if;
  if not exists(select 1 from public.job_assignments ja join public.profiles p on p.id=ja.staff_id and p.active=true where ja.job_id=p_job_id) then
    raise exception 'Assign at least one active technician before starting this job.';
  end if;

  v_started_at := coalesce(j.started_at, now());
  v_label := concat_ws(' · ', nullif(trim(j.customer_name),''), nullif(trim(j.service_name),''));
  if nullif(trim(coalesce(v_label,'')),'') is null then v_label := 'Detail job'; end if;

  update public.jobs
  set status = 'in_progress',
      started_at = v_started_at,
      started_by = coalesce(public.jobs.started_by, auth.uid())
  where id = p_job_id;

  for v_staff in
    select distinct p.id, p.full_name
    from public.job_assignments ja
    join public.profiles p on p.id=ja.staff_id and p.active=true
    where ja.job_id=p_job_id
  loop
    -- If this crew member is already running this exact job, preserve the entry.
    if not exists(
      select 1 from public.van_hq_time_entries te
      where te.staff_id=v_staff.id and te.job_id=p_job_id and te.clocked_out_at is null
    ) then
      -- A person can only be working one thing at a time. Close any stale/open
      -- activity at the moment this job begins.
      update public.van_hq_time_entries
      set clocked_out_at=v_started_at,
          note=coalesce(note,'Closed automatically when next job started')
      where staff_id=v_staff.id and clocked_out_at is null;

      insert into public.van_hq_time_entries(
        staff_id,staff_name,rig_id,job_id,work_shift_id,work_label,source,note,clocked_in_at
      ) values (
        v_staff.id,v_staff.full_name,j.rig_id,p_job_id,null,v_label,'job_lifecycle',null,v_started_at
      );
    end if;
  end loop;

  started_at := v_started_at;
  status := 'in_progress';
  return next;
end;
$$;


create or replace function public.van_hq_start_job(p_job_id uuid,p_operator_name text)
returns jsonb
language plpgsql security definer set search_path=public as $$
declare
  v_job public.jobs%rowtype;
  v_operator public.profiles%rowtype;
  v_session public.van_hq_job_sessions%rowtype;
  v_staff record;
  v_started_at timestamptz;
  v_label text;
  v_already_started boolean;
  v_crew_count integer;
begin
  if not public.is_van_hq_device() then raise exception 'Registered Van HQ device required.'; end if;
  if not public.van_hq_can_access_job(p_job_id) then raise exception 'This job is assigned to a different rig.'; end if;

  select * into v_job from public.jobs where id=p_job_id for update;
  if not found then raise exception 'Job not found.'; end if;
  if v_job.status='cancelled' then raise exception 'Cancelled jobs cannot be started.'; end if;
  if v_job.status='complete' then raise exception 'This job is already complete.'; end if;
  if not exists(select 1 from public.job_progress_events e where e.job_id=p_job_id and e.job_vehicle_id is null and e.undone_at is null and e.stage='Arrived') then
    raise exception 'Mark the crew Arrived before starting the job.';
  end if;

  select count(*) into v_crew_count
  from public.job_assignments ja
  join public.profiles p on p.id=ja.staff_id and p.active=true
  where ja.job_id=p_job_id;
  if v_crew_count=0 then raise exception 'Assign at least one active technician before starting this job.'; end if;

  select * into v_session from public.van_hq_job_sessions where job_id=p_job_id for update;
  if found then
    select * into v_operator from public.profiles where id=v_session.operator_id and active=true;
    if not found then raise exception 'The locked Van HQ operator is no longer active.'; end if;
  else
    if nullif(trim(coalesce(p_operator_name,'')),'') is null or lower(trim(p_operator_name))='all' then
      raise exception 'Select a technician before starting this job.';
    end if;
    select * into v_operator
    from public.profiles p
    where p.active=true and lower(p.full_name)=lower(trim(p_operator_name))
      and exists(select 1 from public.job_assignments ja where ja.job_id=p_job_id and ja.staff_id=p.id)
    limit 1;
    if not found then raise exception 'The Van HQ operator must be an active technician assigned to this job.'; end if;
    insert into public.van_hq_job_sessions(job_id,operator_id,operator_name,selected_at,updated_at)
    values(p_job_id,v_operator.id,v_operator.full_name,now(),now());
  end if;

  v_already_started := v_job.started_at is not null;
  v_started_at := coalesce(v_job.started_at,now());
  v_label := concat_ws(' · ',nullif(trim(v_job.customer_name),''),nullif(trim(v_job.service_name),''));
  if nullif(trim(coalesce(v_label,'')),'') is null then v_label := 'Detail job'; end if;

  update public.jobs
  set status='in_progress',started_at=v_started_at
  where id=p_job_id;

  for v_staff in
    select distinct p.id,p.full_name
    from public.job_assignments ja
    join public.profiles p on p.id=ja.staff_id and p.active=true
    where ja.job_id=p_job_id
  loop
    if not exists(
      select 1 from public.van_hq_time_entries te
      where te.staff_id=v_staff.id and te.job_id=p_job_id and te.clocked_out_at is null
    ) then
      update public.van_hq_time_entries
      set clocked_out_at=v_started_at,
          note=coalesce(note,'Closed automatically when next job started')
      where staff_id=v_staff.id and clocked_out_at is null;

      insert into public.van_hq_time_entries(
        staff_id,staff_name,rig_id,job_id,work_shift_id,work_label,source,note,clocked_in_at
      ) values (
        v_staff.id,v_staff.full_name,v_job.rig_id,p_job_id,null,v_label,'job_lifecycle',null,v_started_at
      );
    end if;
  end loop;

  update public.van_hq_job_sessions set updated_at=now() where job_id=p_job_id;

  return jsonb_build_object(
    'ok',true,'status','in_progress','startedAt',v_started_at,
    'alreadyStarted',v_already_started,'operator',v_operator.full_name,'crewCount',v_crew_count
  );
end $$;


-- Team-app travel uses the same idempotent shared events as Van HQ.
create or replace function public.mobile_set_job_travel_stage(p_job_id uuid,p_stage text)
returns public.job_progress_events language plpgsql security definer set search_path=public as $$
declare v_actor public.profiles%rowtype; v_event public.job_progress_events; v_stage text:=trim(coalesce(p_stage,'')); v_job public.jobs%rowtype;
begin
  select * into v_actor from public.profiles where id=auth.uid() and active=true;
  if not found then raise exception 'Active staff account required.'; end if;
  if lower(v_stage) not in ('on the way','arrived') then raise exception 'Travel status is limited to On the Way and Arrived.'; end if;
  if not public.is_manager() and not exists(select 1 from public.job_assignments ja where ja.job_id=p_job_id and ja.staff_id=auth.uid()) then raise exception 'You are not assigned to this job.'; end if;
  select * into v_job from public.jobs where id=p_job_id;
  if not found then raise exception 'Job not found.'; end if;
  if v_job.status in ('complete','cancelled') then raise exception 'This job is already closed.'; end if;
  if v_job.started_at is not null then raise exception 'This job has already started. Travel status can no longer be changed.'; end if;
  select * into v_event from public.job_progress_events e
    where e.job_id=p_job_id and e.job_vehicle_id is null and e.undone_at is null and lower(trim(e.stage))=lower(v_stage)
    order by e.occurred_at desc,e.id desc limit 1;
  if found then return v_event; end if;
  insert into public.job_progress_events(job_id,job_vehicle_id,stage,source,actor_id,actor_name)
  values(p_job_id,null,v_stage,'mobile',v_actor.id,v_actor.full_name) returning * into v_event;
  return v_event;
end $$;

-- 2. Crew assignment changes during an active job immediately change labor.
create or replace function public.trg_sync_active_job_labor()
returns trigger language plpgsql security definer set search_path=public as $$
declare
  v_job public.jobs%rowtype;
  v_staff public.profiles%rowtype;
  v_at timestamptz := now();
  v_label text;
begin
  if tg_op='DELETE' then
    select * into v_job from public.jobs where id=old.job_id;
  else
    select * into v_job from public.jobs where id=new.job_id;
  end if;
  if not found or v_job.status<>'in_progress' or v_job.started_at is null then
    if tg_op='DELETE' then return old; else return new; end if;
  end if;

  if tg_op='INSERT' then
    select * into v_staff from public.profiles where id=new.staff_id and active=true;
    if found and not exists(
      select 1 from public.van_hq_time_entries te
      where te.staff_id=new.staff_id and te.job_id=new.job_id and te.clocked_out_at is null
    ) then
      update public.van_hq_time_entries
      set clocked_out_at=v_at,note=coalesce(note,'Closed automatically when active job assignment changed')
      where staff_id=new.staff_id and clocked_out_at is null;
      v_label:=concat_ws(' · ',nullif(trim(v_job.customer_name),''),nullif(trim(v_job.service_name),''));
      insert into public.van_hq_time_entries(staff_id,staff_name,rig_id,job_id,work_shift_id,work_label,source,note,clocked_in_at)
      values(v_staff.id,v_staff.full_name,v_job.rig_id,new.job_id,null,coalesce(nullif(v_label,''),'Detail job'),'job_lifecycle',
             'Started automatically when added to an active job',v_at);
    end if;
  elsif tg_op='DELETE' then
    update public.van_hq_time_entries
    set clocked_out_at=v_at,note=coalesce(note,'Stopped automatically when removed from active job')
    where staff_id=old.staff_id and job_id=old.job_id and clocked_out_at is null;
  end if;
  if tg_op='DELETE' then return old; else return new; end if;
end $$;

drop trigger if exists sync_active_job_labor on public.job_assignments;
create trigger sync_active_job_labor after insert or delete on public.job_assignments
for each row execute function public.trg_sync_active_job_labor();

-- 3. Routine job-driven labor should not spam managers with clock-in/out alerts.
create or replace function public.trg_timeclock_event()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if coalesce(new.source,'') in ('job_lifecycle','work_shift_lifecycle') then return new; end if;
  if tg_op='INSERT' then
    perform public.emit_ops_event('clock_in','timeclock',new.staff_name||' clocked in',
      coalesce(new.work_label,'Every Detail shift'),'info',coalesce(new.source,'van_hq'),new.rig_id,new.job_id,new.work_shift_id,null,
      'time_entry',new.id::text,false,'/notifications',jsonb_build_object('staffId',new.staff_id,'clockedInAt',new.clocked_in_at));
  elsif tg_op='UPDATE' and old.clocked_out_at is null and new.clocked_out_at is not null then
    perform public.emit_ops_event('clock_out','timeclock',new.staff_name||' clocked out',
      coalesce(new.work_label,'Every Detail shift'),'info',coalesce(new.source,'van_hq'),new.rig_id,new.job_id,new.work_shift_id,null,
      'time_entry',new.id::text,false,'/notifications',jsonb_build_object('staffId',new.staff_id,'clockedOutAt',new.clocked_out_at));
  end if;
  return new;
end $$;

-- 4. Manager lifecycle transitions are atomic. No direct status edit can leave labor open.
create or replace function public.team_manager_set_job_status(p_job_id uuid,p_status text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_job public.jobs%rowtype; v_status text:=lower(trim(coalesce(p_status,''))); v_at timestamptz:=now();
begin
  if not public.is_manager() then raise exception 'Manager access required.'; end if;
  if v_status not in ('booked','assigned','cancelled') then raise exception 'Use Start Job or Complete Job for that lifecycle transition.'; end if;
  select * into v_job from public.jobs where id=p_job_id for update;
  if not found then raise exception 'Job not found.'; end if;

  if v_status='cancelled' then
    update public.van_hq_time_entries set clocked_out_at=v_at
    where job_id=p_job_id and clocked_out_at is null;
    update public.jobs set status='cancelled' where id=p_job_id;
  else
    update public.van_hq_time_entries set clocked_out_at=v_at,
      note=coalesce(note,'Closed by manager lifecycle reset')
    where job_id=p_job_id and clocked_out_at is null;
    update public.job_progress_events
      set undone_at=coalesce(undone_at,v_at),undone_by=coalesce(undone_by,auth.uid())
      where job_id=p_job_id and undone_at is null;
    delete from public.van_hq_job_sessions where job_id=p_job_id;
    update public.jobs set status=v_status,started_at=null,started_by=null,completed_at=null,completed_by=null
      where id=p_job_id;
  end if;
  return jsonb_build_object('ok',true,'status',v_status);
end $$;

-- 5. Complete Job requires Van HQ production to actually be Done.
create or replace function public.complete_assigned_job(p_job_id uuid)
returns table(completed_at timestamptz,status text)
language plpgsql security definer set search_path=public as $$
declare
  j public.jobs%rowtype; line record; required text[]; missing text[]:=array[]::text[]; photo_key text; v_completed_at timestamptz;
  v_vehicle_count integer;
begin
  if not public.ed_can_work_job(p_job_id) then raise exception 'You are not assigned to this job.'; end if;
  select * into j from public.jobs where id=p_job_id for update;
  if not found then raise exception 'Job not found.'; end if;
  if j.status='cancelled' then raise exception 'Cancelled jobs cannot be completed.'; end if;
  if j.started_at is null then raise exception 'Start the job before completing it.'; end if;

  select count(*) into v_vehicle_count from public.job_vehicles where job_id=p_job_id and coalesce(active_for_visit,true)=true;
  if v_vehicle_count>0 then
    if exists(
      select 1 from public.job_vehicles jv
      where jv.job_id=p_job_id and coalesce(jv.active_for_visit,true)=true
        and coalesce((select e.stage from public.job_progress_events e
          where e.job_id=p_job_id and e.job_vehicle_id=jv.id and e.undone_at is null
          order by e.occurred_at desc,e.id desc limit 1),'')<>'Done'
    ) then raise exception 'Finish production in Van HQ before completing the job.'; end if;
  elsif coalesce((select e.stage from public.job_progress_events e
          where e.job_id=p_job_id and e.job_vehicle_id is null and e.undone_at is null
          order by e.occurred_at desc,e.id desc limit 1),'')<>'Done' then
    raise exception 'Finish production in Van HQ before completing the job.';
  end if;

  for line in select * from public.job_vehicles where job_id=p_job_id and coalesce(active_for_visit,true)=true order by sort_order,created_at loop
    required:=public.ed_required_completion_photos(line.service_name);
    foreach photo_key in array required loop
      if not exists(select 1 from public.job_completion_photos p where p.job_id=p_job_id and p.job_vehicle_id=line.id and p.photo_type=photo_key) then
        missing:=array_append(missing,line.vehicle_label||': '||photo_key);
      end if;
    end loop;
  end loop;
  if coalesce(array_length(missing,1),0)>0 then raise exception 'Missing required completion photos: %',array_to_string(missing,', '); end if;

  v_completed_at:=coalesce(j.completed_at,now());
  update public.jobs set status='complete',completed_at=v_completed_at,completed_by=coalesce(public.jobs.completed_by,auth.uid()) where id=p_job_id;
  update public.van_hq_time_entries set clocked_out_at=v_completed_at where job_id=p_job_id and clocked_out_at is null;
  completed_at:=v_completed_at; status:='complete'; return next;
end $$;

-- 6. Keep the old marketing stage column synchronized while status becomes canonical.
create or replace function public.team_update_marketing_progress(p_content_id uuid,p_status text default null,p_completed_shots jsonb default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_row public.van_hq_marketing_content%rowtype; v_status text;
begin
  select * into v_row from public.van_hq_marketing_content where id=p_content_id and active=true for update;
  if not found then raise exception 'Content assignment not found.'; end if;
  if not public.has_team_permission('marketing') and v_row.assigned_to is distinct from auth.uid()
     and not exists(select 1 from public.job_assignments ja where ja.job_id=v_row.job_id and ja.staff_id=auth.uid()) then
    raise exception 'You are not assigned to this content or its job.';
  end if;
  v_status:=coalesce(p_status,v_row.status);
  if v_status not in ('planned','capturing','captured','editing','ready_to_post','posted','cancelled') then raise exception 'Invalid marketing status.'; end if;
  if p_completed_shots is not null and jsonb_typeof(p_completed_shots)<>'array' then raise exception 'completed_shots must be an array.'; end if;
  update public.van_hq_marketing_content
  set status=v_status,
      stage=case v_status when 'planned' then 'idea' when 'capturing' then 'filming' when 'captured' then 'filmed' when 'editing' then 'editing' when 'ready_to_post' then 'ready' when 'posted' then 'posted' when 'cancelled' then 'cancelled' else stage end,
      completed_shots=coalesce(p_completed_shots,completed_shots),
      published_at=case when v_status='posted' then coalesce(published_at,now()) else published_at end,updated_at=now()
  where id=p_content_id;
  return jsonb_build_object('ok',true,'contentId',p_content_id,'status',v_status);
end $$;

create or replace function public.van_hq_set_marketing_shot(p_content_id uuid,p_shot_index integer,p_done boolean)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_current jsonb; v_next jsonb; v_shots jsonb; v_total integer; v_done_count integer; v_status text;
begin
  if not public.is_van_hq_device() then raise exception 'Registered Van HQ device required.'; end if;
  if p_shot_index is null or p_shot_index<0 then raise exception 'Invalid shot index.'; end if;
  select completed_shots,shots into v_current,v_shots from public.van_hq_marketing_content where id=p_content_id and active=true for update;
  if not found then raise exception 'Content item not found.'; end if;
  select coalesce(jsonb_agg(n order by n),'[]'::jsonb) into v_next from (
    select distinct (value::text)::integer n from jsonb_array_elements(coalesce(v_current,'[]'::jsonb))
    where jsonb_typeof(value)='number' and (coalesce(p_done,false) or (value::text)::integer<>p_shot_index)
    union select p_shot_index where coalesce(p_done,false)
  ) q;
  v_total:=case when jsonb_typeof(coalesce(v_shots,'[]'::jsonb))='array' then jsonb_array_length(coalesce(v_shots,'[]'::jsonb)) else 0 end;
  v_done_count:=jsonb_array_length(v_next);
  v_status:=case when v_total>0 and v_done_count>=v_total then 'captured' when v_done_count>0 then 'capturing' else 'planned' end;
  update public.van_hq_marketing_content set completed_shots=v_next,status=v_status,stage=case when v_status='captured' then 'filmed' when v_status='capturing' then 'filming' else 'idea' end,updated_at=now() where id=p_content_id;
  return jsonb_build_object('ok',true,'contentId',p_content_id,'completedShots',v_next,'status',v_status);
end $$;

-- Walk-up quotes resolve the same canonical client identity used by the website.
create or replace function public.van_hq_submit_walkup_quote(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
  v_id uuid; v_client uuid; v_quote numeric;
  v_name text:=nullif(trim(p_payload->>'name'),''); v_phone text:=nullif(trim(p_payload->>'phone'),'');
  v_make text:=nullif(trim(p_payload->>'vehicleMake'),''); v_model text:=nullif(trim(p_payload->>'vehicleModel'),'');
begin
  if not public.is_van_hq_device() then raise exception 'Registered Van HQ device required.'; end if;
  if v_name is null or v_phone is null then raise exception 'Customer name and phone are required.'; end if;
  v_client:=public.upsert_website_contact(v_name,v_phone,nullif(lower(trim(p_payload->>'email')),''),nullif(trim(p_payload->>'address'),''),'Van HQ Walk-Up');
  v_quote:=case when nullif(regexp_replace(coalesce(p_payload->>'quote',''),'[^0-9.]','','g'),'') is null then null else regexp_replace(p_payload->>'quote','[^0-9.]','','g')::numeric end;
  insert into public.crm_leads(full_name,phone,email,address,vehicle_make,vehicle_model,vehicle_size,requested_service,source,quote_amount,message,internal_notes,status,lifecycle_stage,action_step,next_action_at,next_action_type,next_action_due_date,answered,created_by,converted_client_id)
  values(v_name,v_phone,nullif(lower(trim(p_payload->>'email')),''),nullif(trim(p_payload->>'address'),''),v_make,coalesce(v_model,nullif(trim(p_payload->>'vehicle'),'')),nullif(trim(p_payload->>'vehicleSize'),''),nullif(trim(p_payload->>'service'),''),coalesce(nullif(trim(p_payload->>'source'),''),'Van HQ Walk-Up'),v_quote,nullif(trim(p_payload->>'message'),''),nullif(trim(coalesce(p_payload->>'internalNotes','')||case when nullif(trim(p_payload->>'callOutcome'),'') is not null then ' | Outcome: '||(p_payload->>'callOutcome') else '' end),''),'active','new','call_1',now(),'Call 1 of 2',(now() at time zone 'America/New_York')::date,false,null,v_client)
  returning id into v_id;
  if to_regprocedure('public.crm_refresh_next_actions()') is not null then perform public.crm_refresh_next_actions(); end if;
  return jsonb_build_object('ok',true,'leadId',v_id,'clientId',v_client,'nextAction','Call 1 of 2');
end $$;

-- 7. CRM security: the queue honors caller RLS and website-only RPCs stay server-only.
create or replace view public.crm_needs_action
with (security_invoker = true)
as
select l.*,
  case when l.lifecycle_stage='new' and l.created_at>=now()-interval '30 minutes' then 0
       when l.next_action_at<now()-interval '1 minute' then 1
       when l.lifecycle_stage='new' then 2
       when l.lifecycle_stage='follow_up' then 3 else 4 end as queue_priority
from public.crm_leads l
where l.lifecycle_stage in ('new','working','follow_up') and l.next_action_at is not null and l.next_action_at<=now()
order by queue_priority asc,case when l.lifecycle_stage='new' then l.created_at end desc nulls last,l.next_action_at asc;
revoke all on public.crm_needs_action from anon;
grant select on public.crm_needs_action to authenticated;
revoke execute on function public.crm_upsert_website_quote(text,text,text,text,integer,text,text,text,text,text) from public,anon,authenticated;
revoke execute on function public.crm_mark_booked_by_identity(text,text,text) from public,anon,authenticated;
grant execute on function public.crm_upsert_website_quote(text,text,text,text,integer,text,text,text,text,text) to service_role;
grant execute on function public.crm_mark_booked_by_identity(text,text,text) to service_role;

-- 8. Rebooking requests have a manager-owned resolution path.

create or replace function public.team_resolve_rebooking_request(p_request_id uuid,p_status text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_status text:=lower(trim(coalesce(p_status,'')));
begin
  if not public.is_manager() then raise exception 'Manager access required.'; end if;
  if v_status not in ('requested','contacted','booked','closed') then raise exception 'Invalid rebooking status.'; end if;
  update public.van_hq_rebooking_requests set status=v_status where id=p_request_id;
  if not found then raise exception 'Rebooking request not found.'; end if;
  return jsonb_build_object('ok',true,'status',v_status);
end $$;

do $$ begin
  if to_regprocedure('public.team_toggle_clock(uuid,uuid,text)') is not null then
    revoke all on function public.team_toggle_clock(uuid,uuid,text) from public,anon,authenticated;
  end if;
  if to_regprocedure('public.van_hq_kiosk_toggle(text,uuid)') is not null then
    revoke all on function public.van_hq_kiosk_toggle(text,uuid) from public,anon,authenticated;
  end if;
  if to_regprocedure('public.van_hq_kiosk_pin_status(text)') is not null then
    revoke all on function public.van_hq_kiosk_pin_status(text) from public,anon,authenticated;
  end if;
  if to_regprocedure('public.van_hq_kiosk_clock_in(text,text)') is not null then
    revoke all on function public.van_hq_kiosk_clock_in(text,text) from public,anon,authenticated;
  end if;
end $$;

revoke all on function public.team_manager_set_job_status(uuid,text) from public,anon;
revoke all on function public.team_resolve_rebooking_request(uuid,text) from public,anon;
grant execute on function public.team_manager_set_job_status(uuid,text) to authenticated;
grant execute on function public.mobile_set_job_travel_stage(uuid,text) to authenticated;
grant execute on function public.team_resolve_rebooking_request(uuid,text) to authenticated;
grant execute on function public.complete_assigned_job(uuid) to authenticated;
grant execute on function public.team_update_marketing_progress(uuid,text,jsonb) to authenticated;
grant execute on function public.van_hq_set_marketing_shot(uuid,integer,boolean) to authenticated;
grant execute on function public.van_hq_can_access_job(uuid) to authenticated;
grant execute on function public.van_hq_today_jobs(date) to authenticated;
grant execute on function public.van_hq_job_lifecycle_snapshot(date) to authenticated;

-- Ensure realtime covers the shared lifecycle tables used by both UIs.
do $$ begin
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='job_progress_events') then alter publication supabase_realtime add table public.job_progress_events; end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='job_assignments') then alter publication supabase_realtime add table public.job_assignments; end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='job_rigs') then alter publication supabase_realtime add table public.job_rigs; end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='van_hq_marketing_content') then alter publication supabase_realtime add table public.van_hq_marketing_content; end if;
end $$;

commit;

select
  to_regprocedure('public.team_manager_set_job_status(uuid,text)') is not null as manager_lifecycle_rpc,
  to_regprocedure('public.mobile_set_job_travel_stage(uuid,text)') is not null as shared_travel_rpc,
  to_regprocedure('public.complete_assigned_job(uuid)') is not null as guarded_complete_rpc,
  to_regprocedure('public.team_resolve_rebooking_request(uuid,text)') is not null as rebooking_resolution_rpc,
  to_regprocedure('public.van_hq_can_access_job(uuid)') is not null as multi_rig_van_access,
  to_regprocedure('public.team_update_marketing_progress(uuid,text,jsonb)') is not null as canonical_marketing_progress,
  to_regprocedure('public.upsert_website_contact(text,text,text,text,text)') is not null as canonical_website_contact,
  not has_function_privilege('authenticated','public.crm_upsert_website_quote(text,text,text,text,integer,text,text,text,text,text)','EXECUTE') as website_crm_rpc_server_only,
  not has_function_privilege('authenticated','public.team_toggle_clock(uuid,uuid,text)','EXECUTE') as standalone_team_clock_disabled,
  exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='job_progress_events') as progress_realtime,
  exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='van_hq_marketing_content') as marketing_realtime;
