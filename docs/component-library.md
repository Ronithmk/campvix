# Component Library — Reference

Two tiers: `src/components/ui/` (hand-built shadcn-style primitives) and `src/components/shared/` (app-level components composed from those primitives). Neither was scaffolded by the shadcn CLI — both are hand-written to the same conventions so they read like they were.

## `src/components/ui/` — primitives

```
alert-dialog.tsx  avatar.tsx      badge.tsx        button.tsx
card.tsx          checkbox.tsx    command.tsx      dialog.tsx
dropdown-menu.tsx form.tsx        input.tsx        label.tsx
popover.tsx       progress.tsx    scroll-area.tsx  select.tsx
separator.tsx     sheet.tsx       skeleton.tsx     sonner.tsx
switch.tsx        table.tsx       tabs.tsx         textarea.tsx
tooltip.tsx
```

### Convention: CVA + Radix Slot

Every primitive follows the same recipe — `class-variance-authority` (CVA) for variant/size classes, `@radix-ui/react-slot` for an `asChild` escape hatch, and a `cn()` merge helper (`clsx` + `tailwind-merge`, in `src/lib/utils.ts`). `button.tsx` (`src/components/ui/button.tsx`, full):

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 ... active:scale-[0.98]",
  {
    variants: {
      variant: { default: '...', destructive: '...', outline: '...', secondary: '...', ghost: '...', link: '...', success: '...' },
      size: { default: 'h-9 px-4 py-2', sm: 'h-8 ... text-xs', lg: 'h-11 ... text-base', icon: 'size-9', 'icon-sm': 'size-8' },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}
```

Note the `success` variant and `active:scale-[0.98]` micro-interaction — additions on top of the stock shadcn button, not present in the upstream template. When adding a new primitive or a new variant to an existing one, match this shape: `cva` for the class map, `data-slot="<name>"` on the root element, `asChild` support via `Slot` if the component might need to render as a different element (a `Link`, for instance).

### `form.tsx` — React Hook Form wrapper

Standard shadcn RHF wrapper: `Form = FormProvider`; `FormField` wraps `Controller` inside a `FormFieldContext`; `useFormField()` merges field state + item context + `getFieldState()` to expose `FormItem` / `FormLabel` / `FormControl` / `FormDescription` / `FormMessage`. Every Add/Edit dialog across the app (see [adding-a-module.md](./adding-a-module.md)) is built from these five pieces plus `zodResolver`.

`FormControl` forwards `id`/`aria-*` only to its **immediate child** via Radix `Slot`. If you wrap an `<Input>` in a decorative `<div>` (for an icon or a show/hide-password toggle), the label association breaks — `FormControl` must wrap `<Input>` directly, with the icon/toggle as a sibling, not a parent. This bit several of the auth pages during initial development; if you're adding a field with a leading icon, structure it like:

```tsx
<div className="relative">
  <FormControl>
    <Input className="pl-9" {...field} />
  </FormControl>
  <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2" />
</div>
```
not `<FormControl><div><Icon/><Input/></div></FormControl>`.

## `src/components/shared/` — composed app components

```
chart-tooltip.tsx  confirm-delete-dialog.tsx  data-table.tsx  delete-confirm.tsx
empty-state.tsx    page-header.tsx            route-boundary.tsx
stat-card.tsx      status-badge.tsx
```

Each has a colocated `*.test.tsx`.

### The TanStack Table v9 `/legacy` import

`@tanstack/react-table` is pinned to v9.0.0, a ground-up rewrite that replaces the familiar `useReactTable`/`createColumnHelper`/`getCoreRowModel` exports with a new `tableFeatures()` composition API — those v8-style names no longer exist on the package's main entry point. The package ships a `/legacy` subpath that re-exports a full v8-compatible shim. `src/components/shared/data-table.tsx:2-10` (full):

```ts
import {
  flexRender,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type RowData,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table'
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useLegacyTable as useReactTable,
  type LegacyColumnDef as ColumnDef,
} from '@tanstack/react-table/legacy'
```

The split to memorize: **row-model factories, the table hook, and the column-def type** come from `/legacy` (aliased back to their familiar v8 names — `useLegacyTable as useReactTable`, `LegacyColumnDef as ColumnDef`); **state types and `flexRender`** still come from the main `'@tanstack/react-table'` entry. Also note the renamed state type — it's `ColumnVisibilityState`, not v8's `VisibilityState`.

Any generic component wrapping the table needs `<TData extends RowData>` (import `RowData` from the main entry) or TypeScript rejects the unconstrained generic. `initialState.pagination` requires both `pageIndex` and `pageSize` — passing just one is a type error.

**When adding a table to a new page**, copy this exact import split — do not attempt to import from the main `'@tanstack/react-table'` entry expecting the v8 API, and do not try to learn/use the new v9 `tableFeatures()` API. Page-level column-def imports follow the same pattern, e.g. `src/pages/finance/invoices.tsx:7`:

```ts
import type { LegacyColumnDef as ColumnDef } from '@tanstack/react-table/legacy'
```

### `DataTable` — the shared table component

`src/components/shared/data-table.tsx` owns `sorting`, `columnFilters`, `columnVisibility`, `rowSelection`, and `globalFilter` state internally. It renders a search `Input` (wired to `globalFilter`), a "Columns" visibility toggle (`DropdownMenu`), full pagination controls (page-size select `[10, 20, 50, 100]`, first/prev/next/last), and accepts an optional `onExport` callback. It also exports a standalone helper:

```ts
export function exportToCsv(rows: TData[], filename: string) {
  // builds a CSV Blob, creates an object URL, triggers a synthetic <a download> click
}
```

Every page with a table wires `onExport={() => exportToCsv(filteredData, 'students.csv')}` (or similar) rather than reimplementing CSV export per page.

### Delete confirmation — two variants, pick by call site

Two components exist because Radix's `AlertDialogTrigger`, when nested inside a `DropdownMenuItem`, has its click swallowed by the menu closing first — an uncontrolled trigger-based dialog silently never opens from a dropdown row action.

**`DeleteConfirm`** (`src/components/shared/delete-confirm.tsx`, full) — uncontrolled, wraps a trigger:

```tsx
<AlertDialog>
  <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
    {children}
  </AlertDialogTrigger>
  <AlertDialogContent onClick={(e) => e.stopPropagation()}>
    {/* title / description / cancel / confirm */}
  </AlertDialogContent>
</AlertDialog>
```
Use for a **direct** delete button or card action — not inside a dropdown menu.

**`ConfirmDeleteDialog`** (`src/components/shared/confirm-delete-dialog.tsx`, full) — controlled, no trigger, `open`/`onOpenChange` driven by the caller:

```tsx
<AlertDialog open={open} onOpenChange={onOpenChange}>
  <AlertDialogContent>
    {/* ... */}
    <AlertDialogAction onClick={() => { onConfirm(); onOpenChange(false) }}>
      {confirmLabel}
    </AlertDialogAction>
  </AlertDialogContent>
</AlertDialog>
```
Use for **`DataTable` row-action dropdowns** — the caller holds a `pendingDelete` state (`useState<T | null>(null)`), renders one `ConfirmDeleteDialog` at the bottom of the page with `open={!!pendingDelete}`, and a dropdown "Delete" `DropdownMenuItem` just sets `pendingDelete` instead of trying to nest a trigger. This is also why table `columns` are built by a **factory function** (`getStudentColumns(onDelete)`) rather than a static `const` — the delete callback needs to be threaded in from the page.

### Other shared components

- `PageHeader` — title/description/actions slot, used at the top of every page.
- `StatCard` — the metric tiles under `PageHeader` (`index`, `label`, `value`, `change`, `icon`, `accent`).
- `EmptyState` — zero-results placeholder for tables/lists.
- `StatusBadge` — colored badge driven by a status enum (attendance, fee, exam, etc.).
- `ChartTooltip` — shared Recharts tooltip renderer.
- `RouteBoundary` — error boundary wrapping lazy-loaded route content.

## Related

- [adding-a-module.md](./adding-a-module.md) — using these pieces together to build a new page
- [testing.md](./testing.md) — testing conventions for components that use Radix primitives
