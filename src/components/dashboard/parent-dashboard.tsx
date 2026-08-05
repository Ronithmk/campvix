import { Link } from 'react-router-dom'
import { Baby, TrendingUp, Wallet, MessageSquareText } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { parents } from '@/mock/parents'
import { students } from '@/mock/students'
import { feeRecords } from '@/mock/fees'
import { formatCurrency, initials } from '@/lib/utils'
import type { School } from '@/types'

export function ParentDashboard({ personId, name, school }: { personId: string; name: string; school: School }) {
  const parent = parents.find((p) => p.id === personId)
  const children = parent ? students.filter((s) => parent.childrenIds.includes(s.id)) : []

  if (!parent || children.length === 0) {
    return <EmptyState icon={Baby} title="No linked children found" description="This demo account isn't linked to any student records." />
  }

  const totalDue = children.reduce((sum, c) => {
    const fees = feeRecords.filter((f) => f.studentId === c.id && f.status !== 'paid')
    return sum + fees.reduce((s, f) => s + (f.amount - f.paidAmount), 0)
  }, 0)
  const avgAttendance = Math.round(children.reduce((sum, c) => sum + c.attendancePercent, 0) / children.length)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={`Welcome, ${name.split(' ')[0]}`} description={`You have ${children.length} ${children.length === 1 ? 'child' : 'children'} enrolled at ${school.name}.`} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard index={0} label="Children Enrolled" value={String(children.length)} icon={Baby} accent="primary" />
        <StatCard index={1} label="Avg. Attendance" value={`${avgAttendance}%`} icon={TrendingUp} accent="accent" />
        <StatCard index={2} label="Fees Due" value={formatCurrency(totalDue)} icon={Wallet} accent={totalDue > 0 ? 'warning' : 'primary'} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {children.map((child) => {
          const dues = feeRecords.filter((f) => f.studentId === child.id && f.status !== 'paid').reduce((s, f) => s + (f.amount - f.paidAmount), 0)
          return (
            <Card key={child.id}>
              <CardContent className="flex flex-col gap-4 py-5">
                <div className="flex items-center gap-3">
                  <Avatar className="size-12">
                    <AvatarImage src={child.avatarUrl} alt={child.name} />
                    <AvatarFallback>{initials(child.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="truncate text-sm font-semibold text-foreground">{child.name}</p>
                    <p className="text-xs text-muted-foreground">{child.className} - {child.section} &middot; Roll {child.rollNo}</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/app/students/${child.id}`}>View</Link>
                  </Button>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Attendance</span>
                    <span className="font-medium text-foreground">{child.attendancePercent}%</span>
                  </div>
                  <Progress value={child.attendancePercent} className="h-1.5" indicatorClassName={child.attendancePercent < 75 ? 'bg-destructive' : undefined} />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">GPA</span>
                  <span className="font-medium text-foreground">{child.gpa.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Fees due</span>
                  <span className={dues > 0 ? 'font-medium text-warning' : 'font-medium text-success'}>{dues > 0 ? formatCurrency(dues) : 'All paid'}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardContent className="flex items-center gap-3 py-5">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MessageSquareText className="size-4.5" />
          </div>
          <div className="flex flex-1 flex-col">
            <p className="text-sm font-medium text-foreground">Message a teacher</p>
            <p className="text-xs text-muted-foreground">Reach out about your child's progress or attendance</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/app/chat">Open chat</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
