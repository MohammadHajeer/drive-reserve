# API Reference

[Documentation index](README.md) · [Root README](../README.md)

## Conventions

Except for redirect-based Auth handlers, successful JSON responses use:

```json
{ "success": true, "data": {}, "message": "optional" }
```

Errors use:

```json
{ "success": false, "error": { "code": "ERROR_CODE", "message": "..." } }
```

Validation failures may also include `fieldErrors` and `formErrors`. Private/current-data endpoints use `Cache-Control: private, no-store` where their shared response helper or route sets it; public featured/calendar handlers use `no-store`.

Role checks use verified Supabase claims. A `401` means no valid session; `403` means a valid session lacks the required `customer` or `admin` role. Database RLS/RPC authorization remains a separate enforcement layer.

## Authentication

### `POST /api/auth/register`

**Purpose:** Create a Supabase Auth user and start email confirmation.

**Authentication / authorization:** Guest-oriented; no role required.

**Path/query parameters:** None.

**Request body:**

| Field | Required | Validation |
| --- | ---: | --- |
| `fullName` | Yes | Trimmed, 2–100 characters. |
| `email` | Yes | Valid email, normalized to lowercase. |
| `phone` | No | Empty, `null`, or supported 7–20 character phone format. |
| `password` | Yes | 8–72 characters. |
| `confirmPassword` | Yes | Must equal `password`. |
| `redirectTo` | No | Safe same-origin internal path only. |

**Success response:** `200`; `data.email`, `data.requiresEmailVerification: true`, and an informational message.

**Possible errors:** `400 INVALID_JSON`, `400 VALIDATION_ERROR`, `400 REGISTRATION_FAILED`, `429 RATE_LIMITED`, `500 REGISTRATION_FAILED`, `500 INTERNAL_SERVER_ERROR`.

**Side effects:** Calls `supabase.auth.signUp`; Auth metadata seeds profile name/phone, the database trigger creates a customer profile, and Supabase may send a confirmation link to `/api/auth/confirm`.

### `GET /api/auth/confirm`

**Purpose:** Verify an email OTP and redirect.

**Authentication / authorization:** Public Auth callback.

**Query parameters:** `token_hash` and `type` are required; optional `redirectTo` must be a safe internal path.

**Request body/path parameters:** None.

**Validation:** Presence checks plus internal redirect validation; Supabase validates the OTP type/hash.

**Success response:** HTTP redirect to `redirectTo`, or `/login` when absent.

**Possible errors:** Redirects to `/login?verification=failed` for missing/invalid/expired inputs.

**Side effects:** Establishes/updates the Supabase Auth session represented by response cookies.

### `POST /api/auth/login`

**Purpose:** Create an email/password session and return the application user.

**Authentication / authorization:** No existing session required.

**Path/query parameters:** None.

**Request body:** `email` (valid, lowercase) and nonempty `password`.

**Validation:** `loginSchema`; then Supabase password verification and profile lookup.

**Success response:** `200`; `data.user` with `id`, `email`, `fullName`, `phone`, and `role`.

**Possible errors:** `400 INVALID_JSON`, `400 VALIDATION_ERROR`, `401 INVALID_CREDENTIALS`, `403 EMAIL_NOT_VERIFIED`, `429 RATE_LIMITED`, `500 PROFILE_LOAD_FAILED`, `500 SESSION_CREATION_FAILED`, `500 INTERNAL_SERVER_ERROR`.

**Side effects:** Sets Supabase session cookies. If the profile cannot load, the route signs the session out.

### `GET /api/auth/google`

**Purpose:** Start Google OAuth, or redirect an already-authenticated user.

**Authentication / authorization:** Public; accepts optional existing session.

**Query parameters:** Optional safe internal `redirectTo`.

**Request body/path parameters:** None.

**Validation:** Internal redirect validation; Supabase creates the provider authorization URL.

**Success response:** Redirect to Google/Supabase OAuth, or to the requested/role home route for an existing session.

**Possible errors:** Redirect to `/login?error=google-auth-failed` while preserving a valid `redirectTo`.

**Side effects:** Starts an external OAuth flow; no application row is directly written here.

