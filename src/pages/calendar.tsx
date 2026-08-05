import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DayPicker } from 'react-day-picker'
import { CalendarClock, MapPin, Plus, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DeleteConfirm } from '@/components/shared/delete-confirm'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { calendarEvents as mockEvents } from '@/mock/notifications'
import { formatDate, sleep } from '@/lib/utils'
import { useActiveSchool } from '@/hooks/use-active-school'
import type { CalendarEvent } from '@/types'

const TYPE_VARIANT: Record<CalendarEvent['type'], 'default' | 'success' | 'warning' | 'destructive' | 'accent'> = {
  exam: 'destructive',
  holiday: 'success',
  meeting: 'default',
  event: 'accent',
  sports: 'warning',
}

const eventSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  type: z.enum(['exam', 'holiday', 'meeting', 'event', 'sports']),
  location: z.string().min(2, 'Location is required'),
})

type EventValues = z.infer<typeof eventSchema>

export default function CalendarPage() {
  const school = useActiveSchool()
  const [selected, setSelected] = useState<Date | undefined>(new Date())
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>(mockEvents)
  const [dialogOpen, setDialogOpen] = useState(false)
  const calendarEvents = useMemo(() => allEvents.filter((e) => e.schoolId === school.id), [allEvents, school.id])

  const form = useForm<EventValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: { title: '', date: new Date().toISOString().slice(0, 10), time: '09:00', type: 'event', location: '' },
  })

  async function onSubmit(values: EventValues) {
    await sleep(500)
    const newEvent: CalendarEvent = {
      id: `event-new-${Date.now()}`,
      schoolId: school.id,
      title: values.title,
      date: new Date(values.date).toISOString(),
      time: values.time,
      type: values.type,
      location: values.location,
    }
    setAllEvents((prev) => [newEvent, ...prev])
    toast.success('Event created')
    setDialogOpen(false)
    form.reset()
  }

  function handleDelete(id: string, title: string) {
    setAllEvents((prev) => prev.filter((e) => e.id !== id))
    toast.success(`${title} was deleted`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Calendar"
        description="Academic calendar, holidays, and school-wide events."
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" /> New Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new event</DialogTitle>
                <DialogDescription>Add an event to {school.name}'s calendar.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event title</FormLabel>
                        <FormControl>
                          <Input placeholder="Annual Sports Day" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="exam">Exam</SelectItem>
                            <SelectItem value="holiday">Holiday</SelectItem>
                            <SelectItem value="meeting">Meeting</SelectItem>
                            <SelectItem value="event">Event</SelectItem>
                            <SelectItem value="sports">Sports</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Main Auditorium" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
                      Create event
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
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
