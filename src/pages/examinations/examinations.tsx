import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { FileSpreadsheet, CalendarCheck, GraduationCap, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { DataTable, exportToCsv } from '@/components/shared/data-table'
import { ConfirmDeleteDialog } from '@/components/shared/confirm-delete-dialog'
import { getExamColumns } from '@/features/examinations/columns'
import { exams as mockExams } from '@/mock/exams'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Exam } from '@/types'
import { useActiveSchool } from '@/hooks/use-active-school'

export default function ExaminationsPage() {
  const school = useActiveSchool()
  const [exams, setExams] = useState<Exam[]>(mockExams)
  const [statusFilter, setStatusFilter] = useState('all')
  const [pendingDelete, setPendingDelete] = useState<Exam | null>(null)

  const schoolExams = useMemo(() => exams.filter((e) => e.schoolId === school.id), [exams, school.id])
  const filtered = useMemo(() => schoolExams.filter((e) => statusFilter === 'all' || e.status === statusFilter), [schoolExams, statusFilter])

  const upcoming = schoolExams.filter((e) => e.status === 'upcoming').length
  const graded = schoolExams.filter((e) => e.status === 'graded').length

  const columns = useMemo(() => getExamColumns((exam) => setPendingDelete(exam)), [])

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
          <Button onClick={() => toast.success('Exam scheduled')}>
            <Plus className="size-4" /> Schedule Exam
          </Button>
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
