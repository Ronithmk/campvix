import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts'
import { Wallet, ReceiptText, AlertCircle, CheckCircle2, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { ChartTooltip } from '@/components/shared/chart-tooltip'
import { DataTable, exportToCsv } from '@/components/shared/data-table'
import { ConfirmDeleteDialog } from '@/components/shared/confirm-delete-dialog'
import { getFeeColumns } from '@/features/finance/columns'
import { feeRecords as mockFeeRecords } from '@/mock/fees'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import type { FeeRecord } from '@/types'
import { useActiveSchool } from '@/hooks/use-active-school'

const STATUS_COLORS: Record<string, string> = {
  paid: 'var(--color-status-good)',
  pending: 'var(--color-status-warning)',
  overdue: 'var(--color-status-critical)',
  partial: 'var(--color-chart-1)',
}

export default function FeeManagementPage() {
  const school = useActiveSchool()
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>(mockFeeRecords)
  const [statusFilter, setStatusFilter] = useState('all')
  const [pendingDelete, setPendingDelete] = useState<FeeRecord | null>(null)

  const schoolFees = useMemo(() => feeRecords.filter((f) => f.schoolId === school.id), [feeRecords, school.id])
  const filtered = useMemo(() => schoolFees.filter((f) => statusFilter === 'all' || f.status === statusFilter), [schoolFees, statusFilter])

  const totalAmount = schoolFees.reduce((sum, f) => sum + f.amount, 0)
  const collected = schoolFees.reduce((sum, f) => sum + f.paidAmount, 0)
  const pending = schoolFees.filter((f) => f.status === 'pending' || f.status === 'partial').reduce((sum, f) => sum + (f.amount - f.paidAmount), 0)
  const overdue = schoolFees.filter((f) => f.status === 'overdue').length

  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const f of schoolFees) counts[f.status] = (counts[f.status] ?? 0) + 1
    return Object.entries(counts).map(([status, value]) => ({ status, value }))
  }, [schoolFees])

  const columns = useMemo(() => getFeeColumns((fee) => setPendingDelete(fee)), [])

  function handleDelete() {
    if (!pendingDelete) return
    setFeeRecords((prev) => prev.filter((f) => f.id !== pendingDelete.id))
    toast.success(`Invoice ${pendingDelete.invoiceNo} was voided`)
    setPendingDelete(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Fee Management"
        description={`Track collections, dues, and payment status at ${school.name}.`}
        actions={
          <Button onClick={() => toast.success('Invoice created')}>
            <Plus className="size-4" /> Create Invoice
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="Total Billed" value={formatCurrency(totalAmount)} icon={Wallet} accent="primary" change={5.4} />
        <StatCard index={1} label="Collected" value={formatCurrency(collected)} icon={CheckCircle2} accent="accent" change={8.1} />
        <StatCard index={2} label="Outstanding" value={formatCurrency(pending)} icon={ReceiptText} accent="warning" change={-2.7} />
        <StatCard index={3} label="Overdue Invoices" value={String(overdue)} icon={AlertCircle} accent="destructive" change={-4.5} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Collection progress</CardTitle>
            <CardDescription>{totalAmount ? Math.round((collected / totalAmount) * 100) : 0}% of billed fees collected this term</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${totalAmount ? Math.round((collected / totalAmount) * 100) : 0}%` }} />
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Collected: <span className="font-medium text-foreground">{formatCurrency(collected)}</span></span>
              <span className="text-muted-foreground">Target: <span className="font-medium text-foreground">{formatCurrency(totalAmount)}</span></span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status breakdown</CardTitle>
            <CardDescription>By invoice count</CardDescription>
          </CardHeader>
          <CardContent className="flex h-48 flex-col items-center pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusBreakdown} dataKey="value" nameKey="status" innerRadius={44} outerRadius={68} paddingAngle={3} strokeWidth={0}>
                  {statusBreakdown.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                  ))}
                </Pie>
                <RechartsTooltip content={ChartTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search by invoice number or student..."
        emptyLabel="No invoices match your filters"
        onExport={(rows) => {
          exportToCsv(
            rows.map((f) => ({ invoice: f.invoiceNo, student: f.studentName, amount: f.amount, paid: f.paidAmount, status: f.status })),
            'fee-records.csv',
          )
          toast.success('Exported fee-records.csv')
        }}
        toolbar={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger size="sm" className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <ConfirmDeleteDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Void this invoice?"
        description={pendingDelete ? `Invoice ${pendingDelete.invoiceNo} for ${pendingDelete.studentName} will be permanently voided.` : ''}
        confirmLabel="Void invoice"
      />
    </div>
  )
}
