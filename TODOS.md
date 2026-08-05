# TODOS

## Performance

### Vendor-chunk splitting beyond route-based lazy loading

**What:** After route-based code splitting (React.lazy per page) lands, measure the resulting per-route chunk sizes. If any route (likely the dashboard, which pulls in recharts) is still oversized, add `build.rollupOptions.output.manualChunks` to separately chunk large shared vendor libraries (recharts, framer-motion, embla-carousel, the Radix UI suite).

**Why:** Route-splitting alone may not be enough if a single route still bundles multiple heavy vendor libraries together.

**Context:** Surfaced during the 2026-08-05 /plan-eng-review of the RBAC + multi-tenant architecture. Deliberately not sized or built in that review — doing it before route-splitting ships and chunk sizes are measured would be optimizing blind. Revisit once route-based splitting (see that review's Implementation Tasks) has shipped and `npm run build` output shows per-route chunk sizes.

**Effort:** S
**Priority:** P3
**Depends on:** Route-based lazy loading (React.lazy + Suspense) shipping first

## Accessibility

### Form field label association broken on several icon-wrapped inputs

**What:** `FormControl` (src/components/ui/form.tsx) is a Radix `Slot`, which only forwards the generated `id`/`aria-*` props to its immediate child. Several fields wrap `<Input>` in a decorative `<div>` (for an icon or a show/hide-password toggle) instead of passing `Input` directly, so the wrapper `<div>` gets the id/aria props instead of the actual `<input>`. This breaks `<FormLabel htmlFor>` association — screen readers can't connect the label to the field, and `getByLabelText` queries can't find it either.

**Why:** Real accessibility regression, not just a test-authoring inconvenience — affects real screen-reader users on the login and password-reset flows.

**Context:** Found while writing tests for the auth pages (2026-08-05 /plan-eng-review test backfill). Affects: `src/pages/auth/login.tsx` (password field, wrapped for the eye-icon toggle), `src/pages/auth/forgot-password.tsx` (email field, wrapped for the mail icon), `src/pages/auth/reset-password.tsx` (new password field, wrapped for the key icon + eye toggle — confirm-password is unaffected since it isn't wrapped). Fix: pass the icon/toggle as a sibling using `FormControl`'s `render` prop pattern, or add `asChild`-safe wrapping so the id lands on the real `<input>`.

**Effort:** S
**Priority:** P2
**Depends on:** None

### Label/Input pairs with no htmlFor on Profile and Settings static forms

**What:** `src/pages/profile.tsx` and the School/Academic Year tabs in `src/pages/settings/settings.tsx` render `<Label>`/`<Input>` as unassociated siblings — no `htmlFor`/`id` connecting them at all (not even the Slot-forwarding issue above, just missing entirely).

**Why:** Same screen-reader accessibility gap as the FormControl issue, different root cause (these aren't react-hook-form fields, just plain static inputs).

**Context:** Found alongside the FormControl issue during the same test-backfill pass. Fix: add matching `id`/`htmlFor` pairs.

**Effort:** S
**Priority:** P3
**Depends on:** None

## Multi-tenant consistency

### Subjects page doesn't scope teacher-assignment counts to the active school

**What:** `src/pages/subjects/subjects.tsx` never calls `useActiveSchool()`. Each subject's "N teachers assigned" count is computed across every school's teachers, not just the active one — inconsistent with every other module in the app, which scopes by school.

**Why:** The subject catalog itself (Mathematics, English, ...) is legitimately shared taxonomy with no schoolId (like grade names), but the teacher-assignment count derived from it should still be school-scoped, since teachers themselves are per-school.

**Context:** Found during the test backfill (2026-08-05). Might be intentional if a shared curriculum view across schools is the actual product intent — worth a product decision, not just a mechanical fix.

**Effort:** S
**Priority:** P2
**Depends on:** None

### Document/email-template names aren't unique per school

**What:** `documents.tsx` and `email-templates.tsx` read from `DOC_DEFS`/`TEMPLATE_DEFS` in `src/mock/platform.ts`, which use the same fixed list of names (e.g. "Admission Policy 2026-27.pdf") replicated identically for every school. The underlying `schoolId` scoping is correct (verified in tests via owner/size/sent-count, which do differ per school) — only the display names collide across tenants.

**Why:** Cosmetic/mock-data realism gap, not a real isolation bug — but makes cross-school QA harder since you can't tell two schools' documents apart by name alone.

**Context:** Found during the test backfill (2026-08-05), same session as the Architecture #1 multi-tenant fix that added schoolId to these entities.

**Effort:** S
**Priority:** P4
**Depends on:** None

## Data correctness

### Analytics "At-Risk Students" stat undercounts

**What:** `src/pages/analytics/analytics.tsx` computes `atRiskStudents = students.filter(...).slice(0, 6)` for the list display, then reads the StatCard count off `atRiskStudents.length` — which is capped at 6 regardless of the true at-risk population (observed ~194 for the largest school in mock data, card shows 6).

**Why:** The headline stat is wrong, not just the list below it.

**Context:** Found during the test backfill (2026-08-05); the test was adjusted to assert the actual (buggy) value with a comment rather than silently passing. Fix: compute the stat count from the unsliced filtered array.

**Effort:** S
**Priority:** P2
**Depends on:** None

### Search boxes with misleading placeholders don't filter on the advertised field

**What:** `payroll.tsx` (placeholder "Search employees...") only filters on `name` — `employeeId` is rendered in the cell but has no `accessorKey`, so searching by employee ID returns nothing. The same column-definition pattern (a field shown in the cell renderer but not given its own accessor) exists in `fee-management.tsx` (placeholder "Search by invoice number or student...") and `payments.tsx` (placeholder "Search by reference or student..."), so student-name search on those is very likely broken too, though only the payroll case was directly confirmed.

**Why:** Silent search failure — a user searching by the exact field the placeholder tells them to use gets zero results with no error.

**Context:** Found while writing the payroll search test (2026-08-05); had to switch the test to search by name instead of employee ID to get it to pass. Fix: add `accessorKey`/a custom `filterFn` for the missing fields in each column definition.

**Effort:** S
**Priority:** P2
**Depends on:** None

## Cleanup

### Duplicate "Create Invoice" affordance — one real, one a stub

**What:** `fee-management.tsx` has a "Create Invoice" button that's a UI stub (fires `toast.success(...)`, no real state change). `invoices.tsx` has a *different*, fully-functional "Create Invoice" dialog with a real zod-validated form. Same label, two different pages, only one actually works.

**Why:** Confusing for anyone extending either page — easy to assume the stub is "the same as the other one" and not notice it does nothing.

**Context:** Found during the finance-pages test backfill (2026-08-05).

**Effort:** S
**Priority:** P3
**Depends on:** None

### Remaining stub "Add/Create/New" buttons across the app

**What:** Many list pages have an "Add X"/"New X"/"Create X" button that only fires a toast without adding anything to state: teachers-list, staff, parents, admissions, classes, sections, subjects, examinations, assignments, homework (all "Add/New X"), timetable ("Print"/"Auto-generate"), library ("Add Book"), transport ("Add Route"), hostel ("Add Room"), inventory ("Add Item"), payroll ("Run Payroll"), calendar/events ("New Event"/"Create Event"), documents ("Upload"), email-templates ("New Template"), alumni ("Invite Alumni"). `students-list.tsx` (real zod-validated dialog) and the two pages fixed this session (LMS, Gallery) are the exceptions that actually work.

**Why:** Same class of bug as the original "new course/new album buttons not working" report that triggered this whole review — just not yet reported by a user for these other ~15 buttons.

**Context:** Found across all six test-backfill agents (2026-08-05) while writing tests — each agent independently confirmed the button's onClick never touches component state. This is the largest remaining item from today's session; recommend tackling as its own follow-up pass (one dialog+form per page, same pattern as the LMS/Gallery fix), not folded into a future unrelated change.

**Effort:** L
**Priority:** P2
**Depends on:** None
