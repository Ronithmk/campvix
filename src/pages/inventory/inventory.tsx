import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Boxes, AlertTriangle, Package, Plus, MoreHorizontal, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { DataTable, exportToCsv } from '@/components/shared/data-table'
import { ConfirmDeleteDialog } from '@/components/shared/confirm-delete-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { inventoryItems as mockInventory } from '@/mock/facilities'
import { formatDate } from '@/lib/utils'
import type { LegacyColumnDef as ColumnDef } from '@tanstack/react-table/legacy'
import type { InventoryItem } from '@/types'
import { useActiveSchool } from '@/hooks/use-active-school'

function getColumns(onDelete: (item: InventoryItem) => void): ColumnDef<InventoryItem, unknown>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Item',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">{row.original.name}</span>
          <span className="text-xs text-muted-foreground">{row.original.location}</span>
        </div>
      ),
    },
    { id: 'category', accessorKey: 'category', header: 'Category', cell: ({ getValue }) => <Badge variant="secondary" className="capitalize">{(getValue() as string).replace('_', ' ')}</Badge> },
    {
      id: 'quantity',
      accessorKey: 'quantity',
      header: 'Quantity',
      cell: ({ row }) => {
        const { quantity, minThreshold, unit } = row.original
        const low = quantity <= minThreshold
        return (
          <span className={low ? 'font-medium text-destructive' : 'text-foreground'}>
            {quantity} {unit} {low && <AlertTriangle className="ml-1 inline size-3.5" />}
          </span>
        )
      },
    },
    { id: 'vendor', accessorKey: 'vendor', header: 'Vendor', cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue() as string}</span> },
    { id: 'lastRestocked', accessorKey: 'lastRestocked', header: 'Last Restocked', cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{formatDate(getValue() as string)}</span> },
    {
      id: 'actions',
      header: '',
      enableHiding: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem variant="destructive" onSelect={() => onDelete(row.original)}>
              <Trash2 /> Remove item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}

export default function InventoryPage() {
  const school = useActiveSchool()
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(mockInventory)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [pendingDelete, setPendingDelete] = useState<InventoryItem | null>(null)

  const schoolInventory = useMemo(() => inventoryItems.filter((i) => i.schoolId === school.id), [inventoryItems, school.id])
  const filtered = useMemo(() => schoolInventory.filter((i) => categoryFilter === 'all' || i.category === categoryFilter), [schoolInventory, categoryFilter])

  const lowStock = schoolInventory.filter((i) => i.quantity <= i.minThreshold).length
  const totalUnits = schoolInventory.reduce((sum, i) => sum + i.quantity, 0)

  const columns = useMemo(() => getColumns((item) => setPendingDelete(item)), [])

  function handleDelete() {
    if (!pendingDelete) return
    setInventoryItems((prev) => prev.filter((i) => i.id !== pendingDelete.id))
    toast.success(`${pendingDelete.name} was removed`)
    setPendingDelete(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Inventory"
        description={`Track school assets, supplies, and equipment at ${school.name}.`}
        actions={
          <Button onClick={() => toast.success('Item added')}>
            <Plus className="size-4" /> Add Item
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard index={0} label="Total Items" value={String(schoolInventory.length)} icon={Boxes} accent="primary" change={0} />
        <StatCard index={1} label="Total Units" value={String(totalUnits)} icon={Package} accent="accent" change={0} />
        <StatCard index={2} label="Low Stock Alerts" value={String(lowStock)} icon={AlertTriangle} accent="destructive" change={0} />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search inventory..."
        onExport={(rows) => {
          exportToCsv(
            rows.map((i) => ({ name: i.name, category: i.category, quantity: i.quantity, vendor: i.vendor })),
            'inventory.csv',
          )
          toast.success('Exported inventory.csv')
        }}
        toolbar={
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger size="sm" className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="furniture">Furniture</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
              <SelectItem value="lab_equipment">Lab Equipment</SelectItem>
              <SelectItem value="stationery">Stationery</SelectItem>
              <SelectItem value="books">Books</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <ConfirmDeleteDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Remove this item?"
        description={pendingDelete ? `${pendingDelete.name} will be permanently removed from inventory.` : ''}
      />
    </div>
  )
}