### `GET /api/auth/callback`

**Purpose:** Exchange an OAuth authorization code for a session and apply a role-aware redirect.

**Authentication / authorization:** Public callback.

**Query parameters:** Required `code`; optional safe internal `redirectTo`.

**Request body/path parameters:** None.

**Validation:** Code presence, internal redirect validation, Supabase exchange, then profile-role lookup.

**Success response:** Redirect to `redirectTo`, otherwise `/admin` for admins or `/profile` for customers.

**Possible errors:** Redirect to `/login?error=google-auth-failed` or `profile-load-failed`.

**Side effects:** Sets session cookies. A session is locally signed out if its application profile cannot load.

### `POST /api/auth/logout`

**Purpose:** Sign out the current browser session.

**Authentication / authorization:** Session optional.

**Inputs:** No path/query parameters or body.

**Validation:** None beyond Supabase sign-out.

**Success response:** `200`; `data: null`.

**Possible errors:** `500 LOGOUT_FAILED`, `500 INTERNAL_SERVER_ERROR`.

**Side effects:** Calls local-scope Supabase sign-out and clears/updates Auth cookies.

### `POST /api/auth/forgot-password`

**Purpose:** Send a password-recovery email.

**Authentication / authorization:** Public.

**Path/query parameters:** None.

**Request body:** `email` (valid and normalized).

**Validation:** `forgotPasswordSchema`.

**Success response:** `200` with a message.

**Possible errors:** `400 INVALID_JSON`, `400 VALIDATION_ERROR`, `404 USER_NOT_FOUND` when Supabase reports it, `429 RATE_LIMITED`, `500 PASSWORD_RESET_EMAIL_FAILED`, `500 INTERNAL_SERVER_ERROR`.

**Side effects:** Requests a Supabase recovery email whose application redirect is `/api/auth/recovery`, using `NEXT_PUBLIC_SITE_URL` or request origin.

### `GET /api/auth/recovery`

**Purpose:** Verify a recovery OTP and establish the reset session.

**Authentication / authorization:** Public recovery callback.

**Query parameters:** Required `token_hash` and `type=recovery`.

**Request body/path parameters:** None.

**Validation:** Presence/type check followed by Supabase OTP verification.

**Success response:** Redirect to `/reset-password`.

**Possible errors:** Redirect to `/forgot-password?error=invalid-or-expired-link`.

**Side effects:** Establishes a recovery session in Auth cookies.

### `PATCH /api/auth/reset-password`

**Purpose:** Set a new password for the current recovery/authenticated session.

**Authentication / authorization:** A valid Supabase session with a subject is required.

**Path/query parameters:** None.

**Request body:** `password` (8–72 characters) and matching `confirmPassword`.

**Validation:** `resetPasswordSchema` and verified claims.

**Success response:** `200` with a confirmation message.

**Possible errors:** `400 INVALID_JSON`, `400 VALIDATION_ERROR`, `400 PASSWORD_RESET_FAILED`, `401 INVALID_RECOVERY_SESSION`, `500 INTERNAL_SERVER_ERROR`.

**Side effects:** Updates the Supabase Auth password.

### `GET /api/auth/me`

**Purpose:** Return the verified current Auth user combined with its profile.

**Authentication / authorization:** Any valid customer/admin session.

**Inputs:** No path/query parameters or body.

**Validation:** `getClaims()` verifies the token; `getUser()` verifies the current Auth record and subject match.

**Success response:** `200`; `data.user` contains `id`, `email`, `fullName`, `phone`, `role`, `createdAt`, and `lastSignInAt`.

**Possible errors:** `401 UNAUTHENTICATED`, `500 PROFILE_LOAD_FAILED`, `500 INTERNAL_SERVER_ERROR`.

**Side effects:** None beyond normal cookie refresh behavior.

### `PATCH /api/auth/me`

**Purpose:** Update selected current-customer profile fields.

**Authentication / authorization:** Authenticated `customer`; admins receive `403`.

**Path/query parameters:** None.

**Request body:** Strict partial object containing at least one of `fullName` (2–100) or `phone` (valid optional/empty/null value).

