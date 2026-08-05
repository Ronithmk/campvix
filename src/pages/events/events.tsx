import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { PartyPopper, CalendarDays, MapPin, Plus, Clock, Trash2, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

export default function EventsPage() {
  const school = useActiveSchool()
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>(mockEvents)
  const [dialogOpen, setDialogOpen] = useState(false)
  const calendarEvents = useMemo(() => allEvents.filter((e) => e.schoolId === school.id), [allEvents, school.id])
  const upcoming = calendarEvents.filter((e) => e.type === 'event' || e.type === 'sports')

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
        title="Events"
        description="Plan and promote school-wide events and activities."
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" /> Create Event
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
                      Save event
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
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
