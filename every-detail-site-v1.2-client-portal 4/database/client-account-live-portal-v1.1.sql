-- Every Detail customer account portal identity/linkage fix v1.1
-- Makes the authenticated client_accounts row the single source of truth for account-owned jobs.
-- Safe to re-run.

begin;

create or replace function public.get_my_client_jobs()
returns table (
  id uuid,
  service_name text,
  vehicle text,
  scheduled_start timestamptz,
  status text,
  address text,
  price numeric
)
language sql
stable
security definer
set search_path = public, auth
as $$
  select
    j.id,
    j.service_name::text,
    j.vehicle::text,
    j.scheduled_start,
    j.status::text,
    j.address::text,
    j.price
  from public.client_accounts ca
  join public.jobs j on j.client_id = ca.client_id
  where ca.user_id = auth.uid()
  order by j.scheduled_start desc;
$$;

revoke execute on function public.get_my_client_jobs() from public, anon;
grant execute on function public.get_my_client_jobs() to authenticated;

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
  select ca.client_id
  into v_client
  from public.client_accounts ca
  where ca.user_id = auth.uid()
  limit 1;

  if v_client is null then
    return '[]'::jsonb;
  end if;

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
            jsonb_build_object('stage', e.stage, 'at', e.occurred_at)
            order by e.occurred_at, e.id
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
                  jsonb_build_object('stage', e.stage, 'at', e.occurred_at)
                  order by e.occurred_at, e.id
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
            and coalesce(jv.active_for_visit, true) = true
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

select
  has_function_privilege('authenticated', 'public.get_my_client_jobs()', 'execute') as account_jobs_rpc_ready,
  has_function_privilege('authenticated', 'public.get_my_client_portal_jobs()', 'execute') as portal_jobs_rpc_ready;
