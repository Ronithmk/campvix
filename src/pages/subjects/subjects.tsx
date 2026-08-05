import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { BookOpen, Plus, Users, Trash2, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DeleteConfirm } from '@/components/shared/delete-confirm'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { subjects as mockSubjects } from '@/mock/subjects'
import { teachers } from '@/mock/teachers'
import { cn, sleep } from '@/lib/utils'
import { useActiveSchool } from '@/hooks/use-active-school'
import type { Subject } from '@/types'

const SUBJECT_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#0ea5e9', '#ef4444', '#ec4899', '#14b8a6']

const subjectSchema = z.object({
  name: z.string().min(2, 'Subject name is required'),
  code: z.string().min(2, 'Code is required').max(6, 'Keep the code short'),
  color: z.string().min(1, 'Pick a color'),
})

type SubjectValues = z.infer<typeof subjectSchema>

export default function SubjectsPage() {
  const school = useActiveSchool()
  const [subjects, setSubjects] = useState<Subject[]>(mockSubjects)
  const [dialogOpen, setDialogOpen] = useState(false)

  const form = useForm<SubjectValues>({ resolver: zodResolver(subjectSchema), defaultValues: { name: '', code: '', color: SUBJECT_COLORS[0] } })

  async function onSubmit(values: SubjectValues) {
    await sleep(500)
    const newSubject: Subject = {
      id: `subj-new-${Date.now()}`,
      name: values.name,
      code: values.code.toUpperCase(),
      color: values.color,
    }
    setSubjects((prev) => [newSubject, ...prev])
    toast.success(`${newSubject.name} was created`)
    setDialogOpen(false)
    form.reset()
  }

  function handleDelete(id: string, name: string) {
    setSubjects((prev) => prev.filter((s) => s.id !== id))
    toast.success(`${name} was removed from the catalog`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Subjects"
        description="Maintain the subject catalog and teacher assignments."
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" /> Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a new subject</DialogTitle>
                <DialogDescription>Add a subject to the catalog — you can assign teachers to it afterwards.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject name</FormLabel>
                        <FormControl>
                          <Input placeholder="Economics" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code</FormLabel>
                        <FormControl>
                          <Input placeholder="ECO" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color</FormLabel>
                        <FormControl>
                          <div className="flex flex-wrap gap-2">
                            {SUBJECT_COLORS.map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => field.onChange(color)}
                                aria-label={`Color ${color}`}
                                aria-pressed={field.value === color}
                                className={cn('size-7 rounded-full border-2 transition-transform', field.value === color ? 'scale-110 border-foreground' : 'border-transparent')}
                                style={{ background: color }}
                              />
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
                      Add subject
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {subjects.map((subject) => {
          const assignedTeachers = teachers.filter((t) => t.schoolId === school.id && t.subjects.includes(subject.name))
          return (
            <Card key={subject.id} className="transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col gap-4 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white" style={{ background: subject.color }}>
                    {subject.code.slice(0, 2)}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="text-sm font-semibold text-foreground">{subject.name}</p>
                    <p className="text-xs text-muted-foreground">{subject.code}</p>
                  </div>
                  <DeleteConfirm title="Delete this subject?" description={`${subject.name} will be permanently removed from the catalog.`} onConfirm={() => handleDelete(subject.id, subject.name)}>
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="size-3.5" />
                    </Button>
                  </DeleteConfirm>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="size-3.5" />
                  {assignedTeachers.length} teacher{assignedTeachers.length === 1 ? '' : 's'} assigned
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <BookOpen className="size-3.5" />
                  Grades 1 - 10
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
