import type { LegacyColumnDef as ColumnDef } from '@tanstack/react-table/legacy'
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react'
import type { Staff, StaffRole } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { StatusBadge } from '@/components/shared/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { formatDate, initials } from '@/lib/utils'

const ROLE_LABELS: Record<StaffRole, string> = {
  accountant: 'Accountant',
  receptionist: 'Receptionist',
  driver: 'Driver',
  librarian: 'Librarian',
  admin_staff: 'Admin Staff',
}

export function getStaffColumns(onDelete: (staff: Staff) => void): ColumnDef<Staff, unknown>[] {
  return [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Staff Member',
    cell: ({ row }) => {
      const s = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarImage src={s.avatarUrl} alt={s.name} />
            <AvatarFallback>{initials(s.name)}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-foreground">{s.name}</span>
        </div>
      )
    },
  },
  {
    id: 'role',
    accessorKey: 'role',
    header: 'Role',
    cell: ({ getValue }) => <Badge variant="secondary">{ROLE_LABELS[getValue() as StaffRole]}</Badge>,
  },
  { id: 'email', accessorKey: 'email', header: 'Email', cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue() as string}</span> },
  { id: 'phone', accessorKey: 'phone', header: 'Phone', cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue() as string}</span> },
  { id: 'joiningDate', accessorKey: 'joiningDate', header: 'Joined', cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{formatDate(getValue() as string)}</span> },
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
            <Eye /> View profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Pencil /> Edit details
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => onDelete(row.original)}>
            <Trash2 /> Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
  ]
}
