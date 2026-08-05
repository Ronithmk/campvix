import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Loader2, Users, UserCheck, TrendingUp, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { DataTable, exportToCsv } from '@/components/shared/data-table'
import { ConfirmDeleteDialog } from '@/components/shared/confirm-delete-dialog'
import { getStudentColumns } from '@/features/students/columns'
import { students as mockStudents } from '@/mock/students'
import { classes as allClasses } from '@/mock/classes'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { formatNumber, sleep } from '@/lib/utils'
import type { Student } from '@/types'
import { useActiveSchool } from '@/hooks/use-active-school'

const studentSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  classId: z.string().min(1, 'Select a class'),
  parentName: z.string().min(2, 'Parent name is required'),
})

type StudentValues = z.infer<typeof studentSchema>

export default function StudentsListPage() {
  const school = useActiveSchool()
  const [students, setStudents] = useState<Student[]>(mockStudents)
  const [classFilter, setClassFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Student | null>(null)

  const form = useForm<StudentValues>({ resolver: zodResolver(studentSchema), defaultValues: { name: '', email: '', classId: '', parentName: '' } })

  const schoolClasses = useMemo(() => allClasses.filter((c) => c.schoolId === school.id), [school.id])
  const schoolStudents = useMemo(() => students.filter((s) => s.schoolId === school.id), [students, school.id])

  const filtered = useMemo(() => {
    return schoolStudents.filter((s) => (classFilter === 'all' || s.classId === classFilter) && (statusFilter === 'all' || s.status === statusFilter))
  }, [schoolStudents, classFilter, statusFilter])

  const activeCount = schoolStudents.filter((s) => s.status === 'active').length
  const avgAttendance = schoolStudents.length ? Math.round(schoolStudents.reduce((sum, s) => sum + s.attendancePercent, 0) / schoolStudents.length) : 0
  const overdueFees = schoolStudents.filter((s) => s.feeStatus === 'overdue').length

  const columns = useMemo(() => getStudentColumns((student) => setPendingDelete(student)), [])

  async function onSubmit(values: StudentValues) {
    await sleep(500)
    const klass = schoolClasses.find((c) => c.id === values.classId)!
    const newStudent: Student = {
      id: `student-new-${Date.now()}`,
      schoolId: school.id,
      admissionNo: `ADM-${2600 + students.length}`,
      name: values.name,
      avatarUrl: `https://avatars.githubusercontent.com/u/${Math.floor(Math.random() * 900000)}?v=4`,
      gender: 'male',
      dateOfBirth: new Date(2014, 0, 1).toISOString(),
      classId: klass.id,
      className: klass.name.split(' - ')[0],
      section: klass.sections[0],
      rollNo: schoolStudents.length + 1,
      status: 'active',
      email: values.email,
      phone: '+91 90000 00000',
      address: 'Not provided',
      bloodGroup: 'O+',
      parentId: 'parent-new',
      parentName: values.parentName,
      transportRoute: null,
      hostelRoom: null,
      admissionDate: new Date().toISOString(),
      feeStatus: 'pending',
      attendancePercent: 100,
      gpa: 0,
    }
    setStudents((prev) => [newStudent, ...prev])
    toast.success(`${values.name} has been enrolled`)
    setDialogOpen(false)
    form.reset()
  }

  function handleDelete() {
    if (!pendingDelete) return
    setStudents((prev) => prev.filter((s) => s.id !== pendingDelete.id))
    toast.success(`${pendingDelete.name} was removed`)
    setPendingDelete(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Students"
        description={`Manage enrollment, academics, and records for every student at ${school.name}.`}
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" /> Add Student
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enroll a new student</DialogTitle>
                <DialogDescription>Fill in the details below to add a student to {school.name}.</DialogDescription>
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
                          <Input placeholder="Aarav Mehta" {...field} />
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
                          <Input placeholder="aarav@student.edu" {...field} />
                        </FormControl>
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
                    name="parentName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent / Guardian name</FormLabel>
                        <FormControl>
                          <Input placeholder="Rohan Mehta" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
                      Enroll student
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="Total Students" value={formatNumber(schoolStudents.length)} icon={Users} accent="primary" change={4.2} />
        <StatCard index={1} label="Active" value={formatNumber(activeCount)} icon={UserCheck} accent="accent" change={2.1} />
        <StatCard index={2} label="Avg. Attendance" value={`${avgAttendance}%`} icon={TrendingUp} accent="warning" change={-0.6} />
        <StatCard index={3} label="Overdue Fees" value={formatNumber(overdueFees)} icon={Wallet} accent="destructive" change={-5.3} />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search students by name, admission no..."
        emptyLabel="No students match your filters"
        onExport={(rows) => {
          exportToCsv(
            rows.map((s) => ({ name: s.name, admissionNo: s.admissionNo, class: `${s.className} ${s.section}`, status: s.status, feeStatus: s.feeStatus })),
            'students.csv',
          )
          toast.success('Exported students.csv')
        }}
        toolbar={
          <div className="flex items-center gap-2">
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger size="sm" className="w-36">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All classes</SelectItem>
                {schoolClasses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger size="sm" className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="graduated">Graduated</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <ConfirmDeleteDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Remove this student?"
        description={pendingDelete ? `${pendingDelete.name} (${pendingDelete.admissionNo}) will be permanently removed from ${school.name}'s records.` : ''}
      />
    </div>
  )
}
