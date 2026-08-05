import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { FileText, File, Sheet as SheetIcon, Image, Folder, Star, Upload, MoreHorizontal, Download, Trash2, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ConfirmDeleteDialog } from '@/components/shared/confirm-delete-dialog'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { documents as mockDocuments } from '@/mock/platform'
import { formatDate, sleep } from '@/lib/utils'
import { useActiveSchool } from '@/hooks/use-active-school'
import type { DocumentItem, DocumentType } from '@/types'

const TYPE_ICONS: Record<DocumentType, typeof FileText> = { pdf: FileText, doc: File, sheet: SheetIcon, image: Image, folder: Folder }
const TYPE_COLORS: Record<DocumentType, string> = {
  pdf: 'text-red-500 bg-red-500/10',
  doc: 'text-blue-500 bg-blue-500/10',
  sheet: 'text-emerald-500 bg-emerald-500/10',
  image: 'text-violet-500 bg-violet-500/10',
  folder: 'text-amber-500 bg-amber-500/10',
}

const uploadSchema = z.object({
  name: z.string().min(2, 'File name is required'),
  folder: z.string().min(1, 'Folder is required'),
  type: z.enum(['pdf', 'doc', 'sheet', 'image', 'folder']),
})

type UploadValues = z.infer<typeof uploadSchema>

export default function DocumentsPage() {
  const school = useActiveSchool()
  const [allDocuments, setAllDocuments] = useState<DocumentItem[]>(mockDocuments)
  const documents = useMemo(() => allDocuments.filter((d) => d.schoolId === school.id), [allDocuments, school.id])
  const [folderFilter, setFolderFilter] = useState('all')
  const [pendingDelete, setPendingDelete] = useState<DocumentItem | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const folders = Array.from(new Set(documents.map((d) => d.folder)))
  const filtered = useMemo(() => documents.filter((d) => folderFilter === 'all' || d.folder === folderFilter), [documents, folderFilter])

  const starred = documents.filter((d) => d.starred).length

  const form = useForm<UploadValues>({ resolver: zodResolver(uploadSchema), defaultValues: { name: '', folder: 'General', type: 'pdf' } })

  async function onSubmit(values: UploadValues) {
    await sleep(500)
    const newDoc: DocumentItem = {
      id: `doc-new-${Date.now()}`,
      schoolId: school.id,
      name: values.name,
      type: values.type,
      size: `${Math.floor(Math.random() * 4000) + 80} KB`,
      owner: 'You',
      modifiedDate: new Date().toISOString(),
      folder: values.folder,
      starred: false,
    }
    setAllDocuments((prev) => [newDoc, ...prev])
    toast.success('File uploaded')
    setDialogOpen(false)
    form.reset()
  }

  function handleDelete() {
    if (!pendingDelete) return
    setAllDocuments((prev) => prev.filter((d) => d.id !== pendingDelete.id))
    toast.success(`${pendingDelete.name} was deleted`)
    setPendingDelete(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Documents"
        description="Centralized document management for the entire school."
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="size-4" /> Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload a file</DialogTitle>
                <DialogDescription>Add a document to {school.name}'s library.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>File name</FormLabel>
                        <FormControl>
                          <Input placeholder="Fee Structure.sheet" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="folder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Folder</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select folder" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {folders.map((f) => (
                              <SelectItem key={f} value={f}>
                                {f}
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
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>File type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="doc">Document</SelectItem>
                            <SelectItem value="sheet">Spreadsheet</SelectItem>
                            <SelectItem value="image">Image</SelectItem>
                            <SelectItem value="folder">Folder</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
                      Upload file
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
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
