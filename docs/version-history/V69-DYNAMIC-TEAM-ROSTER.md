# V69 Dynamic Team Roster

- About Us roster now loads active staff from `public.profiles` at request time.
- Inactive profiles disappear from the public roster automatically.
- Leadership sorts above technicians.
- Public title overrides remain only for roles whose customer-facing title is more specific than the app permission role:
  - Wiley: Founder & Owner
  - Davis: Business Manager
  - Grady: Operations Manager
  - Skylar: Social Media Director
- Other active staff display as Lead Technician when `can_lead_jobs` is true, otherwise Technician.
- The old hardcoded roster in `src/data/team.ts` is no longer used by About Us.
