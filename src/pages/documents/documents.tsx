import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { FileText, File, Sheet as SheetIcon, Image, Folder, Star, Upload, MoreHorizontal, Download, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ConfirmDeleteDialog } from '@/components/shared/confirm-delete-dialog'
import { documents as mockDocuments } from '@/mock/platform'
import { formatDate } from '@/lib/utils'
import type { DocumentItem, DocumentType } from '@/types'

const TYPE_ICONS: Record<DocumentType, typeof FileText> = { pdf: FileText, doc: File, sheet: SheetIcon, image: Image, folder: Folder }
const TYPE_COLORS: Record<DocumentType, string> = {
  pdf: 'text-red-500 bg-red-500/10',
  doc: 'text-blue-500 bg-blue-500/10',
  sheet: 'text-emerald-500 bg-emerald-500/10',
  image: 'text-violet-500 bg-violet-500/10',
  folder: 'text-amber-500 bg-amber-500/10',
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>(mockDocuments)
  const [folderFilter, setFolderFilter] = useState('all')
  const [pendingDelete, setPendingDelete] = useState<DocumentItem | null>(null)
  const folders = Array.from(new Set(documents.map((d) => d.folder)))
  const filtered = useMemo(() => documents.filter((d) => folderFilter === 'all' || d.folder === folderFilter), [documents, folderFilter])

  const starred = documents.filter((d) => d.starred).length

  function handleDelete() {
    if (!pendingDelete) return
    setDocuments((prev) => prev.filter((d) => d.id !== pendingDelete.id))
    toast.success(`${pendingDelete.name} was deleted`)
    setPendingDelete(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Documents"
        description="Centralized document management for the entire school."
        actions={
          <Button onClick={() => toast.success('File uploaded')}>
            <Upload className="size-4" /> Upload
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard index={0} label="Total Files" value={String(documents.length)} icon={FileText} accent="primary" change={0} />
        <StatCard index={1} label="Folders" value={String(folders.length)} icon={Folder} accent="accent" change={0} />
        <StatCard index={2} label="Starred" value={String(starred)} icon={Star} accent="warning" change={0} />
      </div>

      <Select value={folderFilter} onValueChange={setFolderFilter}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Folder" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All folders</SelectItem>
          {folders.map((f) => (
            <SelectItem key={f} value={f}>
              {f}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Card>
        <CardContent className="flex flex-col divide-y divide-border pt-4 pb-2">
          {filtered.map((doc) => {
            const Icon = TYPE_ICONS[doc.type]
            return (
              <div key={doc.id} className="flex items-center gap-3 py-3">
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${TYPE_COLORS[doc.type]}`}>
                  <Icon className="size-4" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate text-sm font-medium text-foreground">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.folder} &middot; {doc.owner} &middot; {formatDate(doc.modifiedDate)}
                  </p>
                </div>
                {doc.starred && <Star className="size-3.5 shrink-0 fill-warning text-warning" />}
                <span className="hidden w-16 shrink-0 text-right text-xs text-muted-foreground sm:block">{doc.size}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => toast.success('Downloading...')}>
                      <Download /> Download
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onSelect={() => setPendingDelete(doc)}>
                      <Trash2 /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Delete this file?"
        description={pendingDelete ? `${pendingDelete.name} will be permanently deleted.` : ''}
      />
    </div>
  )
}
