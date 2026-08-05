import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Award, BookMarked, CalendarClock, GraduationCap, NotebookPen, TrendingUp, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { StatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { students } from '@/mock/students'
import { results, exams } from '@/mock/exams'
import { homeworkEntries } from '@/mock/coursework'
import { feeRecords } from '@/mock/fees'
import { subjects } from '@/mock/subjects'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { School } from '@/types'

export function StudentDashboard({ personId, name, school }: { personId: string; name: string; school: School }) {
  const student = students.find((s) => s.id === personId)

  const myResults = useMemo(() => results.filter((r) => r.studentId === personId).slice(0, 5), [personId])
  const myHomework = useMemo(() => (student ? homeworkEntries.filter((h) => h.classId === student.classId).slice(0, 5) : []), [student])
  const myExams = useMemo(
    () => (student ? exams.filter((e) => e.classId === student.classId && (e.status === 'upcoming' || e.status === 'ongoing')).slice(0, 4) : []),
    [student],
  )
  const myFees = useMemo(() => feeRecords.filter((f) => f.studentId === personId), [personId])
  const pendingFee = myFees.filter((f) => f.status !== 'paid').reduce((sum, f) => sum + (f.amount - f.paidAmount), 0)

  if (!student) {
    return <EmptyState icon={GraduationCap} title="Student record not found" description="This demo account isn't linked to a student record." />
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={`Good morning, ${name.split(' ')[0]}`} description={`${student.className} - ${student.section} · ${school.name}`} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="Attendance" value={`${student.attendancePercent}%`} icon={TrendingUp} accent={student.attendancePercent < 75 ? 'destructive' : 'primary'} />
        <StatCard index={1} label="GPA" value={student.gpa.toFixed(1)} icon={Award} accent="accent" />
        <StatCard index={2} label="Fee Status" value={pendingFee > 0 ? formatCurrency(pendingFee) : 'All paid'} icon={Wallet} accent={pendingFee > 0 ? 'warning' : 'primary'} />
        <StatCard index={3} label="Upcoming Exams" value={String(myExams.length)} icon={CalendarClock} accent="primary" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm">Recent results</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app/results">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border pb-4">
            {myResults.length ? (
              myResults.map((r) => {
                const exam = exams.find((e) => e.id === r.examId)
                const subject = subjects.find((s) => s.id === exam?.subjectId)
                return (
                  <div key={r.id} className="flex items-center justify-between py-2.5">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">{exam?.name}</span>
                      <span className="text-xs text-muted-foreground">{subject?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{r.marksObtained}/{r.maxMarks}</span>
                      <Badge variant="accent">{r.grade}</Badge>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="py-4 text-sm text-muted-foreground">No results recorded yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm">Homework</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app/homework">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border pb-4">
            {myHomework.map((h) => {
              const subject = subjects.find((s) => s.id === h.subjectId)
              return (
                <div key={h.id} className="flex items-center gap-3 py-2.5">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg" style={{ background: `${subject?.color}1a`, color: subject?.color }}>
                    <BookMarked className="size-4" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">{h.title}</span>
                    <span className="text-xs text-muted-foreground">{subject?.name} &middot; {formatDate(h.date)}</span>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-sm">Upcoming examinations</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/app/examinations">View all</Link>
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border pb-4">
          {myExams.length ? (
            myExams.map((e) => {
              const subject = subjects.find((s) => s.id === e.subjectId)
              return (
                <div key={e.id} className="flex items-center gap-3 py-2.5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <NotebookPen className="size-4" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="text-sm font-medium text-foreground">{e.name} &middot; {subject?.name}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(e.date)}</span>
                  </div>
                  <StatusBadge status={e.status} />
                </div>
              )
            })
          ) : (
            <p className="py-4 text-sm text-muted-foreground">No upcoming exams scheduled.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
