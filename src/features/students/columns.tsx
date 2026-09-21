import { Link } from 'react-router-dom'
import type { LegacyColumnDef as ColumnDef } from '@tanstack/react-table/legacy'
import { MoreHorizontal, Eye, Pencil, ArrowUpCircle, ArrowRightLeft, Trash2 } from 'lucide-react'
import type { Student } from '@/types'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { StatusBadge } from '@/components/shared/status-badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { initials } from '@/lib/utils'

export function getStudentColumns(onDelete?: (student: Student) => void): ColumnDef<Student, unknown>[] {
  const columns: ColumnDef<Student, unknown>[] = [
  {
    id: 'select',
    header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected()} onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)} aria-label="Select all" />,
    cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label="Select row" />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'student',
    accessorKey: 'name',
    header: 'Student',
    cell: ({ row }) => {
      const s = row.original
      return (
        <Link to={`/app/students/${s.id}`} className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarImage src={s.avatarUrl} alt={s.name} />
            <AvatarFallback>{initials(s.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground hover:text-primary">{s.name}</span>
            <span className="text-xs text-muted-foreground">{s.admissionNo}</span>
          </div>
        </Link>
      )
    },
  },
  {
    id: 'class',
    accessorFn: (row) => `${row.className} - ${row.section}`,
    header: 'Class',
    cell: ({ getValue }) => <span className="text-sm text-foreground">{getValue() as string}</span>,
  },
  {
    id: 'rollNo',
    accessorKey: 'rollNo',
    header: 'Roll No.',
    cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue() as number}</span>,
  },
  {
    id: 'attendancePercent',
    accessorKey: 'attendancePercent',
    header: 'Attendance',
    cell: ({ getValue }) => {
      const value = getValue() as number
      return (
        <div className="flex items-center gap-2">
          <Progress value={value} className="h-1.5 w-16" indicatorClassName={value < 75 ? 'bg-destructive' : undefined} />
          <span className="text-xs text-muted-foreground">{value}%</span>
        </div>
      )
    },
  },
  {
    id: 'feeStatus',
    accessorKey: 'feeStatus',
    header: 'Fee Status',
    cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
  },
  ]

  if (!onDelete) return columns.filter((column) => column.id !== 'select' && column.id !== 'actions')

  return [...columns,
  {
    id: 'actions',
    header: '',
    enableHiding: false,
    cell: ({ row }) => {
      const s = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/app/students/${s.id}`}>
                <Eye /> View profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Pencil /> Edit details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <ArrowUpCircle /> Promote student
            </DropdownMenuItem>
            <DropdownMenuItem>
              <ArrowRightLeft /> Transfer student
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => onDelete(s)}>
              <Trash2 /> Remove student
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
  ]
}
