import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Users2, GraduationCap, Heart, Plus, Trash2, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { DeleteConfirm } from '@/components/shared/delete-confirm'
import { alumni as mockAlumni } from '@/mock/platform'
import { initials, sleep } from '@/lib/utils'
import { useActiveSchool } from '@/hooks/use-active-school'
import type { AlumniProfile } from '@/types'

const alumniSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  graduationYear: z.coerce.number().min(1950, 'Enter a valid year').max(2100, 'Enter a valid year'),
  currentRole: z.string().min(2, 'Current role is required'),
  company: z.string().min(2, 'Company is required'),
  email: z.string().email('Enter a valid email'),
})

type AlumniValues = z.infer<typeof alumniSchema>

export default function AlumniPage() {
  const school = useActiveSchool()
  const [allAlumni, setAllAlumni] = useState<AlumniProfile[]>(mockAlumni)
  const alumni = useMemo(() => allAlumni.filter((a) => a.schoolId === school.id), [allAlumni, school.id])
  const [search, setSearch] = useState('')
  const [yearFilter, setYearFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const years = Array.from(new Set(alumni.map((a) => a.graduationYear))).sort((a, b) => b - a)

  const filtered = useMemo(
    () => alumni.filter((a) => (yearFilter === 'all' || String(a.graduationYear) === yearFilter) && a.name.toLowerCase().includes(search.toLowerCase())),
    [alumni, search, yearFilter],
  )

  const donors = alumni.filter((a) => a.donated).length

  const form = useForm<AlumniValues>({
    resolver: zodResolver(alumniSchema),
    defaultValues: { name: '', graduationYear: new Date().getFullYear(), currentRole: '', company: '', email: '' },
  })

  async function onSubmit(values: AlumniValues) {
    await sleep(500)
    const newAlumnus: AlumniProfile = {
      id: `alumni-new-${Date.now()}`,
      schoolId: school.id,
      name: values.name,
      avatarUrl: `https://avatars.githubusercontent.com/u/${Math.floor(Math.random() * 900000)}?v=4`,
      graduationYear: values.graduationYear,
      currentRole: values.currentRole,
      company: values.company,
      location: 'Not provided',
      email: values.email,
      linkedIn: `linkedin.com/in/${values.name.toLowerCase().replace(/\s+/g, '-')}`,
      donated: false,
    }
    setAllAlumni((prev) => [newAlumnus, ...prev])
    toast.success('Invitation sent')
    setDialogOpen(false)
    form.reset()
  }

  function handleDelete(id: string, name: string) {
    setAllAlumni((prev) => prev.filter((a) => a.id !== id))
    toast.success(`${name} was removed`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Alumni"
        description="Stay connected with graduates through the alumni network."
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" /> Invite Alumni
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite an alumnus</DialogTitle>
                <DialogDescription>Add a graduate to {school.name}'s alumni network.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name</FormLabel>
                        <FormControl>
                          <Input placeholder="Ananya Sharma" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="graduationYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Graduation year</FormLabel>
                        <FormControl>
                          <Input type="number" min={1950} max={2100} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currentRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current role</FormLabel>
                        <FormControl>
                          <Input placeholder="Software Engineer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Input placeholder="Google" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="ananya@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
                      Send invitation
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard index={0} label="Total Alumni" value={String(alumni.length)} icon={Users2} accent="primary" change={0} />
        <StatCard index={1} label="Graduation Years" value={String(years.length)} icon={GraduationCap} accent="accent" change={0} />
        <StatCard index={2} label="Donors" value={String(donors)} icon={Heart} accent="warning" change={0} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Input placeholder="Search alumni..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                Class of {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((a) => (
          <Card key={a.id} className="transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col gap-3 py-5">
              <div className="flex items-center gap-3">
                <Avatar className="size-11">
                  <AvatarImage src={a.avatarUrl} alt={a.name} />
                  <AvatarFallback>{initials(a.name)}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate text-sm font-semibold text-foreground">{a.name}</p>
                  <p className="text-xs text-muted-foreground">Class of {a.graduationYear}</p>
                </div>
                {a.donated && <Heart className="size-4 shrink-0 fill-destructive text-destructive" />}
                <DeleteConfirm title="Remove this alumnus?" description={`${a.name} will be permanently removed from the directory.`} onConfirm={() => handleDelete(a.id, a.name)}>
                  <Button variant="ghost" size="icon-sm" className="shrink-0 text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-3.5" />
                  </Button>
                </DeleteConfirm>
              </div>
              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                <span>
                  {a.currentRole} at <span className="font-medium text-foreground">{a.company}</span>
                </span>
                <span>{a.location}</span>
              </div>
              <Badge variant="outline" className="w-fit">
                {a.linkedIn}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
