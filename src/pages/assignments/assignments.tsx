import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { NotebookPen, ClipboardCheck, Clock, Plus, Trash2, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge } from '@/components/shared/status-badge'
import { DeleteConfirm } from '@/components/shared/delete-confirm'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { assignments as mockAssignments } from '@/mock/coursework'
import { classes } from '@/mock/classes'
import { subjects } from '@/mock/subjects'
import { teachers } from '@/mock/teachers'
import { formatDate, sleep } from '@/lib/utils'
import type { Assignment } from '@/types'
import { useActiveSchool } from '@/hooks/use-active-school'
import { useAuthStore } from '@/store/auth-store'
import { students } from '@/mock/students'

const assignmentSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  subjectId: z.string().min(1, 'Select a subject'),
  classId: z.string().min(1, 'Select a class'),
  dueDate: z.string().min(1, 'Due date is required'),
})

type AssignmentValues = z.infer<typeof assignmentSchema>

export default function AssignmentsPage() {
  const school = useActiveSchool()
  const role = useAuthStore((s) => s.role)
  const personId = useAuthStore((s) => s.personId)
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments)
  const [statusFilter, setStatusFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)

  const studentClassId = useMemo(() => {
    if (role !== 'student' || !personId) return null
    return students.find((student) => student.id === personId && student.schoolId === school.id)?.classId ?? null
  }, [personId, role, school.id])

  const schoolAssignments = useMemo(
    () => assignments.filter((a) =>
      a.schoolId === school.id &&
      (role !== 'student' ? true : !!studentClassId && a.classId === studentClassId && a.status !== 'draft'),
    ),
    [assignments, role, school.id, studentClassId],
  )
  const filtered = useMemo(() => schoolAssignments.filter((a) => statusFilter === 'all' || a.status === statusFilter), [schoolAssignments, statusFilter])
  const schoolClasses = useMemo(() => classes.filter((c) => c.schoolId === school.id), [school.id])
  const schoolTeachers = useMemo(() => teachers.filter((t) => t.schoolId === school.id), [school.id])

  const published = schoolAssignments.filter((a) => a.status === 'published').length
  const grading = schoolAssignments.filter((a) => a.status === 'grading').length
  const avgSubmission = schoolAssignments.length
    ? Math.round((schoolAssignments.reduce((sum, a) => sum + (a.totalStudents ? a.totalSubmissions / a.totalStudents : 0), 0) / schoolAssignments.length) * 100)
    : 0

  const form = useForm<AssignmentValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: { title: '', subjectId: '', classId: '', dueDate: new Date().toISOString().slice(0, 10) },
  })

  async function onSubmit(values: AssignmentValues) {
    await sleep(500)
    const klass = schoolClasses.find((c) => c.id === values.classId)!
    const newAssignment: Assignment = {
      id: `assignment-new-${Date.now()}`,
      schoolId: school.id,
      title: values.title,
      subjectId: values.subjectId,
      classId: values.classId,
      teacherId: schoolTeachers[0]?.id ?? '',
      assignedDate: new Date().toISOString(),
      dueDate: new Date(values.dueDate).toISOString(),
      totalSubmissions: 0,
      totalStudents: klass.strength,
      graded: 0,
      status: 'draft',
      maxScore: 100,
    }
    setAssignments((prev) => [newAssignment, ...prev])
    toast.success(`${newAssignment.title} was created`)
    setDialogOpen(false)
    form.reset()
  }

  function handleDelete(id: string, title: string) {
    setAssignments((prev) => prev.filter((a) => a.id !== id))
    toast.success(`${title} was deleted`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Assignments"
        description={role === 'student' ? `Your assignments for ${school.name}.` : `Create, distribute, and grade assignments at ${school.name}.`}
        actions={
          role === 'student'
            ? undefined
            : (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="size-4" /> New Assignment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create a new assignment</DialogTitle>
                      <DialogDescription>Set up the assignment — you can publish it once it's ready.</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Algebra Problem Set" {...field} />
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
                          name="dueDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Due date</FormLabel>
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
                            Create assignment
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )
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
                  {role !== 'student' && (
                    <div className="flex items-center gap-1">
                      <StatusBadge status={a.status} />
                      <DeleteConfirm title="Delete this assignment?" description={`${a.title} will be permanently deleted.`} onConfirm={() => handleDelete(a.id, a.title)}>
                        <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="size-3.5" />
                        </Button>
                      </DeleteConfirm>
                    </div>
                  )}
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
