BEGIN;

-- Every Detail website quote persistence fix.
-- Run this migration BEFORE deploying the matching website build.
-- It stores the exact customer-visible quote total and the recommender's
-- selected add-on context in the existing crm_leads row.

CREATE OR REPLACE FUNCTION public.crm_upsert_website_quote(
  p_full_name text,
  p_phone text,
  p_email text,
  p_address text,
  p_vehicle_year integer,
  p_vehicle_make text,
  p_vehicle_model text,
  p_vehicle_size text,
  p_requested_service text,
  p_message text,
  p_quote_amount numeric,
  p_internal_notes text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id text;
  ph text := public.crm_normalize_phone(p_phone);
  em text := public.crm_normalize_email(p_email);
  repeat boolean := false;
BEGIN
  SELECT id::text
    INTO v_id
  FROM public.crm_leads
  WHERE lifecycle_stage NOT IN ('won','lost')
    AND (
      (ph IS NOT NULL AND normalized_phone = ph)
      OR (em IS NOT NULL AND normalized_email = em)
    )
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE;

  IF v_id IS NULL THEN
    INSERT INTO public.crm_leads(
      full_name, phone, email, address,
      vehicle_year, vehicle_make, vehicle_model, vehicle_size,
      requested_service, message, quote_amount, internal_notes,
      source, status, lifecycle_stage, action_step,
      next_action_at, next_action_type, next_action_due_date,
      answered, call_attempts, text_attempts, email_attempts
    )
    VALUES(
      p_full_name, p_phone, p_email, p_address,
      p_vehicle_year, p_vehicle_make, p_vehicle_model, p_vehicle_size,
      p_requested_service, p_message, p_quote_amount, p_internal_notes,
      'New Website', 'active', 'new', 'call_1',
      now(), 'Call 1 of 2', (now() AT TIME ZONE 'America/New_York')::date,
      false, 0, 0, 0
    )
    RETURNING id::text INTO v_id;
  ELSE
    repeat := true;

    UPDATE public.crm_leads
    SET
      full_name = coalesce(nullif(p_full_name,''), full_name),
      phone = coalesce(nullif(p_phone,''), phone),
      email = coalesce(nullif(p_email,''), email),
      address = coalesce(nullif(p_address,''), address),
      vehicle_year = coalesce(p_vehicle_year, vehicle_year),
      vehicle_make = coalesce(nullif(p_vehicle_make,''), vehicle_make),
      vehicle_model = coalesce(nullif(p_vehicle_model,''), vehicle_model),
      vehicle_size = coalesce(nullif(p_vehicle_size,''), vehicle_size),
      requested_service = coalesce(nullif(p_requested_service,''), requested_service),
      message = coalesce(nullif(p_message,''), message),
      quote_amount = coalesce(p_quote_amount, quote_amount),
      internal_notes = coalesce(nullif(p_internal_notes,''), internal_notes),
      source = 'New Website',
      status = 'active',
      lifecycle_stage = 'new',
      answered = false,
      action_step = 'call_1',
      next_action_at = now(),
      next_action_type = 'Call 1 of 2',
      next_action_due_date = (now() AT TIME ZONE 'America/New_York')::date,
      snoozed_until = null
    WHERE id::text = v_id;
  END IF;

  INSERT INTO public.crm_activities(lead_id, actor, activity_type, outcome, note)
  VALUES(
    v_id,
    'Website',
    CASE WHEN repeat THEN 'repeat_inquiry' ELSE 'lead_created' END,
    CASE WHEN repeat THEN 'repeat_quote' ELSE 'new_quote' END,
    CASE WHEN repeat THEN 'Customer submitted another website quote' ELSE 'Quote submitted through website' END
  );

  RETURN v_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.crm_upsert_website_quote(text,text,text,text,integer,text,text,text,text,text,numeric,text)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.crm_upsert_website_quote(text,text,text,text,integer,text,text,text,text,text,numeric,text)
TO service_role;

-- Historical repair for website recommender leads where the concern itself
-- deterministically preselected a priced add-on. This intentionally does NOT
-- infer Dull Paint because the recommender can add vehicle-dependent paint
-- services, and it does NOT infer optional Engine Bay selections.
-- Factory Reset already includes pet hair, carpet extraction and seat extraction,
-- so those concerns are not charged again for Factory Reset.
WITH reconstructed AS (
  SELECT
    id,
    CASE lower(trim(requested_service))
      WHEN 'maintenance detail' THEN CASE lower(trim(vehicle_size))
        WHEN 'sedan' THEN 150 WHEN 'small suv' THEN 170 WHEN 'small truck' THEN 180
        WHEN 'large suv' THEN 190 WHEN 'minivan' THEN 200 WHEN 'large truck' THEN 210 END
      WHEN 'premium detail' THEN CASE lower(trim(vehicle_size))
        WHEN 'sedan' THEN 260 WHEN 'small suv' THEN 275 WHEN 'small truck' THEN 285
        WHEN 'large suv' THEN 300 WHEN 'minivan' THEN 320 WHEN 'large truck' THEN 330 END
      WHEN 'factory reset' THEN CASE lower(trim(vehicle_size))
        WHEN 'sedan' THEN 400 WHEN 'small suv' THEN 425 WHEN 'small truck' THEN 440
        WHEN 'large suv' THEN 470 WHEN 'minivan' THEN 490 WHEN 'large truck' THEN 500 END
      ELSE NULL
    END AS base_price,
    CASE WHEN coalesce(message,'') ILIKE '%Bad Odor%' THEN 60 ELSE 0 END AS odor_price,
    CASE WHEN lower(trim(requested_service)) IN ('maintenance detail','premium detail')
              AND coalesce(message,'') ILIKE '%Pet Hair%' THEN 40 ELSE 0 END AS pet_price,
    CASE WHEN lower(trim(requested_service)) IN ('maintenance detail','premium detail')
              AND coalesce(message,'') ILIKE '%Carpet Stains%' THEN 90 ELSE 0 END AS carpet_price,
    CASE WHEN lower(trim(requested_service)) IN ('maintenance detail','premium detail')
              AND coalesce(message,'') ILIKE '%Seat Stains%' THEN 60 ELSE 0 END AS seat_price,
    CASE WHEN lower(trim(requested_service)) IN ('maintenance detail','premium detail')
              AND coalesce(message,'') ILIKE '%Cloudy Headlights%' THEN 70 ELSE 0 END AS headlight_price
  FROM public.crm_leads
  WHERE lower(coalesce(source,'')) = 'new website'
), totals AS (
  SELECT id,
         base_price + odor_price + pet_price + carpet_price + seat_price + headlight_price AS reconstructed_quote
  FROM reconstructed
  WHERE base_price IS NOT NULL
)
UPDATE public.crm_leads l
SET quote_amount = t.reconstructed_quote
FROM totals t
WHERE l.id = t.id;

COMMIT;

-- Verification after commit:
SELECT id, full_name, requested_service, vehicle_size, quote_amount, message, internal_notes, created_at
FROM public.crm_leads
WHERE lower(coalesce(source,'')) = 'new website'
ORDER BY created_at DESC;
