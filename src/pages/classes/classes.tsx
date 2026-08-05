import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { School, Users, DoorOpen, Plus, Trash2, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DeleteConfirm } from '@/components/shared/delete-confirm'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { classes as mockClasses } from '@/mock/classes'
import { teachers } from '@/mock/teachers'
import { formatNumber, initials, sleep } from '@/lib/utils'
import type { SchoolClass } from '@/types'
import { useActiveSchool } from '@/hooks/use-active-school'

const classSchema = z.object({
  grade: z.string().min(2, 'Grade is required'),
  section: z
    .string()
    .min(1, 'Section is required')
    .max(2, 'Use a short section label'),
  room: z.string().min(1, 'Room is required'),
  classTeacherId: z.string().min(1, 'Select a class teacher'),
})

type ClassValues = z.infer<typeof classSchema>

export default function ClassesPage() {
  const school = useActiveSchool()
  const [classes, setClasses] = useState<SchoolClass[]>(mockClasses)
  const [dialogOpen, setDialogOpen] = useState(false)

  const schoolClasses = useMemo(() => classes.filter((c) => c.schoolId === school.id), [classes, school.id])
  const schoolTeachers = useMemo(() => teachers.filter((t) => t.schoolId === school.id), [school.id])
  const totalStrength = schoolClasses.reduce((sum, c) => sum + c.strength, 0)
  const avgStrength = schoolClasses.length ? Math.round(totalStrength / schoolClasses.length) : 0

  const form = useForm<ClassValues>({ resolver: zodResolver(classSchema), defaultValues: { grade: '', section: '', room: '', classTeacherId: '' } })

  async function onSubmit(values: ClassValues) {
    await sleep(500)
    const newClass: SchoolClass = {
      id: `class-new-${Date.now()}`,
      schoolId: school.id,
      name: `${values.grade} - ${values.section}`,
      sections: [values.section],
      classTeacherId: values.classTeacherId,
      strength: 0,
      room: values.room,
    }
    setClasses((prev) => [newClass, ...prev])
    toast.success(`${newClass.name} was created`)
    setDialogOpen(false)
    form.reset()
  }

  function handleDelete(id: string, name: string) {
    setClasses((prev) => prev.filter((c) => c.id !== id))
    toast.success(`${name} was removed`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Classes"
        description={`Configure grades, class teachers, and room assignments at ${school.name}.`}
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" /> Add Class
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a new class</DialogTitle>
                <DialogDescription>Set up a grade and section — you can enroll students into it afterwards.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="grade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade</FormLabel>
                        <FormControl>
                          <Input placeholder="Grade 11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="section"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section</FormLabel>
                        <FormControl>
                          <Input placeholder="C" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="room"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room</FormLabel>
                        <FormControl>
                          <Input placeholder="2B-210" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="classTeacherId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class teacher</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select class teacher" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {schoolTeachers.map((t) => (
                              <SelectItem key={t.id} value={t.id}>
                                {t.name}
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
                      Add class
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard index={0} label="Total Classes" value={String(schoolClasses.length)} icon={School} accent="primary" change={0} />
        <StatCard index={1} label="Total Students" value={formatNumber(totalStrength)} icon={Users} accent="accent" change={4.2} />
        <StatCard index={2} label="Avg. Class Size" value={String(avgStrength)} icon={DoorOpen} accent="warning" change={-1.1} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {schoolClasses.map((klass) => {
          const teacher = teachers.find((t) => t.id === klass.classTeacherId)
          const fillPercent = Math.round((klass.strength / 42) * 100)
          return (
            <Card key={klass.id} className="transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col gap-4 py-5">
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-foreground">{klass.name}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">{klass.room}</span>
                    <DeleteConfirm title="Delete this class?" description={`${klass.name} will be permanently deleted. This does not remove enrolled students.`} onConfirm={() => handleDelete(klass.id, klass.name)}>
                      <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="size-3.5" />
                      </Button>
                    </DeleteConfirm>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Avatar className="size-8">
                    <AvatarImage src={teacher?.avatarUrl} alt={teacher?.name} />
                    <AvatarFallback>{teacher ? initials(teacher.name) : '?'}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Class Teacher</span>
                    <span className="text-sm font-medium text-foreground">{teacher?.name ?? 'Unassigned'}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Strength</span>
                    <span className="font-medium text-foreground">{klass.strength} students</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${fillPercent}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
