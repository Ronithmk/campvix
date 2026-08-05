import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { UserPlus, Users, TrendingUp, CheckCircle2, Plus, Trash2, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { DeleteConfirm } from '@/components/shared/delete-confirm'
import { admissions as initialAdmissions } from '@/mock/admissions'
import type { Admission, AdmissionStage } from '@/types'
import { cn, formatDate, initials, sleep } from '@/lib/utils'
import { useActiveSchool } from '@/hooks/use-active-school'

const admissionSchema = z.object({
  applicantName: z.string().min(2, 'Applicant name is required'),
  gradeAppliedFor: z.string().min(1, 'Grade is required'),
  parentName: z.string().min(2, 'Parent name is required'),
  parentEmail: z.string().email('Enter a valid email'),
  parentPhone: z.string().min(7, 'Enter a valid phone number'),
})

type AdmissionValues = z.infer<typeof admissionSchema>

const STAGE_ORDER: AdmissionStage[] = ['inquiry', 'application', 'entrance_test', 'interview', 'offer', 'enrolled']
const STAGE_LABELS: Record<AdmissionStage, string> = {
  inquiry: 'Inquiry',
  application: 'Application',
  entrance_test: 'Entrance Test',
  interview: 'Interview',
  offer: 'Offer Sent',
  enrolled: 'Enrolled',
  rejected: 'Rejected',
}
const STAGE_COLORS: Record<AdmissionStage, string> = {
  inquiry: 'bg-slate-400',
  application: 'bg-blue-400',
  entrance_test: 'bg-amber-400',
  interview: 'bg-violet-400',
  offer: 'bg-cyan-400',
  enrolled: 'bg-emerald-500',
  rejected: 'bg-red-400',
}

export default function AdmissionsPage() {
  const school = useActiveSchool()
  const [admissions, setAdmissions] = useState<Admission[]>(initialAdmissions)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const form = useForm<AdmissionValues>({
    resolver: zodResolver(admissionSchema),
    defaultValues: { applicantName: '', gradeAppliedFor: '', parentName: '', parentEmail: '', parentPhone: '' },
  })

  const schoolAdmissions = useMemo(() => admissions.filter((a) => a.schoolId === school.id), [admissions, school.id])
  const filtered = useMemo(
    () => schoolAdmissions.filter((a) => a.applicantName.toLowerCase().includes(search.toLowerCase()) || a.parentName.toLowerCase().includes(search.toLowerCase())),
    [schoolAdmissions, search],
  )

  const enrolled = schoolAdmissions.filter((a) => a.stage === 'enrolled').length
  const inPipeline = schoolAdmissions.filter((a) => a.stage !== 'enrolled' && a.stage !== 'rejected').length
  const conversionRate = schoolAdmissions.length ? Math.round((enrolled / schoolAdmissions.length) * 100) : 0

  function advanceStage(id: string) {
    setAdmissions((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a
        const idx = STAGE_ORDER.indexOf(a.stage)
        if (idx === -1 || idx === STAGE_ORDER.length - 1) return a
        toast.success(`${a.applicantName} moved to ${STAGE_LABELS[STAGE_ORDER[idx + 1]]}`)
        return { ...a, stage: STAGE_ORDER[idx + 1] }
      }),
    )
  }

  function handleDelete(id: string, name: string) {
    setAdmissions((prev) => prev.filter((a) => a.id !== id))
    toast.success(`${name}'s application was removed`)
  }

  async function onSubmit(values: AdmissionValues) {
    await sleep(500)
    const newAdmission: Admission = {
      id: `admission-new-${Date.now()}`,
      schoolId: school.id,
      applicantName: values.applicantName,
      avatarUrl: `https://avatars.githubusercontent.com/u/${Math.floor(Math.random() * 900000)}?v=4`,
      gradeAppliedFor: values.gradeAppliedFor,
      parentName: values.parentName,
      parentEmail: values.parentEmail,
      parentPhone: values.parentPhone,
      stage: 'inquiry',
      appliedDate: new Date().toISOString(),
      score: null,
      source: 'website',
    }
    setAdmissions((prev) => [newAdmission, ...prev])
    toast.success('Application recorded')
    setDialogOpen(false)
    form.reset()
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Admissions"
        description={`Track applicants through the enrollment pipeline at ${school.name}.`}
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" /> New Application
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record a new application</DialogTitle>
                <DialogDescription>Add an applicant to the {school.name} enrollment pipeline.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="applicantName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Applicant name</FormLabel>
                        <FormControl>
                          <Input placeholder="Aarav Mehta" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gradeAppliedFor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade applied for</FormLabel>
                        <FormControl>
                          <Input placeholder="Grade 5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="parentName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent / Guardian name</FormLabel>
                        <FormControl>
                          <Input placeholder="Rohan Mehta" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="parentEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent email</FormLabel>
                        <FormControl>
                          <Input placeholder="rohan@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="parentPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+91 90000 00000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
                      Record application
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="Total Applicants" value={String(schoolAdmissions.length)} icon={Users} accent="primary" change={12.4} />
        <StatCard index={1} label="In Pipeline" value={String(inPipeline)} icon={UserPlus} accent="warning" change={6.2} />
        <StatCard index={2} label="Enrolled" value={String(enrolled)} icon={CheckCircle2} accent="accent" change={9.8} />
        <StatCard index={3} label="Conversion Rate" value={`${conversionRate}%`} icon={TrendingUp} accent="primary" change={2.1} />
      </div>

      <Input placeholder="Search applicants..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />

      <div className="flex gap-4 overflow-x-auto pb-2">
        {STAGE_ORDER.map((stage) => {
          const items = filtered.filter((a) => a.stage === stage)
          return (
            <div key={stage} className="flex w-72 shrink-0 flex-col gap-3">
              <div className="flex items-center gap-2 px-1">
                <span className={cn('size-2 rounded-full', STAGE_COLORS[stage])} />
                <p className="text-sm font-medium text-foreground">{STAGE_LABELS[stage]}</p>
                <Badge variant="secondary" className="ml-auto">
                  {items.length}
                </Badge>
              </div>
              <div className="flex flex-col gap-2.5">
                {items.map((a) => (
                  <Card key={a.id} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => stage !== 'enrolled' && advanceStage(a.id)}>
                    <CardContent className="flex flex-col gap-2.5 p-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8">
                          <AvatarImage src={a.avatarUrl} alt={a.applicantName} />
                          <AvatarFallback>{initials(a.applicantName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <p className="truncate text-sm font-medium text-foreground">{a.applicantName}</p>
                          <p className="truncate text-xs text-muted-foreground">{a.gradeAppliedFor}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatDate(a.appliedDate)}</span>
                        <div className="flex items-center gap-1">
                          {a.score !== null && <Badge variant="outline">{a.score}%</Badge>}
                          <DeleteConfirm title="Remove this application?" description={`${a.applicantName}'s application will be permanently removed.`} onConfirm={() => handleDelete(a.id, a.applicantName)}>
                            <button className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive" onClick={(e) => e.stopPropagation()}>
                              <Trash2 className="size-3.5" />
                            </button>
                          </DeleteConfirm>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {items.length === 0 && <div className="rounded-xl border border-dashed border-border py-8 text-center text-xs text-muted-foreground">No applicants</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
