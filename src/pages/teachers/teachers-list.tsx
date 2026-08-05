import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { GraduationCap, UserCheck, Plane, TrendingUp, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { DataTable, exportToCsv } from '@/components/shared/data-table'
import { ConfirmDeleteDialog } from '@/components/shared/confirm-delete-dialog'
import { getTeacherColumns } from '@/features/teachers/columns'
import { teachers as mockTeachers } from '@/mock/teachers'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatNumber } from '@/lib/utils'
import type { Teacher } from '@/types'
import { useActiveSchool } from '@/hooks/use-active-school'

export default function TeachersListPage() {
  const school = useActiveSchool()
  const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers)
  const [statusFilter, setStatusFilter] = useState('all')
  const [pendingDelete, setPendingDelete] = useState<Teacher | null>(null)

  const schoolTeachers = useMemo(() => teachers.filter((t) => t.schoolId === school.id), [teachers, school.id])
  const filtered = useMemo(() => schoolTeachers.filter((t) => statusFilter === 'all' || t.status === statusFilter), [schoolTeachers, statusFilter])

  const active = schoolTeachers.filter((t) => t.status === 'active').length
  const onLeave = schoolTeachers.filter((t) => t.status === 'on_leave').length
  const avgPerformance = schoolTeachers.length ? Math.round(schoolTeachers.reduce((sum, t) => sum + t.performanceScore, 0) / schoolTeachers.length) : 0

  const columns = useMemo(() => getTeacherColumns((teacher) => setPendingDelete(teacher)), [])

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
          <Button onClick={() => toast.info('Add teacher form coming soon')}>
            <Plus className="size-4" /> Add Teacher
          </Button>
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
