# Features and Workflows

[Documentation index](README.md) · [Root README](../README.md)

## Page Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Landing page. |
| `/cars` | Public | Available-car search, filters, sorting, view mode, and pagination. |
| `/cars/[id]` | Public | Car gallery, details, related cars, calendar, and price preview. |
| `/login`, `/register`, `/forgot-password` | Guest only | Sign-in, account creation, and recovery request. |
| `/reset-password` | Public Auth flow | Complete an established recovery session. |
| `/cars/[id]/confirm-reservation` | Customer | Revalidate and submit a selected booking. |
| `/profile` | Customer | Profile, email state, security actions, and rental counts. |
| `/my-reservations` | Customer | Reservation history with client-side search/status filtering. |
| `/my-reservations/[id]` | Customer | Owned reservation details and eligible cancellation. |
| `/admin` | Admin | Operational dashboard. |
| `/admin/cars` | Admin | Fleet list and filters. |
| `/admin/cars/new` | Admin | Create a car and upload images. |
| `/admin/cars/[id]/edit` | Admin | Edit/deactivate a car and manage images. |
| `/admin/reservations` | Admin | Reservation list, summaries, filters, and status actions. |
| `/admin/reservations/[reservationId]` | Admin | Reservation detail and status actions. |
| `/admin/customers` | Admin | Customer directory and operational summary. |
| `/admin/customers/[customerId]` | Admin | Customer details, statistics, and grouped reservations. |

## Public Workflows

### Browse and Filter Cars

**Entry point:** `/cars`, with a hero shortcut from `/`.

The catalogue normalizes URL parameters for search, category, transmission, fuel, seat grouping, maximum price, sorting, page, and grid/list view. The Server Component calls `getPublicCars()` directly and returns six cars per page. Only `cars.status = 'available'` passes RLS/public query filtering.

Search matches brand, model, or category. Supported category filters are economy, compact, sedan, SUV, luxury, and electric. Invalid URL values are discarded or reset to defaults before querying.

### View Car Details

**Entry point:** `/cars/[id]`.

The server validates the UUID, loads one available car with ordered images, and constructs public Storage URLs. Missing/invalid cars render the not-found page. The page shows specifications, description, feature labels, and related available cars selected by comparable attributes and price.

### Check Dates and Preview Price

**Entry point:** the reservation card on `/cars/[id]`.

1. The calendar requests `GET /api/cars/[id]/unavailable-ranges` for the visible one- or two-month window.
2. The route validates an inclusive range of at most 93 days and calls `get_car_unavailable_ranges()`.
3. When both dates are selected, the client sends `POST /api/reservations/preview`.
4. Zod and `preview_reservation()` both enforce future pickup, ordering, 30-day duration, and 180-day horizon rules.
5. The response identifies availability and returns current snapshot pricing without creating a row.

The calendar distinguishes ranges owned by the signed-in user when Auth context is available, but it does not expose another customer's identity.

The reservation card subscribes to `car:<id>:availability`. A database broadcast caused by any relevant reservation insert/update/delete invalidates calendar and preview query keys and prompts active views to refetch.

## Authentication Workflows

### Registration and Email Confirmation

**Entry point:** `/register`; **APIs:** `POST /api/auth/register`, `GET /api/auth/confirm`.

The request validates full name, email, optional phone, password, password confirmation, and a safe internal `redirectTo`. Supabase creates the Auth user with name/phone metadata; an Auth trigger creates a customer profile. When confirmation is enabled, Supabase sends a link through the confirmation Route Handler, which verifies the OTP and redirects internally.

The local Supabase config currently disables mandatory confirmation, although the application always reports `requiresEmailVerification: true`. See [Known Issues and Roadmap](known-issues-and-roadmap.md).

### Login, Google OAuth, Logout, and Recovery

**Entry points:** `/login`, `/forgot-password`, `/reset-password`.

Password login uses Supabase Auth, then loads the application profile. Google sign-in starts at `/api/auth/google` and exchanges the returned code at `/api/auth/callback`. Logout clears the local Supabase session. Password recovery verifies a recovery OTP before `/reset-password` may update the password.

See [Authentication and Authorization](authentication-and-authorization.md) for redirects and protection details.

## Customer Workflows

### Create a Reservation

**Entry point:** `/cars/[id]/confirm-reservation`; **API:** `POST /api/reservations`.

