import { useState } from 'react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, MapPin, Plus, Loader2, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { DeleteConfirm } from '@/components/shared/delete-confirm'
import { schools as initialSchools } from '@/mock/schools'
import type { School } from '@/types'
import { formatNumber, sleep } from '@/lib/utils'

const PLAN_LABEL: Record<string, string> = { starter: 'Starter', growth: 'Growth', enterprise: 'Enterprise' }

const schoolSchema = z.object({
  name: z.string().min(2, 'School name is required'),
  city: z.string().min(2, 'City is required'),
  country: z.string().min(2, 'Country is required'),
})

type SchoolValues = z.infer<typeof schoolSchema>

export default function SchoolsSettingsPage() {
  const [schools, setSchools] = useState<School[]>(initialSchools)
  const [open, setOpen] = useState(false)
  const form = useForm<SchoolValues>({ resolver: zodResolver(schoolSchema), defaultValues: { name: '', city: '', country: 'India' } })

  async function onSubmit(values: SchoolValues) {
    await sleep(500)
    const school: School = {
      id: `school-new-${Date.now()}`,
      name: values.name,
      slug: values.name.toLowerCase().replace(/\s+/g, '-'),
      logoUrl: '',
      city: values.city,
      country: values.country,
      primaryColor: '#2563eb',
      plan: 'starter',
      studentCount: 0,
      establishedYear: new Date().getFullYear(),
    }
    setSchools((prev) => [...prev, school])
    toast.success(`${school.name} added to your account`)
    setOpen(false)
    form.reset()
  }

  function handleDelete(id: string, name: string) {
    if (schools.length <= 1) {
      toast.error('You must keep at least one school')
      return
    }
    setSchools((prev) => prev.filter((s) => s.id !== id))
    toast.success(`${name} was removed from your account`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Schools"
        description="Manage every school in your multi-tenant CampusFlow account."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" /> Add School
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a new school</DialogTitle>
                <DialogDescription>Create an isolated workspace for a new campus.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>School name</FormLabel>
                        <FormControl>
                          <Input placeholder="Lakeside High School" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Mumbai" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
                      Create school
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {schools.map((school) => (
          <Card key={school.id} className="transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col gap-3 py-5">
              <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: school.primaryColor }}>
                  <Building2 className="size-5" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate text-sm font-semibold text-foreground">{school.name}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" /> {school.city}, {school.country}
                  </p>
                </div>
                <Badge variant="secondary">{PLAN_LABEL[school.plan]}</Badge>
                <DeleteConfirm title="Remove this school?" description={`${school.name} and all of its isolated data will be permanently removed from your account.`} onConfirm={() => handleDelete(school.id, school.name)}>
                  <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-3.5" />
                  </Button>
                </DeleteConfirm>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatNumber(school.studentCount)} students</span>
                <span>Est. {school.establishedYear}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast.success(`Switched to ${school.name}`)}>
                Manage workspace
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
