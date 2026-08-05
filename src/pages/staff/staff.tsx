import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Briefcase, UserCheck, Car, BookMarked, Plus, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { DataTable, exportToCsv } from '@/components/shared/data-table'
import { ConfirmDeleteDialog } from '@/components/shared/confirm-delete-dialog'
import { getStaffColumns } from '@/features/staff/columns'
import { staff as mockStaff } from '@/mock/staff'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { formatNumber, sleep } from '@/lib/utils'
import type { Staff } from '@/types'
import { useActiveSchool } from '@/hooks/use-active-school'

const staffSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  role: z.enum(['accountant', 'receptionist', 'driver', 'librarian', 'admin_staff'], { required_error: 'Select a role' }),
})

type StaffValues = z.infer<typeof staffSchema>

export default function StaffPage() {
  const school = useActiveSchool()
  const [staff, setStaff] = useState<Staff[]>(mockStaff)
  const [roleFilter, setRoleFilter] = useState('all')
  const [pendingDelete, setPendingDelete] = useState<Staff | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const schoolStaff = useMemo(() => staff.filter((s) => s.schoolId === school.id), [staff, school.id])
  const filtered = useMemo(() => schoolStaff.filter((s) => roleFilter === 'all' || s.role === roleFilter), [schoolStaff, roleFilter])

  const active = schoolStaff.filter((s) => s.status === 'active').length
  const drivers = schoolStaff.filter((s) => s.role === 'driver').length
  const librarians = schoolStaff.filter((s) => s.role === 'librarian').length

  const columns = useMemo(() => getStaffColumns((s) => setPendingDelete(s)), [])

  const form = useForm<StaffValues>({ resolver: zodResolver(staffSchema), defaultValues: { name: '', email: '', role: 'accountant' } })

  async function onSubmit(values: StaffValues) {
    await sleep(500)
    const newStaff: Staff = {
      id: `staff-new-${Date.now()}`,
      schoolId: school.id,
      name: values.name,
      avatarUrl: `https://avatars.githubusercontent.com/u/${Math.floor(Math.random() * 900000)}?v=4`,
      role: values.role,
      email: values.email,
      phone: '+91 90000 00000',
      joiningDate: new Date().toISOString(),
      status: 'active',
    }
    setStaff((prev) => [newStaff, ...prev])
    toast.success(`${values.name} was added`)
    setDialogOpen(false)
    form.reset()
  }

  function handleDelete() {
    if (!pendingDelete) return
    setStaff((prev) => prev.filter((s) => s.id !== pendingDelete.id))
    toast.success(`${pendingDelete.name} was removed`)
    setPendingDelete(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Staff"
        description={`Manage non-teaching staff at ${school.name}.`}
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" /> Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a staff member</DialogTitle>
                <DialogDescription>Fill in the details below to add non-teaching staff at {school.name}.</DialogDescription>
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
                          <Input placeholder="Priya Nair" {...field} />
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
                          <Input placeholder="priya@school.edu" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="accountant">Accountant</SelectItem>
                            <SelectItem value="receptionist">Receptionist</SelectItem>
                            <SelectItem value="driver">Driver</SelectItem>
                            <SelectItem value="librarian">Librarian</SelectItem>
                            <SelectItem value="admin_staff">Admin Staff</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
                      Save staff member
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="Total Staff" value={formatNumber(schoolStaff.length)} icon={Briefcase} accent="primary" change={3.4} />
        <StatCard index={1} label="Active" value={formatNumber(active)} icon={UserCheck} accent="accent" change={1.2} />
        <StatCard index={2} label="Drivers" value={formatNumber(drivers)} icon={Car} accent="warning" change={0} />
        <StatCard index={3} label="Librarians" value={formatNumber(librarians)} icon={BookMarked} accent="primary" change={0} />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search staff by name..."
        onExport={(rows) => {
          exportToCsv(
            rows.map((s) => ({ name: s.name, role: s.role, email: s.email, status: s.status })),
            'staff.csv',
          )
          toast.success('Exported staff.csv')
        }}
        toolbar={
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger size="sm" className="w-40">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="accountant">Accountant</SelectItem>
              <SelectItem value="receptionist">Receptionist</SelectItem>
              <SelectItem value="driver">Driver</SelectItem>
              <SelectItem value="librarian">Librarian</SelectItem>
              <SelectItem value="admin_staff">Admin Staff</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <ConfirmDeleteDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Remove this staff member?"
        description={pendingDelete ? `${pendingDelete.name} will be permanently removed from ${school.name}'s staff records.` : ''}
      />
    </div>
  )
}
