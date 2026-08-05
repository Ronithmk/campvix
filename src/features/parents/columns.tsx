import type { LegacyColumnDef as ColumnDef } from '@tanstack/react-table/legacy'
import { MoreHorizontal, Eye, MessageSquare, Trash2 } from 'lucide-react'
import type { Parent } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { initials } from '@/lib/utils'

export function getParentColumns(onDelete: (parent: Parent) => void): ColumnDef<Parent, unknown>[] {
  return [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Parent',
    cell: ({ row }) => {
      const p = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarImage src={p.avatarUrl} alt={p.name} />
            <AvatarFallback>{initials(p.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">{p.name}</span>
            <span className="text-xs text-muted-foreground">{p.occupation}</span>
          </div>
        </div>
      )
    },
  },
  { id: 'email', accessorKey: 'email', header: 'Email', cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue() as string}</span> },
  { id: 'phone', accessorKey: 'phone', header: 'Phone', cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue() as string}</span> },
  {
    id: 'childrenIds',
    accessorFn: (row) => row.childrenIds.length,
    header: 'Children',
    cell: ({ getValue }) => <Badge variant="secondary">{getValue() as number} enrolled</Badge>,
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
            <MessageSquare /> Send message
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
