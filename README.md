# DriveReserve

DriveReserve is a full-stack car-rental platform for public vehicle discovery, customer reservations, and fleet administration.

## Overview

Visitors can browse available cars and check date availability. Authenticated customers can submit, track, and cancel eligible reservations. Administrators manage the fleet, reservation lifecycle, customer directory, images, and operational dashboard.

## Key Features

- Searchable, filterable vehicle catalogue with details, pricing, and availability.
- Email/password and Google authentication through Supabase Auth.
- Availability-aware reservation preview and transactional booking creation.
- Customer profile, reservation history, details, and cancellation workflows.
- Admin dashboards for cars, reservations, customers, revenue, and fleet status.
- Supabase Storage for car images and Realtime broadcasts for availability refreshes.

## Tech Stack

- Next.js 16 App Router and React 19
- TypeScript, Tailwind CSS, and shadcn/ui
- Supabase Auth, PostgreSQL, Storage, and Realtime
- TanStack Query, React Hook Form, and Zod

## Quick Start

Prerequisites: Git, Node.js 20.9 or newer, and npm. A Supabase project is required; local Supabase development also requires the Supabase CLI and a Docker-compatible runtime.

```bash
git clone https://github.com/MohammadHajeer/drive-reserve.git
cd drive-reserve
npm install
cp .env.example .env.local
npm run dev
```

On Windows PowerShell, copy the environment template with:

```powershell
Copy-Item .env.example .env.local
```

Open [http://localhost:3000](http://localhost:3000). Complete Supabase migrations and Auth configuration before testing protected workflows; see the [setup and configuration guide](docs/setup-and-configuration.md).

## Environment Setup

Add the Supabase URL and publishable key to `.env.local`. Set the service-role key when admin email lookups are needed, and set the application URL for stable Auth redirects. The checked-in `.env.example` contains safe placeholders only. Never commit real credentials.

See [Setup and Configuration](docs/setup-and-configuration.md#environment-variables) for variable scope and Supabase setup.

## Documentation

- [Documentation index](docs/README.md)
- [Project overview](docs/project-overview.md)
- [Architecture and project structure](docs/architecture-and-project-structure.md)
- [Setup and configuration](docs/setup-and-configuration.md)
- [Database](docs/database.md)
- [Features and workflows](docs/features-and-workflows.md)
- [API reference](docs/api-reference.md)
- [Authentication and authorization](docs/authentication-and-authorization.md)
- [Technical decisions](docs/technical-decisions.md)
- [Testing and deployment](docs/testing-and-deployment.md)
- [Known issues and roadmap](docs/known-issues-and-roadmap.md)

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Create a production build. |
| `npm run start` | Serve the production build. |
| `npm run lint` | Run ESLint. |
| `npm run typecheck` | Run TypeScript checking without emitting files. |
| `npm test` | Run the configured Node test target. The referenced test file is currently missing. |

## Contributors

- Mohammad Hajeer
- Nada Alahmad
- Youssef Al Issa
- Mentor: Mohammad Dawi
