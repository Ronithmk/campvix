import { useState } from 'react'
import { toast } from 'sonner'
import { PartyPopper, CalendarDays, MapPin, Plus, Clock, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DeleteConfirm } from '@/components/shared/delete-confirm'
import { calendarEvents as mockEvents } from '@/mock/notifications'
import { formatDate } from '@/lib/utils'
import type { CalendarEvent } from '@/types'

const TYPE_VARIANT: Record<CalendarEvent['type'], 'default' | 'success' | 'warning' | 'destructive' | 'accent'> = {
  exam: 'destructive',
  holiday: 'success',
  meeting: 'default',
  event: 'accent',
  sports: 'warning',
}

export default function EventsPage() {
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(mockEvents)
  const upcoming = calendarEvents.filter((e) => e.type === 'event' || e.type === 'sports')

  function handleDelete(id: string, title: string) {
    setCalendarEvents((prev) => prev.filter((e) => e.id !== id))
    toast.success(`${title} was deleted`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Events"
        description="Plan and promote school-wide events and activities."
        actions={
          <Button onClick={() => toast.success('Event created')}>
            <Plus className="size-4" /> Create Event
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard index={0} label="Total Events" value={String(calendarEvents.length)} icon={PartyPopper} accent="primary" change={0} />
        <StatCard index={1} label="This Month" value={String(upcoming.length)} icon={CalendarDays} accent="accent" change={0} />
        <StatCard index={2} label="Venues Booked" value="4" icon={MapPin} accent="warning" change={0} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {calendarEvents.map((e) => (
          <Card key={e.id} className="overflow-hidden transition-shadow hover:shadow-md">
            <div className="relative flex h-20 items-center justify-center bg-gradient-to-br from-primary/10 to-accent-solid/10">
              <PartyPopper className="size-7 text-primary" />
              <DeleteConfirm title="Delete this event?" description={`${e.title} will be permanently deleted.`} onConfirm={() => handleDelete(e.id, e.title)}>
                <button className="absolute top-2 right-2 rounded-md bg-black/10 p-1.5 text-foreground/70 transition-colors hover:bg-destructive/20 hover:text-destructive">
                  <Trash2 className="size-3.5" />
                </button>
              </DeleteConfirm>
            </div>
            <CardContent className="flex flex-col gap-2 py-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{e.title}</p>
                <Badge variant={TYPE_VARIANT[e.type]} className="shrink-0 capitalize">
                  {e.type}
                </Badge>
              </div>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="size-3.5" /> {formatDate(e.date)}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3.5" /> {e.time}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3.5" /> {e.location}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
