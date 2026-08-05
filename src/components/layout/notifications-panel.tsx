import { Bell, CheckCheck, AlertTriangle, Info, XCircle, CheckCircle2 } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { notifications as initialNotifications } from '@/mock/notifications'
import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { useActiveSchool } from '@/hooks/use-active-school'
import type { NotificationKind } from '@/types'

const ICONS: Record<NotificationKind, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
}

const ICON_STYLES: Record<NotificationKind, string> = {
  info: 'bg-primary/10 text-primary',
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  danger: 'bg-destructive/10 text-destructive',
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function NotificationsPanel() {
  const school = useActiveSchool()
  const [allItems, setAllItems] = useState(initialNotifications)
  const items = useMemo(() => allItems.filter((n) => n.schoolId === school.id), [allItems, school.id])
  const unread = items.filter((n) => !n.read).length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="size-4" />
          {unread > 0 && <span className="absolute top-1.5 right-1.5 flex size-2 rounded-full bg-destructive ring-2 ring-card" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            <p className="text-xs text-muted-foreground">{unread} unread</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setAllItems((prev) => prev.map((n) => (n.schoolId === school.id ? { ...n, read: true } : n)))}>
            <CheckCheck className="size-3.5" /> Mark all read
          </Button>
        </div>
        <Separator />
        <ScrollArea className="h-96">
          <div className="flex flex-col">
            {items.map((n) => {
              const Icon = ICONS[n.kind]
              return (
                <button
                  key={n.id}
                  onClick={() => setAllItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
                  className={cn('flex items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-secondary/50', !n.read && 'bg-primary/[0.03]')}
                >
                  <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-full', ICON_STYLES[n.kind])}>
                    <Icon className="size-4" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                      {!n.read && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
                      {n.title}
                    </span>
                    <span className="line-clamp-2 text-xs text-muted-foreground">{n.description}</span>
                    <span className="text-[11px] text-muted-foreground/80">{timeAgo(n.timestamp)}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
