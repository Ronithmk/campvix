import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Layers, Scale, Plus, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { classes as mockClasses } from '@/mock/classes'
import { teachers } from '@/mock/teachers'
import { cn, sleep } from '@/lib/utils'
import { useActiveSchool } from '@/hooks/use-active-school'
import type { SchoolClass } from '@/types'

const sectionSchema = z.object({
  grade: z.string().min(2, 'Grade is required'),
  section: z.string().min(1, 'Section letter is required').max(2, 'Keep it short'),
  strength: z.coerce.number().min(1, 'Strength must be at least 1').max(60, 'Strength must be 60 or fewer'),
})

type SectionValues = z.infer<typeof sectionSchema>

export default function SectionsPage() {
  const school = useActiveSchool()
  const [classes, setClasses] = useState<SchoolClass[]>(mockClasses)
  const [dialogOpen, setDialogOpen] = useState(false)

  const schoolClasses = useMemo(() => classes.filter((c) => c.schoolId === school.id), [classes, school.id])

  const { grouped, imbalanced } = useMemo(() => {
    const g = new Map<string, SchoolClass[]>()
    for (const c of schoolClasses) {
      const grade = c.name.split(' - ')[0]
      g.set(grade, [...(g.get(grade) ?? []), c])
    }
    const imb = Array.from(g.values()).filter((secs) => {
      const strengths = secs.map((s) => s.strength)
      return Math.max(...strengths) - Math.min(...strengths) > 8
    }).length
    return { grouped: g, imbalanced: imb }
  }, [schoolClasses])

  const form = useForm<SectionValues>({ resolver: zodResolver(sectionSchema), defaultValues: { grade: '', section: '', strength: 20 } })

  async function onSubmit(values: SectionValues) {
    await sleep(500)
    const schoolTeachers = teachers.filter((t) => t.schoolId === school.id)
    const newSection: SchoolClass = {
      id: `class-new-${Date.now()}`,
      schoolId: school.id,
      name: `${values.grade} - ${values.section}`,
      sections: [values.section],
      classTeacherId: schoolTeachers[0]?.id ?? '',
      strength: values.strength,
      room: 'TBD',
    }
    setClasses((prev) => [newSection, ...prev])
    toast.success(`${newSection.name} was added`)
    setDialogOpen(false)
    form.reset()
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Sections"
        description={`Compare section strength and balance enrollment within each grade at ${school.name}.`}
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" /> Add Section
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a new section</DialogTitle>
                <DialogDescription>Create a new grade + section combination to track its balance.</DialogDescription>
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
                        <FormLabel>Section letter</FormLabel>
                        <FormControl>
                          <Input placeholder="C" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="strength"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Starting strength</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
                      Add section
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard index={0} label="Total Sections" value={String(schoolClasses.length)} icon={Layers} accent="primary" change={0} />
        <StatCard index={1} label="Grades Covered" value={String(grouped.size)} icon={Layers} accent="accent" change={0} />
        <StatCard index={2} label="Imbalanced Grades" value={String(imbalanced)} icon={Scale} accent="warning" change={0} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {Array.from(grouped.entries()).map(([grade, sections]) => {
          const maxStrength = Math.max(...sections.map((s) => s.strength))
          return (
            <Card key={grade}>
              <CardHeader>
                <CardTitle>{grade}</CardTitle>
                <CardDescription>{sections.length} sections</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pb-6">
                {sections.map((s) => {
                  const teacher = teachers.find((t) => t.id === s.classTeacherId)
                  const isHigh = s.strength === maxStrength && maxStrength - Math.min(...sections.map((x) => x.strength)) > 8
                  return (
                    <div key={s.id} className="flex items-center gap-3">
                      <span className="w-6 text-sm font-medium text-foreground">{s.sections[0]}</span>
                      <div className="flex-1">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                          <div className={cn('h-full rounded-full', isHigh ? 'bg-warning' : 'bg-primary')} style={{ width: `${(s.strength / maxStrength) * 100}%` }} />
                        </div>
                      </div>
                      <span className="w-10 text-right text-xs font-medium text-foreground">{s.strength}</span>
                      <span className="w-32 truncate text-xs text-muted-foreground">{teacher?.name}</span>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
