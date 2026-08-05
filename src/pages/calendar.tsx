import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { CalendarClock, MapPin, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

export default function CalendarPage() {
  const [selected, setSelected] = useState<Date | undefined>(new Date())
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(mockEvents)

  function handleDelete(id: string, title: string) {
    setCalendarEvents((prev) => prev.filter((e) => e.id !== id))
    toast.success(`${title} was deleted`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Calendar"
        description="Academic calendar, holidays, and school-wide events."
        actions={
          <Button onClick={() => toast.success('Event created')}>
            <Plus className="size-4" /> New Event
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardContent className="flex justify-center pt-6 pb-6">
            <DayPicker
              mode="single"
              selected={selected}
              onSelect={setSelected}
              className="w-full max-w-md"
              classNames={{
                months: 'flex flex-col',
                month_caption: 'flex justify-center py-2 text-sm font-medium text-foreground',
                weekdays: 'flex',
                weekday: 'w-10 text-center text-xs font-medium text-muted-foreground',
                week: 'flex w-full',
                day: 'p-0.5',
                day_button: 'size-9 flex items-center justify-center text-sm rounded-lg hover:bg-secondary cursor-pointer text-foreground transition-colors',
                selected: '[&>button]:bg-primary! [&>button]:text-primary-foreground!',
                today: '[&>button]:font-semibold [&>button]:text-primary',
                outside: '[&>button]:text-muted-foreground/40',
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Upcoming events</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border pb-4">
            {calendarEvents.map((e) => (
              <div key={e.id} className="flex items-start gap-3 py-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CalendarClock className="size-4" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">{e.title}</p>
                    <Badge variant={TYPE_VARIANT[e.type]} className="capitalize">
                      {e.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatDate(e.date)} &middot; {e.time}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" /> {e.location}
                  </p>
                </div>
                <DeleteConfirm title="Delete this event?" description={`${e.title} will be permanently removed from the calendar.`} onConfirm={() => handleDelete(e.id, e.title)}>
                  <Button variant="ghost" size="icon-sm" className="shrink-0 text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-3.5" />
                  </Button>
                </DeleteConfirm>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
