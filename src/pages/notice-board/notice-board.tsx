import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Pin, AlertTriangle, CalendarClock, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DeleteConfirm } from '@/components/shared/delete-confirm'
import { noticeBoardPosts as mockNotices } from '@/mock/communication'
import { formatDate } from '@/lib/utils'
import type { NoticeBoardPost } from '@/types'
import { useActiveSchool } from '@/hooks/use-active-school'

const CATEGORY_VARIANT: Record<NoticeBoardPost['category'], 'default' | 'accent' | 'secondary' | 'destructive'> = {
  academic: 'default',
  event: 'accent',
  administrative: 'secondary',
  urgent: 'destructive',
}

export default function NoticeBoardPage() {
  const school = useActiveSchool()
  const [noticeBoardPosts, setNoticeBoardPosts] = useState<NoticeBoardPost[]>(mockNotices)

  const schoolNotices = useMemo(() => noticeBoardPosts.filter((n) => n.schoolId === school.id), [noticeBoardPosts, school.id])

  function handleDelete(id: string, title: string) {
    setNoticeBoardPosts((prev) => prev.filter((n) => n.id !== id))
    toast.success(`${title} was removed`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Notice Board"
        description={`A digital notice board for daily circulars and notices at ${school.name}.`}
        actions={
          <Button onClick={() => toast.success('Notice posted')}>
            <Plus className="size-4" /> Post Notice
          </Button>
        }
      />

      <div className="columns-1 gap-4 sm:columns-2 xl:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid">
        {schoolNotices.map((notice) => (
          <Card key={notice.id} className={notice.category === 'urgent' ? 'border-destructive/40' : undefined}>
            <CardContent className="flex flex-col gap-2.5 py-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {notice.category === 'urgent' ? <AlertTriangle className="size-3.5 text-destructive" /> : <Pin className="size-3.5 text-primary" />}
                  <p className="text-sm font-semibold text-foreground">{notice.title}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant={CATEGORY_VARIANT[notice.category]} className="shrink-0 capitalize">
                    {notice.category}
                  </Badge>
                  <DeleteConfirm title="Delete this notice?" description={`${notice.title} will be permanently removed.`} onConfirm={() => handleDelete(notice.id, notice.title)}>
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="size-3.5" />
                    </Button>
                  </DeleteConfirm>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{notice.body}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>By {notice.postedBy}</span>
                <span className="flex items-center gap-1">
                  <CalendarClock className="size-3" /> Expires {formatDate(notice.expiryDate)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