**Validation:** `updateProfileSchema`, claims, and database profile constraints.

**Success response:** `200`; `data.profile` with `id`, `fullName`, `phone`, `role`, and `updatedAt`.

**Possible errors:** `400 INVALID_JSON`, `400 VALIDATION_ERROR`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `500 PROFILE_UPDATE_FAILED`, `500 INTERNAL_SERVER_ERROR`.

**Side effects:** Updates `profiles.full_name` and/or `phone`; the update trigger refreshes `updated_at`.

## Public Cars and Reservations

### `GET /api/cars/featured`

**Purpose:** Return the three newest available public cars for the landing page.

**Authentication / authorization:** Public; RLS exposes available cars only.

**Inputs:** No path/query parameters or body.

**Validation:** Uses normalized default public filters with `sort=newest` and limit 3.

**Success response:** `200`; `data.cars`, an array of public car list items with primary image URL.

**Possible errors:** `500` with the public car service error envelope.

**Side effects:** None; response is `no-store`.

### `GET /api/cars/[id]/unavailable-ranges`

**Purpose:** Return blocking reservation ranges for a car/calendar window.

**Authentication / authorization:** Public; an authenticated owner may receive `isMine: true` for their own ranges.

**Path/query parameters:** UUID path `id`; required `from` and `to` dates in `YYYY-MM-DD`.

**Request body:** None.

**Validation:** Valid UUID/dates, `to >= from`, and no more than 92 days between endpoints (93 inclusive days).

**Success response:** `200`; array items `{ startDate, endDateExclusive, isMine }`.

**Possible errors:** `400 VALIDATION_ERROR`, `404 CAR_NOT_FOUND`, `500 UNAVAILABLE_RANGES_FAILED`.

**Side effects:** Calls `get_car_unavailable_ranges()`; no write; response is `no-store`.

### `POST /api/reservations/preview`

**Purpose:** Validate dates and return availability/current pricing without booking.

**Authentication / authorization:** Public.

**Path/query parameters:** None.

**Request body:** `carId`, `pickupDate`, `returnDate`.

**Validation:** UUID, real `YYYY-MM-DD` dates, pickup after Beirut today, return after pickup, maximum 30 days, pickup within 180 days; repeated in `preview_reservation()`.

**Success response:** `200`; `{ carId, pickupDate, returnDate, rentalDays, available, pricePerDay, totalPrice, unavailableReason }`. Unavailable cars/dates are successful previews with `available: false`.

**Possible errors:** `400 INVALID_JSON`, `400 VALIDATION_ERROR` or RPC date reason, `404 CAR_NOT_FOUND`, `500 PREVIEW_FAILED`.

**Side effects:** None; private `no-store` response.

### `POST /api/reservations`

**Purpose:** Create a customer reservation.

**Authentication / authorization:** Authenticated `customer` only.

**Path/query parameters:** None.

**Request body:** The same `carId`, `pickupDate`, and `returnDate` contract as preview.

**Validation:** Claims and `reservationPreviewSchema`, then all rules in `create_reservation()` including customer limits and transactional overlap checks.

**Success response:** `201`; `data.reservation` with `id`, `carId`, dates, `rentalDays`, `totalPrice`, and `status` (`pending`).

**Possible errors:** `400 INVALID_JSON`, `400 VALIDATION_ERROR`/date-rule codes, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `409 MAXIMUM_UPCOMING_RESERVATIONS_REACHED`, `409 MAXIMUM_CONCURRENT_RESERVATIONS_REACHED`, `409 DATES_UNAVAILABLE`, `409 DATES_JUST_RESERVED`, `409 CAR_UNAVAILABLE`, `500 RESERVATION_CREATE_FAILED`.

**Side effects:** `create_reservation()` inserts a snapshot-priced row; database triggers set timestamps/validate status and broadcast the car's availability change.

## Customer

### `GET /api/customer/profile`

**Purpose:** Return the current customer profile and Auth email state.

**Authentication / authorization:** Authenticated `customer` only.

**Inputs:** No path/query parameters or body.

**Validation:** Verified customer claim and RLS-scoped profile lookup.

