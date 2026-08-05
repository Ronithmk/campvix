import { useState } from 'react'
import { toast } from 'sonner'
import { AlertTriangle, Bell, CheckCheck, CheckCircle2, Info, Trash2, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/shared/empty-state'
import { DeleteConfirm } from '@/components/shared/delete-confirm'
import { notifications as initial } from '@/mock/notifications'
import { cn } from '@/lib/utils'
import type { NotificationKind } from '@/types'

const ICONS: Record<NotificationKind, typeof Info> = { info: Info, success: CheckCircle2, warning: AlertTriangle, danger: XCircle }
const ICON_STYLES: Record<NotificationKind, string> = {
  info: 'bg-primary/10 text-primary',
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  danger: 'bg-destructive/10 text-destructive',
}

function timeAgo(iso: string) {
  const hours = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function NotificationsPage() {
  const [items, setItems] = useState(initial)
  const unread = items.filter((n) => !n.read)

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((n) => n.id !== id))
    toast.success('Notification deleted')
  }

  function renderList(list: typeof items) {
    if (!list.length) return <EmptyState icon={Bell} title="You're all caught up" description="No notifications to show here." />
    return (
      <div className="flex flex-col divide-y divide-border">
        {list.map((n) => {
          const Icon = ICONS[n.kind]
          return (
            <div
              key={n.id}
              onClick={() => setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
              className={cn('flex cursor-pointer items-start gap-3 px-2 py-4 text-left transition-colors hover:bg-secondary/40', !n.read && 'bg-primary/[0.03]')}
            >
              <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-full', ICON_STYLES[n.kind])}>
                <Icon className="size-5" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                  {!n.read && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
                  {n.title}
                </span>
                <span className="text-sm text-muted-foreground">{n.description}</span>
                <span className="text-xs text-muted-foreground/80">{timeAgo(n.timestamp)}</span>
              </span>
              <DeleteConfirm title="Delete this notification?" description={`"${n.title}" will be permanently deleted.`} onConfirm={() => handleDelete(n.id)}>
                <Button variant="ghost" size="icon-sm" className="shrink-0 text-muted-foreground hover:text-destructive">
                  <Trash2 className="size-3.5" />
                </Button>
              </DeleteConfirm>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Notifications"
        description="Stay on top of everything happening across your school."
        actions={
          <Button variant="outline" onClick={() => setItems((prev) => prev.map((n) => ({ ...n, read: true })))}>
            <CheckCheck className="size-4" /> Mark all read
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6 pb-4">
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({items.length})</TabsTrigger>
              <TabsTrigger value="unread">Unread ({unread.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              {renderList(items)}
            </TabsContent>
            <TabsContent value="unread" className="mt-4">
              {renderList(unread)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
