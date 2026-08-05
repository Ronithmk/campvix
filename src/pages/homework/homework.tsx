import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { BookMarked, CalendarDays, CheckCircle2, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { DeleteConfirm } from '@/components/shared/delete-confirm'
import { homeworkEntries as mockHomework } from '@/mock/coursework'
import { classes } from '@/mock/classes'
import { subjects } from '@/mock/subjects'
import { formatDate } from '@/lib/utils'
import type { HomeworkEntry } from '@/types'
import { useActiveSchool } from '@/hooks/use-active-school'

export default function HomeworkPage() {
  const school = useActiveSchool()
  const [homeworkEntries, setHomeworkEntries] = useState<HomeworkEntry[]>(mockHomework)

  const schoolHomework = useMemo(() => homeworkEntries.filter((h) => h.schoolId === school.id), [homeworkEntries, school.id])
  const avgCompletion = schoolHomework.length ? Math.round(schoolHomework.reduce((sum, h) => sum + h.completionPercent, 0) / schoolHomework.length) : 0
  const dueToday = schoolHomework.filter((h) => new Date(h.date).toDateString() === new Date().toDateString()).length

  function handleDelete(id: string, title: string) {
    setHomeworkEntries((prev) => prev.filter((h) => h.id !== id))
    toast.success(`${title} was deleted`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Homework"
        description={`Daily homework diary tracked across every class at ${school.name}.`}
        actions={
          <Button onClick={() => toast.success('Homework assigned')}>
            <Plus className="size-4" /> Assign Homework
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard index={0} label="Total Entries" value={String(schoolHomework.length)} icon={BookMarked} accent="primary" change={0} />
        <StatCard index={1} label="Assigned Today" value={String(dueToday)} icon={CalendarDays} accent="warning" change={0} />
        <StatCard index={2} label="Avg. Completion" value={`${avgCompletion}%`} icon={CheckCircle2} accent="accent" change={1.8} />
      </div>

      <div className="flex flex-col gap-3">
        {schoolHomework.map((h) => {
          const klass = classes.find((c) => c.id === h.classId)
          const subject = subjects.find((s) => s.id === h.subjectId)
          return (
            <Card key={h.id}>
              <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg" style={{ background: `${subject?.color}1a`, color: subject?.color }}>
                  <BookMarked className="size-4.5" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="text-sm font-medium text-foreground">{h.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {subject?.name} &middot; {klass?.name} &middot; {formatDate(h.date)}
                  </p>
                </div>
                <div className="flex w-full items-center gap-2 sm:w-40">
                  <Progress value={h.completionPercent} className="h-1.5" />
                  <span className="w-9 shrink-0 text-right text-xs font-medium text-foreground">{h.completionPercent}%</span>
                </div>
                <DeleteConfirm title="Delete this homework entry?" description={`${h.title} will be permanently deleted.`} onConfirm={() => handleDelete(h.id, h.title)}>
                  <Button variant="ghost" size="icon-sm" className="shrink-0 text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-3.5" />
                  </Button>
                </DeleteConfirm>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