**Success response:** `200`; `data` contains `fullName`, `phone`, `email`, `createdAt`, `updatedAt`, and `emailVerified`.

**Possible errors:** `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 PROFILE_NOT_FOUND`, `500 PROFILE_LOAD_FAILED`.

**Side effects:** None.

### `PATCH /api/customer/profile`

**Purpose:** Replace the editable name and phone values.

**Authentication / authorization:** Authenticated `customer` only.

**Path/query parameters:** None.

**Request body:** `fullName` (2–100) and `phone` (empty or supported 7–30 character format); both fields are required by this endpoint's schema.

**Validation:** `editableCustomerProfileSchema`, RLS, column privileges, and table length constraints.

**Success response:** `200`; full profile data and success message.

**Possible errors:** `400 INVALID_JSON`, `400 VALIDATION_ERROR`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 PROFILE_NOT_FOUND`, `500 PROFILE_UPDATE_FAILED`.

**Side effects:** Updates `profiles.full_name`/`phone` and `updated_at`.

### `GET /api/customer/profile/stats`

**Purpose:** Return rental counters for the current customer.

**Authentication / authorization:** Authenticated `customer` only.

**Inputs:** No path/query parameters or body.

**Validation:** Verified customer claim and owner-scoped reservation counts.

**Success response:** `200`; `totalRentals`, `activeRentals`, and `completedRentals`.

**Possible errors:** `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `500 PROFILE_STATS_LOAD_FAILED`.

**Side effects:** None.

### `GET /api/customer/reservations`

**Purpose:** Return all current-customer reservations, newest first.

**Authentication / authorization:** Authenticated `customer` only.

**Inputs:** No path/query parameters or body.

**Validation:** Verified customer claim; query explicitly matches `customer_id` and RLS repeats ownership.

**Success response:** `200`; array of reservation list items containing id, dates, duration, total, status, creation time, and compact car data.

**Possible errors:** `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `500 RESERVATIONS_LOAD_FAILED`.

**Side effects:** None.

### `GET /api/customer/reservations/[reservationId]`

**Purpose:** Return one owned reservation with joined detail.

**Authentication / authorization:** Authenticated `customer` owner only.

**Path parameters:** UUID `reservationId`.

**Query parameters/request body:** None.

**Validation:** UUID, customer claim, explicit owner match, and RLS.

**Success response:** `200`; detailed reservation, customer, car, snapshot pricing, status/reasons, and timestamps.

**Possible errors:** `400 INVALID_RESERVATION_ID`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 RESERVATION_NOT_FOUND`, `500 RESERVATION_LOAD_FAILED`, `500 INTERNAL_SERVER_ERROR`.

**Side effects:** None.

### `PATCH /api/customer/reservations/[reservationId]/cancel`

**Purpose:** Cancel an owned pending or confirmed reservation.

**Authentication / authorization:** Authenticated `customer` owner only.

**Path parameters:** UUID `reservationId`.

**Request body:** `{ "reason": "..." }`, trimmed, 1–1,000 characters.

**Query parameters:** None.

**Validation:** UUID/body schema, customer claim, then locked ownership/status/reason checks in `cancel_my_reservation()`.

**Success response:** `200`; updated detailed reservation and message. The route treats an already-observed `cancelled` row as success after an RPC error to handle ambiguous retries.

**Possible errors:** `400 INVALID_RESERVATION_ID`, `400 INVALID_JSON`, `400 VALIDATION_ERROR`, `400 CANCELLATION_REASON_REQUIRED`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 RESERVATION_NOT_FOUND`, `409 CANCELLATION_NOT_ALLOWED`, `500 RESERVATION_CANCELLATION_FAILED`, `500 RESERVATION_RELOAD_FAILED`.

**Side effects:** RPC changes status to `cancelled`, records the reason, updates timestamp, and broadcasts the availability change; client hooks update detail cache and invalidate list queries.

## Admin

All endpoints below require an authenticated `admin` claim and are also protected by RLS or admin-only RPC checks.

### `GET /api/admin/dashboard`

**Purpose:** Return dashboard KPIs, six-month chart series, fleet status, and recent activity.

**Inputs:** No path/query parameters or body.

**Validation:** Admin access helper.

**Success response:** `200`; `kpis`, `revenue`, `reservations`, `fleetStatus`, `recentReservations`, and `recentCustomers`.

**Possible errors:** `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `500 DASHBOARD_LOAD_FAILED`.

