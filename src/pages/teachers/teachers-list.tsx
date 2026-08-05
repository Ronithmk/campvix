import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { GraduationCap, UserCheck, Plane, TrendingUp, Plus, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { DataTable, exportToCsv } from '@/components/shared/data-table'
import { ConfirmDeleteDialog } from '@/components/shared/confirm-delete-dialog'
import { getTeacherColumns } from '@/features/teachers/columns'
import { teachers as mockTeachers } from '@/mock/teachers'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { formatNumber, sleep } from '@/lib/utils'
import type { Teacher } from '@/types'
import { useActiveSchool } from '@/hooks/use-active-school'

const teacherSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  subjectsInput: z.string().min(1, 'Enter at least one subject'),
  qualification: z.string().min(2, 'Qualification is required'),
})

type TeacherValues = z.infer<typeof teacherSchema>

export default function TeachersListPage() {
  const school = useActiveSchool()
  const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers)
  const [statusFilter, setStatusFilter] = useState('all')
  const [pendingDelete, setPendingDelete] = useState<Teacher | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const schoolTeachers = useMemo(() => teachers.filter((t) => t.schoolId === school.id), [teachers, school.id])
  const filtered = useMemo(() => schoolTeachers.filter((t) => statusFilter === 'all' || t.status === statusFilter), [schoolTeachers, statusFilter])

  const active = schoolTeachers.filter((t) => t.status === 'active').length
  const onLeave = schoolTeachers.filter((t) => t.status === 'on_leave').length
  const avgPerformance = schoolTeachers.length ? Math.round(schoolTeachers.reduce((sum, t) => sum + t.performanceScore, 0) / schoolTeachers.length) : 0

  const columns = useMemo(() => getTeacherColumns((teacher) => setPendingDelete(teacher)), [])

  const form = useForm<TeacherValues>({ resolver: zodResolver(teacherSchema), defaultValues: { name: '', email: '', subjectsInput: '', qualification: '' } })

  async function onSubmit(values: TeacherValues) {
    await sleep(500)
    const subjectsList = values.subjectsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const newTeacher: Teacher = {
      id: `teacher-new-${Date.now()}`,
      schoolId: school.id,
      employeeId: `EMP-${String(2000 + teachers.length)}`,
      name: values.name,
      avatarUrl: `https://avatars.githubusercontent.com/u/${Math.floor(Math.random() * 900000)}?v=4`,
      gender: 'female',
      email: values.email,
      phone: '+91 90000 00000',
      subjects: subjectsList,
      classes: [],
      qualification: values.qualification,
      experienceYears: 1,
      joiningDate: new Date().toISOString(),
      status: 'active',
      salary: 40000,
      address: 'Not provided',
      performanceScore: 75,
    }
    setTeachers((prev) => [newTeacher, ...prev])
    toast.success(`${values.name} was added to the faculty`)
    setDialogOpen(false)
    form.reset()
  }

  function handleDelete() {
    if (!pendingDelete) return
    setTeachers((prev) => prev.filter((t) => t.id !== pendingDelete.id))
    toast.success(`${pendingDelete.name} was removed`)
    setPendingDelete(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Teachers"
        description={`Manage faculty profiles, subjects, and performance at ${school.name}.`}
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" /> Add Teacher
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a new teacher</DialogTitle>
                <DialogDescription>Fill in the details below to add a teacher to {school.name}.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name</FormLabel>
                        <FormControl>
                          <Input placeholder="Amber Pfannerstill" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="amber@school.edu" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subjectsInput"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subjects taught</FormLabel>
                        <FormControl>
                          <Input placeholder="Mathematics, Physics" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="qualification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qualification</FormLabel>
                        <FormControl>
                          <Input placeholder="M.Ed" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
                      Save teacher
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="Total Teachers" value={formatNumber(schoolTeachers.length)} icon={GraduationCap} accent="primary" change={1.8} />
        <StatCard index={1} label="Active" value={formatNumber(active)} icon={UserCheck} accent="accent" change={0.9} />
        <StatCard index={2} label="On Leave" value={formatNumber(onLeave)} icon={Plane} accent="warning" change={-2.4} />
        <StatCard index={3} label="Avg. Performance" value={`${avgPerformance}/100`} icon={TrendingUp} accent="primary" change={3.2} />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search teachers by name, employee ID..."
        emptyLabel="No teachers match your filters"
        onExport={(rows) => {
          exportToCsv(
            rows.map((t) => ({ name: t.name, employeeId: t.employeeId, subjects: t.subjects.join('; '), status: t.status, performance: t.performanceScore })),
            'teachers.csv',
          )
          toast.success('Exported teachers.csv')
        }}
        toolbar={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger size="sm" className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on_leave">On Leave</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <ConfirmDeleteDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Remove this teacher?"
        description={pendingDelete ? `${pendingDelete.name} (${pendingDelete.employeeId}) will be permanently removed from ${school.name}'s faculty records.` : ''}
      />
    </div>
  )
}