1. Proxy requires a signed-in customer before the confirmation route opens.
2. The Server Component validates query dates and loads a fresh server-side preview.
3. The Client Component subscribes to availability broadcasts and continues to refetch the same preview.
4. The customer must acknowledge the displayed reservation policy.
5. The POST handler verifies the `customer` claim and repeats Zod validation.
6. `create_reservation()` locks the profile, checks date/usage/availability rules, snapshots the current daily price, and inserts `pending`.
7. The GiST exclusion constraint resolves last-moment races that pass earlier checks.
8. On success, the UI opens `/my-reservations/[id]`.

The inserted row triggers an availability broadcast for that car.

### View Reservations

**Entry points:** `/my-reservations` and `/my-reservations/[id]`; **APIs:** customer reservation GET handlers.

TanStack Query loads the customer's RLS-scoped rows. The list can be searched and filtered in the UI. Details include itinerary, snapshot price, totals, car/customer data, state progress, timestamps, and recorded cancellation/rejection reasons. Ownership is applied in both the data query (`customer_id`) and RLS.

### Cancel a Reservation

**Entry point:** eligible detail page; **API:** `PATCH /api/customer/reservations/[reservationId]/cancel`.

The route validates the UUID and a nonblank reason of at most 1,000 characters, verifies the customer role, then calls `cancel_my_reservation()`. The RPC locks the owned row and permits only `pending` or `confirmed` to become `cancelled`. The trigger requires/preserves the reason. The client updates the detail cache and invalidates the list; the database broadcasts newly available dates.

### Manage Profile

**Entry point:** `/profile`; **APIs:** `/api/customer/profile` and `/api/customer/profile/stats`.

Customers can edit full name and phone. Email is read from Supabase Auth and remains read-only. Stats count all, active, and completed reservations. Password reset starts the normal recovery-email flow. Profile data is RLS-scoped, with column privileges limiting direct updates to name and phone.

`/api/auth/me` also exposes current-account read and customer profile patch behavior, but current profile feature services use the `/api/customer/profile` domain endpoints.

## Admin Workflows

### Dashboard

**Entry point:** `/admin`; **API:** `GET /api/admin/dashboard`.

The dashboard loads total cars, active/pending reservations, customer totals, new customers, monthly completed-reservation revenue, change indicators, six-month revenue/reservation series, fleet status, and recent records. Revenue is derived only from completed reservation totals because no payment ledger exists. Customer emails use the server-only Auth admin client and may be `null` if lookup fails.

### Manage Cars

**Entry points:** `/admin/cars`, `/admin/cars/new`, `/admin/cars/[id]/edit`; **APIs:** admin car handlers.

- The list supports search, status/category/transmission filters, sorting, pagination, and image thumbnails.
- Creation validates core car fields and database uniqueness; duplicate plates return a conflict.
- Editing accepts a strict partial body and persists selected fields.
- `DELETE /api/admin/cars/[id]` is a soft deactivation that sets `status = 'inactive'`; it does not delete related history.
- Car creation/editing does not currently expose the database `features` array.

Zod checks input ranges and supported values. RLS and `private.is_admin()` enforce database authorization independently of the Route Handler claim check.

### Manage Car Images

**Entry point:** car create/edit form; **API:** `/api/admin/cars/[id]/images`.

Upload accepts multipart field `images`, one to six JPEG/PNG/WebP files, each at most 5 MiB. Files are stored under a randomized car path, then metadata rows are inserted. The first uploaded image becomes primary only if no primary exists. Partial upload failures remove already uploaded objects where possible.

PATCH accepts `{ "imageId": "<uuid>" }` and switches the primary image. DELETE accepts the same shape, removes the row/object, and promotes the earliest remaining image when the deleted row was primary. These multi-step operations include compensating attempts but are not a single database/storage transaction.

### Manage Reservations

**Entry points:** `/admin/reservations` and its detail route; **APIs:** admin reservation handlers.

Admins can search by reservation UUID, customer name, car brand/model, or plate; filter by status and pickup range; sort; paginate; and view all-status summaries. Status actions validate the target and required reason before calling `admin_update_reservation_status()`.

The database trigger, not the UI, is authoritative for allowed transitions. Rejection/cancellation require a reason. Reservation changes broadcast availability for the affected car.

### View Customers

**Entry points:** `/admin/customers` and `/admin/customers/[customerId]`; **APIs:** admin customer GET handlers.

The directory searches customer name/phone, filters join dates, sorts by join time, and paginates. Details combine profile/Auth email information with reservation statistics and current, upcoming, and historical groupings. Completed totals contribute to `totalSpent`.

Customer management is view-only: no admin customer edit, deletion, suspension, or role-change Route Handler is implemented.

[Previous: Database](database.md) · [Next: API Reference](api-reference.md)
