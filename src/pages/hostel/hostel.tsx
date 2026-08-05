import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { BedDouble, Building2, Users, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DeleteConfirm } from '@/components/shared/delete-confirm'
import { hostelRooms as mockRooms } from '@/mock/facilities'
import { formatNumber } from '@/lib/utils'
import type { HostelRoom } from '@/types'
import { useActiveSchool } from '@/hooks/use-active-school'

export default function HostelPage() {
  const school = useActiveSchool()
  const [hostelRooms, setHostelRooms] = useState<HostelRoom[]>(mockRooms)
  const [blockFilter, setBlockFilter] = useState('all')

  const schoolRooms = useMemo(() => hostelRooms.filter((r) => r.schoolId === school.id), [hostelRooms, school.id])
  const blocks = Array.from(new Set(schoolRooms.map((r) => r.block)))
  const filtered = useMemo(() => schoolRooms.filter((r) => blockFilter === 'all' || r.block === blockFilter), [schoolRooms, blockFilter])

  const totalCapacity = schoolRooms.reduce((sum, r) => sum + r.capacity, 0)
  const totalOccupied = schoolRooms.reduce((sum, r) => sum + r.occupied, 0)

  function handleDelete(id: string, roomNo: string) {
    setHostelRooms((prev) => prev.filter((r) => r.id !== id))
    toast.success(`Room ${roomNo} was removed`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Hostel"
        description={`Manage hostel rooms, allocations, and warden oversight at ${school.name}.`}
        actions={
          <Button onClick={() => toast.success('Room added')}>
            <Plus className="size-4" /> Add Room
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="Total Rooms" value={formatNumber(schoolRooms.length)} icon={BedDouble} accent="primary" change={0} />
        <StatCard index={1} label="Blocks" value={String(blocks.length)} icon={Building2} accent="accent" change={0} />
        <StatCard index={2} label="Beds Occupied" value={formatNumber(totalOccupied)} icon={Users} accent="warning" change={1.4} />
        <StatCard index={3} label="Occupancy Rate" value={totalCapacity ? `${Math.round((totalOccupied / totalCapacity) * 100)}%` : '0%'} icon={Users} accent="primary" change={0} />
      </div>

      <Select value={blockFilter} onValueChange={setBlockFilter}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Block" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All blocks</SelectItem>
          {blocks.map((b) => (
            <SelectItem key={b} value={b}>
              {b} Block
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {filtered.map((room) => {
          const isFull = room.occupied === room.capacity
          return (
            <Card key={room.id} className="transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col gap-3 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Room {room.roomNo}</p>
                  <div className="flex items-center gap-1">
                    <Badge variant={isFull ? 'destructive' : 'success'} className="capitalize">
                      {isFull ? 'Full' : 'Available'}
                    </Badge>
                    <DeleteConfirm title="Delete this room?" description={`Room ${room.roomNo} will be permanently deleted.`} onConfirm={() => handleDelete(room.id, room.roomNo)}>
                      <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="size-3.5" />
                      </Button>
                    </DeleteConfirm>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {room.block} Block &middot; Floor {room.floor} &middot; <span className="capitalize">{room.type}</span>
                </p>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Occupancy</span>
                    <span className="font-medium text-foreground">
                      {room.occupied}/{room.capacity}
                    </span>
                  </div>
                  <Progress value={(room.occupied / room.capacity) * 100} className="h-1.5" />
                </div>
                <p className="text-xs text-muted-foreground">Warden: {room.wardenName}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
