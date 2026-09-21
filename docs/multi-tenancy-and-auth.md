# Multi-Tenancy, Auth, and Roles

## The problem this solves

An early version of CampusFlow had a school switcher in the sidebar, but it was cosmetic — every school shared one global pool of students and teachers, so switching schools didn't change what you saw. That's not multi-tenancy, it's a dropdown. This document covers the real version: genuine per-school data isolation, nine distinct roles with different home screens, and role-based access control (RBAC) enforced both at the route level and the individual-nav-item level.

## Roles

`src/types/role.ts` defines nine roles:

```ts
export const ROLES = [
  'administrator', 'principal', 'teacher', 'accountant',
  'receptionist', 'student', 'parent', 'driver', 'librarian',
] as const
export type Role = (typeof ROLES)[number]
```

Every `Role` has a human label in `ROLE_LABELS`. Roles gate two independent things: which **routes** you can reach (`RoleProtectedRoute`, backed by `nav-config.tsx`) and which **dashboard variant** you land on (see below).

## Auth store

`src/store/auth-store.ts` is a Zustand store with the `persist` middleware, saved to `localStorage` under the key `campusflow-auth`:

```ts
interface AuthState {
  isAuthenticated: boolean
  name: string
  email: string
  avatarUrl: string
  role: Role | null
  personId: string | null
  schoolId: string | null
  managesMultipleSchools: boolean
}
```

`schoolId` defaults to `schools[0].id` even when logged out — there's always an active tenant, which keeps every `useActiveSchool()` call safe to call unconditionally (see below).

Key actions:

| Action | What it does |
|---|---|
| `loginWithCredentials(email, password)` | Looks up `findDemoAccount(email, password)`; returns `false` on no match, applies the account and returns `true` on success. |
| `loginAsRole(role)` | The one-click "Quick access" demo login. Calls `demoAccountForRole(role)` (throws if that role has no demo account configured) and applies it. |
| `setSchool(schoolId)` | Simple `set({ schoolId })`. Used by the choose-school page and the sidebar's `SchoolSwitcher`. |
| `logout()` | Clears `isAuthenticated`, `role`, `personId`. Note: **`schoolId` is left untouched** — the next login lands on whatever school was last active. |

`applyAccount()` sets `managesMultipleSchools: account.role === 'administrator' || account.role === 'principal'` — this single boolean is the entire rule for whether login routes you through `/choose-school` or straight to `/app/dashboard`. Every other role manages exactly one school (their `homeSchool`) and skips the picker.

A version-gated `migrate()` function on the persist config forces any pre-v1 persisted session back to logged-out state, rather than trusting an old shape blindly — a defensive guard against stale `localStorage` from a previous schema.

## Demo accounts

`src/mock/demo-accounts.ts` defines one `DemoAccount` per role, all bound to `homeSchool = schools[0].id` (Riverside), all sharing the password `demo1234`. Every non-admin/principal account is wired to a **real generated record** — `sampleStudent`, `sampleParent`, `sampleTeacher`, `sampleAccountant`, found via `.find()` on the corresponding mock array — so `personId` points at an actual entity. That's what lets the Student/Teacher/Parent dashboard variants show "your" data instead of generic placeholders.

`findDemoAccount(email, password)` matches case-insensitively and trims whitespace. `demoAccountForRole(role)` throws if you ask for a role with no configured demo account — don't call it speculatively.

## Login flow

