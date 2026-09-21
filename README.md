# CampusFlow

A premium, multi-tenant School Management System SaaS frontend — the command center for modern school operations: students, staff, admissions, attendance, academics, finance, facilities, communication, and platform-wide tools, all in one place.

CampusFlow has **no backend**. Every record — students, teachers, invoices, attendance history — is generated deterministically by a seeded [faker](https://fakerjs.dev/) layer the moment the app loads. Three schools, each with its own genuinely isolated roster (not a filtered view of one shared pool), nine user roles each with a tailored dashboard, and ~40 fully working modules with real create/delete flows, not placeholders.

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:5173`, click **Administrator** under "Quick access" on the login screen, pick a school, and you're in. No environment variables, no database, no API keys required.

For a full walkthrough — including how to prove the multi-tenant isolation is real — see **[docs/getting-started.md](./docs/getting-started.md)**.

## Tech stack

React 19 · Vite · TypeScript · Tailwind CSS v4 · React Router 7 · TanStack Table (v9, via its `/legacy` shim) · TanStack Query · React Hook Form + Zod · Zustand · Recharts · Framer Motion · Radix UI · @faker-js/faker · Vitest + Testing Library

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Typecheck (`tsc -b`) then production build |
| `npm run lint` | Run oxlint |
| `npm run test` | Run the full Vitest suite once |
| `npm run test:watch` | Vitest in watch mode |
| `npm run preview` | Serve the production build locally |

## Documentation

Full documentation lives in **[docs/](./docs/README.md)**:

- [Tutorial: Get CampusFlow Running](./docs/getting-started.md) — start here
- [Architecture](./docs/architecture.md) — tech stack, project structure, full route table
- [Mock Data Layer](./docs/mock-data.md) — how the fake backend is generated
- [Multi-Tenancy, Auth, and Roles](./docs/multi-tenancy-and-auth.md) — schools, roles, RBAC
- [Component Library](./docs/component-library.md) — UI primitives, `DataTable`, the TanStack Table v9 import quirk
- [Adding a New Module](./docs/adding-a-module.md) — step-by-step recipe for a new page
- [Testing](./docs/testing.md) — Vitest/RTL conventions

## Project structure

```
src/
  app/          # nav-config.tsx (nav + RBAC source of truth), providers
  components/   # ui/ (primitives), shared/ (DataTable, dialogs, ...), layout/, dashboard/
  hooks/        # use-active-school.ts and friends
  mock/         # the entire fake data layer
  pages/        # one folder per module
  routes/       # route table + auth/role guards
  store/        # zustand: auth, permissions, ui
  types/        # all domain types
```

See [docs/architecture.md](./docs/architecture.md) for the full breakdown.
