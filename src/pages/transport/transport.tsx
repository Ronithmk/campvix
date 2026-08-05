import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Bus, Users, MapPin, Plus, Phone, Trash2, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { DeleteConfirm } from '@/components/shared/delete-confirm'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { transportRoutes as mockRoutes } from '@/mock/facilities'
import { cn, initials, sleep } from '@/lib/utils'
import type { TransportRoute } from '@/types'
import { useActiveSchool } from '@/hooks/use-active-school'

const STATUS_STYLES: Record<string, string> = {
  on_route: 'bg-success-bg text-success',
  idle: 'bg-secondary text-secondary-foreground',
  maintenance: 'bg-warning-bg text-warning',
}

const routeSchema = z.object({
  name: z.string().min(2, 'Route name is required'),
  vehicleNo: z.string().min(2, 'Vehicle number is required'),
  driverName: z.string().min(2, 'Driver name is required'),
  capacity: z.coerce.number().min(1, 'Enter a valid capacity'),
})

type RouteValues = z.infer<typeof routeSchema>

export default function TransportPage() {
  const school = useActiveSchool()
  const [transportRoutes, setTransportRoutes] = useState<TransportRoute[]>(mockRoutes)
  const [dialogOpen, setDialogOpen] = useState(false)

  const form = useForm<RouteValues>({ resolver: zodResolver(routeSchema), defaultValues: { name: '', vehicleNo: '', driverName: '', capacity: 40 } })

  const schoolRoutes = useMemo(() => transportRoutes.filter((r) => r.schoolId === school.id), [transportRoutes, school.id])
  const totalCapacity = schoolRoutes.reduce((sum, r) => sum + r.capacity, 0)
  const totalOccupied = schoolRoutes.reduce((sum, r) => sum + r.occupied, 0)
  const onRoute = schoolRoutes.filter((r) => r.status === 'on_route').length

  function handleDelete(id: string, name: string) {
    setTransportRoutes((prev) => prev.filter((r) => r.id !== id))
    toast.success(`${name} was removed`)
  }

  async function onSubmit(values: RouteValues) {
    await sleep(500)
    const newRoute: TransportRoute = {
      id: `route-new-${Date.now()}`,
      schoolId: school.id,
      name: values.name,
      vehicleNo: values.vehicleNo,
      driverName: values.driverName,
      driverAvatar: `https://avatars.githubusercontent.com/u/${Math.floor(Math.random() * 900000)}?v=4`,
      driverPhone: '+91 90000 00000',
      capacity: values.capacity,
      occupied: 0,
      stops: ['School Gate'],
      status: 'idle',
      currentStop: 'School Gate',
      etaMinutes: 0,
    }
    setTransportRoutes((prev) => [newRoute, ...prev])
    toast.success('Route created')
    setDialogOpen(false)
    form.reset()
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Transport"
        description={`Manage bus routes, drivers, and student transport at ${school.name}.`}
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" /> Add Route
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a transport route</DialogTitle>
                <DialogDescription>Set up a new bus route for {school.name}.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Route name</FormLabel>
                        <FormControl>
                          <Input placeholder="Route G - Lakeside" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vehicleNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle number</FormLabel>
                        <FormControl>
                          <Input placeholder="KA-05-AB-1234" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="driverName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Driver name</FormLabel>
                        <FormControl>
                          <Input placeholder="Suresh Kumar" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
                      Add route
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="Active Routes" value={String(schoolRoutes.length)} icon={Bus} accent="primary" change={0} />
        <StatCard index={1} label="On Route Now" value={String(onRoute)} icon={MapPin} accent="accent" change={0} />
        <StatCard index={2} label="Students Enrolled" value={String(totalOccupied)} icon={Users} accent="warning" change={2.1} />
        <StatCard index={3} label="Capacity Utilization" value={totalCapacity ? `${Math.round((totalOccupied / totalCapacity) * 100)}%` : '0%'} icon={Users} accent="primary" change={0} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {schoolRoutes.map((route) => (
          <Card key={route.id} className="transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col gap-4 py-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col">
                  <p className="text-sm font-semibold text-foreground">{route.name}</p>
                  <p className="text-xs text-muted-foreground">{route.vehicleNo}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium capitalize', STATUS_STYLES[route.status])}>{route.status.replace('_', ' ')}</span>
                  <DeleteConfirm title="Delete this route?" description={`${route.name} will be permanently deleted.`} onConfirm={() => handleDelete(route.id, route.name)}>
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="size-3.5" />
                    </Button>
                  </DeleteConfirm>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Avatar className="size-9">
                  <AvatarImage src={route.driverAvatar} alt={route.driverName} />
                  <AvatarFallback>{initials(route.driverName)}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">{route.driverName}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone className="size-3" /> {route.driverPhone}
                  </span>
                </div>
                {route.status === 'on_route' && (
                  <Badge variant="accent" className="shrink-0">
                    ETA {route.etaMinutes}m
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {route.stops.map((stop) => (
                  <Badge key={stop} variant={stop === route.currentStop ? 'default' : 'outline'} className="text-[11px]">
                    <MapPin className="size-2.5" /> {stop}
                  </Badge>
                ))}
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Occupancy</span>
                  <span className="font-medium text-foreground">
                    {route.occupied}/{route.capacity}
                  </span>
                </div>
                <Progress value={(route.occupied / route.capacity) * 100} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