1. **`/login`** (`src/pages/auth/login.tsx`) — a real credential form (React Hook Form + Zod, email + 6-char-minimum password) *plus* a "Quick access" grid of four one-click role buttons (`administrator`, `teacher`, `student`, `parent`), with a "Show more roles" reveal for the remaining five. Manual submit calls `loginWithCredentials` after an `await sleep(500)`; quick-access calls `loginAsRole` after `sleep(400)`. On success: `navigate(managesMultipleSchools ? '/choose-school' : '/app/dashboard')`.
2. **`/choose-school`** (only reached by administrator/principal) — animated list of all schools with plan badge and student count; selecting one calls `setSchool(id)` then navigates to `/app/dashboard`.
3. **`/forgot-password` → `/otp-verification` → `/reset-password`** — a full password-reset flow (email entry, 6-digit OTP with a 45s resend countdown, new-password form with a live rule checklist). All three are real UI flows with `sleep()`-simulated latency; none persist a password change anywhere (there's nothing to persist it to — no backend).

## `useActiveSchool()` — where multi-tenancy actually happens

`src/hooks/use-active-school.ts` (full):

```ts
export function useActiveSchoolId(): string {
  const schoolId = useAuthStore((s) => s.schoolId)
  return schoolId ?? schools[0].id
}
export function useActiveSchool() {
  const schoolId = useActiveSchoolId()
  return schools.find((s) => s.id === schoolId) ?? schools[0]
}
```

This tiny hook is the single seam between the auth store and every page's data. The pattern, repeated on every school-scoped page:

```tsx
const school = useActiveSchool()
const schoolStudents = useMemo(
  () => students.filter((s) => s.schoolId === school.id),
  [students, school.id],
)
```

`SchoolSwitcher` (`src/components/layout/school-switcher.tsx`), in the sidebar header, lets a user with `managesMultipleSchools` change tenants without logging out — it reads the same `useActiveSchool()`/`setSchool()` pair. Its "Add a school" item links to `/app/settings/schools`, where a real Add-School dialog (React Hook Form + Zod, backed by page-local `useState`) lives.

## Role-based navigation

`src/app/nav-config.tsx` is the canonical source for both the sidebar's contents and route-level RBAC. Two independent permission axes live here:

1. **Page-level**: every `NavItem` carries `roles: Role[]`. `getNavForRole(role)` filters the full `NAV_SECTIONS` tree down to what that role can see, dropping any section left empty. Helper role-set constants keep this readable: `ALL_STAFF = ['administrator','principal','teacher','accountant','receptionist','librarian']`, `LEADERSHIP = ['administrator','principal']`. As one example, Invoices/Payments/Payroll are `['administrator','accountant']`-only; Reports/Analytics are `LEADERSHIP`-only.
2. **Action-level**: a separate `ActionPermission` list keyed like `"action:<module>:<verb>"` (e.g. gating who can click "New Course") — checked through the exact same `usePermissionsStore().hasAccess(role, key)` call as page URLs, just with an action key instead of a route.

`findNavItemForPath(pathname)` does exact match first, then longest-prefix match — this is what `RoleProtectedRoute` calls to figure out which nav item (and therefore which role list) a given URL belongs to, including URLs with no exact nav entry (like `/app/students/:studentId`).

`usePermissionsStore` (`src/store/permissions-store.ts`) holds the actual role→URL/action permission matrix at runtime and exposes `hasAccess(role, key)`; it's what both `RoleProtectedRoute` and any in-page "can this role do X" check ultimately calls.

## Per-role dashboards

`src/pages/dashboard.tsx` branches by role: `student`/`teacher`/`parent` roles (with a `personId`) render a dedicated dashboard component (`StudentDashboard`, `TeacherDashboard`, `ParentDashboard` in `src/components/dashboard/`) built around that person's own records, rather than the admin's aggregate-stats view. All branching happens **after** every hook in the component has already run — React's Rules of Hooks require hooks to execute unconditionally in the same order every render, so the early `return <StudentDashboard .../>` statements sit below all `useMemo` calls, not interleaved with them.

## Known limitation

Deleting or creating a record on one page never touches `src/mock/`'s underlying arrays (see [mock-data.md](./mock-data.md#known-limitation-no-cross-page-shared-store)) — so a role switch or school switch mid-session shows fresh, unmodified mock data, not whatever you edited earlier.

## Related

- [mock-data.md](./mock-data.md) — how `schoolId` gets attached to generated records in the first place
- [adding-a-module.md](./adding-a-module.md) — wiring a new page into `nav-config.tsx` and scoping it to the active school
