import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { UsersRound, Baby, Mail, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { DataTable, exportToCsv } from '@/components/shared/data-table'
import { ConfirmDeleteDialog } from '@/components/shared/confirm-delete-dialog'
import { getParentColumns } from '@/features/parents/columns'
import { parents as mockParents } from '@/mock/parents'
import { Button } from '@/components/ui/button'
import { formatNumber } from '@/lib/utils'
import type { Parent } from '@/types'
import { useActiveSchool } from '@/hooks/use-active-school'

export default function ParentsPage() {
  const school = useActiveSchool()
  const [parents, setParents] = useState<Parent[]>(mockParents)
  const [pendingDelete, setPendingDelete] = useState<Parent | null>(null)

  const schoolParents = useMemo(() => parents.filter((p) => p.schoolId === school.id), [parents, school.id])
  const totalChildren = schoolParents.reduce((sum, p) => sum + p.childrenIds.length, 0)
  const multiChild = schoolParents.filter((p) => p.childrenIds.length > 1).length

  const columns = useMemo(() => getParentColumns((p) => setPendingDelete(p)), [])

  function handleDelete() {
    if (!pendingDelete) return
    setParents((prev) => prev.filter((p) => p.id !== pendingDelete.id))
    toast.success(`${pendingDelete.name} was removed`)
    setPendingDelete(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Parents"
        description={`A directory of every parent and guardian at ${school.name}.`}
        actions={
          <Button onClick={() => toast.success('Invite sent')}>
            <Plus className="size-4" /> Invite Parent
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard index={0} label="Total Parents" value={formatNumber(schoolParents.length)} icon={UsersRound} accent="primary" change={2.8} />
        <StatCard index={1} label="Linked Students" value={formatNumber(totalChildren)} icon={Baby} accent="accent" change={4.1} />
        <StatCard index={2} label="Multi-child Families" value={formatNumber(multiChild)} icon={Mail} accent="warning" change={0} />
      </div>

      <DataTable
        columns={columns}
        data={schoolParents}
        searchPlaceholder="Search parents by name..."
        onExport={(rows) => {
          exportToCsv(
            rows.map((p) => ({ name: p.name, email: p.email, phone: p.phone, children: p.childrenIds.length })),
            'parents.csv',
          )
          toast.success('Exported parents.csv')
        }}
      />

      <ConfirmDeleteDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Remove this parent?"
        description={pendingDelete ? `${pendingDelete.name} will be permanently removed from ${school.name}'s records.` : ''}
      />
    </div>
  )
}
