# Tutorial: Get CampusFlow Running and See Multi-Tenancy Work

You'll go from a fresh clone to a running app, log in as a school administrator with one click, and see the same UI render completely different data for two different schools — proving to yourself that the multi-tenant behavior is real, not cosmetic. No backend, no database, no API keys: everything you'll see is generated locally the moment the dev server starts.

## What you'll need

- Node.js (any recent LTS; the project has no `engines` field pinning a version)
- npm (there's a committed `package-lock.json`, so use npm rather than yarn/pnpm to match it)

## Step 1: Install and start the dev server

```bash
npm install
npm run dev
```

You'll see:

```
  VITE v8.2.0  ready in 6XX ms
  ➜  Local:   http://localhost:5173/
```

Open `http://localhost:5173/` in a browser. You're redirected to `/login` — this is CampusFlow's marketing-style split login screen.

## Step 2: Log in with one click

Don't fill out the form. Under **Quick access**, click **Administrator**.

That's a real login — it calls the same `loginWithCredentials`-adjacent path as typing credentials, just pre-filled from a seeded demo account (`admin@campusflow.app` / `demo1234`, if you want to type it manually instead). Because administrators manage multiple schools, you land on `/choose-school`, not straight on the dashboard.

## Step 3: Pick a school

You'll see three schools listed, each with a different plan and student count:

- **Riverside International School** — Bengaluru, 500 students, Enterprise
- **Northfield Public School** — Pune, 220 students, Growth
- **Sunrise Global Academy** — Hyderabad, 90 students, Starter

Click **Riverside International School**. You land on `/app/dashboard`, which now says "Here's what's happening across Riverside International School today" — with real stat cards (Total Students: 500, Active Teachers, Revenue, Pending Fees), a revenue chart, a gender-ratio pie chart, an attendance trend, and a "today's classes" list. All of it generated, all of it specific to Riverside.

## Step 4: Prove the multi-tenancy is real

In the sidebar header, click the school switcher (it currently reads "Riverside International School"). Select **Sunrise Global Academy** instead.

Watch the dashboard re-render: Total Students drops to 90, the revenue and attendance charts redraw with entirely different numbers, the "today's classes" list shows different teacher names. This isn't a filtered view of the same 500 students — Sunrise has its own generated roster, its own teachers, its own fee records, entirely separate from Riverside's. That's the whole point of [multi-tenancy-and-auth.md](./multi-tenancy-and-auth.md): every school-scoped record in `src/mock/` is generated per-tenant from the start, not tagged after the fact.

## Step 5: Try a real CRUD flow

Click **Students** in the sidebar. Click **Add Student** in the page header, fill in the form, and submit. The new student appears at the top of the table immediately — this isn't a fake success toast, the row is genuinely there. Open the row's action menu and delete it; it's genuinely gone.

(If you now navigate to the Dashboard, the student count there won't reflect your addition — each page keeps its own local copy of the mock data, by design. See [mock-data.md](./mock-data.md#known-limitation-no-cross-page-shared-store) for why.)

## Step 6: Try a different role

Log out (Profile menu, top right) and go back to `/login`. This time click **Teacher** under Quick access. You skip the school picker entirely (teachers manage one school only) and land on a completely different dashboard — a teacher-specific view built around that teacher's own classes, not the admin's org-wide stats. Try **Student** and **Parent** too, each with its own dashboard variant.

## Step 7: Run the test suite

```bash
npm run test
```

You should see 84+ test files and 380+ tests pass. Every test runs against the same deterministic mock data you just saw in the browser — the faker seeds mean CI, your machine, and a teammate's machine all generate byte-identical fake students.

## What you built

Nothing — you didn't need to. That's the point of the tutorial: `npm install && npm run dev` is the entire setup, and everything from nine distinct role-based dashboards to genuinely isolated multi-tenant data is already there, generated deterministically on load. From here:

- [architecture.md](./architecture.md) — the full tech stack and route table
- [adding-a-module.md](./adding-a-module.md) — build a new module following the established pattern
- [multi-tenancy-and-auth.md](./multi-tenancy-and-auth.md) — how roles, schools, and RBAC fit together
- [mock-data.md](./mock-data.md) — how the fake data layer is generated
- [component-library.md](./component-library.md) — the shared UI primitives and the TanStack Table v9 import quirk
- [testing.md](./testing.md) — conventions for the test suite you just ran
