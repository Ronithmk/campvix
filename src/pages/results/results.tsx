import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts'
import { Award, TrendingUp, Users } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { ChartTooltip } from '@/components/shared/chart-tooltip'
import { DataTable, exportToCsv } from '@/components/shared/data-table'
import { ConfirmDeleteDialog } from '@/components/shared/confirm-delete-dialog'
import { getResultColumns } from '@/features/results/columns'
import { results as mockResults } from '@/mock/exams'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Result } from '@/types'
import { useActiveSchool } from '@/hooks/use-active-school'
import { useAuthStore } from '@/store/auth-store'
import { students as allStudents } from '@/mock/students'

const GRADE_ORDER = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D']

export default function ResultsPage() {
  const school = useActiveSchool()
  const role = useAuthStore((s) => s.role)
  const personId = useAuthStore((s) => s.personId)
  const [results, setResults] = useState<Result[]>(mockResults)
  const [pendingDelete, setPendingDelete] = useState<Result | null>(null)

  const studentClassId = useMemo(() => {
    if (role !== 'student' || !personId) return null
    return allStudents.find((student) => student.id === personId && student.schoolId === school.id)?.classId ?? null
  }, [personId, role, school.id])

  const schoolResults = useMemo(
    () => results.filter((r) => r.schoolId === school.id && (role !== 'student' || (!!personId && r.studentId === personId))),
    [personId, results, role, school.id, studentClassId],
  )
  const avgScore = schoolResults.length ? Math.round(schoolResults.reduce((sum, r) => sum + (r.marksObtained / r.maxMarks) * 100, 0) / schoolResults.length) : 0
  const topScorers = schoolResults.filter((r) => r.marksObtained / r.maxMarks >= 0.9).length

  const gradeDistribution = useMemo(() => {
    const counts = new Map<string, number>()
    for (const r of schoolResults) counts.set(r.grade, (counts.get(r.grade) ?? 0) + 1)
    return GRADE_ORDER.map((grade) => ({ grade, count: counts.get(grade) ?? 0 }))
  }, [schoolResults])

  const columns = useMemo(() => getResultColumns(role === 'student' ? undefined : (result) => setPendingDelete(result)), [role])

  function handleDelete() {
    if (!pendingDelete) return
    setResults((prev) => prev.filter((r) => r.id !== pendingDelete.id))
    toast.success('Result deleted')
    setPendingDelete(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Results" description={role === 'student' ? `Your academic results at ${school.name}.` : `Review grades and performance across every examination at ${school.name}.`} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard index={0} label="Results Recorded" value={String(schoolResults.length)} icon={Award} accent="primary" change={0} />
        <StatCard index={1} label="Average Score" value={`${avgScore}%`} icon={TrendingUp} accent="accent" change={2.4} />
        <StatCard index={2} label="Top Scorers (A+/A)" value={String(topScorers)} icon={Users} accent="warning" change={0} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grade distribution</CardTitle>
          <CardDescription>Across all recorded results</CardDescription>
        </CardHeader>
        <CardContent className="h-64 pb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gradeDistribution} margin={{ left: -18, right: 12, top: 8 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="grade" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} width={32} />
              <RechartsTooltip content={ChartTooltip} />
              <Bar dataKey="count" name="Students" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={schoolResults}
        searchPlaceholder="Search results..."
        onExport={(rows) => {
          exportToCsv(
            rows.map((r) => ({ studentId: r.studentId, examId: r.examId, marks: r.marksObtained, grade: r.grade })),
            'results.csv',
          )
          toast.success('Exported results.csv')
        }}
      />

      {role !== 'student' && (
        <ConfirmDeleteDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)} onConfirm={handleDelete} title="Delete this result?" description="This result entry will be permanently deleted." />
      )}
    </div>
  )
}
