-- Every Detail customer account history API.
-- Safe to run after 20260926_website_booking.sql.
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
  from public.jobs j
  where j.client_id = public.get_my_client_identity()
  order by j.scheduled_start desc;
$$;

revoke execute on function public.get_my_client_jobs() from public, anon;
grant execute on function public.get_my_client_jobs() to authenticated;

commit;
