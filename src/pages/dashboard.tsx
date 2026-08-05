import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowRight,
  CakeIcon,
  CalendarClock,
  CreditCard,
  GraduationCap,
  ReceiptText,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { ChartTooltip } from '@/components/shared/chart-tooltip'
import { StatusBadge } from '@/components/shared/status-badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { students, teachers, feeRecords, payments, classes, calendarEvents, notifications, attendanceRecords, buildAttendanceTrend, buildRevenueTrend } from '@/mock'
import { formatCurrency, formatDate, formatNumber, initials } from '@/lib/utils'
import { useActiveSchool } from '@/hooks/use-active-school'
import { useAuthStore } from '@/store/auth-store'
import { StudentDashboard } from '@/components/dashboard/student-dashboard'
import { TeacherDashboard } from '@/components/dashboard/teacher-dashboard'
import { ParentDashboard } from '@/components/dashboard/parent-dashboard'

const QUICK_ACTIONS = [
  { label: 'Add Student', icon: UserPlus, to: '/app/students' },
  { label: 'Mark Attendance', icon: UserCheck, to: '/app/attendance' },
  { label: 'Create Invoice', icon: ReceiptText, to: '/app/finance/invoices' },
  { label: 'Record Payment', icon: CreditCard, to: '/app/finance/payments' },
]

