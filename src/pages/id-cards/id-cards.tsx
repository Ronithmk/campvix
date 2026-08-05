import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { IdCard, Printer, Download, GraduationCap, QrCode } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { students as allStudents } from '@/mock/students'
import { teachers as allTeachers } from '@/mock/teachers'
import { classes as allClasses } from '@/mock/classes'
import { initials } from '@/lib/utils'
import { useActiveSchool } from '@/hooks/use-active-school'

export default function IdCardsPage() {
  const school = useActiveSchool()
  const [type, setType] = useState<'student' | 'teacher'>('student')
  const [classFilter, setClassFilter] = useState('all')

  const classes = useMemo(() => allClasses.filter((c) => c.schoolId === school.id), [school.id])
  const students = useMemo(() => allStudents.filter((s) => s.schoolId === school.id), [school.id])
  const teachers = useMemo(() => allTeachers.filter((t) => t.schoolId === school.id), [school.id])

  const filteredStudents = useMemo(() => students.filter((s) => classFilter === 'all' || s.classId === classFilter).slice(0, 12), [students, classFilter])
  const previewTeachers = teachers.slice(0, 12)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="ID Cards"
        description={`Design and bulk-generate ID cards for students and staff at ${school.name}.`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.success('Sent to printer')}>
              <Printer className="size-4" /> Print
            </Button>
            <Button onClick={() => toast.success('Exporting ID cards as PDF')}>
              <Download className="size-4" /> Export PDF
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 pt-6 pb-6">
          <Tabs value={type} onValueChange={(v) => setType(v as 'student' | 'teacher')}>
            <TabsList>
              <TabsTrigger value="student">Students</TabsTrigger>
              <TabsTrigger value="teacher">Teachers</TabsTrigger>
            </TabsList>
          </Tabs>
          {type === 'student' && (
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All classes</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
            <IdCard className="size-3.5" /> {type === 'student' ? filteredStudents.length : previewTeachers.length} cards ready
          </span>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {(type === 'student' ? filteredStudents : previewTeachers).map((person) => (
          <div key={person.id} className="flex flex-col overflow-hidden rounded-2xl border border-border shadow-md">
            <div className="flex flex-col items-center gap-1.5 bg-gradient-to-br from-primary to-primary-hover p-4 text-center text-white" style={{ background: `linear-gradient(135deg, ${school.primaryColor}, ${school.primaryColor}bb)` }}>
              <GraduationCap className="size-5" />
              <p className="text-xs font-semibold">{school.name}</p>
            </div>
            <div className="flex flex-col items-center gap-1.5 bg-card p-4">
              <Avatar className="size-16 border-4 border-card shadow">
                <AvatarImage src={person.avatarUrl} alt={person.name} />
                <AvatarFallback>{initials(person.name)}</AvatarFallback>
              </Avatar>
              <p className="text-sm font-semibold text-foreground">{person.name}</p>
              <p className="text-xs text-muted-foreground">
                {type === 'student' ? `${(person as (typeof students)[number]).className} - ${(person as (typeof students)[number]).section}` : (person as (typeof teachers)[number]).employeeId}
              </p>
              <QrCode className="mt-1.5 size-12 text-foreground" />
              <p className="text-[10px] text-muted-foreground">{type === 'student' ? (person as (typeof students)[number]).admissionNo : (person as (typeof teachers)[number]).employeeId}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
