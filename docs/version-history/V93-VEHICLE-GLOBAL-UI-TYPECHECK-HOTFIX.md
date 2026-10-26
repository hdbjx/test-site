# V93 Vehicle Global UI Typecheck Hotfix

- Fixes Vercel TypeScript error `TS7031` in `src/components/vehicle/VehicleGlobalUI.tsx`.
- Replaces implicit destructuring of the Supabase `getUser()` response with an explicitly typed result parameter.
- No UI, animation, auth-routing, or vehicle-selection behavior changed.
- QA: vehicle catalog, site context, SEO, full TS/TSX transpile sweep, CSS balance.
