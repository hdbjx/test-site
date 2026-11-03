-- Every Detail: one price catalog for every app.
-- Services, prices and times per vehicle type, crew, add-ons and what each
-- package includes now live here. The website, Team HQ, the Team App and
-- Van HQ all read it; managers edit it in Team HQ → Services & pricing.
-- Seeded with exactly today's numbers, so nothing changes until someone edits.
-- Existing jobs keep the price they were booked at. Safe to re-run (it never
-- overwrites a price that's already been edited).

begin;

create table if not exists public.catalog_services (
  id text primary key,
  name text not null,
  kind text not null default 'detail' check (kind in ('detail', 'paint', 'other')),
  crew integer not null default 1 check (crew between 1 and 6),
  quoted boolean not null default false,
  on_website boolean not null default false,
  sort_order integer not null default 0,
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create table if not exists public.catalog_prices (
  service_id text not null references public.catalog_services(id) on update cascade on delete cascade,
  vehicle text not null check (vehicle in ('sedan', 'smallSUV', 'smallTruck', 'largeSUV', 'minivan', 'largeTruck')),
  price numeric(10, 2),
  minutes integer not null default 120 check (minutes between 15 and 960),
  primary key (service_id, vehicle)
);

create table if not exists public.catalog_addons (
  id text primary key,                      -- website add-on id, e.g. 'Pet Hair Removal'
  key text not null unique,                 -- job_vehicle_addons.addon_key, e.g. 'pet_hair_removal'
  name text not null,
  price numeric(10, 2),                     -- null = priced on site
  included_in text[] not null default '{}', -- service ids where it's already part of the package
  not_offered_with text[] not null default '{}',
  sort_order integer not null default 0,
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

-- ── Seed: today's catalog ────────────────────────────────────────────────
insert into public.catalog_services (id, name, kind, crew, quoted, on_website, sort_order) values
  ('maintenance',  'Maintenance Detail',     'detail', 1, false, true,  10),
  ('premium',      'Premium Detail',         'detail', 2, false, true,  20),
  ('factoryReset', 'Factory Reset',          'detail', 2, false, true,  30),
  ('interior',     'Interior Detail',        'detail', 1, false, false, 40),
  ('exterior',     'Exterior Detail',        'detail', 1, false, false, 50),
  ('enhancement',  'Enhancement Polish',     'paint',  1, false, true,  60),
  ('correction',   'Full Paint Correction',  'paint',  1, false, true,  70),
  ('ceramic2yr',   '2-Year Ceramic Coating', 'paint',  1, false, true,  80)
on conflict (id) do nothing;

insert into public.catalog_prices (service_id, vehicle, price, minutes)
select s, v, p, m from (values
  ('maintenance','sedan',150,120),('maintenance','smallSUV',170,135),('maintenance','smallTruck',180,135),('maintenance','largeSUV',190,150),('maintenance','minivan',200,180),('maintenance','largeTruck',210,180),
  ('premium','sedan',260,150),('premium','smallSUV',275,160),('premium','smallTruck',285,165),('premium','largeSUV',300,180),('premium','minivan',320,195),('premium','largeTruck',330,180),
  ('factoryReset','sedan',400,240),('factoryReset','smallSUV',425,240),('factoryReset','smallTruck',440,240),('factoryReset','largeSUV',470,240),('factoryReset','minivan',490,240),('factoryReset','largeTruck',500,240),
  ('interior','sedan',100,90),('interior','smallSUV',110,90),('interior','smallTruck',105,90),('interior','largeSUV',135,90),('interior','minivan',135,90),('interior','largeTruck',120,90),
  ('exterior','sedan',70,60),('exterior','smallSUV',80,60),('exterior','smallTruck',85,60),('exterior','largeSUV',95,60),('exterior','minivan',100,60),('exterior','largeTruck',105,60),
  ('enhancement','sedan',395,300),('enhancement','smallSUV',445,300),('enhancement','smallTruck',445,300),('enhancement','largeSUV',525,300),('enhancement','minivan',495,300),('enhancement','largeTruck',525,300),
  ('correction','sedan',695,480),('correction','smallSUV',795,480),('correction','smallTruck',795,480),('correction','largeSUV',945,480),('correction','minivan',895,480),('correction','largeTruck',945,480),
  ('ceramic2yr','sedan',895,360),('ceramic2yr','smallSUV',995,360),('ceramic2yr','smallTruck',995,360),('ceramic2yr','largeSUV',1095,360),('ceramic2yr','minivan',1020,360),('ceramic2yr','largeTruck',1095,360)
) x(s, v, p, m)
on conflict (service_id, vehicle) do nothing;

insert into public.catalog_addons (id, key, name, price, included_in, not_offered_with, sort_order) values
  ('Sealant',               'sealant',               'Protective Sealant',         60, '{premium,factoryReset}', '{}',             10),
  ('Pet Hair Removal',      'pet_hair_removal',      'Pet Hair Removal',           40, '{factoryReset}',         '{}',             20),
  ('Clay Bar',              'clay_bar',              'Clay Bar Decontamination',   95, '{factoryReset}',         '{}',             30),
  ('Plastic Restoration',   'plastic_restoration',   'Trim & Plastic Restoration', 40, '{factoryReset}',         '{}',             40),
  ('Headlight Restoration', 'headlight_restoration', 'Headlight Restoration',      70, '{}',                     '{factoryReset}', 50),
  ('Engine Bay',            'engine_bay',            'Engine Bay',                 70, '{}',                     '{}',             60),
  ('Carpet Extraction',     'carpet_extraction',     'Floor Carpet Extraction',    90, '{factoryReset}',         '{}',             70),
  ('Seat Extraction',       'seat_extraction',       'Seat Extraction',            60, '{factoryReset}',         '{}',             80),
  ('Odor Removal',          'odor_removal',          'Odor Removal',               60, '{}',                     '{}',             90)
on conflict (id) do nothing;

-- ── Who can read / edit ──────────────────────────────────────────────────
alter table public.catalog_services enable row level security;
alter table public.catalog_prices enable row level security;
alter table public.catalog_addons enable row level security;

do $$
declare t text;
begin
  foreach t in array array['catalog_services', 'catalog_prices', 'catalog_addons'] loop
    execute format('drop policy if exists "catalog read" on public.%I', t);
    execute format('create policy "catalog read" on public.%I for select to anon, authenticated using (true)', t);
    execute format('drop policy if exists "catalog manager write" on public.%I', t);
    execute format('create policy "catalog manager write" on public.%I for all to authenticated using (public.is_manager()) with check (public.is_manager())', t);
  end loop;
end $$;

grant select on public.catalog_services, public.catalog_prices, public.catalog_addons to anon, authenticated;
grant insert, update, delete on public.catalog_services, public.catalog_prices, public.catalog_addons to authenticated;

create or replace function public.catalog_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end $$;
drop trigger if exists catalog_services_touch on public.catalog_services;
create trigger catalog_services_touch before update on public.catalog_services for each row execute function public.catalog_touch();
drop trigger if exists catalog_addons_touch on public.catalog_addons;
create trigger catalog_addons_touch before update on public.catalog_addons for each row execute function public.catalog_touch();

-- A price edit counts as an edit to its service (for "last changed").
create or replace function public.catalog_price_touch()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.catalog_services set updated_at = now() where id = coalesce(new.service_id, old.service_id);
  return coalesce(new, old);
end $$;
drop trigger if exists catalog_prices_touch on public.catalog_prices;
create trigger catalog_prices_touch after insert or update or delete on public.catalog_prices for each row execute function public.catalog_price_touch();

-- Everything in one call, for every app.
create or replace function public.catalog_public()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'services', coalesce((select jsonb_agg(jsonb_build_object(
        'id', s.id, 'name', s.name, 'kind', s.kind, 'crew', s.crew, 'quoted', s.quoted,
        'onWebsite', s.on_website, 'active', s.active,
        'prices', coalesce((select jsonb_object_agg(p.vehicle, jsonb_build_object('price', p.price, 'minutes', p.minutes))
                            from public.catalog_prices p where p.service_id = s.id), '{}'::jsonb))
        order by s.sort_order, s.id) from public.catalog_services s), '[]'::jsonb),
    'addons', coalesce((select jsonb_agg(jsonb_build_object(
        'id', a.id, 'key', a.key, 'name', a.name, 'price', a.price,
        'includedIn', a.included_in, 'notOfferedWith', a.not_offered_with, 'active', a.active)
        order by a.sort_order, a.id) from public.catalog_addons a), '[]'::jsonb),
    'updatedAt', greatest((select max(updated_at) from public.catalog_services), (select max(updated_at) from public.catalog_addons))
  )
$$;
revoke all on function public.catalog_public() from public;
grant execute on function public.catalog_public() to anon, authenticated, service_role;

notify pgrst, 'reload schema';
commit;
