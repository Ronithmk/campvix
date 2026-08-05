import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { NotebookPen, ClipboardCheck, Clock, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge } from '@/components/shared/status-badge'
import { DeleteConfirm } from '@/components/shared/delete-confirm'
import { assignments as mockAssignments } from '@/mock/coursework'
import { classes } from '@/mock/classes'
import { subjects } from '@/mock/subjects'
import { formatDate } from '@/lib/utils'
import type { Assignment } from '@/types'
import { useActiveSchool } from '@/hooks/use-active-school'

export default function AssignmentsPage() {
  const school = useActiveSchool()
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments)
  const [statusFilter, setStatusFilter] = useState('all')

  const schoolAssignments = useMemo(() => assignments.filter((a) => a.schoolId === school.id), [assignments, school.id])
  const filtered = useMemo(() => schoolAssignments.filter((a) => statusFilter === 'all' || a.status === statusFilter), [schoolAssignments, statusFilter])

  const published = schoolAssignments.filter((a) => a.status === 'published').length
  const grading = schoolAssignments.filter((a) => a.status === 'grading').length
  const avgSubmission = schoolAssignments.length
    ? Math.round((schoolAssignments.reduce((sum, a) => sum + (a.totalStudents ? a.totalSubmissions / a.totalStudents : 0), 0) / schoolAssignments.length) * 100)
    : 0

  function handleDelete(id: string, title: string) {
    setAssignments((prev) => prev.filter((a) => a.id !== id))
    toast.success(`${title} was deleted`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Assignments"
        description={`Create, distribute, and grade assignments at ${school.name}.`}
        actions={
          <Button onClick={() => toast.success('Assignment created')}>
            <Plus className="size-4" /> New Assignment
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="Total Assignments" value={String(schoolAssignments.length)} icon={NotebookPen} accent="primary" change={0} />
        <StatCard index={1} label="Published" value={String(published)} icon={ClipboardCheck} accent="accent" change={0} />
        <StatCard index={2} label="Pending Grading" value={String(grading)} icon={Clock} accent="warning" change={0} />
        <StatCard index={3} label="Avg. Submission Rate" value={`${avgSubmission}%`} icon={ClipboardCheck} accent="primary" change={3.5} />
      </div>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All status</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="published">Published</SelectItem>
          <SelectItem value="grading">Grading</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((a) => {
          const klass = classes.find((c) => c.id === a.classId)
          const subject = subjects.find((s) => s.id === a.subjectId)
          const submissionPercent = a.totalStudents ? Math.round((a.totalSubmissions / a.totalStudents) * 100) : 0

          return (
            <Card key={a.id} className="transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col gap-3 py-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold text-foreground">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {subject?.name} &middot; {klass?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <StatusBadge status={a.status} />
                    <DeleteConfirm title="Delete this assignment?" description={`${a.title} will be permanently deleted.`} onConfirm={() => handleDelete(a.id, a.title)}>
                      <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="size-3.5" />
                      </Button>
                    </DeleteConfirm>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Submissions</span>
                    <span className="font-medium text-foreground">
                      {a.totalSubmissions}/{a.totalStudents}
                    </span>
                  </div>
                  <Progress value={submissionPercent} className="h-1.5" />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Due {formatDate(a.dueDate)}</span>
                  <Badge variant="outline">{a.maxScore} pts</Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
