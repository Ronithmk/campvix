# Architecture Reference

What CampusFlow is built from, how the pieces fit together, and where to find them.

## Tech stack

| Layer | Choice | Version |
|---|---|---|
| UI framework | React | 19.2.8 |
| Build tool | Vite | 8.2.0 |
| Language | TypeScript | ~6.0.2 |
| Styling | Tailwind CSS (via `@tailwindcss/vite`, no `tailwind.config.js`) | 4.3.3 |
| Routing | React Router | 7.18.2 |
| Server state / async | TanStack Query | 5.101.4 |
| Tables | TanStack Table (via the `/legacy` v8-compatible subpath — see [component-library.md](./component-library.md#the-tanstack-table-v9-legacy-import)) | 9.0.0 |
| Forms | React Hook Form + Zod (`@hookform/resolvers`) | 7.84.0 / 3.25.76 |
| Client state | Zustand (with `persist` middleware for auth) | 5.0.14 |
| Charts | Recharts | 3.10.1 |
| Animation | Framer Motion | 12.43.0 |
| Toasts | Sonner | 2.0.7 |
| Fake data | @faker-js/faker | 10.5.0 |
| Component primitives | Radix UI (individually versioned per primitive) | — |
| Linter | oxlint (not ESLint) | 1.75.0 |
| Test runner | Vitest + Testing Library + jsdom | 4.1.10 |

There is **no backend**. Every entity — students, teachers, fees, attendance, everything — is generated at module-load time by a deterministic faker-seeded mock layer in `src/mock/`. See [mock-data.md](./mock-data.md) for how that layer works.

No environment variables are required. There's no `.env` file anywhere in the repo — `npm run dev` works with zero configuration.

## Scripts

```bash
npm run dev       # vite dev server
npm run build     # tsc -b && vite build  (typechecks, then bundles)
npm run lint      # oxlint
npm run test      # vitest run (single pass, CI mode)
npm run test:watch
npm run preview   # serve the production build locally
```

## Path aliases

`@/*` maps to `./src/*`, configured in both `vite.config.ts` (`path.resolve(import.meta.dirname, './src')`) and `tsconfig.json`. Always import via `@/...`, never relative paths that climb more than one directory.

## Project structure

```
src/
  app/              # nav-config.tsx (the nav/RBAC source of truth), providers.tsx
  components/
    ui/             # hand-built shadcn-style primitives (button, dialog, form, table, ...)
    shared/         # composed app-level components (DataTable, PageHeader, StatCard, delete dialogs)
    layout/         # Sidebar, Topbar, SchoolSwitcher, CommandPalette, ProfileMenu
    dashboard/      # per-role dashboard variants (Student/Teacher/Parent)
  hooks/            # use-active-school.ts and friends
  lib/              # utils.ts (cn(), formatCurrency(), sleep(), etc.)
  mock/             # the entire fake data layer — see mock-data.md
  pages/            # one folder per module, e.g. students/, finance/, admissions/
  routes/           # index.tsx (route table), protected-route.tsx, role-protected-route.tsx
  store/            # zustand stores: auth-store.ts, permissions-store.ts, ui-store.ts
  styles/           # globals.css (Tailwind v4 entry)
  test/             # setup.ts (Vitest/RTL/jsdom setup)
  types/            # all domain types, barrel-exported from types/index.ts
```

## Entry point

`src/main.tsx` is the whole bootstrap:

```tsx
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </BrowserRouter>
  </StrictMode>,
)
```

`AppProviders` (`src/app/providers.tsx`) wires up TanStack Query's `QueryClientProvider` and the `Toaster` (sonner). `AppRouter` is the full route table below.

## Routing and guards

`src/routes/index.tsx` splits routes into two tiers:

**Public** (rendered eagerly, no code-splitting): `/login`, `/forgot-password`, `/otp-verification`, `/reset-password`, `/choose-school`. `/` redirects to `/login`; unmatched paths hit a `NotFoundPage`.

**Protected** (`/app/*`, every page `lazy()`-imported — 35+ separate chunks): wrapped in a guard stack —

```tsx
<Route element={<ProtectedRoute />}>
  <Route element={<RoleProtectedRoute />}>
    <Route path="/app" element={<AppShell />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      {/* ...all /app/* routes... */}
```

- **`ProtectedRoute`** (`src/routes/protected-route.tsx`) — redirects to `/login` if `!isAuthenticated || !role`.
- **`RoleProtectedRoute`** (`src/routes/role-protected-route.tsx`) — looks up the current path in `nav-config.tsx` via `findNavItemForPath()`, then checks `usePermissionsStore().hasAccess(role, navItem.url)`. Denied access toasts an error and redirects to `/app/dashboard`.
- **`AppShell`** — the layout: sidebar, topbar, `<Outlet />`.

### Full route table

| Path (under `/app/`) | Page component |
|---|---|
| `dashboard` | `DashboardPage` |
| `students`, `students/:studentId` | `StudentsListPage`, `StudentProfilePage` |
| `admissions` | `AdmissionsPage` |
| `attendance` | `AttendancePage` |
| `teachers` | `TeachersListPage` |
| `staff` | `StaffPage` |
| `parents` | `ParentsPage` |
| `classes` | `ClassesPage` |
| `sections` | `SectionsPage` |
| `subjects` | `SubjectsPage` |
| `timetable` | `TimetablePage` |
| `examinations` | `ExaminationsPage` |
| `results` | `ResultsPage` |
| `assignments` | `AssignmentsPage` |
| `homework` | `HomeworkPage` |
| `finance/fees` | `FeeManagementPage` |
| `finance/invoices` | `InvoicesPage` |
| `finance/payments` | `PaymentsPage` |
| `finance/payroll` | `PayrollPage` |
| `library` | `LibraryPage` |
| `transport`, `transport/gps` | `TransportPage`, `GpsTrackingPage` |
| `hostel` | `HostelPage` |
| `inventory` | `InventoryPage` |
| `calendar` | `CalendarPage` |
| `notifications` | `NotificationsPage` |
| `events` | `EventsPage` |
| `announcements` | `AnnouncementsPage` |
| `notice-board` | `NoticeBoardPage` |
| `chat` | `ChatPage` |
| `reports` | `ReportsPage` |
| `analytics` | `AnalyticsPage` |
| `ai-assistant` | `AiAssistantPage` |
| `alumni` | `AlumniPage` |
| `lms` | `LmsPage` |
| `documents` | `DocumentsPage` |
| `email-templates` | `EmailTemplatesPage` |
| `gallery` | `GalleryPage` |
| `settings`, `settings/schools` | `SettingsPage`, `SchoolsSettingsPage` |
| `id-cards` | `IdCardsPage` |
| `profile` | `ProfilePage` |
| `support` | `SupportPage` |

The canonical, role-filtered version of this list — with icons and per-item RBAC — lives in `src/app/nav-config.tsx`. See [multi-tenancy-and-auth.md](./multi-tenancy-and-auth.md#role-based-navigation) for how roles gate it.

## Build output — vendor chunking

Route-based lazy loading already splits each page into its own chunk, but large shared libraries used across many pages (Recharts, faker, the Radix suite, form libs, Framer Motion) would otherwise land in whichever page chunk imports them first. `vite.config.ts` fixes this with `build.rollupOptions.output.manualChunks`:

```ts
manualChunks(id) {
  if (!id.includes('node_modules')) return undefined
  if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-vendor')) return 'vendor-charts'
  if (id.includes('@radix-ui')) return 'vendor-radix'
  if (id.includes('@faker-js')) return 'vendor-faker'
  if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) return 'vendor-forms'
  if (id.includes('framer-motion')) return 'vendor-motion'
  return 'vendor'
},
```

Five named, independently-cacheable vendor chunks plus a catch-all `vendor`. App code outside `node_modules` is left to Vite's default per-route splitting.

## Related

- [mock-data.md](./mock-data.md) — how the fake data layer is generated
- [multi-tenancy-and-auth.md](./multi-tenancy-and-auth.md) — roles, schools, RBAC
- [component-library.md](./component-library.md) — UI primitives and shared components
- [adding-a-module.md](./adding-a-module.md) — how to build a new page following the established pattern
