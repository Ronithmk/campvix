import type { LegacyColumnDef as ColumnDef } from '@tanstack/react-table/legacy'
import { MoreHorizontal, Eye, FileSpreadsheet, Trash2 } from 'lucide-react'
import type { Exam } from '@/types'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { classes } from '@/mock/classes'
import { subjects } from '@/mock/subjects'
import { formatDate } from '@/lib/utils'

export function getExamColumns(onDelete: (exam: Exam) => void): ColumnDef<Exam, unknown>[] {
  return [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Exam',
    cell: ({ row }) => {
      const e = row.original
      const subject = subjects.find((s) => s.id === e.subjectId)
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">{e.name}</span>
          <span className="text-xs text-muted-foreground">{subject?.name}</span>
        </div>
      )
    },
  },
  {
    id: 'classId',
    accessorFn: (row) => classes.find((c) => c.id === row.classId)?.name ?? '',
    header: 'Class',
    cell: ({ getValue }) => <span className="text-sm text-foreground">{getValue() as string}</span>,
  },
  { id: 'date', accessorKey: 'date', header: 'Date', cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{formatDate(getValue() as string)}</span> },
  { id: 'maxMarks', accessorKey: 'maxMarks', header: 'Max Marks', cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue() as number}</span> },
  { id: 'status', accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <StatusBadge status={getValue() as string} /> },
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
            <Eye /> View details
          </DropdownMenuItem>
          <DropdownMenuItem>
            <FileSpreadsheet /> Enter marks
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => onDelete(row.original)}>
            <Trash2 /> Cancel exam
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
  ]
}
