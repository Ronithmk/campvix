import type { LegacyColumnDef as ColumnDef } from '@tanstack/react-table/legacy'
import { MoreHorizontal, Eye, Receipt, Send, Trash2 } from 'lucide-react'
import type { FeeRecord } from '@/types'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { formatCurrency, formatDate } from '@/lib/utils'

export function getFeeColumns(onDelete: (fee: FeeRecord) => void): ColumnDef<FeeRecord, unknown>[] {
  return [
  {
    id: 'invoiceNo',
    accessorFn: (row) => `${row.invoiceNo} ${row.studentName}`,
    header: 'Invoice',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">{row.original.invoiceNo}</span>
        <span className="text-xs text-muted-foreground">{row.original.studentName}</span>
      </div>
    ),
  },
  {
    id: 'category',
    accessorKey: 'category',
    header: 'Category',
    cell: ({ getValue }) => <span className="text-sm capitalize text-foreground">{getValue() as string}</span>,
  },
  {
    id: 'term',
    accessorKey: 'term',
    header: 'Term',
    cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue() as string}</span>,
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">{formatCurrency(row.original.amount)}</span>
        <span className="text-xs text-muted-foreground">Paid {formatCurrency(row.original.paidAmount)}</span>
      </div>
    ),
  },
  {
    id: 'dueDate',
    accessorKey: 'dueDate',
    header: 'Due Date',
    cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{formatDate(getValue() as string)}</span>,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
  },
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
          <DropdownMenuItem>
            <Eye /> View invoice
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Receipt /> Record payment
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Send /> Send reminder
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => onDelete(row.original)}>
            <Trash2 /> Void invoice
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
  ]
}
