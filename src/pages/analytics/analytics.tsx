import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts'
import { AlertTriangle, TrendingUp, Users, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { ChartTooltip } from '@/components/shared/chart-tooltip'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { students as allStudents } from '@/mock/students'
import { admissions as allAdmissions } from '@/mock/admissions'
import { feeRecords as allFeeRecords } from '@/mock/fees'
import { formatCurrency, formatNumber, initials } from '@/lib/utils'
import { useActiveSchool } from '@/hooks/use-active-school'

const SOURCE_COLORS: Record<string, string> = {
  website: 'var(--color-chart-1)',
  referral: 'var(--color-chart-2)',
  walk_in: 'var(--color-chart-3)',
  agent: 'var(--color-chart-4)',
}

function hashCode(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  return hash
}

export default function AnalyticsPage() {
  const school = useActiveSchool()
  const students = useMemo(() => allStudents.filter((s) => s.schoolId === school.id), [school.id])
  const admissions = useMemo(() => allAdmissions.filter((a) => a.schoolId === school.id), [school.id])
  const feeRecords = useMemo(() => allFeeRecords.filter((f) => f.schoolId === school.id), [school.id])

  const enrollmentTrend = useMemo(() => {
    const seed = hashCode(school.id)
    const current = students.length
    return Array.from({ length: 6 }, (_, i) => {
      const year = 2021 + i
      const growth = 1 - (5 - i) * (0.08 + ((seed + i) % 5) / 100)
      return { year: String(year), students: Math.max(1, Math.round(current * growth)) }
    })
  }, [school.id, students.length])

  const admissionsBySource = useMemo(() => {
    const counts = new Map<string, number>()
    for (const a of admissions) counts.set(a.source, (counts.get(a.source) ?? 0) + 1)
    return Array.from(counts.entries()).map(([source, value]) => ({ source: source.replace('_', ' '), value, key: source }))
  }, [admissions])

  const feeCategoryBreakdown = useMemo(() => {
    const counts = new Map<string, number>()
    for (const f of feeRecords) counts.set(f.category, (counts.get(f.category) ?? 0) + f.amount)
    return Array.from(counts.entries()).map(([category, value]) => ({ category, value }))
  }, [feeRecords])

  const allAtRiskStudents = students.filter((s) => s.attendancePercent < 75 || s.gpa < 6.5)
  const atRiskStudents = allAtRiskStudents.slice(0, 6)
  const growthPercent = enrollmentTrend.length ? Math.round(((enrollmentTrend[enrollmentTrend.length - 1].students - enrollmentTrend[0].students) / enrollmentTrend[0].students) * 1000) / 10 : 0
  const totalRevenue = feeRecords.reduce((sum, f) => sum + f.paidAmount, 0)
  const revenuePerStudent = students.length ? Math.round(totalRevenue / students.length) : 0

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Analytics" description={`School-wide analytics and predictive insights for ${school.name}.`} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="6-Year Growth" value={`${growthPercent >= 0 ? '+' : ''}${growthPercent}%`} icon={TrendingUp} accent="primary" change={growthPercent} />
        <StatCard index={1} label="Total Enrollment" value={formatNumber(students.length)} icon={Users} accent="accent" change={7.6} />
        <StatCard index={2} label="At-Risk Students" value={String(allAtRiskStudents.length)} icon={AlertTriangle} accent="destructive" change={-1.8} />
        <StatCard index={3} label="Revenue per Student" value={formatCurrency(revenuePerStudent)} icon={Wallet} accent="warning" change={4.3} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Enrollment growth</CardTitle>
            <CardDescription>Total students enrolled per academic year</CardDescription>
          </CardHeader>
          <CardContent className="h-64 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={enrollmentTrend} margin={{ left: -12, right: 12, top: 8 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="year" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} width={40} />
                <RechartsTooltip content={ChartTooltip} />
                <Line type="monotone" dataKey="students" name="Students" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={{ r: 3.5, fill: 'var(--color-chart-1)' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admissions by source</CardTitle>
            <CardDescription>Lead attribution</CardDescription>
          </CardHeader>
          <CardContent className="h-64 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={admissionsBySource} dataKey="value" nameKey="source" innerRadius={48} outerRadius={72} paddingAngle={3} strokeWidth={0}>
                  {admissionsBySource.map((entry) => (
                    <Cell key={entry.key} fill={SOURCE_COLORS[entry.key]} />
                  ))}
                </Pie>
                <RechartsTooltip content={ChartTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Revenue by category</CardTitle>
            <CardDescription>Total billed amount per fee category</CardDescription>
          </CardHeader>
          <CardContent className="h-60 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feeCategoryBreakdown} margin={{ left: -12, right: 12, top: 8 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="category" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} className="capitalize" />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} width={40} />
                <RechartsTooltip content={ChartTooltip} />
                <Bar dataKey="value" name="Revenue" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>At-risk students</CardTitle>
            <CardDescription>Low attendance or GPA</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border pb-4">
            {atRiskStudents.map((s) => (
              <div key={s.id} className="flex items-center gap-2.5 py-2.5">
                <Avatar className="size-8">
                  <AvatarImage src={s.avatarUrl} alt={s.name} />
                  <AvatarFallback>{initials(s.name)}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">{s.name}</span>
                  <span className="text-xs text-muted-foreground">{s.className} - {s.section}</span>
                </div>
                <Badge variant="destructive">{s.attendancePercent}%</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
