import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { UsersRound, Baby, Mail, Plus, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { DataTable, exportToCsv } from '@/components/shared/data-table'
import { ConfirmDeleteDialog } from '@/components/shared/confirm-delete-dialog'
import { getParentColumns } from '@/features/parents/columns'
import { parents as mockParents } from '@/mock/parents'
import { students as allStudents } from '@/mock/students'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { formatNumber, sleep } from '@/lib/utils'
import type { Parent } from '@/types'
import { useActiveSchool } from '@/hooks/use-active-school'

const parentSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  childStudentId: z.string().min(1, 'Select a child'),
})

type ParentValues = z.infer<typeof parentSchema>

export default function ParentsPage() {
  const school = useActiveSchool()
  const [parents, setParents] = useState<Parent[]>(mockParents)
  const [pendingDelete, setPendingDelete] = useState<Parent | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const schoolParents = useMemo(() => parents.filter((p) => p.schoolId === school.id), [parents, school.id])
  const schoolStudents = useMemo(() => allStudents.filter((s) => s.schoolId === school.id), [school.id])
  const totalChildren = schoolParents.reduce((sum, p) => sum + p.childrenIds.length, 0)
  const multiChild = schoolParents.filter((p) => p.childrenIds.length > 1).length

  const columns = useMemo(() => getParentColumns((p) => setPendingDelete(p)), [])

  const form = useForm<ParentValues>({ resolver: zodResolver(parentSchema), defaultValues: { name: '', email: '', childStudentId: '' } })

  async function onSubmit(values: ParentValues) {
    await sleep(500)
    const newParent: Parent = {
      id: `parent-new-${Date.now()}`,
      schoolId: school.id,
      name: values.name,
      avatarUrl: `https://avatars.githubusercontent.com/u/${Math.floor(Math.random() * 900000)}?v=4`,
      email: values.email,
      phone: '+91 90000 00000',
      occupation: 'Not provided',
      childrenIds: [values.childStudentId],
      address: 'Not provided',
    }
    setParents((prev) => [newParent, ...prev])
    toast.success(`Invite sent to ${values.name}`)
    setDialogOpen(false)
    form.reset()
  }

  function handleDelete() {
    if (!pendingDelete) return
    setParents((prev) => prev.filter((p) => p.id !== pendingDelete.id))
    toast.success(`${pendingDelete.name} was removed`)
    setPendingDelete(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Parents"
        description={`A directory of every parent and guardian at ${school.name}.`}
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" /> Invite Parent
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite a parent</DialogTitle>
                <DialogDescription>Send an invite and link them to their child's record at {school.name}.</DialogDescription>
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
                          <Input placeholder="Rohan Mehta" {...field} />
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
                          <Input placeholder="rohan@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="childStudentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Child</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select student" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {schoolStudents.slice(0, 30).map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name} &middot; {s.className}
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
                      Send invite
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard index={0} label="Total Parents" value={formatNumber(schoolParents.length)} icon={UsersRound} accent="primary" change={2.8} />
        <StatCard index={1} label="Linked Students" value={formatNumber(totalChildren)} icon={Baby} accent="accent" change={4.1} />
        <StatCard index={2} label="Multi-child Families" value={formatNumber(multiChild)} icon={Mail} accent="warning" change={0} />
      </div>

      <DataTable
        columns={columns}
        data={schoolParents}
        searchPlaceholder="Search parents by name..."
        onExport={(rows) => {
          exportToCsv(
            rows.map((p) => ({ name: p.name, email: p.email, phone: p.phone, children: p.childrenIds.length })),
            'parents.csv',
          )
          toast.success('Exported parents.csv')
        }}
      />

      <ConfirmDeleteDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Remove this parent?"
        description={pendingDelete ? `${pendingDelete.name} will be permanently removed from ${school.name}'s records.` : ''}
      />
    </div>
  )
}
