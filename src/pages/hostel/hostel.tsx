import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { BedDouble, Building2, Users, Plus, Trash2, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { DeleteConfirm } from '@/components/shared/delete-confirm'
import { hostelRooms as mockRooms } from '@/mock/facilities'
import { formatNumber, sleep } from '@/lib/utils'
import type { HostelRoom } from '@/types'
import { useActiveSchool } from '@/hooks/use-active-school'

const ROOM_TYPE_OPTIONS: { value: HostelRoom['type']; label: string }[] = [
  { value: 'single', label: 'Single' },
  { value: 'double', label: 'Double' },
  { value: 'dormitory', label: 'Dormitory' },
]

const roomSchema = z.object({
  roomNo: z.string().min(1, 'Room number is required'),
  block: z.string().min(1, 'Block is required'),
  floor: z.coerce.number().min(1, 'Enter a valid floor'),
  capacity: z.coerce.number().min(1, 'Enter a valid capacity'),
  type: z.enum(['single', 'double', 'dormitory'], { required_error: 'Select a room type' }),
})

type RoomValues = z.infer<typeof roomSchema>

export default function HostelPage() {
  const school = useActiveSchool()
  const [hostelRooms, setHostelRooms] = useState<HostelRoom[]>(mockRooms)
  const [blockFilter, setBlockFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)

  const form = useForm<RoomValues>({ resolver: zodResolver(roomSchema), defaultValues: { roomNo: '', block: '', floor: 1, capacity: 2, type: 'double' } })

  const schoolRooms = useMemo(() => hostelRooms.filter((r) => r.schoolId === school.id), [hostelRooms, school.id])
  const blocks = Array.from(new Set(schoolRooms.map((r) => r.block)))
  const filtered = useMemo(() => schoolRooms.filter((r) => blockFilter === 'all' || r.block === blockFilter), [schoolRooms, blockFilter])

  const totalCapacity = schoolRooms.reduce((sum, r) => sum + r.capacity, 0)
  const totalOccupied = schoolRooms.reduce((sum, r) => sum + r.occupied, 0)

  function handleDelete(id: string, roomNo: string) {
    setHostelRooms((prev) => prev.filter((r) => r.id !== id))
    toast.success(`Room ${roomNo} was removed`)
  }

  async function onSubmit(values: RoomValues) {
    await sleep(500)
    const newRoom: HostelRoom = {
      id: `room-new-${Date.now()}`,
      schoolId: school.id,
      roomNo: values.roomNo,
      block: values.block,
      floor: values.floor,
      capacity: values.capacity,
      occupied: 0,
      wardenName: 'Unassigned',
      type: values.type,
      occupants: [],
    }
    setHostelRooms((prev) => [newRoom, ...prev])
    toast.success('Room added')
    setDialogOpen(false)
    form.reset()
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Hostel"
        description={`Manage hostel rooms, allocations, and warden oversight at ${school.name}.`}
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" /> Add Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a hostel room</DialogTitle>
                <DialogDescription>Add a new room to {school.name}'s hostel blocks.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="roomNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room number</FormLabel>
                        <FormControl>
                          <Input placeholder="A105" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="block"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Block</FormLabel>
                        <FormControl>
                          <Input placeholder="Ashoka" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="floor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Floor</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} {...field} />
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
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ROOM_TYPE_OPTIONS.map((t) => (
                              <SelectItem key={t.value} value={t.value}>
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
                      Add room
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
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
