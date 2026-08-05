import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Plus, Receipt, Download, Send, MoreHorizontal, Trash2 } from 'lucide-react'
import type { LegacyColumnDef as ColumnDef } from '@tanstack/react-table/legacy'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { DataTable, exportToCsv } from '@/components/shared/data-table'
import { ConfirmDeleteDialog } from '@/components/shared/confirm-delete-dialog'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { feeRecords as mockFeeRecords } from '@/mock/fees'
import { students as allStudents } from '@/mock/students'
import type { FeeRecord } from '@/types'
import { formatCurrency, formatDate, sleep } from '@/lib/utils'
import { useActiveSchool } from '@/hooks/use-active-school'

const invoiceSchema = z.object({
  studentId: z.string().min(1, 'Select a student'),
  category: z.enum(['tuition', 'transport', 'hostel', 'library', 'exam']),
  amount: z.coerce.number().min(1, 'Enter a valid amount'),
  term: z.string().min(1, 'Term is required'),
})

type InvoiceValues = z.infer<typeof invoiceSchema>

function getColumns(onDelete: (fee: FeeRecord) => void): ColumnDef<FeeRecord, unknown>[] {
  return [
    {
      id: 'invoiceNo',
      accessorKey: 'invoiceNo',
      header: 'Invoice',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Receipt className="size-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">{row.original.invoiceNo}</span>
            <span className="text-xs text-muted-foreground">{row.original.studentName}</span>
          </div>
        </div>
      ),
    },
    { id: 'category', accessorKey: 'category', header: 'Category', cell: ({ getValue }) => <span className="text-sm capitalize text-foreground">{getValue() as string}</span> },
    { id: 'amount', accessorKey: 'amount', header: 'Amount', cell: ({ getValue }) => <span className="text-sm font-medium text-foreground">{formatCurrency(getValue() as number)}</span> },
    { id: 'dueDate', accessorKey: 'dueDate', header: 'Due Date', cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{formatDate(getValue() as string)}</span> },
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
            <DropdownMenuItem>
              <Download /> Download PDF
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Send /> Send reminder
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={() => onDelete(row.original)}>
              <Trash2 /> Delete invoice
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}

export default function InvoicesPage() {
  const school = useActiveSchool()
  const [invoices, setInvoices] = useState<FeeRecord[]>(mockFeeRecords)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<FeeRecord | null>(null)
  const form = useForm<InvoiceValues>({ resolver: zodResolver(invoiceSchema), defaultValues: { studentId: '', category: 'tuition', amount: 15000, term: 'Term 2' } })

  const schoolStudents = useMemo(() => allStudents.filter((s) => s.schoolId === school.id), [school.id])
  const schoolInvoices = useMemo(() => invoices.filter((i) => i.schoolId === school.id), [invoices, school.id])

  const total = schoolInvoices.reduce((sum, i) => sum + i.amount, 0)
  const paid = schoolInvoices.filter((i) => i.status === 'paid').length
  const unpaid = schoolInvoices.filter((i) => i.status !== 'paid').length

  const columns = useMemo(() => getColumns((fee) => setPendingDelete(fee)), [])

  async function onSubmit(values: InvoiceValues) {
    await sleep(500)
    const student = schoolStudents.find((s) => s.id === values.studentId)!
    const invoice: FeeRecord = {
      id: `fee-new-${Date.now()}`,
      schoolId: school.id,
      studentId: student.id,
      studentName: student.name,
      invoiceNo: `INV-${9000 + invoices.length}`,
      term: values.term,
      amount: values.amount,
      paidAmount: 0,
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      status: 'pending',
      category: values.category,
    }
    setInvoices((prev) => [invoice, ...prev])
    toast.success(`Invoice ${invoice.invoiceNo} created`)
    setDialogOpen(false)
    form.reset()
  }

  function handleDelete() {
    if (!pendingDelete) return
    setInvoices((prev) => prev.filter((i) => i.id !== pendingDelete.id))
    toast.success(`Invoice ${pendingDelete.invoiceNo} was deleted`)
    setPendingDelete(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Invoices"
        description={`Generate and manage fee invoices for every student at ${school.name}.`}
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" /> Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new invoice</DialogTitle>
                <DialogDescription>Generate a fee invoice for a student.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select student" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {schoolStudents.slice(0, 30).map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name} &middot; {s.className}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="tuition">Tuition</SelectItem>
                            <SelectItem value="transport">Transport</SelectItem>
                            <SelectItem value="hostel">Hostel</SelectItem>
                            <SelectItem value="library">Library</SelectItem>
                            <SelectItem value="exam">Exam</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="term"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Term</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
                      Create invoice
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard index={0} label="Total Invoiced" value={formatCurrency(total)} icon={Receipt} accent="primary" change={5.2} />
        <StatCard index={1} label="Paid Invoices" value={String(paid)} icon={Receipt} accent="accent" change={3.1} />
        <StatCard index={2} label="Unpaid Invoices" value={String(unpaid)} icon={Receipt} accent="warning" change={-2.4} />
      </div>

      <DataTable
        columns={columns}
        data={schoolInvoices}
        searchPlaceholder="Search invoices..."
        onExport={(rows) => {
          exportToCsv(
            rows.map((i) => ({ invoice: i.invoiceNo, student: i.studentName, amount: i.amount, status: i.status })),
            'invoices.csv',
          )
          toast.success('Exported invoices.csv')
        }}
      />

      <ConfirmDeleteDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Delete this invoice?"
        description={pendingDelete ? `Invoice ${pendingDelete.invoiceNo} for ${pendingDelete.studentName} will be permanently deleted.` : ''}
      />
    </div>
  )
}
