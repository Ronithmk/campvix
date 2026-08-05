import { useState } from 'react'
import { toast } from 'sonner'
import { BookOpen, Plus, Users, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DeleteConfirm } from '@/components/shared/delete-confirm'
import { subjects as mockSubjects } from '@/mock/subjects'
import { teachers } from '@/mock/teachers'
import type { Subject } from '@/types'

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>(mockSubjects)

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
          <Button onClick={() => toast.success('Subject created')}>
            <Plus className="size-4" /> Add Subject
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {subjects.map((subject) => {
          const assignedTeachers = teachers.filter((t) => t.subjects.includes(subject.name))
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
