# Technical Decisions

[Documentation index](README.md) · [Root README](../README.md)

These decisions are inferred from current code, migrations, and comments. They describe the implementation as it exists, not an external architecture mandate.

## Next.js App Router and Mixed Component Boundaries

### Context

The application needs server-side database reads and metadata as well as highly interactive calendars, forms, filters, and dashboards.

### Decision

Use the Next.js App Router with Server Components by default and narrow Client Component boundaries for browser state and events.

### Reasoning

Public catalogue/detail data can be fetched close to Supabase without shipping data-access code to the browser. Interactive features retain normal React state, effects, browser APIs, and TanStack Query.

### Trade-offs

Developers must understand the server/client module boundary and keep props serializable. A broad client import can pull more modules into the browser bundle.

## Direct Server Data Access for Server Components

### Context

Public pages and parameterized admin edit pages render on the Next.js server.

### Decision

Call `server-only` data functions directly instead of sending an HTTP request to the application's own Route Handler.

### Reasoning

This avoids an internal network hop, reuses the cookie-aware Supabase client, and keeps secrets/data mapping on the server.

### Trade-offs

The HTTP and direct-server paths need shared domain rules to avoid drift. Direct functions are not independently consumable as public APIs.

## Route Handlers for Browser-Initiated Operations

### Context

Customer and admin screens need client-side queries, mutations, multipart upload, status-code mapping, and role checks.

### Decision

Use App Router Route Handlers as a backend-for-frontend for interactive operations.

### Reasoning

Handlers provide stable JSON contracts, centralized input validation, access checks, server-only Supabase access, and predictable errors for TanStack Query services.

### Trade-offs

Some handlers repeat envelope/auth logic, and API contracts must be maintained alongside feature response schemas.

## TanStack Query for Interactive Workspaces

### Context

Customer/admin content changes after mutations and needs loading, retry, cancellation, pagination, and cache invalidation behavior.

### Decision

Use feature-specific query keys, fetch services, and TanStack Query hooks in Client Components.

### Reasoning

This standardizes request lifecycle state and lets mutations update detail caches and invalidate affected lists.

### Trade-offs

Most authenticated pages render a shell before client data arrives. Cross-browser changes require a refetch mechanism; only reservation availability currently adds Realtime push invalidation.

## Zod at Application Boundaries

### Context

Route/query parameters, JSON bodies, dates, filters, and server responses begin as untrusted runtime values.

### Decision

Use Zod schemas before domain work and, for several client services, validate response shapes too. React Hook Form uses compatible schemas for form feedback.

### Reasoning

Schemas provide coercion, normalization, field-level errors, and TypeScript inference while rejecting unsupported fields in sensitive partial updates.

### Trade-offs

Critical rules are necessarily duplicated in PostgreSQL. Schema and migration limits must be changed together.

## PostgreSQL as the Reservation Authority

### Context

Booking creation, cancellation, and admin transitions can race and may be invoked by clients that bypass UI checks.

### Decision

Put authoritative writes in security-definer RPCs and enforce invariants through constraints, locks, generated columns, triggers, and RLS.

### Reasoning

The database can atomically verify identity/role, snapshot price, apply customer limits, and write the reservation. It remains correct regardless of which UI initiated the operation.

### Trade-offs

Business logic is split between TypeScript and SQL, migrations require careful review, and RPC error messages are mapped to HTTP errors by string matching.

## GiST Exclusion for Overlap Protection

### Context

Two valid requests can check availability at the same time and both appear free before either commits.

### Decision

Represent each reservation as a generated half-open `daterange` and use a partial GiST exclusion constraint on car plus overlap for blocking statuses.

### Reasoning

The constraint is a final race-condition guard at commit time. The `[pickup, return)` model allows one rental to return on the next rental's pickup date.

### Trade-offs

It requires `btree_gist` and explicit handling of exclusion violations. Only statuses in the partial predicate block availability.

## Row and Profile Locking for Usage Limits

### Context

Customer-level limits and status transitions can also be bypassed by simultaneous requests.

### Decision

Lock the customer's profile during creation and the reservation row during cancellation/status change.

### Reasoning

Serializing operations for one customer/reservation makes count checks and transition checks reliable without locking unrelated customers.

### Trade-offs

Concurrent operations for the same customer wait on each other and must remain short to avoid lock contention.

## Targeted Realtime Broadcasts

### Context

An open calendar/confirmation view can become stale when another user creates or changes a reservation.

### Decision

Broadcast only an availability-change event on a car-specific topic and invalidate that car's TanStack Query subtree.

### Reasoning

The client receives no reservation/customer payload and refetches authoritative API data. Topics avoid globally refreshing every booking view.

### Trade-offs

Realtime service availability becomes part of the freshness path. Other customer/admin data is not pushed, and the public topic can reveal that availability changed (not who or which exact reservation).

## Store Image Paths, Derive Public URLs

### Context

Supabase public object URLs depend on the project origin while image metadata must remain portable between local and hosted environments.

### Decision

Store bucket-relative object paths in `car_images.image_url` and call `getPublicUrl()` when mapping responses.

### Reasoning

Database rows survive project-origin changes and deletion can address the exact Storage object.

### Trade-offs

Every read must map paths correctly; seed rows display broken images unless matching Storage objects are uploaded.

## Snapshot Reservation Pricing

### Context

Fleet daily rates may change after a customer books.

### Decision

Capture `price_per_day_snapshot` during the transactional create RPC and derive duration/subtotal/total as generated columns.

### Reasoning

Historical reservation totals remain stable and cannot silently change with the car's current price.

### Trade-offs

The current subtotal and total use the same simple calculation; fees, taxes, discounts, and payment reconciliation would need additional schema/workflows.

[Previous: Authentication and Authorization](authentication-and-authorization.md) · [Next: Testing and Deployment](testing-and-deployment.md)
