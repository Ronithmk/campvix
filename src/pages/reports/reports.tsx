import { useState } from 'react'
import { toast } from 'sonner'
import { BarChart3, CalendarCheck, Wallet, GraduationCap, TrendingUp, Download, FileText, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DeleteConfirm } from '@/components/shared/delete-confirm'
import { formatDate } from '@/lib/utils'

const REPORT_TYPES = [
  { title: 'Attendance Report', description: 'Daily, weekly, and monthly attendance summaries by class.', icon: CalendarCheck, accent: 'text-primary bg-primary/10' },
  { title: 'Fee Collection Report', description: 'Revenue, dues, and payment method breakdowns.', icon: Wallet, accent: 'text-success bg-success-bg' },
  { title: 'Academic Performance Report', description: 'Grade distributions and subject-wise performance.', icon: GraduationCap, accent: 'text-warning bg-warning-bg' },
  { title: 'Teacher Workload Report', description: 'Class load, subjects taught, and performance scores.', icon: BarChart3, accent: 'text-accent-foreground bg-accent' },
  { title: 'Student Growth Report', description: 'Enrollment trends and retention across academic years.', icon: TrendingUp, accent: 'text-primary bg-primary/10' },
]

const RECENT_REPORTS = [
  { name: 'Attendance Summary - July 2026', generatedBy: 'Aditi Sharma', date: '2026-08-01' },
  { name: 'Fee Collection - Term 2', generatedBy: 'Rohan Mehta', date: '2026-07-28' },
  { name: 'Academic Performance - Grade 8', generatedBy: 'Priya Nair', date: '2026-07-20' },
  { name: 'Teacher Workload Q2', generatedBy: 'Aditi Sharma', date: '2026-07-15' },
]

export default function ReportsPage() {
  const [recentReports, setRecentReports] = useState(RECENT_REPORTS)

  function handleDelete(name: string) {
    setRecentReports((prev) => prev.filter((r) => r.name !== name))
    toast.success(`${name} was deleted`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Reports" description="Generate detailed reports across academics, finance, and operations." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {REPORT_TYPES.map((report) => (
          <Card key={report.title} className="transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col gap-4 py-5">
              <div className={`flex size-10 items-center justify-center rounded-xl ${report.accent}`}>
                <report.icon className="size-5" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-foreground">{report.title}</p>
                <p className="text-xs text-muted-foreground">{report.description}</p>
              </div>
              <Button variant="outline" size="sm" className="w-fit" onClick={() => toast.success(`${report.title} generated`)}>
                <FileText className="size-3.5" /> Generate
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="flex flex-col divide-y divide-border pt-6 pb-2">
          <p className="pb-3 text-sm font-medium text-foreground">Recently generated</p>
          {recentReports.map((r) => (
            <div key={r.name} className="flex items-center gap-3 py-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                <FileText className="size-4" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="truncate text-sm font-medium text-foreground">{r.name}</p>
                <p className="text-xs text-muted-foreground">
                  {r.generatedBy} &middot; {formatDate(r.date)}
                </p>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => toast.success('Downloading...')}>
                <Download className="size-3.5" />
              </Button>
              <DeleteConfirm title="Delete this report?" description={`${r.name} will be permanently deleted.`} onConfirm={() => handleDelete(r.name)}>
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="size-3.5" />
                </Button>
              </DeleteConfirm>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
