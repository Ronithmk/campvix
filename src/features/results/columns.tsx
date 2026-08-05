import type { LegacyColumnDef as ColumnDef } from '@tanstack/react-table/legacy'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import type { Result } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { students } from '@/mock/students'
import { exams } from '@/mock/exams'
import { subjects } from '@/mock/subjects'

const GRADE_VARIANT: Record<string, 'success' | 'accent' | 'warning' | 'destructive' | 'secondary'> = {
  'A+': 'success',
  A: 'success',
  'B+': 'accent',
  B: 'accent',
  'C+': 'warning',
  C: 'warning',
  D: 'destructive',
}

export function getResultColumns(onDelete: (result: Result) => void): ColumnDef<Result, unknown>[] {
  return [
  {
    id: 'studentId',
    accessorFn: (row) => students.find((s) => s.id === row.studentId)?.name ?? '',
    header: 'Student',
    cell: ({ getValue }) => <span className="text-sm font-medium text-foreground">{getValue() as string}</span>,
  },
  {
    id: 'examId',
    accessorFn: (row) => exams.find((e) => e.id === row.examId)?.name ?? '',
    header: 'Exam',
    cell: ({ row, getValue }) => {
      const exam = exams.find((e) => e.id === row.original.examId)
      const subject = subjects.find((s) => s.id === exam?.subjectId)
      return (
        <div className="flex flex-col">
          <span className="text-sm text-foreground">{getValue() as string}</span>
          <span className="text-xs text-muted-foreground">{subject?.name}</span>
        </div>
      )
    },
  },
  {
    id: 'marksObtained',
    accessorKey: 'marksObtained',
    header: 'Score',
    cell: ({ row }) => {
      const { marksObtained, maxMarks } = row.original
      return (
        <div className="flex items-center gap-2">
          <Progress value={(marksObtained / maxMarks) * 100} className="h-1.5 w-16" />
          <span className="text-xs text-muted-foreground">
            {marksObtained}/{maxMarks}
          </span>
        </div>
      )
    },
  },
  {
    id: 'grade',
    accessorKey: 'grade',
    header: 'Grade',
    cell: ({ getValue }) => <Badge variant={GRADE_VARIANT[getValue() as string] ?? 'secondary'}>{getValue() as string}</Badge>,
  },
  {
    id: 'actions',
    header: '',
    enableHiding: false,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Pencil /> Edit marks
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => onDelete(row.original)}>
            <Trash2 /> Delete result
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
  ]
}
