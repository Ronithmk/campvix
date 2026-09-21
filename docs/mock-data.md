# Mock Data Layer — Reference

CampusFlow has no backend. Every record you see — students, teachers, fee invoices, attendance history, calendar events — is generated once, at module-load time, by a deterministic faker-seeded layer under `src/mock/`. This document is the complete reference for how that layer works, so you can extend it correctly.

## Why deterministic, not random

Every generator file calls `faker.seed(<fixed number>)` once at the top of the module before generating anything:

```ts
// src/mock/students.ts
faker.seed(104)
// src/mock/teachers.ts
faker.seed(101)
// src/mock/attendance.ts
faker.seed(106)
// src/mock/fees.ts
faker.seed(107)
```

Because `faker` is a shared singleton and each module seeds independently right before it draws values, the same student named "Aditi Sharma" appears on every dev server restart, every test run, and every teammate's machine. Screenshots, bug reports, and test assertions all stay stable. **If you add a new generator file, give it its own unique seed** — reusing a seed number that's already in use will desync unrelated generators the moment import order changes.

## The barrel: `src/mock/index.ts`

```ts
export * from './subjects'
export * from './teachers'
export * from './classes'
export * from './parents'
export * from './students'
export * from './staff'
export * from './attendance'
export * from './fees'
export * from './exams'
export * from './notifications'
export * from './schools'
export * from './admissions'
export * from './coursework'
export * from './library'
export * from './facilities'
export * from './payroll'
export * from './communication'
export * from './platform'
```

Pages import from `@/mock` (the barrel), e.g. `import { students, teachers, classes } from '@/mock'`. Two files are deliberately **not** re-exported here and must be imported directly from their own path: `school-roster-config.ts` and `demo-accounts.ts`.

## `SCHOOL_ROSTER_CONFIG` — the single source of truth for scale

`src/mock/school-roster-config.ts` (full):

```ts
export interface SchoolRosterConfig {
  schoolId: string
  teacherCount: number
  studentCount: number
  parentCount: number
  staffScale: number
  sectionsPerGrade: number
}

export const SCHOOL_ROSTER_CONFIG: SchoolRosterConfig[] = [
  { schoolId: schools[0].id, teacherCount: 30, studentCount: 500, parentCount: 100, staffScale: 1,   sectionsPerGrade: 2 },
  { schoolId: schools[1].id, teacherCount: 16, studentCount: 220, parentCount: 45,  staffScale: 0.5, sectionsPerGrade: 2 },
  { schoolId: schools[2].id, teacherCount: 8,  studentCount: 90,  parentCount: 20,  staffScale: 0.3, sectionsPerGrade: 1 },
]

export function configFor(schoolId: string): SchoolRosterConfig {
  return SCHOOL_ROSTER_CONFIG.find((c) => c.schoolId === schoolId) ?? SCHOOL_ROSTER_CONFIG[0]
}
```

Three tenants, three different scales: Riverside International School (`school-1`, 500 students, Enterprise plan), Northfield Public School (`school-2`, 220 students, Growth), and Sunrise Global Academy (`school-3`, 90 students, Starter). Every generator that produces school-scoped data loops over this array (or calls `configFor(schoolId)`) rather than generating one flat pool and tagging it after the fact — this is what makes the multi-tenant behavior real instead of cosmetic. See [multi-tenancy-and-auth.md](./multi-tenancy-and-auth.md) for how a page consumes this.

## Generation pattern, by example

### `students.ts`

```ts
SCHOOL_ROSTER_CONFIG.flatMap((config) => {
  const schoolClasses = classes.filter((c) => c.schoolId === config.schoolId)
  const schoolParents = parents.filter((p) => p.schoolId === config.schoolId)
  return Array.from({ length: config.studentCount }, (_, i) => {
    const id = `student-${++globalIndex}`
    const parent = schoolParents[i % schoolParents.length]
    parent.childrenIds.push(id) // <-- mutates the parent record in place
    return {
      id,
      schoolId: config.schoolId,
      admissionNo: `ADM-${2100 + globalIndex}`,
      classId: schoolClasses[i % schoolClasses.length].id,
      parentId: parent.id,
      // ...
    }
  })
})
```

Two things worth knowing before you touch this file:

1. **`globalIndex` is a module-level counter, not reset per school.** IDs (`student-1`, `student-2`, ...) and admission numbers are unique across the whole dataset, not just within a school.
2. **Cross-references are established as a side effect of generation, not a separate pass.** `parent.childrenIds.push(id)` mutates the already-generated `Parent` record directly. This means **import order matters**: `parents` must be generated (and its module fully evaluated) before `students.ts` runs, because `students.ts` reaches into live `Parent` objects and pushes onto them. The barrel's export order in `index.ts` follows the dependency chain for this reason — don't reorder it casually.

