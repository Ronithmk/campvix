import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, CheckCircle2, ClipboardList, Users, Star } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { StatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { teachers } from '@/mock/teachers'
import { classes } from '@/mock/classes'
import { students } from '@/mock/students'
import { assignments } from '@/mock/coursework'
import { subjects } from '@/mock/subjects'
import { formatDate } from '@/lib/utils'
import type { School } from '@/types'

export function TeacherDashboard({ personId, name, school }: { personId: string; name: string; school: School }) {
  const teacher = teachers.find((t) => t.id === personId)
  const myClasses = useMemo(() => classes.filter((c) => c.classTeacherId === personId), [personId])
  const myStudentCount = useMemo(() => students.filter((s) => myClasses.some((c) => c.id === s.classId)).length, [myClasses])
  const myAssignments = useMemo(() => assignments.filter((a) => a.teacherId === personId), [personId])
  const toGrade = myAssignments.filter((a) => a.status === 'grading')
  const recent = myAssignments.slice(0, 5)

  if (!teacher) {
    return <EmptyState icon={BookOpen} title="Teacher record not found" description="This demo account isn't linked to a teacher record." />
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={`Good morning, ${name.split(' ')[0]}`} description={`${teacher.subjects.join(', ')} &middot; ${school.name}`} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="My Classes" value={String(myClasses.length)} icon={Users} accent="primary" />
        <StatCard index={1} label="My Students" value={String(myStudentCount)} icon={BookOpen} accent="accent" />
        <StatCard index={2} label="Assignments to Grade" value={String(toGrade.length)} icon={ClipboardList} accent={toGrade.length > 0 ? 'warning' : 'primary'} />
        <StatCard index={3} label="Performance Score" value={`${teacher.performanceScore}`} icon={Star} accent="primary" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm">My classes</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app/classes">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border pb-4">
            {myClasses.length ? (
              myClasses.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2.5">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{c.name}</span>
                    <span className="text-xs text-muted-foreground">Room {c.room}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{c.strength} students</span>
                </div>
              ))
            ) : (
              <p className="py-4 text-sm text-muted-foreground">You are not assigned as a class teacher.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm">My assignments</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app/assignments">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border pb-4">
            {recent.length ? (
              recent.map((a) => {
                const subject = subjects.find((s) => s.id === a.subjectId)
                const klass = classes.find((c) => c.id === a.classId)
                return (
                  <div key={a.id} className="flex items-center gap-3 py-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg" style={{ background: `${subject?.color}1a`, color: subject?.color }}>
                      <CheckCircle2 className="size-4" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium text-foreground">{a.title}</span>
                      <span className="text-xs text-muted-foreground">{klass?.name} &middot; Due {formatDate(a.dueDate)}</span>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                )
              })
            ) : (
              <p className="py-4 text-sm text-muted-foreground">No assignments created yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {toGrade.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Grading queue</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border pb-4">
            {toGrade.map((a) => {
              const klass = classes.find((c) => c.id === a.classId)
              const progress = a.totalSubmissions ? Math.round((a.graded / a.totalSubmissions) * 100) : 0
              return (
                <div key={a.id} className="flex flex-col gap-2 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{a.title} &middot; {klass?.name}</span>
                    <span className="text-xs text-muted-foreground">{a.graded}/{a.totalSubmissions} graded</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
