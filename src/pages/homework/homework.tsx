import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { BookMarked, CalendarDays, CheckCircle2, Plus, Trash2, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { DeleteConfirm } from '@/components/shared/delete-confirm'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { homeworkEntries as mockHomework } from '@/mock/coursework'
import { classes } from '@/mock/classes'
import { subjects } from '@/mock/subjects'
import { formatDate, sleep } from '@/lib/utils'
import type { HomeworkEntry } from '@/types'
import { useActiveSchool } from '@/hooks/use-active-school'
import { useAuthStore } from '@/store/auth-store'
import { students } from '@/mock/students'

const homeworkSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().min(2, 'Description is required'),
  subjectId: z.string().min(1, 'Select a subject'),
  classId: z.string().min(1, 'Select a class'),
  date: z.string().min(1, 'Date is required'),
})

type HomeworkValues = z.infer<typeof homeworkSchema>

export default function HomeworkPage() {
  const school = useActiveSchool()
  const role = useAuthStore((s) => s.role)
  const personId = useAuthStore((s) => s.personId)
  const [homeworkEntries, setHomeworkEntries] = useState<HomeworkEntry[]>(mockHomework)
  const [dialogOpen, setDialogOpen] = useState(false)

  const studentClassId = useMemo(() => {
    if (role !== 'student' || !personId) return null
    return students.find((student) => student.id === personId && student.schoolId === school.id)?.classId ?? null
  }, [personId, role, school.id])

  const schoolHomework = useMemo(
    () => homeworkEntries.filter((h) => h.schoolId === school.id && (role !== 'student' ? true : !!studentClassId && h.classId === studentClassId)),
    [homeworkEntries, role, school.id, studentClassId],
  )
  const schoolClasses = useMemo(() => classes.filter((c) => c.schoolId === school.id), [school.id])
  const avgCompletion = schoolHomework.length ? Math.round(schoolHomework.reduce((sum, h) => sum + h.completionPercent, 0) / schoolHomework.length) : 0
  const dueToday = schoolHomework.filter((h) => new Date(h.date).toDateString() === new Date().toDateString()).length

  const form = useForm<HomeworkValues>({
    resolver: zodResolver(homeworkSchema),
    defaultValues: { title: '', description: '', subjectId: '', classId: '', date: new Date().toISOString().slice(0, 10) },
  })

  async function onSubmit(values: HomeworkValues) {
    await sleep(500)
    const newHomework: HomeworkEntry = {
      id: `homework-new-${Date.now()}`,
      schoolId: school.id,
      subjectId: values.subjectId,
      classId: values.classId,
      title: values.title,
      description: values.description,
      date: new Date(values.date).toISOString(),
      completionPercent: 0,
    }
    setHomeworkEntries((prev) => [newHomework, ...prev])
    toast.success(`${newHomework.title} was assigned`)
    setDialogOpen(false)
    form.reset()
  }

  function handleDelete(id: string, title: string) {
    setHomeworkEntries((prev) => prev.filter((h) => h.id !== id))
    toast.success(`${title} was deleted`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Homework"
        description={role === 'student' ? `Your homework for ${school.name}.` : `Daily homework diary tracked across every class at ${school.name}.`}
        actions={
          role === 'student'
            ? undefined
            : (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="size-4" /> Assign Homework
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Assign new homework</DialogTitle>
                      <DialogDescription>Add a homework entry to the diary for a class.</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Read Chapter 3 and summarize" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Details for students and parents" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="subjectId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select subject" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {subjects.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>
                                      {s.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="classId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Class</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select class" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {schoolClasses.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                      {c.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
                            Assign homework
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
        <StatCard index={0} label="Total Entries" value={String(schoolHomework.length)} icon={BookMarked} accent="primary" change={0} />
        <StatCard index={1} label="Assigned Today" value={String(dueToday)} icon={CalendarDays} accent="warning" change={0} />
        <StatCard index={2} label="Avg. Completion" value={`${avgCompletion}%`} icon={CheckCircle2} accent="accent" change={1.8} />
      </div>

      <div className="flex flex-col gap-3">
        {schoolHomework.map((h) => {
          const klass = classes.find((c) => c.id === h.classId)
          const subject = subjects.find((s) => s.id === h.subjectId)
          return (
            <Card key={h.id}>
              <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg" style={{ background: `${subject?.color}1a`, color: subject?.color }}>
                  <BookMarked className="size-4.5" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="text-sm font-medium text-foreground">{h.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {subject?.name} &middot; {klass?.name} &middot; {formatDate(h.date)}
                  </p>
                </div>
                <div className="flex w-full items-center gap-2 sm:w-40">
                  <Progress value={h.completionPercent} className="h-1.5" />
                  <span className="w-9 shrink-0 text-right text-xs font-medium text-foreground">{h.completionPercent}%</span>
                </div>
                {role !== 'student' && (
                  <DeleteConfirm title="Delete this homework entry?" description={`${h.title} will be permanently deleted.`} onConfirm={() => handleDelete(h.id, h.title)}>
                    <Button variant="ghost" size="icon-sm" className="shrink-0 text-muted-foreground hover:text-destructive">
                      <Trash2 className="size-3.5" />
                    </Button>
                  </DeleteConfirm>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
