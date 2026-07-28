# DriveReserve Documentation

This directory contains the implementation-oriented documentation needed to set up, understand, maintain, and extend DriveReserve. Each guide focuses on one concern and links to the relevant source areas without duplicating the source code.

## Documentation Index

| Guide | Purpose |
| --- | --- |
| [Project Overview](project-overview.md) | Product scope, roles, capabilities, and reservation lifecycle. |
| [Architecture and Project Structure](architecture-and-project-structure.md) | Runtime architecture, rendering, data flow, and repository organization. |
| [Setup and Configuration](setup-and-configuration.md) | Local installation, environment variables, Supabase, and troubleshooting. |
| [Database](database.md) | Tables, relationships, constraints, RLS, functions, triggers, and migrations. |
| [Features and Workflows](features-and-workflows.md) | Public, customer, and admin behavior from entry point to database enforcement. |
| [API Reference](api-reference.md) | All implemented Next.js Route Handlers and their contracts. |
| [Authentication and Authorization](authentication-and-authorization.md) | Auth flows, session handling, role checks, Proxy protection, and RLS. |
| [Technical Decisions](technical-decisions.md) | Verifiable architectural choices, reasoning, and trade-offs. |
| [Testing and Deployment](testing-and-deployment.md) | Checks, current test coverage, production setup, and release verification. |
| [Known Issues and Roadmap](known-issues-and-roadmap.md) | Verified gaps, limitations, and clearly separated improvement ideas. |

## Recommended Reading Order

New developers should read:

1. [Project Overview](project-overview.md)
2. [Setup and Configuration](setup-and-configuration.md)
3. [Architecture and Project Structure](architecture-and-project-structure.md)
4. [Database](database.md)
5. [Authentication and Authorization](authentication-and-authorization.md)
6. [Features and Workflows](features-and-workflows.md)
7. [API Reference](api-reference.md)
8. [Testing and Deployment](testing-and-deployment.md)
9. [Technical Decisions](technical-decisions.md)
10. [Known Issues and Roadmap](known-issues-and-roadmap.md)

[Back to the root README](../README.md)
