import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { School, Users, DoorOpen, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DeleteConfirm } from '@/components/shared/delete-confirm'
import { classes as mockClasses } from '@/mock/classes'
import { teachers } from '@/mock/teachers'
import { formatNumber, initials } from '@/lib/utils'
import type { SchoolClass } from '@/types'
import { useActiveSchool } from '@/hooks/use-active-school'

export default function ClassesPage() {
  const school = useActiveSchool()
  const [classes, setClasses] = useState<SchoolClass[]>(mockClasses)

  const schoolClasses = useMemo(() => classes.filter((c) => c.schoolId === school.id), [classes, school.id])
  const totalStrength = schoolClasses.reduce((sum, c) => sum + c.strength, 0)
  const avgStrength = schoolClasses.length ? Math.round(totalStrength / schoolClasses.length) : 0

  function handleDelete(id: string, name: string) {
    setClasses((prev) => prev.filter((c) => c.id !== id))
    toast.success(`${name} was removed`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Classes"
        description={`Configure grades, class teachers, and room assignments at ${school.name}.`}
        actions={
          <Button onClick={() => toast.success('Class created')}>
            <Plus className="size-4" /> Add Class
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard index={0} label="Total Classes" value={String(schoolClasses.length)} icon={School} accent="primary" change={0} />
        <StatCard index={1} label="Total Students" value={formatNumber(totalStrength)} icon={Users} accent="accent" change={4.2} />
        <StatCard index={2} label="Avg. Class Size" value={String(avgStrength)} icon={DoorOpen} accent="warning" change={-1.1} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {schoolClasses.map((klass) => {
          const teacher = teachers.find((t) => t.id === klass.classTeacherId)
          const fillPercent = Math.round((klass.strength / 42) * 100)
          return (
            <Card key={klass.id} className="transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col gap-4 py-5">
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-foreground">{klass.name}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">{klass.room}</span>
                    <DeleteConfirm title="Delete this class?" description={`${klass.name} will be permanently deleted. This does not remove enrolled students.`} onConfirm={() => handleDelete(klass.id, klass.name)}>
                      <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="size-3.5" />
                      </Button>
                    </DeleteConfirm>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Avatar className="size-8">
                    <AvatarImage src={teacher?.avatarUrl} alt={teacher?.name} />
                    <AvatarFallback>{teacher ? initials(teacher.name) : '?'}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Class Teacher</span>
                    <span className="text-sm font-medium text-foreground">{teacher?.name ?? 'Unassigned'}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Strength</span>
                    <span className="font-medium text-foreground">{klass.strength} students</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${fillPercent}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