### `attendance.ts` — trend builders

Two shapes recur across the mock layer: raw per-record data, and a pre-aggregated "trend" array meant to feed a chart directly.

```ts
// src/mock/attendance.ts
function lastNDays(n: number) { /* last n weekdays, Sat/Sun skipped */ }
const attendanceDays = lastNDays(14)

export const attendanceRecords = SCHOOL_ROSTER_CONFIG.flatMap((config) => {
  const sample = students.filter((s) => s.schoolId === config.schoolId).slice(0, 60)
  return attendanceDays.flatMap((date, di) =>
    sample.map((student, si) => ({ id: `att-${di}-${si}`, schoolId: config.schoolId, studentId: student.id, date, status: /* ... */ }))
  )
})

export function buildAttendanceTrend(records: AttendanceRecord[]) {
  // reverses attendanceDays, computes percent = present+late / total per day
  // returns { date, label, percent }[]
}
```

Note the sampling: only the **first 60 students per school** get attendance records, not the full roster — a deliberate cap to keep the generated dataset a manageable size while still producing a real 14-day trend.

`src/mock/fees.ts` has the same shape for revenue:

```ts
export function buildRevenueTrend(schoolId: string) {
  const hash = hashCode(schoolId)     // custom str-hash: hash = hash*31 + charCode
  const base = configFor(schoolId).studentCount * 1800
  // generates 6 months back from now, revenue/target derived from hash + base
}
export const revenueTrendBySchool = Object.fromEntries(
  SCHOOL_ROSTER_CONFIG.map((c) => [c.schoolId, buildRevenueTrend(c.schoolId)])
)
```

`hashCode(schoolId)` is what makes the revenue curve look different per school while staying deterministic — no `faker.seed()` re-call needed mid-module.

When you need a new trend/aggregate for a chart, follow this shape: a pure function taking the already-generated array (or a `schoolId`) and returning a small array of `{ x, y, ... }` points, exported alongside the raw data it derives from.

### `fees.ts` — derived-not-generated data

Not every array in `src/mock/` is generated fresh from `SCHOOL_ROSTER_CONFIG`. Some are *derived* from an already-generated array:

```ts
export const feeRecords = students.map((student) => ({
  id: `fee-${student.id}`,
  schoolId: student.schoolId,
  studentId: student.id,
  paidAmount: deriveFromStatus(student.feeStatus), // paid→full, partial→50%, overdue/pending→0-40%
  // ...
}))

export const payments = feeRecords
  .filter((f) => f.paidAmount > 0)
  .sort((a, b) => b.date.localeCompare(a.date))
```

One fee record per student (not per roster-config entry), and `payments` is just a filtered/sorted view of `feeRecords`. Prefer deriving from an existing array over hand-rolling a new `Array.from({length: N})` loop whenever the new entity has a natural 1:1 or 1:N relationship to something that already exists — it keeps the two arrays trivially consistent.

## Known limitation: no cross-page shared store

Every page keeps its **own local `useState` copy** of the mock data it renders (see [adding-a-module.md](./adding-a-module.md)). A delete or create on the Students list page mutates only that page's in-memory state — it does **not** propagate to `src/mock/students.ts`'s module-level array, and it does **not** show up on, say, the Student Profile page or the Dashboard in the same session.

This is an accepted limitation of the mock-data-per-page architecture, not a bug: there is no cross-page shared store layered on top of the mock generators. If a future requirement needs cross-page consistency (e.g. "deleting a student here should remove them from Attendance too"), that's a real architectural change — introducing a shared client-side store (Zustand or TanStack Query's cache) seeded from `src/mock/` — not a page-level fix.

## Which entities are per-school vs. org-wide

Most domain data loops `SCHOOL_ROSTER_CONFIG` and carries `schoolId`: students, teachers, classes, parents, staff, attendance, fees, exams, admissions, coursework, library, facilities, payroll, notifications, calendar events.

Deliberately **org-wide** (no `schoolId`, shared across all tenants): Subjects (shared curriculum), Chat, Alumni, LMS, Documents, Email Templates, Gallery, Reports, Settings/Profile/Support. Calendar Events are schoolId-scoped but not further filtered for per-instance deletability in every view — check the specific page if you're extending it.

## Related

- [multi-tenancy-and-auth.md](./multi-tenancy-and-auth.md) — how `schoolId` flows from login into page filtering
- [adding-a-module.md](./adding-a-module.md) — the full recipe for adding a new school-scoped entity + page
- [architecture.md](./architecture.md) — where `src/mock/` sits in the overall project structure
