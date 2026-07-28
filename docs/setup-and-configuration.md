# Setup and Configuration

[Documentation index](README.md) · [Root README](../README.md)

## Prerequisites

- Git.
- Node.js **20.9.0 or newer**. The repository does not declare `engines` or an `.nvmrc`; this minimum comes from the installed Next.js 16.2.12 package.
- npm. `package-lock.json` is tracked, so npm is the supported package manager.
- A Supabase project, or the Supabase CLI and a Docker-compatible runtime for the local stack.

The repository was inspected with Supabase CLI 2.90.0, but it does not pin a CLI version.

## Clone and Install

```bash
git clone https://github.com/MohammadHajeer/drive-reserve.git
cd drive-reserve
npm install
```

For repeatable CI-style installs, `npm ci` is also compatible with the tracked lockfile.

## Environment Variables

Copy the safe template to `.env.local`:

```bash
cp .env.example .env.local
```

```powershell
Copy-Item .env.example .env.local
```

### Application variables

| Variable | Required | Scope | Used For | Example Format |
| --- | ---: | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_PUBLIC_URL` | Yes | Browser-safe public | Browser, SSR, Proxy, and service-role client project URL. | `http://127.0.0.1:54321` or `https://project-ref.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Browser-safe public | User-scoped Supabase browser/server/Proxy clients. | `sb_publishable_...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Conditional | Server only | Populates customer email addresses in admin views. Missing/failed Auth admin lookups degrade those email fields to `null`. | Supabase service-role secret from the project or local status output |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Browser-safe public | Canonical origin for registration confirmation and password-recovery redirects; request origin is the fallback. | `http://localhost:3000` |

`NODE_ENV` is read for development-only logging behavior but is managed by Next.js; do not add it to `.env.local` for normal use.

### Supabase CLI template variables

`supabase/config.toml` also contains standard CLI template references. `OPENAI_API_KEY` is optional and only affects Supabase Studio AI. The Twilio, Apple, SMTP, Vault, and experimental S3 secret names occur in disabled or commented example sections and are not DriveReserve application requirements. Configure them only if those local Supabase features are deliberately enabled.

Never expose `SUPABASE_SERVICE_ROLE_KEY` through a `NEXT_PUBLIC_` variable or commit `.env.local`.

## Local Supabase Setup

From the repository root:

```bash
supabase start
supabase db reset
supabase status
```

`supabase db reset` applies `supabase/migrations/` in filename order and loads `supabase/seed.sql`. Copy the reported API URL, publishable key, and service-role key into `.env.local`.

The local configuration uses PostgreSQL 17, enables migrations, seed loading, Auth, Storage, Studio, Inbucket, and Realtime. The seed is idempotent for its demo rows, but its car-image records refer to object paths whose binary files are not stored in the repository. Upload images through the admin UI or replace those rows if images are required locally.

## Hosted Supabase Setup

```bash
supabase login
supabase link --project-ref <project-ref>
supabase db push
```

Load the seed only into environments where demo data is appropriate. Do not seed production by default.

## Required Supabase Auth Configuration

The migrations create `public.custom_access_token_hook`, but the repository's local config leaves its hook block commented out. Enable the Custom Access Token hook and point it to:

```text
pg-functions://postgres/public/custom_access_token_hook
```

Without this hook, JWTs do not contain `user_role`, and Proxy/API role checks will reject protected customer and admin access even though a profile row exists.

Also configure:

1. Site URL and allowed redirects for the application origin.
2. Email confirmation according to the target environment. The UI supports confirmation, while checked-in local config has `enable_confirmations = false`.
3. Google provider credentials if Google sign-in is required, plus the provider callback shown by Supabase and application callback `/api/auth/callback`.
4. Recovery and email-confirmation URLs that route through `/api/auth/recovery` and `/api/auth/confirm`.

To create an administrator, first create a normal Auth user, then update only its trusted profile row and sign in again so a new token receives the claim:

```sql
update public.profiles
set role = 'admin'
where id = '<AUTH_USER_UUID>';
```

## Start the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verify the Installation

1. Load `/` and `/cars` and confirm available seeded cars appear.
2. Create a customer and sign in; if confirmations are enabled, complete the email callback first.
3. Confirm `/profile` loads and a valid car date range returns a preview.
4. Create or promote an admin, sign in again, and confirm `/admin` loads.
5. Run static checks:

   ```bash
   npm run typecheck
   npm run lint
   npm run build
   ```

`npm test` currently fails because its configured target, `tests/reservation-date.test.mjs`, is not tracked. See [Testing and Deployment](testing-and-deployment.md).

## Common Setup Problems

| Symptom | Likely Cause | Resolution |
| --- | --- | --- |
| Supabase client errors immediately | Missing/incorrect public URL or publishable key | Recopy values from the project settings or `supabase status`. |
| Admin email lookups fail or show `null` | Missing service-role key or Auth admin lookup failure | Set the server-only key and restart Next.js. Never expose it publicly. |
| Signed-in users reach `/unauthorized` or receive `403` | `user_role` claim absent/stale | Enable the custom access-token hook and sign in again. |
| Confirmation or recovery link returns to the wrong host | Site URL or redirect allow-list mismatch | Align Supabase Auth settings and `NEXT_PUBLIC_SITE_URL`. |
| Google sign-in returns `google-auth-failed` | Provider credentials/callback not configured | Enable Google in Supabase and verify both provider and app callback URLs. |
| Seeded image URLs are broken | Seed references Storage paths only | Upload matching objects or manage images through the admin UI. |
| Booking views do not refresh across browsers | Realtime unavailable or latest migration missing | Apply all migrations and ensure Realtime is enabled. |
| Lifecycle statuses do not advance automatically | No scheduler is included | Configure a trusted scheduler for the maintenance functions. |
| Production build cannot fetch Geist fonts | The root layout uses `next/font/google` | Allow outbound access to Google Fonts during build or replace the fonts with checked-in local assets. |

[Previous: Architecture and Project Structure](architecture-and-project-structure.md) · [Next: Database](database.md)
