import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { CalendarClock, Printer, Wand2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { classes as allClasses } from '@/mock/classes'
import { subjects } from '@/mock/subjects'
import { teachers as allTeachers } from '@/mock/teachers'
import { cn } from '@/lib/utils'
import { useActiveSchool } from '@/hooks/use-active-school'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const PERIODS = ['08:30', '09:20', '10:10', '11:20', '12:10', '13:40', '02:30']

function hashCode(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  return hash
}

export default function TimetablePage() {
  const school = useActiveSchool()
  const classes = useMemo(() => allClasses.filter((c) => c.schoolId === school.id), [school.id])
  const teachers = useMemo(() => allTeachers.filter((t) => t.schoolId === school.id), [school.id])
  const [classId, setClassId] = useState(classes[0]?.id)

  const activeClassId = classes.some((c) => c.id === classId) ? classId : classes[0]?.id
  const klass = classes.find((c) => c.id === activeClassId)

  const grid = useMemo(() => {
    if (!activeClassId) return []
    const seed = hashCode(activeClassId)
    return DAYS.map((_day, di) =>
      PERIODS.map((_, pi) => {
        if (pi === 4) return { subject: 'Lunch Break', teacher: '', color: '#94a3b8', isBreak: true }
        const index = (seed + di * 7 + pi * 3) % subjects.length
        const subject = subjects[index]
        const teacher = teachers[(seed + di + pi) % teachers.length]
        return { subject: subject.name, teacher: teacher?.name ?? '', color: subject.color, isBreak: false }
      }),
    )
  }, [activeClassId, teachers])

  if (!klass) {
    return <PageHeader title="Timetable" description="No classes found for this school yet." />
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Timetable"
        description={`Weekly class schedule builder for ${school.name}.`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.success('Timetable sent to printer')}>
              <Printer className="size-4" /> Print
            </Button>
            <Button onClick={() => toast.success('Timetable auto-generated')}>
              <Wand2 className="size-4" /> Auto-generate
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 pt-6 pb-6">
          <span className="text-sm font-medium text-foreground">Class</span>
          <Select value={activeClassId} onValueChange={setClassId}>
            <SelectTrigger className="w-52">
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
          <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarClock className="size-3.5" /> Room {klass.room}
          </span>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-24 border-b border-border p-3 text-left text-xs font-medium text-muted-foreground">Time</th>
                {DAYS.map((day) => (
                  <th key={day} className="border-b border-border p-3 text-left text-xs font-medium text-muted-foreground">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((time, pi) => (
                <tr key={time} className="border-b border-border last:border-0">
                  <td className="p-3 text-xs font-medium text-muted-foreground">{time}</td>
                  {DAYS.map((day, di) => {
                    const cell = grid[di][pi]
                    return (
                      <td key={day} className="p-2 align-top">
                        {cell.isBreak ? (
                          <div className="flex h-16 items-center justify-center rounded-lg bg-secondary/50 text-xs font-medium text-muted-foreground">Lunch Break</div>
                        ) : (
                          <div className={cn('flex h-16 flex-col justify-center gap-0.5 rounded-lg border-l-4 bg-secondary/40 px-3')} style={{ borderColor: cell.color }}>
                            <span className="text-xs font-medium text-foreground">{cell.subject}</span>
                            <span className="truncate text-[11px] text-muted-foreground">{cell.teacher}</span>
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