**Side effects:** No application writes; the service-role Auth client may read customer emails.

### `GET /api/admin/cars`

**Purpose:** Return the paginated admin fleet list.

**Query parameters:**

| Name | Default | Accepted Values |
| --- | --- | --- |
| `search` | empty | Up to 80 letters/numbers/spaces/hyphens; matches brand/model/plate/category. |
| `status` | all | `available`, `maintenance`, `inactive`. |
| `category` | all | String up to 50 characters. |
| `transmission` | all | `automatic`, `manual`. |
| `sort` | `newest` | `newest`, `oldest`, `price-asc`, `price-desc`, `year-desc`, `brand-asc`. |
| `page` | `1` | Positive integer. |
| `limit` | `10` | Integer 1–50. |

**Path parameters/request body:** None.

**Validation:** `adminCarsQuerySchema` and admin claim.

**Success response:** `200`; `data.cars` with ordered image records and `data.pagination`.

**Possible errors:** `400 INVALID_QUERY_PARAMETERS`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `500 CARS_LOAD_FAILED`, `500 INTERNAL_SERVER_ERROR`.

**Side effects:** None.

### `POST /api/admin/cars`

**Purpose:** Create a fleet record.

**Path/query parameters:** None.

**Request body:** `brand`, `model`, `year`, `plateNumber`, `color`, `category`, `transmission`, `fuelType`, `seats`, `pricePerDay`, optional `description`, optional `status`.

**Validation:** Field length/range rules; supported category/transmission/fuel/status values; plate normalized uppercase; positive price.

**Success response:** `201`; `data.car` with empty `images` and message.

**Possible errors:** `400 INVALID_JSON`, `400 VALIDATION_ERROR`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `409 PLATE_NUMBER_EXISTS`, `500 CAR_CREATION_FAILED`, `500 INTERNAL_SERVER_ERROR`.

**Side effects:** Inserts `cars`; timestamp trigger runs.

### `GET /api/admin/cars/[id]`

**Purpose:** Return one fleet record with ordered images.

**Path parameters:** UUID `id`.

**Query parameters/request body:** None.

**Validation:** UUID and admin claim.

**Success response:** `200`; `data.car` with public image URLs and stored paths.

**Possible errors:** `400 INVALID_CAR_ID`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 CAR_NOT_FOUND`, `500 CAR_LOAD_FAILED`, `500 INTERNAL_SERVER_ERROR`.

**Side effects:** None.

### `PATCH /api/admin/cars/[id]`

**Purpose:** Update selected fleet fields.

**Path parameters:** UUID `id`.

**Request body:** Strict nonempty partial of the car creation fields (except `features`); `description` may be string or `null`.

**Query parameters:** None.

**Validation:** `updateCarSchema`, admin claim, table constraints, case-insensitive plate uniqueness.

**Success response:** `200`; updated `data.car` including images.

**Possible errors:** `400 INVALID_CAR_ID`, `400 INVALID_JSON`, `400 VALIDATION_ERROR`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 CAR_NOT_FOUND`, `409 PLATE_NUMBER_EXISTS`, `500 CAR_UPDATE_FAILED`, `500 INTERNAL_SERVER_ERROR`.

**Side effects:** Updates `cars` and `updated_at`.

### `DELETE /api/admin/cars/[id]`

**Purpose:** Soft-deactivate a car.

**Path parameters:** UUID `id`.

**Query parameters/request body:** None.

**Validation:** UUID and admin claim.

**Success response:** `200`; updated car with `status: "inactive"`.

