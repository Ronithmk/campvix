import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts'
import { CalendarCheck, Check, Clock, Save, UserX, X } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { ChartTooltip } from '@/components/shared/chart-tooltip'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn, initials } from '@/lib/utils'
import { classes as allClasses } from '@/mock/classes'
import { students } from '@/mock/students'
import { attendanceRecords, buildAttendanceTrend } from '@/mock/attendance'
import type { AttendanceStatus } from '@/types'
import { useActiveSchool } from '@/hooks/use-active-school'

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; icon: typeof Check }[] = [
  { value: 'present', label: 'Present', icon: Check },
  { value: 'absent', label: 'Absent', icon: X },
  { value: 'late', label: 'Late', icon: Clock },
  { value: 'excused', label: 'Excused', icon: UserX },
]

const STATUS_STYLES: Record<AttendanceStatus, string> = {
  present: 'bg-success text-success-foreground border-success',
  absent: 'bg-destructive text-destructive-foreground border-destructive',
  late: 'bg-warning text-warning-foreground border-warning',
  excused: 'bg-secondary text-secondary-foreground border-border',
}

export default function AttendancePage() {
  const school = useActiveSchool()
  const classes = useMemo(() => allClasses.filter((c) => c.schoolId === school.id), [school.id])
  const [classId, setClassId] = useState(classes[0]?.id)
  const activeClassId = classes.some((c) => c.id === classId) ? classId : classes[0]?.id
  const classStudents = useMemo(() => students.filter((s) => s.classId === activeClassId).slice(0, 12), [activeClassId])
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>(() => Object.fromEntries(classStudents.map((s) => [s.id, 'present'])))
  const schoolAttendance = useMemo(() => attendanceRecords.filter((a) => a.schoolId === school.id), [school.id])
  const attendanceTrend = useMemo(() => buildAttendanceTrend(schoolAttendance), [schoolAttendance])

  function setMark(studentId: string, status: AttendanceStatus) {
    setMarks((prev) => ({ ...prev, [studentId]: status }))
  }

  function handleClassChange(id: string) {
    setClassId(id)
    const next = students.filter((s) => s.classId === id).slice(0, 12)
    setMarks(Object.fromEntries(next.map((s) => [s.id, 'present'])))
  }

  const presentCount = Object.values(marks).filter((m) => m === 'present').length
  const absentCount = Object.values(marks).filter((m) => m === 'absent').length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Attendance" description={`Mark and track daily attendance across every class at ${school.name}.`} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard index={0} label="Present today" value={String(presentCount)} icon={Check} accent="accent" />
        <StatCard index={1} label="Absent today" value={String(absentCount)} icon={X} accent="destructive" />
        <StatCard index={2} label="Class strength" value={String(classStudents.length)} icon={CalendarCheck} accent="primary" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance trend</CardTitle>
          <CardDescription>School-wide presence over the last 14 school days</CardDescription>
        </CardHeader>
        <CardContent className="h-52 pb-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={attendanceTrend} margin={{ left: -18, right: 12, top: 8 }}>
              <defs>
                <linearGradient id="attFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-status-good)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--color-status-good)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} interval={1} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} domain={[60, 100]} width={32} />
              <RechartsTooltip content={ChartTooltip} />
              <Area type="monotone" dataKey="percent" name="Present %" stroke="var(--color-status-good)" strokeWidth={2.5} fill="url(#attFill)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Mark attendance</CardTitle>
            <CardDescription>Select a class and tap a status for each student</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={activeClassId} onValueChange={handleClassChange}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => toast.success('Attendance saved for ' + classes.find((c) => c.id === activeClassId)?.name)}>
              <Save className="size-4" /> Save
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border pb-4">
          {classStudents.map((s) => (
            <div key={s.id} className="flex items-center gap-3 py-2.5">
              <Avatar className="size-8">
                <AvatarImage src={s.avatarUrl} alt={s.name} />
                <AvatarFallback>{initials(s.name)}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium text-foreground">{s.name}</span>
                <span className="text-xs text-muted-foreground">Roll No. {s.rollNo}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setMark(s.id, opt.value)}
                    className={cn(
                      'flex size-8 items-center justify-center rounded-lg border text-muted-foreground transition-all',
                      marks[s.id] === opt.value ? STATUS_STYLES[opt.value] : 'border-border bg-card hover:bg-secondary',
                    )}
                    title={opt.label}
                  >
                    <opt.icon className="size-3.5" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
