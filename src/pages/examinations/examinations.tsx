import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { FileSpreadsheet, CalendarCheck, GraduationCap, Plus, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { DataTable, exportToCsv } from '@/components/shared/data-table'
import { ConfirmDeleteDialog } from '@/components/shared/confirm-delete-dialog'
import { getExamColumns } from '@/features/examinations/columns'
import { exams as mockExams } from '@/mock/exams'
import { classes as allClasses } from '@/mock/classes'
import { subjects } from '@/mock/subjects'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { sleep } from '@/lib/utils'
import type { Exam } from '@/types'
import { useActiveSchool } from '@/hooks/use-active-school'

const examSchema = z.object({
  name: z.string().min(2, 'Exam name is required'),
  subjectId: z.string().min(1, 'Select a subject'),
  classId: z.string().min(1, 'Select a class'),
  date: z.string().min(1, 'Date is required'),
})

type ExamValues = z.infer<typeof examSchema>

export default function ExaminationsPage() {
  const school = useActiveSchool()
  const [exams, setExams] = useState<Exam[]>(mockExams)
  const [statusFilter, setStatusFilter] = useState('all')
  const [pendingDelete, setPendingDelete] = useState<Exam | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const schoolExams = useMemo(() => exams.filter((e) => e.schoolId === school.id), [exams, school.id])
  const filtered = useMemo(() => schoolExams.filter((e) => statusFilter === 'all' || e.status === statusFilter), [schoolExams, statusFilter])
  const schoolClasses = useMemo(() => allClasses.filter((c) => c.schoolId === school.id), [school.id])

  const upcoming = schoolExams.filter((e) => e.status === 'upcoming').length
  const graded = schoolExams.filter((e) => e.status === 'graded').length

  const columns = useMemo(() => getExamColumns((exam) => setPendingDelete(exam)), [])

  const form = useForm<ExamValues>({
    resolver: zodResolver(examSchema),
    defaultValues: { name: '', subjectId: '', classId: '', date: new Date().toISOString().slice(0, 10) },
  })

  async function onSubmit(values: ExamValues) {
    await sleep(500)
    const newExam: Exam = {
      id: `exam-new-${Date.now()}`,
      schoolId: school.id,
      name: values.name,
      subjectId: values.subjectId,
      classId: values.classId,
      date: new Date(values.date).toISOString(),
      maxMarks: 100,
      status: 'upcoming',
    }
    setExams((prev) => [newExam, ...prev])
    toast.success(`${newExam.name} was scheduled`)
    setDialogOpen(false)
    form.reset()
  }

  function handleDelete() {
    if (!pendingDelete) return
    setExams((prev) => prev.filter((e) => e.id !== pendingDelete.id))
    toast.success(`${pendingDelete.name} was cancelled`)
    setPendingDelete(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Examinations"
        description={`Plan, schedule, and manage examinations at ${school.name}.`}
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" /> Schedule Exam
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule a new exam</DialogTitle>
                <DialogDescription>Set up the exam basics — results can be entered once it's completed.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exam name</FormLabel>
                        <FormControl>
                          <Input placeholder="Mid Term" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subjectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subjects.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name}
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
                    name="classId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {schoolClasses.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
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
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
                      Schedule exam
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard index={0} label="Total Exams" value={String(schoolExams.length)} icon={FileSpreadsheet} accent="primary" change={0} />
        <StatCard index={1} label="Upcoming" value={String(upcoming)} icon={CalendarCheck} accent="warning" change={0} />
        <StatCard index={2} label="Graded" value={String(graded)} icon={GraduationCap} accent="accent" change={0} />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search exams..."
        onExport={(rows) => {
          exportToCsv(
            rows.map((e) => ({ name: e.name, date: e.date, maxMarks: e.maxMarks, status: e.status })),
            'examinations.csv',
          )
          toast.success('Exported examinations.csv')
        }}
        toolbar={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger size="sm" className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="graded">Graded</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <ConfirmDeleteDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Cancel this exam?"
        description={pendingDelete ? `${pendingDelete.name} will be permanently removed from the schedule.` : ''}
        confirmLabel="Cancel exam"
      />
    </div>
  )
}
