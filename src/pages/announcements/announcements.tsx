import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Megaphone, Pin, Users, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DeleteConfirm } from '@/components/shared/delete-confirm'
import { announcements as mockAnnouncements } from '@/mock/communication'
import { formatDate, formatNumber, initials } from '@/lib/utils'
import type { Announcement } from '@/types'
import { useActiveSchool } from '@/hooks/use-active-school'

const AUDIENCE_LABELS: Record<string, string> = { all: 'Everyone', teachers: 'Teachers', students: 'Students', parents: 'Parents', staff: 'Staff' }

export default function AnnouncementsPage() {
  const school = useActiveSchool()
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements)
  const [audience, setAudience] = useState('all')

  const schoolAnnouncements = useMemo(() => announcements.filter((a) => a.schoolId === school.id), [announcements, school.id])
  const filtered = schoolAnnouncements.filter((a) => audience === 'all' || a.audience === audience)
  const pinned = schoolAnnouncements.filter((a) => a.pinned).length

  function handleDelete(id: string, title: string) {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id))
    toast.success(`${title} was deleted`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Announcements"
        description={`Broadcast important updates to staff, students, and parents at ${school.name}.`}
        actions={
          <Button onClick={() => toast.success('Announcement published')}>
            <Plus className="size-4" /> New Announcement
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard index={0} label="Total Announcements" value={String(schoolAnnouncements.length)} icon={Megaphone} accent="primary" change={0} />
        <StatCard index={1} label="Pinned" value={String(pinned)} icon={Pin} accent="warning" change={0} />
        <StatCard index={2} label="Reach" value={formatNumber(school.studentCount)} icon={Users} accent="accent" change={0} />
      </div>

      <Select value={audience} onValueChange={setAudience}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Audience" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All audiences</SelectItem>
          <SelectItem value="teachers">Teachers</SelectItem>
          <SelectItem value="students">Students</SelectItem>
          <SelectItem value="parents">Parents</SelectItem>
          <SelectItem value="staff">Staff</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex flex-col gap-3">
        {filtered.map((a) => (
          <Card key={a.id} className={a.pinned ? 'border-primary/30' : undefined}>
            <CardContent className="flex flex-col gap-2.5 py-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {a.pinned && <Pin className="size-3.5 text-primary" />}
                  <p className="text-sm font-semibold text-foreground">{a.title}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="secondary">{AUDIENCE_LABELS[a.audience]}</Badge>
                  <DeleteConfirm title="Delete this announcement?" description={`${a.title} will be permanently deleted.`} onConfirm={() => handleDelete(a.id, a.title)}>
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="size-3.5" />
                    </Button>
                  </DeleteConfirm>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{a.body}</p>
              <div className="flex items-center gap-2 pt-1">
                <Avatar className="size-6">
                  <AvatarImage src={a.authorAvatar} alt={a.author} />
                  <AvatarFallback className="text-[10px]">{initials(a.author)}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  {a.author} &middot; {formatDate(a.publishedDate)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
