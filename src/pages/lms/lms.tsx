import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Video, PlayCircle, Users, Plus, Trash2, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { StatusBadge } from '@/components/shared/status-badge'
import { DeleteConfirm } from '@/components/shared/delete-confirm'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { courses as mockCourses } from '@/mock/platform'
import { subjects } from '@/mock/subjects'
import { sleep } from '@/lib/utils'
import { useAuthStore } from '@/store/auth-store'
import type { Course } from '@/types'

const THUMB_COLORS = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#dc2626', '#0891b2']

const courseSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  subjectId: z.string().min(1, 'Select a subject'),
  instructor: z.string().min(2, 'Instructor name is required'),
  duration: z.string().min(1, 'Duration is required'),
})

type CourseValues = z.infer<typeof courseSchema>

export default function LmsPage() {
  const role = useAuthStore((s) => s.role)
  const canCreate = role === 'administrator' || role === 'teacher'
  const [courses, setCourses] = useState<Course[]>(mockCourses)
  const [dialogOpen, setDialogOpen] = useState(false)
  const published = courses.filter((c) => c.status === 'published').length
  const totalEnrolled = courses.reduce((sum, c) => sum + c.enrolledCount, 0)

  const form = useForm<CourseValues>({ resolver: zodResolver(courseSchema), defaultValues: { title: '', subjectId: '', instructor: '', duration: '8 weeks' } })

  async function onSubmit(values: CourseValues) {
    await sleep(500)
    const newCourse: Course = {
      id: `course-new-${Date.now()}`,
      title: values.title,
      subjectId: values.subjectId,
      instructor: values.instructor,
      thumbnail: THUMB_COLORS[courses.length % THUMB_COLORS.length],
      lessonsCount: 0,
      enrolledCount: 0,
      progress: 0,
      status: 'draft',
      duration: values.duration,
    }
    setCourses((prev) => [newCourse, ...prev])
    toast.success(`${values.title} was created`)
    setDialogOpen(false)
    form.reset()
  }

  function handleDelete(id: string, title: string) {
    setCourses((prev) => prev.filter((c) => c.id !== id))
    toast.success(`${title} was deleted`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="LMS"
        description="Online classes, courses, and learning content."
        actions={
          canCreate && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" /> New Course
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new course</DialogTitle>
                <DialogDescription>Set up the basics — you can add lessons once it's created.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course title</FormLabel>
                        <FormControl>
                          <Input placeholder="Introduction to Physics" {...field} />
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
                    name="instructor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instructor</FormLabel>
                        <FormControl>
                          <Input placeholder="Ms. Amber Pfannerstill" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <FormControl>
                          <Input placeholder="8 weeks" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
                      Create course
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
        <StatCard index={0} label="Total Courses" value={String(courses.length)} icon={Video} accent="primary" change={0} />
        <StatCard index={1} label="Published" value={String(published)} icon={PlayCircle} accent="accent" change={0} />
        <StatCard index={2} label="Total Enrollments" value={String(totalEnrolled)} icon={Users} accent="warning" change={5.8} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="overflow-hidden transition-shadow hover:shadow-md">
            <div className="relative flex h-28 items-center justify-center" style={{ background: `${course.thumbnail}1a` }}>
              <PlayCircle className="size-9" style={{ color: course.thumbnail }} />
              <DeleteConfirm title="Delete this course?" description={`${course.title} will be permanently deleted.`} onConfirm={() => handleDelete(course.id, course.title)}>
                <button className="absolute top-2 right-2 rounded-md bg-black/10 p-1.5 text-foreground/70 transition-colors hover:bg-destructive/20 hover:text-destructive">
                  <Trash2 className="size-3.5" />
                </button>
              </DeleteConfirm>
            </div>
            <CardContent className="flex flex-col gap-2.5 py-4">
              <div className="flex items-start justify-between gap-2">
                <p className="line-clamp-1 text-sm font-semibold text-foreground">{course.title}</p>
                <StatusBadge status={course.status} />
              </div>
              <p className="text-xs text-muted-foreground">
                {course.instructor} &middot; {course.lessonsCount} lessons &middot; {course.duration}
              </p>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{course.enrolledCount} enrolled</span>
                  <span className="font-medium text-foreground">{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
