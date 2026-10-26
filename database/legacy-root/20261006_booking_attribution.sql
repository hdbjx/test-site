-- Every Detail website booking attribution
-- Safe for the existing iOS Team app: both columns are nullable and no existing
-- RPC signature, trigger, policy, or required insert field is changed.

begin;

alter table public.jobs
  add column if not exists lead_source text,
  add column if not exists lead_source_detail text;

comment on column public.jobs.lead_source is
  'Customer-reported acquisition source captured by the website booking form.';
comment on column public.jobs.lead_source_detail is
  'Optional referral name or free-text detail for the acquisition source.';

create index if not exists jobs_lead_source_idx
  on public.jobs (lead_source)
  where lead_source is not null;

commit;
