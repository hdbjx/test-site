-- Every Detail: new Google review alerts for Marketing (+ managers)
-- Run in Supabase SQL Editor. Safe to re-run.
-- The website route /api/cron/review-alerts calls ed_record_google_reviews
-- every 30 minutes; this file also schedules that call.

begin;

create table if not exists public.google_reviews (
  id text primary key,                 -- Google's id for the review
  author_name text not null,
  rating integer not null check (rating between 0 and 5),
  review_text text,
  published_at timestamptz,
  url text,
  matched_client_id uuid,
  matched_job_id uuid,
  matched_tech_names text,
  created_at timestamptz not null default now()
);
create index if not exists google_reviews_published_idx on public.google_reviews(published_at desc);

create table if not exists public.google_review_state (
  id boolean primary key default true check (id),
  review_count integer not null default 0,
  rating numeric(3,2),
  checked_at timestamptz not null default now()
);

alter table public.google_reviews enable row level security;
alter table public.google_review_state enable row level security;

drop policy if exists "Marketing and managers can read reviews" on public.google_reviews;
create policy "Marketing and managers can read reviews" on public.google_reviews
  for select to authenticated
  using (exists (select 1 from public.profiles p
                 where p.id = auth.uid() and p.active = true
                   and p.role::text in ('marketing', 'manager', 'admin')));

drop policy if exists "Marketing and managers can read review state" on public.google_review_state;
create policy "Marketing and managers can read review state" on public.google_review_state
  for select to authenticated
  using (exists (select 1 from public.profiles p
                 where p.id = auth.uid() and p.active = true
                   and p.role::text in ('marketing', 'manager', 'admin')));

create or replace function public.ed_record_google_reviews(p_count integer, p_rating numeric, p_reviews jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_state public.google_review_state%rowtype;
  v_first_run boolean;
  v_item jsonb;
  v_new_ids text[] := array[]::text[];
  v_author text;
  v_client uuid;
  v_job uuid;
  v_techs text;
  v_new_count integer;
  v_extra integer;
  v_title text;
  v_body text;
  v_person uuid;
  v_row public.google_reviews%rowtype;
begin
  select * into v_state from public.google_review_state where id;
  v_first_run := not found;

  for v_item in select * from jsonb_array_elements(coalesce(p_reviews, '[]'::jsonb)) loop
    if exists (select 1 from public.google_reviews where id = v_item->>'id') then continue; end if;

    -- Match the reviewer to a client with a recently completed job:
    -- "Sarah Kim" or "Sarah K." against the client's full name.
    v_author := lower(trim(coalesce(v_item->>'author', '')));
    v_client := null; v_job := null; v_techs := null;
    select j.client_id, j.id into v_client, v_job
    from public.jobs j
    join public.clients c on c.id = j.client_id
    where j.status::text = 'complete'
      and coalesce(j.completed_at, j.scheduled_start) > now() - interval '45 days'
      and (lower(trim(c.full_name)) = v_author
           or (v_author ~ '^\S+ \S\.?$'
               and lower(split_part(trim(c.full_name), ' ', 1)) = split_part(v_author, ' ', 1)
               and lower(left(split_part(trim(c.full_name), ' ', 2), 1)) = left(split_part(v_author, ' ', 2), 1)))
    order by coalesce(j.completed_at, j.scheduled_start) desc
    limit 1;

    if v_job is not null then
      select string_agg(p.full_name, ' + ' order by p.full_name) into v_techs
      from public.job_assignments ja join public.profiles p on p.id = ja.staff_id
      where ja.job_id = v_job;
    end if;

    insert into public.google_reviews(id, author_name, rating, review_text, published_at, url, matched_client_id, matched_job_id, matched_tech_names)
    values (
      v_item->>'id',
      coalesce(nullif(trim(v_item->>'author'), ''), 'Google user'),
      greatest(0, least(5, coalesce((v_item->>'rating')::numeric, 0)))::integer,
      nullif(v_item->>'text', ''),
      nullif(v_item->>'published_at', '')::timestamptz,
      nullif(v_item->>'url', ''),
      v_client, v_job, v_techs
    )
    on conflict (id) do nothing;
    if found then v_new_ids := v_new_ids || (v_item->>'id'); end if;
  end loop;

  v_new_count := coalesce(array_length(v_new_ids, 1), 0);
  -- Google only returns the newest few reviews; the count tells us if we missed any.
  v_extra := case when v_first_run then 0
                  else greatest(0, coalesce(p_count, 0) - coalesce(v_state.review_count, 0) - v_new_count) end;

  insert into public.google_review_state(id, review_count, rating, checked_at)
  values (true, coalesce(p_count, 0), p_rating, now())
  on conflict (id) do update set review_count = excluded.review_count, rating = excluded.rating, checked_at = now();

  -- First run only records what's already there; no alert flood.
  if v_first_run or (v_new_count = 0 and v_extra = 0) then
    return jsonb_build_object('new', v_new_count, 'extra', v_extra, 'notified', false, 'firstRun', v_first_run);
  end if;

  if v_new_count > 0 then
    select * into v_row from public.google_reviews where id = v_new_ids[1];
    v_title := 'New ' || v_row.rating || '★ review from ' || v_row.author_name;
    v_body := coalesce(left(nullif(trim(v_row.review_text), ''), 140), 'No written review.')
              || case when v_row.matched_tech_names is not null then ' · Crew: ' || v_row.matched_tech_names else '' end
              || case when v_new_count + v_extra > 1 then ' · +' || (v_new_count + v_extra - 1) || ' more' else '' end;
  else
    v_title := v_extra || ' new Google review' || case when v_extra = 1 then '' else 's' end;
    v_body := 'Open Google to read ' || case when v_extra = 1 then 'it' else 'them' end || '.';
  end if;

  for v_person in
    select id from public.profiles
    where active = true and role::text in ('marketing', 'manager', 'admin')
  loop
    perform public.queue_staff_notification_once(
      'google-review:' || coalesce(v_new_ids[1], 'count-' || p_count::text) || ':' || v_person::text,
      v_person, v_title, v_body,
      jsonb_build_object('type', 'google_review', 'route', '/reviews', 'reviewId', v_new_ids[1])
    );
  end loop;

  return jsonb_build_object('new', v_new_count, 'extra', v_extra, 'notified', true);
end $$;

revoke all on function public.ed_record_google_reviews(integer, numeric, jsonb) from public, anon, authenticated;
grant execute on function public.ed_record_google_reviews(integer, numeric, jsonb) to service_role;

commit;

-- Every 30 minutes, same secret as the other website crons.
do $$
declare
  v_jobid bigint;
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron')
     and exists (select 1 from pg_extension where extname = 'pg_net') then
    select jobid into v_jobid from cron.job where jobname = 'every-detail-review-alerts' limit 1;
    if v_jobid is not null then perform cron.unschedule(v_jobid); end if;

    perform cron.schedule(
      'every-detail-review-alerts',
      '*/30 * * * *',
      $cron$
      select net.http_get(
        url := 'https://www.everydetail.co/api/cron/review-alerts',
        headers := jsonb_build_object(
          'Authorization',
          'Bearer ' || (
            select decrypted_secret
            from vault.decrypted_secrets
            where name = 'customer_reminder_cron_secret'
            order by created_at desc
            limit 1
          )
        ),
        timeout_milliseconds := 60000
      );
      $cron$
    );
  end if;
end $$;
