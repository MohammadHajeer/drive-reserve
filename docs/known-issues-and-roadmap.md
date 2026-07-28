# Known Issues and Roadmap

[Documentation index](README.md) · [Root README](../README.md)

This document separates verified repository gaps from improvement ideas. Suggested work is not a confirmed product commitment.

## Known Issues

- **Broken test script:** `npm test` targets `tests/reservation-date.test.mjs`, but no tracked test file exists.
- **Missing authorization destination:** Proxy redirects unrecognized/non-admin roles to `/unauthorized`, but no page implements that route.
- **Broken/stale public links:** the footer links to `/about`, and route-access configuration lists `/about` and `/how-it-works`; neither page exists.
- **Generated database type drift:** `types/database.types.ts` omits `advance_reservation_statuses()` added by a later migration. The private Realtime trigger function is also outside its generated public schema representation.
- **Lifecycle functions are unscheduled:** expired pending reservations and date-based confirmed/active transitions do not run automatically from repository configuration.
- **Custom role hook is not enabled locally:** the migration creates `custom_access_token_hook`, but the relevant block in `supabase/config.toml` is commented out. Protected routes depend on the resulting claim.
- **Registration messaging/config mismatch:** registration always reports that email verification is required while local Auth config disables confirmations.
- **Local URL mismatch risk:** `supabase/config.toml` uses `http://127.0.0.1:3000` as Site URL and only lists `https://127.0.0.1:3000` as an additional redirect, while developer instructions commonly use `http://localhost:3000`. Local Auth redirects must be aligned manually.
- **Sensitive/noisy logging:** the email confirmation handler logs `token_hash`, and the image-upload handler logs the received `FormData`. These should not be present in production logs.
- **Image operations are not atomic:** Storage and PostgreSQL mutations are coordinated with compensating steps, but failures can leave partial state and explicit cleanup may be required.

## Current Limitations

- No tracked unit, SQL, integration, end-to-end, accessibility, or performance tests; no CI workflow.
- No production hosting target, deployed URL, deployment manifest, formal release process, or rollback scripts.
- No license file or contribution guide.
- No payment provider, payment ledger, invoices, taxes, discounts, deposits, or refunds. Dashboard revenue is completed reservation total only.
- No email/SMS/in-app operational notifications beyond Supabase Auth emails.
- Admin customer records are view-only; no suspension, editing, deletion, or role-management endpoints.
- The database supports car `features`, but admin car forms do not edit the array.
- Realtime push refresh is limited to car reservation availability; customer/admin lists and dashboards do not subscribe to cross-session changes.
- No trusted scheduler, monitoring, structured logging, error reporting, audit log, or health endpoint is configured.
- Seed image rows reference Storage objects that are not included in the repository.
- No application screenshots or public preview URL are tracked.
- The service-role email lookup may perform one Supabase Auth admin call per customer in admin views and degrades to `null` emails on failure.
- Clean production builds depend on downloading Geist and Geist Mono from Google Fonts through `next/font/google`.

## Recommended Improvements

1. Restore the reservation-date unit test target, then add API/RPC integration and critical browser-flow tests.
2. Add `/unauthorized` and resolve or remove missing public route links.
3. Regenerate database types after every migration and enforce drift checking in CI.
4. Enable/document the custom access-token hook and align local/production Auth URLs and confirmation behavior.
5. Remove sensitive console logging; add structured server logging, error monitoring, and secret-redaction rules.
6. Choose and document a scheduler for the two maintenance functions, with alerting and idempotent runbooks.
7. Add CI for install, typecheck, lint, tests, migration reset, and production build.
8. Make image metadata/Storage repair observable; consider a transactional workflow or cleanup job for orphaned objects/rows.
9. Perform keyboard, screen-reader, color-contrast, responsive, and reduced-motion audits.
10. Review query/index behavior with production-scale cars, reservations, and customers; batch/cache Auth email lookup where appropriate.
11. Add a deployment target, environment/runbook documentation, backups, and post-release monitoring.

## Future Features

The following are possibilities suggested by current scope gaps, not confirmed requirements:

- Payment authorization, receipts, refunds, deposits, taxes, and reconciliation.
- Customer/admin notifications for reservation decisions, upcoming pickup, return, cancellation, and expiration.
- Pickup/return locations, opening hours, add-ons, insurance, driver verification, and fleet maintenance records.
- Admin customer account controls and an audit trail for privileged actions.
- More granular Realtime updates for admin queues and customer reservation status.
- Saved searches/favorites, localization, multi-currency support, and approved application screenshots.

[Previous: Testing and Deployment](testing-and-deployment.md) · [Documentation index](README.md)
