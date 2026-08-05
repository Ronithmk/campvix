import { useMemo, useState } from 'react'
import type { LegacyColumnDef as ColumnDef } from '@tanstack/react-table/legacy'
import { toast } from 'sonner'
import { CreditCard, Wallet, TrendingUp, Receipt, MoreHorizontal, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { DataTable, exportToCsv } from '@/components/shared/data-table'
import { ConfirmDeleteDialog } from '@/components/shared/confirm-delete-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { payments as mockPayments } from '@/mock/fees'
import type { Payment } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useActiveSchool } from '@/hooks/use-active-school'

const METHOD_LABELS: Record<Payment['method'], string> = { card: 'Card', upi: 'UPI', bank_transfer: 'Bank Transfer', cash: 'Cash' }

function getColumns(onDelete: (payment: Payment) => void): ColumnDef<Payment, unknown>[] {
  return [
    {
      id: 'reference',
      accessorFn: (row) => `${row.reference} ${row.studentName}`,
      header: 'Reference',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">{row.original.reference}</span>
          <span className="text-xs text-muted-foreground">{row.original.studentName}</span>
        </div>
      ),
    },
    { id: 'method', accessorKey: 'method', header: 'Method', cell: ({ getValue }) => <Badge variant="secondary">{METHOD_LABELS[getValue() as Payment['method']]}</Badge> },
    { id: 'date', accessorKey: 'date', header: 'Date', cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{formatDate(getValue() as string)}</span> },
    { id: 'amount', accessorKey: 'amount', header: 'Amount', cell: ({ getValue }) => <span className="text-sm font-medium text-foreground">{formatCurrency(getValue() as number)}</span> },
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
              <Trash2 /> Delete record
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}

export default function PaymentsPage() {
  const school = useActiveSchool()
  const [payments, setPayments] = useState<Payment[]>(mockPayments)
  const [pendingDelete, setPendingDelete] = useState<Payment | null>(null)

  const schoolPayments = useMemo(() => payments.filter((p) => p.schoolId === school.id), [payments, school.id])
  const total = schoolPayments.reduce((sum, p) => sum + p.amount, 0)
  const avg = schoolPayments.length ? Math.round(total / schoolPayments.length) : 0
  const upiShare = schoolPayments.length ? Math.round((schoolPayments.filter((p) => p.method === 'upi').length / schoolPayments.length) * 100) : 0

  const columns = useMemo(() => getColumns((payment) => setPendingDelete(payment)), [])

  function handleDelete() {
    if (!pendingDelete) return
    setPayments((prev) => prev.filter((p) => p.id !== pendingDelete.id))
    toast.success('Payment record deleted')
    setPendingDelete(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Payments" description={`A ledger of every fee payment received at ${school.name}.`} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="Total Collected" value={formatCurrency(total)} icon={Wallet} accent="primary" change={8.6} />
        <StatCard index={1} label="Transactions" value={String(schoolPayments.length)} icon={Receipt} accent="accent" change={4.1} />
        <StatCard index={2} label="Avg. Payment" value={formatCurrency(avg)} icon={TrendingUp} accent="primary" change={1.2} />
        <StatCard index={3} label="UPI Share" value={`${upiShare}%`} icon={CreditCard} accent="warning" change={6.4} />
      </div>

      <DataTable
        columns={columns}
        data={schoolPayments}
        searchPlaceholder="Search by reference or student..."
        onExport={(rows) => {
          exportToCsv(
            rows.map((p) => ({ reference: p.reference, student: p.studentName, amount: p.amount, method: p.method, date: p.date })),
            'payments.csv',
          )
          toast.success('Exported payments.csv')
        }}
      />

      <ConfirmDeleteDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Delete this payment record?"
        description={pendingDelete ? `Payment ${pendingDelete.reference} for ${pendingDelete.studentName} will be permanently deleted.` : ''}
      />
    </div>
  )
}
