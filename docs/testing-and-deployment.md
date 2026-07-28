# Testing and Deployment

[Documentation index](README.md) · [Root README](../README.md)

## Development and Verification Commands

| Command | Implementation | Status/Purpose |
| --- | --- | --- |
| `npm run dev` | `next dev` | Start local development. |
| `npm run typecheck` | `tsc --noEmit` | Strict TypeScript verification. |
| `npm run lint` | `eslint` | ESLint checks. |
| `npm test` | Node test runner targeting `tests/reservation-date.test.mjs` | Script exists, but the target file is missing. |
| `npm run build` | `next build` | Production compilation and route verification. |
| `npm run start` | `next start` | Serve a completed production build. |

There are no tracked unit, integration, end-to-end, coverage, or browser-test files. No CI workflow is checked in. Do not report `npm test` as passing until the target is restored or the script is corrected.

## Local Database and Migration Testing

Use a disposable local Supabase stack:

```bash
supabase start
supabase db reset
supabase status
```

`db reset` is the primary repository-supported check that all migrations apply in order and the seed still loads. For schema work:

1. Create a new timestamped migration with `supabase migration new <name>`.
2. Reset locally from a clean database.
3. Exercise RLS with anonymous, customer, and admin sessions.
4. Test RPC success and failure cases, including concurrent overlapping reservations.
5. Regenerate `types/database.types.ts` and review it.
6. Confirm the latest migration also works against a staging project before production.

No SQL test framework is configured.

## Manual Verification Checklist

### Public

- Landing page loads featured available cars.
- Catalogue search, each filter, sort, pagination, and grid/list URLs behave correctly.
- Unavailable/invalid car IDs render a useful state.
- Calendar loads owned/other unavailable ranges and enforces future, 30-day, and 180-day rules.
- Another session's reservation change causes an open calendar/preview to refetch.

### Authentication

- Register with confirmation both enabled and disabled in controlled environments.
- Confirm email callback uses a safe redirect.
- Login handles invalid credentials, unverified email, customer, and admin roles.
- Google OAuth succeeds with the configured callback and fails safely.
- Recovery link establishes a session; expired links fail safely; password update succeeds.
- Logout removes access to protected pages.

### Customer

- Create a valid reservation and confirm snapshot totals/status.
- Reject past/same-day, reversed, too-long, too-far, overlapping, and usage-limit bookings.
- Reservation list/detail is owner-scoped.
- Pending/confirmed cancellation requires a reason; terminal/active cancellation is rejected.
- Profile name/phone update; email remains read-only; counters are correct.

### Admin

- Dashboard metrics and six-month buckets match database samples.
- Car list filters/sorts/paginates; create/edit/soft-deactivate works.
- Duplicate plate handling is case-insensitive.
- Image upload rejects wrong types, oversized files, and more than six; primary selection/deletion behaves correctly.
- Reservation search/filter/summary and every valid/invalid transition behave correctly.
- Customer list/detail is readable but exposes no mutation action.

### Security

- Guests receive `401` from protected APIs and login redirects from protected pages.
- Customers receive `403` for admin APIs; admins receive `403` for customer-only operations.
- Direct table attempts respect RLS and column grants.
- Service-role credentials never appear in browser bundles, logs, or responses.
- Redirect inputs cannot escape the application origin.

## Production Build Verification

Run:

```bash
npm run typecheck
npm run lint
npm run build
```

Run `npm test` only after resolving the missing target. Then start the output in a production-like environment:

```bash
npm run start
```

Smoke-test both a customer and admin session against the production build.

The root layout uses `next/font/google` for Geist and Geist Mono, so a clean build currently needs outbound access to Google Fonts. Restricted/offline builders fail during font retrieval unless the fonts are changed to local assets.

## Deployment Target

No hosting-platform configuration is tracked. `.vercel` is ignored, but that does not establish Vercel as the selected production target. The application can be deployed to a platform that supports the Next.js 16 Node.js runtime and its `next build`/`next start` output, subject to platform-specific configuration that is not documented in this repository.

## Deployment Prerequisites

1. A production Supabase project.
2. A Node.js runtime meeting Next.js's minimum (20.9+).
3. All four application environment variables configured in the hosting platform.
4. Ordered migrations applied to production.
5. Custom access-token hook enabled.
6. Production Auth Site URL/redirect allow-list and provider credentials.
7. `car-images` bucket/policies and Realtime enabled by migrations/project services.
8. A trusted scheduler if automatic expiration/status advancement is operationally required.

## Production Supabase Configuration

### Migrations

Link carefully and preview the target before applying:

```bash
supabase link --project-ref <production-project-ref>
supabase db push
```

Do not load `supabase/seed.sql` into production unless demo fleet data is explicitly desired. Take a database backup/snapshot according to the organization's Supabase plan before material migrations.

### Auth URLs

Set the production application origin as the Supabase Site URL and allow the exact application destinations used by the code:

- `https://<app-origin>/api/auth/callback`
- `https://<app-origin>/api/auth/confirm`
- `https://<app-origin>/api/auth/recovery`

Supabase also has a provider-facing OAuth callback URL that must be registered with Google; use the URL shown in the project's provider settings. Set `NEXT_PUBLIC_SITE_URL=https://<app-origin>` with no trailing slash.

Enable email confirmations deliberately, verify production SMTP/template behavior, and enable `public.custom_access_token_hook` before users sign in.

### Storage and Realtime

The migrations create the public `car-images` bucket and policies. Verify object MIME/size restrictions and upload real assets; seed SQL alone does not upload files.

Verify Realtime is enabled and that the latest reservation broadcast migration applies. Open two browsers on the same car and confirm a booking/status change in one causes the other to refresh availability.

### Lifecycle Scheduling

The repository creates but does not schedule:

- `reject_expired_pending_reservations()`
- `advance_reservation_statuses()`

If required, configure an authenticated trusted scheduler outside this repository, make calls idempotently at an appropriate frequency, monitor failures, and document ownership. Do not expose these privileged functions to public clients.

## Post-Deployment Checks

- Confirm the deployed origin and all Auth redirects use HTTPS and remain on the intended host.
- Create/sign in a customer and load protected routes.
- Sign in an admin with a freshly issued role-bearing token.
- Create and cancel a test reservation, then verify Realtime calendar refresh.
- Upload/delete a test car image and confirm its public URL.
- Verify dashboard data and service-role email lookup without leaking the key.
- Inspect server logs for secrets or token hashes and configure alerts/retention.

## Rollback Considerations

- Application rollback: retain the previously successful build artifact/config and redeploy it if the new build fails.
- Database rollback: migrations have no checked-in down scripts. Prefer forward corrective migrations; restore a verified backup only with explicit operational approval.
- Schema/application compatibility: deploy additive schema changes before code that needs them, then remove old fields only after all running builds stop using them.
- Storage operations are not covered by PostgreSQL rollback; back up or version critical assets separately.
- Role-claim changes may require users to refresh/re-authenticate after rollback as well as rollout.

[Previous: Technical Decisions](technical-decisions.md) · [Next: Known Issues and Roadmap](known-issues-and-roadmap.md)
