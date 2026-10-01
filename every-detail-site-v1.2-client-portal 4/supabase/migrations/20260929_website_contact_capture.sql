-- Every Detail website contact capture
--
-- Any public website form that has a real name + phone can now resolve to one
-- canonical public.clients record. Phone is matched by its final 10 digits and
-- email is matched case-insensitively. Existing contacts are enriched rather
-- than duplicated.

begin;

create or replace function public.upsert_website_contact(
  p_full_name text,
  p_phone text,
  p_email text default null,
  p_address text default null,
  p_source text default 'website'
) returns uuid
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_name text := nullif(trim(p_full_name), '');
  v_phone text := nullif(trim(p_phone), '');
  v_phone_digits text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  v_phone_key text;
  v_email text := nullif(lower(trim(p_email)), '');
  v_address text := nullif(trim(p_address), '');
  v_source text := coalesce(nullif(trim(p_source), ''), 'website');
  v_client uuid;
  v_first text;
  v_last text;
begin
  if v_name is null or length(v_phone_digits) < 10 then
    raise exception 'contact_identity_required';
  end if;

  -- Every Detail currently serves US phone numbers. Matching on the final ten
  -- digits makes +1 404..., 404-..., and (404) ... resolve to the same person.
  v_phone_key := right(v_phone_digits, 10);
  v_first := split_part(v_name, ' ', 1);
  v_last := nullif(trim(substr(v_name, length(v_first) + 1)), '');

  -- Phone is the primary identity because every website lead form requires it.
  select c.id into v_client
  from public.clients c
  where right(regexp_replace(coalesce(c.phone, ''), '[^0-9]', '', 'g'), 10) = v_phone_key
  order by c.updated_at desc nulls last, c.id
  limit 1
  for update;

  -- Email is a secondary identity for customers whose phone formatting/data may
  -- have changed. It is only considered when the submission actually has email.
  if v_client is null and v_email is not null then
    select c.id into v_client
    from public.clients c
    where lower(trim(coalesce(c.email, ''))) = v_email
    order by c.updated_at desc nulls last, c.id
    limit 1
    for update;
  end if;

  if v_client is null then
    insert into public.clients (
      full_name,
      first_name,
      last_name,
      phone,
      email,
      address,
      source
    ) values (
      v_name,
      v_first,
      v_last,
      v_phone,
      v_email,
      v_address,
      v_source
    )
    returning id into v_client;
  else
    update public.clients
    set full_name = v_name,
        first_name = v_first,
        last_name = v_last,
        phone = v_phone,
        email = coalesce(v_email, email),
        address = coalesce(v_address, address),
        source = coalesce(nullif(source, ''), v_source),
        updated_at = now()
    where id = v_client;
  end if;

  return v_client;
end;
$$;

revoke all on function public.upsert_website_contact(text, text, text, text, text) from public;
grant execute on function public.upsert_website_contact(text, text, text, text, text) to service_role;

commit;
