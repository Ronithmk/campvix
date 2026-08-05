# TODOS

Nothing currently open — see `## Completed` below for this session's history.

## Completed

### Remaining stub "Add/Create/New" buttons across the app

**What:** ~19 "Add X"/"New X"/"Create X" buttons across 17 pages fired a success toast without adding anything to state: teachers-list, staff, parents, admissions, classes, sections, subjects, examinations, assignments, homework, library, transport, hostel, inventory, payroll ("Run Payroll"), calendar, events, documents, email-templates, alumni, and timetable ("Print"/"Auto-generate"). Same bug class as the original "new course/new album buttons not working" report that triggered this whole review.

**Completed:** 2026-08-05 — every page now has a real Dialog + react-hook-form + zod flow that creates an actual school-scoped record (or, for Payroll/Timetable, a real batch state transition / `window.print()` / genuine reshuffle instead of a dialog, since those aren't "create a record" actions). 110 new/updated tests added across the batch. `sections.tsx` needed a small structural change (lifted `classes` from a direct import into local `useState`) since it derives entirely from `SchoolClass` records with no separate "Section" entity.

### Vendor-chunk splitting beyond route-based lazy loading

**What:** Add `build.rollupOptions.output.manualChunks` to separately chunk large shared vendor libraries (recharts, faker, framer-motion, the Radix UI suite) from the app's main bundle.

**Completed:** 2026-08-05 — main bundle dropped from 692KB to 77KB; vendor code now split into named, independently-cacheable chunks (vendor-charts, vendor-faker, vendor-radix, vendor-forms, vendor-motion, vendor).

### Form field label association broken on several icon-wrapped inputs

**What:** `FormControl`'s Radix `Slot` only forwarded id/aria-* to its immediate child, breaking label association on fields that wrapped `<Input>` in a decorative `<div>` for an icon or toggle button.

**Completed:** 2026-08-05 — restructured login.tsx, forgot-password.tsx, and reset-password.tsx so `FormControl` wraps `<Input>` directly, with icons/toggles as siblings. Tests updated to query via `getByLabelText` instead of placeholder/display-value workarounds.

### Label/Input pairs with no htmlFor on Profile and Settings static forms

**What:** `profile.tsx` and the School/Academic Year tabs in `settings.tsx` had `<Label>`/`<Input>` as unassociated siblings.

**Completed:** 2026-08-05 — added matching `id`/`htmlFor` pairs on all affected fields (including the two `Select` triggers in Settings).

### Subjects page doesn't scope teacher-assignment counts to the active school

**What:** `subjects.tsx` computed "N teachers assigned" across every school's teachers instead of the active school's.

**Completed:** 2026-08-05 — added `useActiveSchool()` scoping to the teacher-assignment filter, plus a cross-school regression test.

### Document/email-template names aren't unique per school

**What:** `documents.tsx`/`email-templates.tsx` names were identical across every tenant, making cross-school QA hard.

**Completed:** 2026-08-05 — document and email template names are now prefixed with the school's short name in `src/mock/platform.ts`, making them genuinely distinguishable per tenant.

### Analytics "At-Risk Students" stat undercounts

**What:** The stat card read its count off an array already `.slice(0, 6)`-capped for the list display.

**Completed:** 2026-08-05 — stat now reads from the unsliced filtered array; the display list stays capped at 6.

### Search boxes with misleading placeholders don't filter on the advertised field

**What:** `payroll.tsx`, `fee-management.tsx`, and `payments.tsx` search boxes didn't actually filter on employeeId/studentName because those fields had no column accessor.

**Completed:** 2026-08-05 — added `accessorFn` combining the primary field with the previously-unsearchable one in each affected column definition, plus tests proving both fields now filter correctly.

### Duplicate "Create Invoice" affordance — one real, one a stub

**What:** `fee-management.tsx` had a stub "Create Invoice" button while `invoices.tsx` had the real, working dialog with the same label.

**Completed:** 2026-08-05 — `fee-management.tsx`'s button now links to `/app/finance/invoices` instead of firing a no-op toast.
