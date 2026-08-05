import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Bus, Users, MapPin, Plus, Phone, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { DeleteConfirm } from '@/components/shared/delete-confirm'
import { transportRoutes as mockRoutes } from '@/mock/facilities'
import { cn, initials } from '@/lib/utils'
import type { TransportRoute } from '@/types'
import { useActiveSchool } from '@/hooks/use-active-school'

const STATUS_STYLES: Record<string, string> = {
  on_route: 'bg-success-bg text-success',
  idle: 'bg-secondary text-secondary-foreground',
  maintenance: 'bg-warning-bg text-warning',
}

export default function TransportPage() {
  const school = useActiveSchool()
  const [transportRoutes, setTransportRoutes] = useState<TransportRoute[]>(mockRoutes)

  const schoolRoutes = useMemo(() => transportRoutes.filter((r) => r.schoolId === school.id), [transportRoutes, school.id])
  const totalCapacity = schoolRoutes.reduce((sum, r) => sum + r.capacity, 0)
  const totalOccupied = schoolRoutes.reduce((sum, r) => sum + r.occupied, 0)
  const onRoute = schoolRoutes.filter((r) => r.status === 'on_route').length

  function handleDelete(id: string, name: string) {
    setTransportRoutes((prev) => prev.filter((r) => r.id !== id))
    toast.success(`${name} was removed`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Transport"
        description={`Manage bus routes, drivers, and student transport at ${school.name}.`}
        actions={
          <Button onClick={() => toast.success('Route created')}>
            <Plus className="size-4" /> Add Route
          </Button>
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
