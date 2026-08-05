import type { LegacyColumnDef as ColumnDef } from '@tanstack/react-table/legacy'
import { MoreHorizontal, Eye, Pencil, CalendarClock, Trash2 } from 'lucide-react'
import type { Teacher } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { StatusBadge } from '@/components/shared/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { initials } from '@/lib/utils'

export function getTeacherColumns(onDelete: (teacher: Teacher) => void): ColumnDef<Teacher, unknown>[] {
  return [
  {
    id: 'teacher',
    accessorKey: 'name',
    header: 'Teacher',
    cell: ({ row }) => {
      const t = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarImage src={t.avatarUrl} alt={t.name} />
            <AvatarFallback>{initials(t.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">{t.name}</span>
            <span className="text-xs text-muted-foreground">{t.employeeId}</span>
          </div>
        </div>
      )
    },
  },
  {
    id: 'subjects',
    accessorFn: (row) => row.subjects.join(', '),
    header: 'Subjects',
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.subjects.slice(0, 2).map((s) => (
          <Badge key={s} variant="secondary">
            {s}
          </Badge>
        ))}
        {row.original.subjects.length > 2 && <Badge variant="secondary">+{row.original.subjects.length - 2}</Badge>}
      </div>
    ),
  },
  {
    id: 'experienceYears',
    accessorKey: 'experienceYears',
    header: 'Experience',
    cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue() as number} yrs</span>,
  },
  {
    id: 'performanceScore',
    accessorKey: 'performanceScore',
    header: 'Performance',
    cell: ({ getValue }) => <span className="text-sm font-medium text-foreground">{getValue() as number}/100</span>,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
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
            <Eye /> View profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Pencil /> Edit details
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CalendarClock /> View timetable
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => onDelete(row.original)}>
            <Trash2 /> Remove teacher
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
  ]
}
