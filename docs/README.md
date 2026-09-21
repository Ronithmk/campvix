# CampusFlow Documentation

Deeper documentation than the root [README.md](../README.md) has room for, organized by what you're trying to do.

## Start here

- **[Tutorial: Get CampusFlow Running](./getting-started.md)** — install, log in, switch schools, see multi-tenancy work. Start here if you're new to the project.

## How-to guides

- **[Adding a New Module](./adding-a-module.md)** — the step-by-step recipe for a new school-scoped page: type, mock generator, page, columns, route, nav entry, tests. Worked example: `InvoicesPage`.

## Reference

- **[Architecture](./architecture.md)** — tech stack, project structure, the full route table, build/vendor-chunking config.
- **[Mock Data Layer](./mock-data.md)** — how the faker-seeded fake backend is generated: `SCHOOL_ROSTER_CONFIG`, generator patterns, trend builders, the no-shared-store limitation.
- **[Component Library](./component-library.md)** — `ui/` primitives vs `shared/` composed components, the TanStack Table v9 `/legacy` import, the two delete-confirmation variants.
- **[Testing](./testing.md)** — Vitest/RTL/jsdom conventions, `setup.ts`, what a new module's tests should cover.

## Explanation

- **[Multi-Tenancy, Auth, and Roles](./multi-tenancy-and-auth.md)** — why the school switcher is real isolation and not a cosmetic dropdown; the auth store, demo accounts, RBAC via `nav-config.tsx`, and the per-role dashboards.

## Reading order

If you're doing your first real task in this codebase (adding or modifying a module), read in this order: [getting-started.md](./getting-started.md) → [architecture.md](./architecture.md) → [mock-data.md](./mock-data.md) → [multi-tenancy-and-auth.md](./multi-tenancy-and-auth.md) → [component-library.md](./component-library.md) → [adding-a-module.md](./adding-a-module.md) → [testing.md](./testing.md).
