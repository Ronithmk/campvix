import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { BookMarked, Library as LibraryIcon, AlertCircle, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatusBadge } from '@/components/shared/status-badge'
import { DeleteConfirm } from '@/components/shared/delete-confirm'
import { libraryBooks as mockBooks, bookIssues as mockIssues } from '@/mock/library'
import { formatDate, formatCurrency, initials } from '@/lib/utils'
import type { BookIssue, LibraryBook } from '@/types'
import { useActiveSchool } from '@/hooks/use-active-school'

export default function LibraryPage() {
  const school = useActiveSchool()
  const [tab, setTab] = useState('catalog')
  const [libraryBooks, setLibraryBooks] = useState<LibraryBook[]>(mockBooks)
  const [bookIssues, setBookIssues] = useState<BookIssue[]>(mockIssues)

  const schoolBooks = useMemo(() => libraryBooks.filter((b) => b.schoolId === school.id), [libraryBooks, school.id])
  const schoolIssues = useMemo(() => bookIssues.filter((i) => i.schoolId === school.id), [bookIssues, school.id])

  const availableBooks = schoolBooks.reduce((sum, b) => sum + b.availableCopies, 0)
  const overdue = schoolIssues.filter((i) => i.status === 'overdue').length
  const totalFines = schoolIssues.reduce((sum, i) => sum + i.fine, 0)

  function deleteBook(id: string, title: string) {
    setLibraryBooks((prev) => prev.filter((b) => b.id !== id))
    toast.success(`${title} removed from catalog`)
  }

  function deleteIssue(id: string, title: string) {
    setBookIssues((prev) => prev.filter((i) => i.id !== id))
    toast.success(`Issue record for ${title} removed`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Library"
        description={`Catalog, issue, and track books at ${school.name}.`}
        actions={
          <Button onClick={() => toast.success('Book added to catalog')}>
            <Plus className="size-4" /> Add Book
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="Total Titles" value={String(schoolBooks.length)} icon={BookMarked} accent="primary" change={0} />
        <StatCard index={1} label="Available Copies" value={String(availableBooks)} icon={LibraryIcon} accent="accent" change={0} />
        <StatCard index={2} label="Overdue Books" value={String(overdue)} icon={AlertCircle} accent="destructive" change={0} />
        <StatCard index={3} label="Outstanding Fines" value={formatCurrency(totalFines)} icon={AlertCircle} accent="warning" change={0} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="catalog">Catalog</TabsTrigger>
          <TabsTrigger value="issued">Issued Books</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="mt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {schoolBooks.map((book) => (
              <Card key={book.id} className="overflow-hidden transition-shadow hover:shadow-md">
                <div className="relative flex h-28 items-center justify-center text-white" style={{ background: book.coverColor }}>
                  <BookMarked className="size-9 opacity-80" />
                  <DeleteConfirm title="Remove this book?" description={`${book.title} will be permanently removed from the catalog.`} onConfirm={() => deleteBook(book.id, book.title)}>
                    <button className="absolute top-2 right-2 rounded-md bg-black/20 p-1.5 text-white transition-colors hover:bg-black/40">
                      <Trash2 className="size-3.5" />
                    </button>
                  </DeleteConfirm>
                </div>
                <CardContent className="flex flex-col gap-2 py-4">
                  <p className="line-clamp-1 text-sm font-semibold text-foreground">{book.title}</p>
                  <p className="text-xs text-muted-foreground">{book.author}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="capitalize">
                      {book.category.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{book.shelfLocation}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Availability</span>
                    <span className={book.availableCopies === 0 ? 'font-medium text-destructive' : 'font-medium text-success'}>
                      {book.availableCopies}/{book.totalCopies}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="issued" className="mt-4">
          <Card>
            <CardContent className="flex flex-col divide-y divide-border pt-6 pb-2">
              {schoolIssues.map((issue) => (
                <div key={issue.id} className="flex items-center gap-3 py-3">
                  <Avatar className="size-9">
                    <AvatarImage src={issue.studentAvatar} alt={issue.studentName} />
                    <AvatarFallback>{initials(issue.studentName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="truncate text-sm font-medium text-foreground">{issue.bookTitle}</p>
                    <p className="text-xs text-muted-foreground">{issue.studentName}</p>
                  </div>
                  <div className="hidden text-xs text-muted-foreground sm:block">
                    Due {formatDate(issue.dueDate)}
                  </div>
                  {issue.fine > 0 && <span className="text-xs font-medium text-destructive">{formatCurrency(issue.fine)}</span>}
                  <StatusBadge status={issue.status} />
                  <DeleteConfirm title="Remove this issue record?" description={`The issue record for ${issue.bookTitle} will be permanently removed.`} onConfirm={() => deleteIssue(issue.id, issue.bookTitle)}>
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="size-3.5" />
                    </Button>
                  </DeleteConfirm>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
