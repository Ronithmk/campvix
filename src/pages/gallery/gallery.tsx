import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Images, Globe, Lock, Plus, Camera, Trash2, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DeleteConfirm } from '@/components/shared/delete-confirm'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { galleryAlbums as mockAlbums, COVER_COLORS } from '@/mock/platform'
import { formatDate, formatNumber, sleep } from '@/lib/utils'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'
import { useActiveSchool } from '@/hooks/use-active-school'
import type { GalleryAlbum } from '@/types'

const albumSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  eventDate: z.string().min(1, 'Event date is required'),
  isPublic: z.boolean(),
})

type AlbumValues = z.infer<typeof albumSchema>

export default function GalleryPage() {
  const role = useAuthStore((s) => s.role)
  const hasAccess = usePermissionsStore((s) => s.hasAccess)
  const canCreate = !!role && hasAccess(role, 'action:gallery:create')
  const school = useActiveSchool()
  const [galleryAlbums, setGalleryAlbums] = useState<GalleryAlbum[]>(mockAlbums)
  const [dialogOpen, setDialogOpen] = useState(false)
  const schoolAlbums = useMemo(() => galleryAlbums.filter((a) => a.schoolId === school.id), [galleryAlbums, school.id])
  const totalPhotos = schoolAlbums.reduce((sum, a) => sum + a.photoCount, 0)
  const publicAlbums = schoolAlbums.filter((a) => a.isPublic).length

  const form = useForm<AlbumValues>({
    resolver: zodResolver(albumSchema),
    defaultValues: { title: '', eventDate: new Date().toISOString().slice(0, 10), isPublic: true },
  })

  async function onSubmit(values: AlbumValues) {
    await sleep(500)
    const newAlbum: GalleryAlbum = {
      id: `album-new-${Date.now()}`,
      schoolId: school.id,
      title: values.title,
      coverColor: COVER_COLORS[schoolAlbums.length % COVER_COLORS.length],
      eventDate: new Date(values.eventDate).toISOString(),
      photoCount: 0,
      isPublic: values.isPublic,
    }
    setGalleryAlbums((prev) => [newAlbum, ...prev])
    toast.success(`${values.title} was created`)
    setDialogOpen(false)
    form.reset()
  }

  function handleDelete(id: string, title: string) {
    setGalleryAlbums((prev) => prev.filter((a) => a.id !== id))
    toast.success(`${title} was deleted`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Gallery"
        description="A photo and video gallery for school events and achievements."
        actions={
          canCreate && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" /> New Album
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new album</DialogTitle>
                <DialogDescription>Set up an album — you can upload photos to it afterwards.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Album title</FormLabel>
                        <FormControl>
                          <Input placeholder="Annual Sports Day 2026" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="eventDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border px-3 py-2.5">
                        <div className="flex flex-col gap-0.5">
                          <FormLabel>Public album</FormLabel>
                          <p className="text-xs text-muted-foreground">Visible to parents and students</p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
                      Create album
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          )
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard index={0} label="Total Albums" value={String(schoolAlbums.length)} icon={Images} accent="primary" change={0} />
        <StatCard index={1} label="Total Photos" value={formatNumber(totalPhotos)} icon={Camera} accent="accent" change={8.9} />
        <StatCard index={2} label="Public Albums" value={String(publicAlbums)} icon={Globe} accent="warning" change={0} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {schoolAlbums.map((album) => (
          <Card key={album.id} className="overflow-hidden transition-shadow hover:shadow-md">
            <div className="relative flex h-32 items-center justify-center" style={{ background: `linear-gradient(135deg, ${album.coverColor}, ${album.coverColor}99)` }}>
              <Images className="size-8 text-white/90" />
              <DeleteConfirm title="Delete this album?" description={`${album.title} and its photos will be permanently deleted.`} onConfirm={() => handleDelete(album.id, album.title)}>
                <button className="absolute top-2 right-2 rounded-md bg-black/20 p-1.5 text-white transition-colors hover:bg-black/40">
                  <Trash2 className="size-3.5" />
                </button>
              </DeleteConfirm>
            </div>
            <CardContent className="flex flex-col gap-2 py-4">
              <p className="line-clamp-1 text-sm font-semibold text-foreground">{album.title}</p>
              <p className="text-xs text-muted-foreground">{formatDate(album.eventDate)}</p>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{album.photoCount} photos</Badge>
                {album.isPublic ? <Globe className="size-3.5 text-muted-foreground" /> : <Lock className="size-3.5 text-muted-foreground" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
