import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Mail, Send, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { DeleteConfirm } from '@/components/shared/delete-confirm'
import { emailTemplates as mockTemplates } from '@/mock/platform'
import type { EmailTemplate } from '@/types'
import { formatDate, formatNumber } from '@/lib/utils'
import { useActiveSchool } from '@/hooks/use-active-school'

const CATEGORY_LABELS: Record<string, string> = { fee_reminder: 'Fee Reminder', admission: 'Admission', attendance: 'Attendance', exam: 'Exam', general: 'General' }

export default function EmailTemplatesPage() {
  const school = useActiveSchool()
  const [allTemplates, setAllTemplates] = useState<EmailTemplate[]>(mockTemplates)
  const emailTemplates = useMemo(() => allTemplates.filter((t) => t.schoolId === school.id), [allTemplates, school.id])
  const [preview, setPreview] = useState<EmailTemplate | null>(null)
  const totalSent = emailTemplates.reduce((sum, t) => sum + t.sentCount, 0)

  function handleDelete(id: string, name: string) {
    setAllTemplates((prev) => prev.filter((t) => t.id !== id))
    toast.success(`${name} was deleted`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Email Templates"
        description="Design and manage reusable email templates."
        actions={
          <Button onClick={() => toast.success('Template created')}>
            <Plus className="size-4" /> New Template
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard index={0} label="Total Templates" value={String(emailTemplates.length)} icon={Mail} accent="primary" change={0} />
        <StatCard index={1} label="Emails Sent" value={formatNumber(totalSent)} icon={Send} accent="accent" change={12.4} />
        <StatCard index={2} label="Avg. Sends / Template" value={formatNumber(emailTemplates.length ? Math.round(totalSent / emailTemplates.length) : 0)} icon={Mail} accent="warning" change={0} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {emailTemplates.map((t) => (
          <Card key={t.id} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => setPreview(t)}>
            <CardContent className="flex flex-col gap-2.5 py-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="size-4" />
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="secondary">{CATEGORY_LABELS[t.category]}</Badge>
                  <DeleteConfirm title="Delete this template?" description={`${t.name} will be permanently deleted.`} onConfirm={() => handleDelete(t.id, t.name)}>
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive" onClick={(e) => e.stopPropagation()}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </DeleteConfirm>
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.subject}</p>
              </div>
              <p className="text-xs text-muted-foreground">Sent {formatNumber(t.sentCount)} times &middot; edited {formatDate(t.lastEdited)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{preview?.name}</DialogTitle>
            <DialogDescription>{preview?.subject}</DialogDescription>
          </DialogHeader>
          <Separator />
          <p className="text-sm text-muted-foreground">{preview?.preview}</p>
        </DialogContent>
      </Dialog>
    </div>
  )
}
