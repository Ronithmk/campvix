import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Droplet,
  Bus,
  BedDouble,
  Download,
  FileText,
  IdCard,
  QrCode,
  GraduationCap,
  HeartPulse,
  Award,
  Trash2,
} from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import { DeleteConfirm } from '@/components/shared/delete-confirm'
import { StatusBadge } from '@/components/shared/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { students } from '@/mock/students'
import { parents } from '@/mock/parents'
import { feeRecords } from '@/mock/fees'
import { results, exams } from '@/mock/exams'
import { attendanceRecords } from '@/mock/attendance'
import { subjects } from '@/mock/subjects'
import { formatCurrency, formatDate, initials } from '@/lib/utils'

export default function StudentProfilePage() {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const student = students.find((s) => s.id === studentId)

  if (!student) {
    return <EmptyState icon={GraduationCap} title="Student not found" description="This student record doesn't exist or may have been removed." />
  }

  const parent = parents.find((p) => p.id === student.parentId)
  const fees = feeRecords.filter((f) => f.studentId === student.id)
  const studentResults = results.filter((r) => r.studentId === student.id).map((r) => ({ ...r, exam: exams.find((e) => e.id === r.examId) }))
  const studentAttendance = attendanceRecords.filter((a) => a.studentId === student.id).slice(0, 10)

  return (
    <div className="flex flex-col gap-6">
      <Link to="/app/students" className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Back to students
      </Link>

      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/15 via-accent-solid/10 to-primary/5" />
        <CardContent className="-mt-12 flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-end">
            <Avatar className="size-24 border-4 border-card shadow-md">
              <AvatarImage src={student.avatarUrl} alt={student.name} />
              <AvatarFallback className="text-xl">{initials(student.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center gap-1 sm:items-start">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-foreground">{student.name}</h1>
                <StatusBadge status={student.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                {student.admissionNo} &middot; {student.className} - {student.section} &middot; Roll No. {student.rollNo}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <IdCard className="size-4" /> ID Card
            </Button>
            <Button>
              <FileText className="size-4" /> Edit Profile
            </Button>
            <DeleteConfirm
              title="Remove this student?"
              description={`${student.name} (${student.admissionNo}) will be permanently removed from the school's records.`}
              onConfirm={() => {
                toast.success(`${student.name} was removed`)
                navigate('/app/students')
              }}
            >
              <Button variant="destructive" size="icon" aria-label="Remove student">
                <Trash2 className="size-4" />
              </Button>
            </DeleteConfirm>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <GraduationCap className="size-4.5" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{student.gpa.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Current GPA</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Award className="size-4.5" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{student.attendancePercent}%</p>
              <p className="text-xs text-muted-foreground">Attendance</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-warning-bg text-warning">
              <HeartPulse className="size-4.5" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{student.bloodGroup}</p>
              <p className="text-xs text-muted-foreground">Blood Group</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="academics">Academics</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="fees">Fee Status</TabsTrigger>
          <TabsTrigger value="family">Parent &amp; Medical</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="id-card">ID Card</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Contact information</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pb-6 text-sm">
                <div className="flex items-center gap-2.5 text-foreground">
                  <Mail className="size-4 text-muted-foreground" /> {student.email}
                </div>
                <div className="flex items-center gap-2.5 text-foreground">
                  <Phone className="size-4 text-muted-foreground" /> {student.phone}
                </div>
                <div className="flex items-center gap-2.5 text-foreground">
                  <MapPin className="size-4 text-muted-foreground" /> {student.address}
                </div>
                <div className="flex items-center gap-2.5 text-foreground">
                  <Droplet className="size-4 text-muted-foreground" /> {student.bloodGroup}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Logistics</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pb-6 text-sm">
                <div className="flex items-center gap-2.5 text-foreground">
                  <Bus className="size-4 text-muted-foreground" /> {student.transportRoute ?? 'Not enrolled in transport'}
                </div>
                <div className="flex items-center gap-2.5 text-foreground">
                  <BedDouble className="size-4 text-muted-foreground" /> {student.hostelRoom ? `Room ${student.hostelRoom}` : 'Day scholar'}
                </div>
                <Separator />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Admission date</span>
                  <span className="font-medium text-foreground">{formatDate(student.admissionDate)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="academics" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Exam results</CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              {studentResults.length ? (
                <div className="flex flex-col divide-y divide-border">
                  {studentResults.map((r) => (
                    <div key={r.id} className="flex items-center justify-between py-3 text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{r.exam?.name}</span>
                        <span className="text-xs text-muted-foreground">{subjects.find((s) => s.id === r.exam?.subjectId)?.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">
                          {r.marksObtained}/{r.maxMarks}
                        </span>
                        <Badge variant="accent">{r.grade}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={GraduationCap} title="No results yet" description="Exam results will appear here once graded." className="border-0" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="mt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-sm">Attendance record</CardTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                Overall
                <Progress value={student.attendancePercent} className="h-1.5 w-24" />
                <span className="font-medium text-foreground">{student.attendancePercent}%</span>
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="flex flex-col divide-y divide-border">
                {studentAttendance.map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-foreground">{formatDate(a.date, { weekday: 'long', month: 'short', day: 'numeric', year: undefined })}</span>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Fee invoices</CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="flex flex-col divide-y divide-border">
                {fees.map((f) => (
                  <div key={f.id} className="flex items-center justify-between py-3 text-sm">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{f.invoiceNo}</span>
                      <span className="text-xs text-muted-foreground capitalize">{f.category} &middot; {f.term}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">{formatCurrency(f.paidAmount)} / {formatCurrency(f.amount)}</span>
                      <StatusBadge status={f.status} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="family" className="mt-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Parent / Guardian</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3 pb-6">
                <Avatar className="size-11">
                  <AvatarImage src={parent?.avatarUrl} alt={parent?.name} />
                  <AvatarFallback>{parent ? initials(parent.name) : '?'}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-sm">
                  <span className="font-medium text-foreground">{parent?.name}</span>
                  <span className="text-xs text-muted-foreground">{parent?.occupation}</span>
                  <span className="text-xs text-muted-foreground">{parent?.email}</span>
                  <span className="text-xs text-muted-foreground">{parent?.phone}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Medical details</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 pb-6 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Blood group</span><span className="font-medium text-foreground">{student.bloodGroup}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Allergies</span><span className="font-medium text-foreground">None reported</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Emergency contact</span><span className="font-medium text-foreground">{parent?.phone}</span></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardContent className="grid grid-cols-1 gap-3 pt-6 pb-6 sm:grid-cols-2">
              {['Birth Certificate', 'Transfer Certificate', 'Previous Report Card', 'Immunization Record'].map((doc) => (
                <div key={doc} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <FileText className="size-4 text-primary" />
                  <span className="flex-1 text-sm text-foreground">{doc}</span>
                  <Button variant="ghost" size="icon-sm">
                    <Download className="size-3.5" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="id-card" className="mt-4">
          <div className="flex justify-center py-4">
            <div className="flex w-72 flex-col overflow-hidden rounded-2xl border border-border shadow-lg">
              <div className="flex flex-col items-center gap-2 bg-gradient-to-br from-primary to-primary-hover p-5 text-center text-white">
                <GraduationCap className="size-6" />
                <p className="text-sm font-semibold">Riverside International School</p>
              </div>
              <div className="flex flex-col items-center gap-2 bg-card p-5">
                <Avatar className="size-20 border-4 border-card shadow">
                  <AvatarImage src={student.avatarUrl} alt={student.name} />
                  <AvatarFallback>{initials(student.name)}</AvatarFallback>
                </Avatar>
                <p className="text-sm font-semibold text-foreground">{student.name}</p>
                <p className="text-xs text-muted-foreground">{student.className} - {student.section} &middot; Roll {student.rollNo}</p>
                <QrCode className="mt-2 size-16 text-foreground" />
                <p className="text-[10px] text-muted-foreground">{student.admissionNo}</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