**Possible errors:** `400 INVALID_CAR_ID`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 CAR_NOT_FOUND`, `500 CAR_DEACTIVATION_FAILED`, `500 INTERNAL_SERVER_ERROR`.

**Side effects:** Updates status to `inactive`; no row, image, or reservation history is deleted.

### `POST /api/admin/cars/[id]/images`

**Purpose:** Upload car images and create metadata rows.

**Path parameters:** UUID car `id`.

**Request body:** `multipart/form-data`; repeated `images` field with 1–6 JPEG, PNG, or WebP files, each at most 5 MiB.

**Query parameters:** None.

**Validation:** UUID, admin claim, car existence, count, MIME type, and file size; bucket enforces MIME/size too.

**Success response:** `201`; `data.images` with `id`, `path`, public `url`, `isPrimary`, and `displayOrder`.

**Possible errors:** `400 INVALID_CAR_ID`, `400 IMAGES_REQUIRED`, `400 TOO_MANY_IMAGES`, `400 INVALID_IMAGE_TYPE`, `400 IMAGE_TOO_LARGE`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 CAR_NOT_FOUND`, `500 CAR_LOAD_FAILED`, `500 IMAGES_LOAD_FAILED`, `500 IMAGE_UPLOAD_FAILED`, `500 IMAGE_RECORD_CREATION_FAILED`, `500 INTERNAL_SERVER_ERROR`.

**Side effects:** Uploads randomized Storage objects and inserts `car_images`; compensating deletion is attempted on partial failures.

### `PATCH /api/admin/cars/[id]/images`

**Purpose:** Set one image as primary.

**Path parameters:** UUID car `id`.

**Request body:** Strict `{ "imageId": "<uuid>" }`.

**Query parameters:** None.

**Validation:** Both UUIDs, admin claim, and image membership in the car.

**Success response:** `200`; `data.image` marked primary.

**Possible errors:** `400 INVALID_CAR_ID`, `400 INVALID_JSON`, `400 VALIDATION_ERROR`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 IMAGE_NOT_FOUND`, `500 IMAGE_LOAD_FAILED`, `500 PRIMARY_IMAGE_LOAD_FAILED`, `500 PRIMARY_IMAGE_UPDATE_FAILED`, `500 INTERNAL_SERVER_ERROR`.

**Side effects:** Unsets the current primary and sets the target; attempts to restore the previous primary if the second update fails.

### `DELETE /api/admin/cars/[id]/images`

**Purpose:** Delete one car image.

**Path parameters:** UUID car `id`.

**Request body:** Strict `{ "imageId": "<uuid>" }`.

**Query parameters:** None.

**Validation:** Both UUIDs, admin claim, car existence, and image membership.

**Success response:** `200`; `data.imageId` and message.

**Possible errors:** `400 INVALID_CAR_ID`, `400 INVALID_JSON`, `400 VALIDATION_ERROR`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 CAR_NOT_FOUND`, `404 IMAGE_NOT_FOUND`, `500 CAR_LOAD_FAILED`, `500 IMAGE_LOAD_FAILED`, `500 IMAGE_DELETE_FAILED`, `500 IMAGE_STORAGE_DELETE_FAILED`, `500 PRIMARY_IMAGE_UPDATE_FAILED`, `500 INTERNAL_SERVER_ERROR`.

**Side effects:** Deletes metadata, promotes the first remaining image when needed, and removes the Storage object. A later failure can leave a partially completed operation and is reported explicitly.

### `GET /api/admin/reservations`

**Purpose:** Return searchable/filterable reservations, status summary, and pagination.

**Query parameters:**

| Name | Default | Accepted Values |
| --- | --- | --- |
| `q` | empty | Up to 100 characters; UUID/customer name/car brand/model/plate lookup. |
| `status` | all | Any reservation status. |
| `pickupFrom`, `pickupTo` | unset | ISO dates; end must be on/after start. |
| `sort` | `newest` | `newest`, `oldest`, `pickup-asc`, `pickup-desc`, `total-asc`, `total-desc`. |
| `page` | `1` | Positive integer. |
| `limit` | `10` | `10`, `20`, or `50`. |

**Path parameters/request body:** None.

**Validation:** `adminReservationsQuerySchema` and admin claim.

**Success response:** `200`; `reservations`, per-status `summary`, and `pagination`.

**Possible errors:** `400 INVALID_QUERY_PARAMETERS`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `500 RESERVATIONS_LOAD_FAILED`, `500 INTERNAL_SERVER_ERROR`.

