-- Every Detail customer account live portal v1
-- Replaces the old Google Apps Script client portal data path with an authenticated Supabase RPC.
-- Safe to re-run after the customer account, job_vehicles, job_progress_events, and job_assignments migrations.

begin;

create or replace function public.get_my_client_portal_jobs()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare
  v_client uuid;
  v_today date := (now() at time zone 'America/New_York')::date;
  v_jobs jsonb;
begin
  v_client := public.get_my_client_identity();

  select coalesce(jsonb_agg(x.payload order by x.start_sort), '[]'::jsonb)
  into v_jobs
  from (
    select
      j.scheduled_start as start_sort,
      jsonb_build_object(
        'id', j.id,
        'serviceName', coalesce(j.service_name, 'Detail'),
        'vehicle', coalesce(j.vehicle, 'Vehicle'),
        'scheduledStart', j.scheduled_start,
        'scheduledEnd', j.scheduled_end,
        'status', j.status,
        'address', j.address,
        'price', j.price,
        'startedAt', j.started_at,
        'completedAt', j.completed_at,
        'crew', coalesce((
          select jsonb_agg(
            jsonb_build_object(
              'id', p.id,
              'name', p.full_name,
              'role', p.role::text
            ) order by p.full_name
          )
          from public.job_assignments ja
          join public.profiles p on p.id = ja.staff_id and p.active = true
          where ja.job_id = j.id
        ), '[]'::jsonb),
        'jobProgress', coalesce((
          select jsonb_agg(
            jsonb_build_object(
              'stage', e.stage,
              'at', e.occurred_at
            ) order by e.occurred_at, e.id
          )
          from public.job_progress_events e
          where e.job_id = j.id
            and e.job_vehicle_id is null
            and e.undone_at is null
        ), '[]'::jsonb),
        'vehicles', coalesce((
          select jsonb_agg(
            jsonb_build_object(
              'id', jv.id,
              'vehicleId', jv.vehicle_id,
              'label', coalesce(nullif(jv.vehicle_label, ''), nullif(j.vehicle, ''), 'Vehicle'),
              'serviceName', coalesce(nullif(jv.service_name, ''), nullif(j.service_name, ''), 'Detail'),
              'progress', coalesce((
                select jsonb_agg(
                  jsonb_build_object(
                    'stage', e.stage,
                    'at', e.occurred_at
                  ) order by e.occurred_at, e.id
                )
                from public.job_progress_events e
                where e.job_id = j.id
                  and e.job_vehicle_id = jv.id
                  and e.undone_at is null
              ), '[]'::jsonb)
            ) order by jv.sort_order, jv.created_at
          )
          from public.job_vehicles jv
          where jv.job_id = j.id
        ), '[]'::jsonb)
      ) as payload
    from public.jobs j
    where j.client_id = v_client
      and j.status <> 'cancelled'
      and (
        j.status = 'in_progress'
        or (j.scheduled_start at time zone 'America/New_York')::date >= v_today
      )
  ) x;

  return v_jobs;
end;
$$;

revoke execute on function public.get_my_client_portal_jobs() from public, anon;
grant execute on function public.get_my_client_portal_jobs() to authenticated;

commit;

-- Expected: true
select has_function_privilege('authenticated', 'public.get_my_client_portal_jobs()', 'execute')
       and not has_function_privilege('anon', 'public.get_my_client_portal_jobs()', 'execute')
       as client_portal_rpc_ready;
