import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Briefcase, UserCheck, Car, BookMarked, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { DataTable, exportToCsv } from '@/components/shared/data-table'
import { ConfirmDeleteDialog } from '@/components/shared/confirm-delete-dialog'
import { getStaffColumns } from '@/features/staff/columns'
import { staff as mockStaff } from '@/mock/staff'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatNumber } from '@/lib/utils'
import type { Staff } from '@/types'
import { useActiveSchool } from '@/hooks/use-active-school'

export default function StaffPage() {
  const school = useActiveSchool()
  const [staff, setStaff] = useState<Staff[]>(mockStaff)
  const [roleFilter, setRoleFilter] = useState('all')
  const [pendingDelete, setPendingDelete] = useState<Staff | null>(null)

  const schoolStaff = useMemo(() => staff.filter((s) => s.schoolId === school.id), [staff, school.id])
  const filtered = useMemo(() => schoolStaff.filter((s) => roleFilter === 'all' || s.role === roleFilter), [schoolStaff, roleFilter])

  const active = schoolStaff.filter((s) => s.status === 'active').length
  const drivers = schoolStaff.filter((s) => s.role === 'driver').length
  const librarians = schoolStaff.filter((s) => s.role === 'librarian').length

  const columns = useMemo(() => getStaffColumns((s) => setPendingDelete(s)), [])

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
          <Button onClick={() => toast.success('Staff member added')}>
            <Plus className="size-4" /> Add Staff
          </Button>
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
