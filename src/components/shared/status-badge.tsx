import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const STATUS_MAP: Record<string, { variant: 'success' | 'warning' | 'destructive' | 'secondary' | 'accent'; label?: string }> = {
  active: { variant: 'success' },
  present: { variant: 'success' },
  paid: { variant: 'success' },
  completed: { variant: 'success' },
  graded: { variant: 'success' },
  approved: { variant: 'success' },
  on_leave: { variant: 'warning', label: 'On Leave' },
  pending: { variant: 'warning' },
  partial: { variant: 'warning' },
  late: { variant: 'warning' },
  upcoming: { variant: 'accent' },
  ongoing: { variant: 'accent' },
  inactive: { variant: 'secondary' },
  graduated: { variant: 'secondary' },
  excused: { variant: 'secondary' },
  suspended: { variant: 'destructive' },
  overdue: { variant: 'destructive' },
  absent: { variant: 'destructive' },
  rejected: { variant: 'destructive' },
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const meta = STATUS_MAP[status] ?? { variant: 'secondary' as const }
  const label = meta.label ?? status.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())

  return (
    <Badge variant={meta.variant} className={cn('capitalize', className)}>
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </Badge>
  )
}
