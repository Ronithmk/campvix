# How to Add a New School-Scoped Module

Every one of CampusFlow's ~40 modules — Students, Invoices, Library, Payroll, and so on — follows the same recipe: a mock generator, a page with local state, a data table, and a real Add/Delete flow. This guide walks through adding a new one, using the real `InvoicesPage` (`src/pages/finance/invoices.tsx`) as the worked example throughout.

## Prerequisites

- Familiarity with [architecture.md](./architecture.md) (project structure) and [mock-data.md](./mock-data.md) (how the fake data layer is organized).
- The entity you're adding is school-scoped (carries a `schoolId`). If it's org-wide instead (like Subjects or Documents), skip the `useActiveSchool()` filtering steps — see [mock-data.md](./mock-data.md#which-entities-are-per-school-vs-org-wide) for which category your entity falls into.

## Steps

### 1. Define the type

Add your entity's shape to the appropriate file in `src/types/` (e.g. `operations.ts` for a new operational entity), and re-export it — the barrel at `src/types/index.ts` already does `export * from './operations'` etc., so a new type just needs to exist in one of the six domain files. Always include `id: string` and, for school-scoped entities, `schoolId: string`.

### 2. Write the mock generator

Create `src/mock/<entity>.ts`. Pick a `faker.seed(N)` number not already used by another generator (grep `src/mock/*.ts` for `faker.seed(` to see what's taken). Loop `SCHOOL_ROSTER_CONFIG` if this is a fresh per-school entity:

```ts
import { faker } from '@faker-js/faker'
import { SCHOOL_ROSTER_CONFIG } from './school-roster-config'

faker.seed(199) // pick an unused number

export const widgets: Widget[] = SCHOOL_ROSTER_CONFIG.flatMap((config) =>
  Array.from({ length: 20 }, (_, i) => ({
    id: `widget-${config.schoolId}-${i}`,
    schoolId: config.schoolId,
    name: faker.commerce.productName(),
    // ...
  })),
)
```

Or, if your entity derives from an existing one (like `feeRecords` derives from `students` — see [mock-data.md](./mock-data.md#feests--derived-not-generated-data)), `.map()` over the parent array instead of generating from scratch.

Add `export * from './widgets'` to `src/mock/index.ts`, in dependency order relative to anything it references.

### 3. Build the page

Create `src/pages/<module>/<module>.tsx` (or reuse an existing module folder if this is a sub-view). Structure it exactly like `InvoicesPage`:

```tsx
export default function InvoicesPage() {
  const school = useActiveSchool()
  const [invoices, setInvoices] = useState<FeeRecord[]>(mockFeeRecords)   // (1) local copy of mock data
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<FeeRecord | null>(null)
  const form = useForm<InvoiceValues>({ resolver: zodResolver(invoiceSchema), defaultValues: { /* ... */ } })

  const schoolInvoices = useMemo(                                        // (2) filter to active tenant
    () => invoices.filter((i) => i.schoolId === school.id),
    [invoices, school.id],
  )

  const columns = useMemo(() => getColumns((fee) => setPendingDelete(fee)), [])  // (3) column factory

  async function onSubmit(values: InvoiceValues) {                       // (4) create
    await sleep(500)
    const invoice: FeeRecord = { id: `fee-new-${Date.now()}`, schoolId: school.id, /* ...values... */ }
    setInvoices((prev) => [invoice, ...prev])
    toast.success(`Invoice ${invoice.invoiceNo} created`)
    setDialogOpen(false)
    form.reset()
  }

  function handleDelete() {                                              // (5) delete
    if (!pendingDelete) return
    setInvoices((prev) => prev.filter((i) => i.id !== pendingDelete.id))
    toast.success(`Invoice ${pendingDelete.invoiceNo} was deleted`)
    setPendingDelete(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Invoices" description={`... ${school.name}.`} actions={/* Dialog with Add button trigger */} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{/* StatCard row */}</div>
      <DataTable columns={columns} data={schoolInvoices} onExport={/* exportToCsv */} />
      <ConfirmDeleteDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)} onConfirm={handleDelete} /* ... */ />
    </div>
  )
}
```

The five numbered pieces are non-negotiable — every real module has all five. See the full file at `src/pages/finance/invoices.tsx` for the complete, working version, including the zod schema, the `Dialog`/`Form` markup, and the `getColumns()` factory.

**Never write a button that fires a `toast.success(...)` without actually mutating state.** That was the exact bug class TODOS.md's biggest single fix addressed (19 stub buttons across 17 pages) — a button with no backing state change is a stub, not a feature, no matter how convincing the toast looks.

### 4. Write the columns factory

```ts
function getColumns(onDelete: (item: Widget) => void): ColumnDef<Widget, unknown>[] {
  return [
    { id: 'name', accessorKey: 'name', header: 'Name', cell: ({ row }) => /* ... */ },
    // ... more columns ...
    {
      id: 'actions',
      header: '',
      enableHiding: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm"><MoreHorizontal /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem variant="destructive" onSelect={() => onDelete(row.original)}>
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}
```

It's a **factory function**, not a static `const columns = [...]`, specifically so the delete callback can be threaded through from the page's `pendingDelete` state. See [component-library.md](./component-library.md#delete-confirmation--two-variants-pick-by-call-site) for why the delete dialog must be `ConfirmDeleteDialog` (controlled) here, not `DeleteConfirm` (trigger-based) — a trigger nested inside this `DropdownMenuItem` would never open, because the menu closes and swallows the click first.

Use the [TanStack Table v9 `/legacy` import](./component-library.md#the-tanstack-table-v9-legacy-import) for `ColumnDef`:

```ts
import type { LegacyColumnDef as ColumnDef } from '@tanstack/react-table/legacy'
```

### 5. Wire the route

Add a `lazy()` import and a `<Route>` entry in `src/routes/index.tsx`, matching the existing pattern for a sibling module.

### 6. Add it to the nav

Add a `NavItem` to the appropriate section in `src/app/nav-config.tsx`, with a `roles: Role[]` allowlist. Reuse `ALL_STAFF` or `LEADERSHIP` if your module fits one of those groups, or list roles explicitly. This single entry drives both the sidebar link and the `RoleProtectedRoute` guard — see [multi-tenancy-and-auth.md](./multi-tenancy-and-auth.md#role-based-navigation).

### 7. Write tests

At minimum, cover: the page renders with school-scoped data, the Add flow actually creates a record (assert the new row appears, not just that a toast fired), the Delete flow actually removes a record, and — if you added a route — that unauthorized roles get redirected. See [testing.md](./testing.md) for the exact conventions (MemoryRouter wrapping, store reset in `beforeEach`, etc).

## Verification

```bash
npm run test         # your new tests + the full suite
npm run lint          # oxlint — watch for react-hooks/rules-of-hooks if you branch early
npx tsc -b --noEmit   # typecheck, including the ColumnDef<Widget, unknown> generic
```

Then run `npm run dev`, log in as an Administrator (Quick access on `/login`), and click through your new module: does Add actually add a row, does Delete actually remove it, does switching schools via the sidebar `SchoolSwitcher` change what you see?

## Troubleshooting

- **"React Hook useMemo is called conditionally"** (oxlint `react-hooks/rules-of-hooks`) — you likely added an early `return` (e.g. a role branch, an empty-school guard) above a `useMemo`/`useState` call. All hooks must run in the same order every render; move conditional returns below every hook call, not between them.
- **`ColumnDef` type error / can't find `useReactTable`** — you imported from `'@tanstack/react-table'` directly instead of the `/legacy` subpath. See [component-library.md](./component-library.md#the-tanstack-table-v9-legacy-import).
- **Label doesn't focus the input when clicked** — you wrapped `<Input>` in a decorative `<div>` inside `FormControl`. `FormControl`'s `Slot` only forwards `id`/`aria-*` to its immediate child; see [component-library.md](./component-library.md#formtsx--react-hook-form-wrapper).
- **A delete added elsewhere doesn't show up here** — expected. There's no cross-page shared store; see [mock-data.md](./mock-data.md#known-limitation-no-cross-page-shared-store).

## Related

- [mock-data.md](./mock-data.md) — generator conventions in depth
- [component-library.md](./component-library.md) — `DataTable`, delete dialogs, form conventions
- [testing.md](./testing.md) — test conventions for new modules