**Side effects:** None.

### `GET /api/admin/reservations/[reservationId]`

**Purpose:** Return one reservation with joined customer/car detail.

**Path parameters:** UUID `reservationId`.

**Query parameters/request body:** None.

**Validation:** UUID and admin claim.

**Success response:** `200`; `data.reservation`.

**Possible errors:** `400 INVALID_RESERVATION_ID`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 RESERVATION_NOT_FOUND`, `500 RESERVATION_LOAD_FAILED`, `500 INTERNAL_SERVER_ERROR`.

**Side effects:** None.

### `PATCH /api/admin/reservations/[reservationId]/status`

**Purpose:** Apply an administrator lifecycle transition.

**Path parameters:** UUID `reservationId`.

**Request body:** Strict `status` in `confirmed`, `active`, `completed`, `cancelled`, `rejected`; optional `reason` up to 1,000 characters, required for cancellation/rejection.

**Query parameters:** None.

**Validation:** UUID/body schema, admin claim, locked RPC authorization, and lifecycle trigger.

**Success response:** `200`; updated `data.reservation` and message.

**Possible errors:** `400 INVALID_RESERVATION_ID`, `400 INVALID_JSON`, `400 VALIDATION_ERROR`, `400 REASON_REQUIRED`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 RESERVATION_NOT_FOUND`, `409 INVALID_STATUS_TRANSITION`, `500 RESERVATION_STATUS_UPDATE_FAILED`, `500 RESERVATION_RELOAD_FAILED`, `500 INTERNAL_SERVER_ERROR`.

**Side effects:** RPC updates status/reasons/timestamp and the reservation trigger broadcasts availability changes.

### `GET /api/admin/customers`

**Purpose:** Return the customer directory, pagination, and operational summary.

**Query parameters:**

| Name | Default | Accepted Values |
| --- | --- | --- |
| `q` | empty | Trimmed/collapsed, up to 100 characters; matches name or phone. |
| `sort` | `newest` | `newest`, `oldest`. |
| `joinedFrom`, `joinedTo` | unset | ISO dates; end must be on/after start. |
| `page` | `1` | Positive integer. |
| `limit` | `6` | `6`, `12`, or `24`. |

**Path parameters/request body:** None.

**Validation:** `adminCustomersQuerySchema` and admin claim.

**Success response:** `200`; customer list and pagination plus summary counts for total customers, active/upcoming reservations, and new customers this month.

**Possible errors:** `400 INVALID_QUERY_PARAMETERS`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `500 CUSTOMERS_LOAD_FAILED`.

**Side effects:** No writes; service-role Auth lookups read email addresses and may return `null` on lookup failure.

### `GET /api/admin/customers/[customerId]`

**Purpose:** Return one customer, statistics, and grouped reservations.

**Path parameters:** UUID `customerId`.

**Query parameters/request body:** None.

**Validation:** UUID, admin claim, and profile role must be `customer`.

**Success response:** `200`; `customer`, `statistics`, `currentReservations`, `upcomingReservations`, and `reservationHistory`.

**Possible errors:** `400 INVALID_CUSTOMER_ID`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 CUSTOMER_NOT_FOUND`, `500 CUSTOMER_LOAD_FAILED`.

**Side effects:** No writes; performs a server-only Auth email lookup.

## Internal Server Functions and PostgreSQL RPCs

The following are not HTTP endpoints:

- `lib/server/**`: imported directly by Server Components and Route Handlers; never call them as URLs.
- `getPublicCars`, `getPublicCarById`, `getRelatedCars`: server-only catalogue reads.
- `getCustomerAccess`, `getAdminAccess`: verified-claim access helpers.
- `previewReservation`, `getCarUnavailableRanges`: server wrappers around database RPCs.
- PostgreSQL functions such as `create_reservation`, `cancel_my_reservation`, and `admin_update_reservation_status`: invoked through Supabase RPC and documented in [Database](database.md#functions-and-rpcs).

[Previous: Features and Workflows](features-and-workflows.md) · [Next: Authentication and Authorization](authentication-and-authorization.md)
