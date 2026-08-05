import { useMemo, useState } from 'react'
import { Bus, MapPin, Navigation, Phone } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { transportRoutes as allRoutes } from '@/mock/facilities'
import { cn, initials } from '@/lib/utils'
import { useActiveSchool } from '@/hooks/use-active-school'

const POSITIONS = [
  { top: '22%', left: '30%' },
  { top: '55%', left: '62%' },
  { top: '70%', left: '20%' },
  { top: '35%', left: '75%' },
  { top: '15%', left: '58%' },
  { top: '80%', left: '48%' },
]

export default function GpsTrackingPage() {
  const school = useActiveSchool()
  const transportRoutes = useMemo(() => allRoutes.filter((r) => r.schoolId === school.id), [school.id])
  const [selected, setSelected] = useState(transportRoutes[0]?.id)
  const activeSelected = transportRoutes.some((r) => r.id === selected) ? selected : transportRoutes[0]?.id
  const activeRoutes = transportRoutes.filter((r) => r.status === 'on_route')

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="GPS Tracking" description={`Live location tracking for every transport vehicle at ${school.name}.`} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="overflow-hidden xl:col-span-2">
          <div className="relative h-[520px] bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:32px_32px] bg-secondary/20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent-solid/5" />
            {transportRoutes.map((route, i) => {
              const pos = POSITIONS[i % POSITIONS.length]
              const isActive = route.status === 'on_route'
              const isSelected = route.id === activeSelected
              return (
                <button
                  key={route.id}
                  onClick={() => setSelected(route.id)}
                  className={cn(
                    'absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-lg transition-all',
                    isSelected ? 'z-10 size-12 bg-primary text-primary-foreground ring-4 ring-primary/20' : 'size-9 bg-card text-foreground',
                    !isActive && 'opacity-50',
                  )}
                  style={pos}
                >
                  <Bus className={isSelected ? 'size-5' : 'size-4'} />
                  {isActive && <span className="absolute -right-0.5 -top-0.5 size-2.5 animate-pulse rounded-full bg-success ring-2 ring-card" />}
                </button>
              )
            })}
            <div className="absolute bottom-4 left-4 rounded-lg bg-card/90 px-3 py-2 text-xs text-muted-foreground shadow-sm backdrop-blur-sm">
              Illustrative live map &middot; {activeRoutes.length} vehicles on route
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-3">
          {transportRoutes.map((route) => (
            <Card
              key={route.id}
              onClick={() => setSelected(route.id)}
              className={cn('cursor-pointer transition-all hover:shadow-md', activeSelected === route.id && 'border-primary ring-1 ring-primary/30')}
            >
              <CardContent className="flex flex-col gap-2.5 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">{route.name}</p>
                  <Badge variant={route.status === 'on_route' ? 'success' : route.status === 'maintenance' ? 'warning' : 'secondary'} className="capitalize">
                    {route.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="size-7">
                    <AvatarImage src={route.driverAvatar} alt={route.driverName} />
                    <AvatarFallback>{initials(route.driverName)}</AvatarFallback>
                  </Avatar>
                  <span className="truncate text-xs text-muted-foreground">{route.driverName}</span>
                  <a href="#" className="ml-auto text-muted-foreground hover:text-primary" onClick={(e) => e.preventDefault()}>
                    <Phone className="size-3.5" />
                  </a>
                </div>
                {route.status === 'on_route' && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Navigation className="size-3.5 text-primary" /> Near {route.currentStop} &middot; ETA {route.etaMinutes}m
                  </div>
                )}
                <div className="flex flex-wrap gap-1">
                  {route.stops.map((s) => (
                    <span key={s} className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground">
                      <MapPin className="size-2.5" /> {s}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