export default function DashboardPage() {
  const school = useActiveSchool()
  const { role, personId, name: userName } = useAuthStore()

  if (role === 'student' && personId) return <StudentDashboard personId={personId} name={userName} school={school} />
  if (role === 'teacher' && personId) return <TeacherDashboard personId={personId} name={userName} school={school} />
  if (role === 'parent' && personId) return <ParentDashboard personId={personId} name={userName} school={school} />

  const schoolStudents = useMemo(() => students.filter((s) => s.schoolId === school.id), [school.id])
  const schoolTeachers = useMemo(() => teachers.filter((t) => t.schoolId === school.id), [school.id])
  const schoolFeeRecords = useMemo(() => feeRecords.filter((f) => f.schoolId === school.id), [school.id])
  const schoolPayments = useMemo(() => payments.filter((p) => p.schoolId === school.id), [school.id])
  const schoolClasses = useMemo(() => classes.filter((c) => c.schoolId === school.id), [school.id])
  const schoolAttendance = useMemo(() => attendanceRecords.filter((a) => a.schoolId === school.id), [school.id])
  const attendanceTrend = useMemo(() => buildAttendanceTrend(schoolAttendance), [schoolAttendance])
  const revenueTrend = useMemo(() => buildRevenueTrend(school.id), [school.id])

  const totalStudents = schoolStudents.length
  const activeTeachers = schoolTeachers.filter((t) => t.status === 'active').length
  const totalRevenue = schoolPayments.reduce((sum, p) => sum + p.amount, 0)
  const pendingFees = schoolFeeRecords.filter((f) => f.status === 'pending' || f.status === 'overdue')
  const pendingAmount = pendingFees.reduce((sum, f) => sum + (f.amount - f.paidAmount), 0)
  const avgAttendance = attendanceTrend.length ? Math.round(attendanceTrend.reduce((sum, d) => sum + d.percent, 0) / attendanceTrend.length) : 0

  const genderData = useMemo(() => {
    const male = schoolStudents.filter((s) => s.gender === 'male').length
    const female = schoolStudents.length - male
    return [
      { name: 'Male', value: male },
      { name: 'Female', value: female },
    ]
  }, [schoolStudents])

  const classStrength = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of schoolClasses) {
      const grade = c.name.split(' - ')[0]
      map.set(grade, (map.get(grade) ?? 0) + c.strength)
    }
    return Array.from(map.entries()).map(([grade, strength]) => ({ grade, strength }))
  }, [schoolClasses])

  const birthdaysThisWeek = schoolStudents.slice(2, 5)
  const upcomingEvents = calendarEvents.slice(0, 4)
  const recentNotifications = notifications.slice(0, 4)
  const latestPayments = schoolPayments.slice(0, 5)
  const todaysClasses = schoolClasses.slice(0, 4).map((c, i) => ({
    class: c.name,
    subject: ['Mathematics', 'English', 'Science', 'Computer Science'][i],
    time: ['09:00 AM', '10:15 AM', '11:30 AM', '01:00 PM'][i],
    teacher: schoolTeachers.find((t) => t.id === c.classTeacherId)?.name ?? 'Staff',
  }))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Good morning, ${userName.split(' ')[0]}`}
        description={`Here's what's happening across ${school.name} today.`}
        actions={
          <Button asChild>
            <Link to="/app/reports">
              View reports <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard index={0} label="Total Students" value={formatNumber(totalStudents)} change={4.2} icon={Users} accent="primary" />
        <StatCard index={1} label="Active Teachers" value={formatNumber(activeTeachers)} change={1.8} icon={GraduationCap} accent="accent" />
        <StatCard index={2} label="Revenue (30d)" value={formatCurrency(totalRevenue)} change={8.6} icon={Wallet} accent="primary" />
        <StatCard index={3} label="Avg. Attendance" value={`${avgAttendance}%`} change={-1.4} icon={UserCheck} accent="warning" />
        <StatCard index={4} label="Pending Fees" value={formatCurrency(pendingAmount)} change={-3.1} changeLabel="vs last week" icon={ReceiptText} accent="destructive" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Revenue overview</CardTitle>
              <CardDescription>Collected fees vs monthly target</CardDescription>
            </div>
            <Badge variant="accent">+8.6% MoM</Badge>
          </CardHeader>
          <CardContent className="h-72 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ left: -12, right: 12, top: 8 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} width={44} />
                <RechartsTooltip content={ChartTooltip} />
                <Area type="monotone" dataKey="target" name="Target" stroke="var(--muted-foreground)" strokeDasharray="4 4" strokeWidth={2} fill="none" dot={false} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="var(--color-chart-1)" strokeWidth={2.5} fill="url(#revenueFill)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gender ratio</CardTitle>
            <CardDescription>Current student enrollment</CardDescription>
          </CardHeader>
          <CardContent className="flex h-72 flex-col items-center justify-center pb-4">
            <ResponsiveContainer width="100%" height="70%">
              <PieChart>
                <Pie data={genderData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={3} strokeWidth={0}>
                  <Cell fill="var(--color-chart-1)" />
                  <Cell fill="var(--color-chart-2)" />
                </Pie>
                <RechartsTooltip content={ChartTooltip} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-5 text-xs">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[var(--color-chart-1)]" /> Male &middot; {genderData[0].value}</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[var(--color-chart-2)]" /> Female &middot; {genderData[1].value}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Attendance trend</CardTitle>
            <CardDescription>Last 14 school days</CardDescription>
          </CardHeader>
          <CardContent className="h-60 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrend} margin={{ left: -18, right: 12, top: 8 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} interval={1} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} domain={[60, 100]} width={32} />
                <RechartsTooltip content={ChartTooltip} />
                <Line type="monotone" dataKey="percent" name="Present %" stroke="var(--color-status-good)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Class strength</CardTitle>
            <CardDescription>Enrolled students per grade</CardDescription>
          </CardHeader>
          <CardContent className="h-60 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classStrength} margin={{ left: -18, right: 12, top: 8 }} barCategoryGap={16}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="grade" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={32} />
                <RechartsTooltip content={ChartTooltip} />
                <Bar dataKey="strength" name="Students" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 pb-6">
            {QUICK_ACTIONS.map((action) => (
              <Button key={action.label} variant="outline" asChild className="h-auto flex-col gap-2 py-4">
                <Link to={action.to}>
                  <action.icon className="size-4.5 text-primary" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Today's classes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pb-6">
            {todaysClasses.map((c) => (
              <div key={c.class + c.time} className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-[10px] font-semibold leading-none text-primary">
                  <CalendarClock className="size-4" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate text-sm font-medium text-foreground">{c.subject} &middot; {c.class}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.teacher}</p>
                </div>
                <span className="shrink-0 text-xs font-medium text-muted-foreground">{c.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Upcoming birthdays</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pb-6">
            {birthdaysThisWeek.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarImage src={s.avatarUrl} alt={s.name} />
                  <AvatarFallback>{initials(s.name)}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate text-sm font-medium text-foreground">{s.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{s.className} - {s.section}</p>
                </div>
                <CakeIcon className="size-4 shrink-0 text-warning" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Upcoming events</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pb-6">
            {upcomingEvents.map((e) => (
              <div key={e.id} className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <CalendarClock className="size-4" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate text-sm font-medium text-foreground">{e.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{formatDate(e.date)} &middot; {e.location}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent notifications</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app/notifications">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 pb-4">
            {recentNotifications.map((n) => (
              <div key={n.id} className="flex items-start gap-3 rounded-lg px-2 py-2.5 hover:bg-secondary/40">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">{n.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Latest payments</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app/finance/payments">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col pb-2">
            {latestPayments.map((p) => (
              <div key={p.id} className="flex items-center gap-3 border-b border-border py-2.5 last:border-0">
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate text-sm font-medium text-foreground">{p.studentName}</p>
                  <p className="text-xs text-muted-foreground">{p.reference}</p>
                </div>
                <StatusBadge status="paid" />
                <span className="w-24 shrink-0 text-right text-sm font-medium text-foreground">{formatCurrency(p.amount)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
