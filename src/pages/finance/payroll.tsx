import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Banknote, CheckCircle2, Clock, MoreHorizontal, Trash2 } from 'lucide-react'
import type { LegacyColumnDef as ColumnDef } from '@tanstack/react-table/legacy'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { DataTable, exportToCsv } from '@/components/shared/data-table'
import { ConfirmDeleteDialog } from '@/components/shared/confirm-delete-dialog'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { payrollRecords as mockPayroll } from '@/mock/payroll'
import type { PayrollRecord } from '@/types'
import { formatCurrency, initials } from '@/lib/utils'
import { useActiveSchool } from '@/hooks/use-active-school'

function getColumns(onDelete: (record: PayrollRecord) => void): ColumnDef<PayrollRecord, unknown>[] {
  return [
    {
      id: 'name',
      accessorFn: (row) => `${row.name} ${row.employeeId}`,
      header: 'Employee',
      cell: ({ row }) => {
        const p = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-9">
              <AvatarImage src={p.avatarUrl} alt={p.name} />
              <AvatarFallback>{initials(p.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">{p.name}</span>
              <span className="text-xs text-muted-foreground">{p.employeeId}</span>
            </div>
          </div>
        )
      },
    },
    { id: 'role', accessorKey: 'role', header: 'Role', cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue() as string}</span> },
    { id: 'baseSalary', accessorKey: 'baseSalary', header: 'Base Salary', cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{formatCurrency(getValue() as number)}</span> },
    { id: 'netPay', accessorKey: 'netPay', header: 'Net Pay', cell: ({ getValue }) => <span className="text-sm font-medium text-foreground">{formatCurrency(getValue() as number)}</span> },
    { id: 'status', accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <StatusBadge status={getValue() as string} /> },
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
              <Trash2 /> Remove record
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}

export default function PayrollPage() {
  const school = useActiveSchool()
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(mockPayroll)
  const [statusFilter, setStatusFilter] = useState('all')
  const [pendingDelete, setPendingDelete] = useState<PayrollRecord | null>(null)

  const schoolPayroll = useMemo(() => payrollRecords.filter((p) => p.schoolId === school.id), [payrollRecords, school.id])
  const filtered = useMemo(() => schoolPayroll.filter((p) => statusFilter === 'all' || p.status === statusFilter), [schoolPayroll, statusFilter])

  const totalNet = schoolPayroll.reduce((sum, p) => sum + p.netPay, 0)
  const paid = schoolPayroll.filter((p) => p.status === 'paid').length
  const pending = schoolPayroll.filter((p) => p.status !== 'paid').length
  const pendingCount = schoolPayroll.filter((p) => p.status === 'pending').length

  const columns = useMemo(() => getColumns((record) => setPendingDelete(record)), [])

  function handleDelete() {
    if (!pendingDelete) return
    setPayrollRecords((prev) => prev.filter((p) => p.id !== pendingDelete.id))
    toast.success(`Payroll record for ${pendingDelete.name} was removed`)
    setPendingDelete(null)
  }

  function handleRunPayroll() {
    if (pendingCount === 0) return
    setPayrollRecords((prev) => prev.map((p) => (p.schoolId === school.id && p.status === 'pending' ? { ...p, status: 'processing' } : p)))
    toast.success('Payroll run initiated for August 2026')
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payroll"
        description={`Run payroll for teachers and staff at ${school.name}.`}
        actions={
          <Button onClick={handleRunPayroll} disabled={pendingCount === 0}>
            <Banknote className="size-4" /> Run Payroll
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard index={0} label="Total Payout" value={formatCurrency(totalNet)} icon={Banknote} accent="primary" change={2.6} />
        <StatCard index={1} label="Paid" value={String(paid)} icon={CheckCircle2} accent="accent" change={0} />
        <StatCard index={2} label="Pending / Processing" value={String(pending)} icon={Clock} accent="warning" change={0} />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search employees..."
        onExport={(rows) => {
          exportToCsv(
            rows.map((p) => ({ employeeId: p.employeeId, name: p.name, role: p.role, netPay: p.netPay, status: p.status })),
            'payroll.csv',
          )
          toast.success('Exported payroll.csv')
        }}
        toolbar={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger size="sm" className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <ConfirmDeleteDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Remove this payroll record?"
        description={pendingDelete ? `The payroll record for ${pendingDelete.name} will be permanently removed.` : ''}
      />
    </div>
  )
}
