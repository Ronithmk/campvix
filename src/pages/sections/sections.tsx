import { toast } from 'sonner'
import { Layers, Scale, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { classes as allClasses } from '@/mock/classes'
import { teachers } from '@/mock/teachers'
import { cn } from '@/lib/utils'
import { useActiveSchool } from '@/hooks/use-active-school'

export default function SectionsPage() {
  const school = useActiveSchool()
  const classes = allClasses.filter((c) => c.schoolId === school.id)
  const grouped = new Map<string, typeof classes>()
  for (const c of classes) {
    const grade = c.name.split(' - ')[0]
    grouped.set(grade, [...(grouped.get(grade) ?? []), c])
  }

  const imbalanced = Array.from(grouped.values()).filter((secs) => {
    const strengths = secs.map((s) => s.strength)
    return Math.max(...strengths) - Math.min(...strengths) > 8
  }).length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Sections"
        description={`Compare section strength and balance enrollment within each grade at ${school.name}.`}
        actions={
          <Button onClick={() => toast.success('Section added')}>
            <Plus className="size-4" /> Add Section
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard index={0} label="Total Sections" value={String(classes.length)} icon={Layers} accent="primary" change={0} />
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
