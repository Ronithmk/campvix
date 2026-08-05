import { useState } from 'react'
import { toast } from 'sonner'
import { Send, Search, Phone, Video, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DeleteConfirm } from '@/components/shared/delete-confirm'
import { chatThreads as initialThreads } from '@/mock/communication'
import { cn, initials } from '@/lib/utils'
import type { ChatThread } from '@/types'

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export default function ChatPage() {
  const [threads, setThreads] = useState<ChatThread[]>(initialThreads)
  const [activeId, setActiveId] = useState<string | undefined>(initialThreads[0]?.id)
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState('')

  const active = threads.find((t) => t.id === activeId)
  const filtered = threads.filter((t) => t.participantName.toLowerCase().includes(search.toLowerCase()))

  function sendMessage() {
    if (!draft.trim() || !active) return
    setThreads((prev) =>
      prev.map((t) =>
        t.id === active.id
          ? {
              ...t,
              lastMessage: draft,
              lastMessageTime: new Date().toISOString(),
              messages: [...t.messages, { id: `${t.id}-msg-${t.messages.length}`, senderId: 'self', senderName: 'You', text: draft, timestamp: new Date().toISOString(), isSelf: true }],
            }
          : t,
      ),
    )
    setDraft('')
  }

  function handleDeleteThread(id: string, name: string) {
    setThreads((prev) => prev.filter((t) => t.id !== id))
    if (activeId === id) setActiveId(undefined)
    toast.success(`Conversation with ${name} deleted`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Parent Chat" description="Secure messaging between teachers and parents." />

      <Card className="overflow-hidden p-0">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr]" style={{ height: '640px' }}>
          <div className="flex flex-col border-r border-border">
            <div className="p-3">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search conversations..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="flex flex-col">
                {filtered.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setActiveId(t.id)}
                    className={cn('group flex cursor-pointer items-start gap-2.5 border-b border-border px-3 py-3 text-left transition-colors hover:bg-secondary/50', activeId === t.id && 'bg-secondary/70')}
                  >
                    <Avatar className="size-9">
                      <AvatarImage src={t.participantAvatar} alt={t.participantName} />
                      <AvatarFallback>{initials(t.participantName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate text-sm font-medium text-foreground">{t.participantName}</span>
                        <span className="shrink-0 text-[10px] text-muted-foreground">{timeLabel(t.lastMessageTime)}</span>
                      </div>
                      <span className="truncate text-xs text-muted-foreground">{t.lastMessage}</span>
                    </div>
                    {t.unread > 0 && <span className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">{t.unread}</span>}
                    <DeleteConfirm title="Delete this conversation?" description={`Your conversation with ${t.participantName} will be permanently deleted.`} onConfirm={() => handleDeleteThread(t.id, t.participantName)}>
                      <button className="hidden shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 sm:block">
                        <Trash2 className="size-3.5" />
                      </button>
                    </DeleteConfirm>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex flex-col">
            {active ? (
              <>
                <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
                  <Avatar className="size-9">
                    <AvatarImage src={active.participantAvatar} alt={active.participantName} />
                    <AvatarFallback>{initials(active.participantName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{active.participantName}</span>
                    <span className="text-xs capitalize text-muted-foreground">{active.participantRole}</span>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <Button variant="ghost" size="icon">
                      <Phone className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="size-4" />
                    </Button>
                  </div>
                </div>
                <ScrollArea className="flex-1 p-4">
                  <div className="flex flex-col gap-3">
                    {active.messages.map((m) => (
                      <div key={m.id} className={cn('flex', m.isSelf ? 'justify-end' : 'justify-start')}>
                        <div className={cn('max-w-[70%] rounded-2xl px-3.5 py-2 text-sm', m.isSelf ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground')}>
                          {m.text}
                          <div className={cn('mt-1 text-[10px]', m.isSelf ? 'text-primary-foreground/70' : 'text-muted-foreground')}>{timeLabel(m.timestamp)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex items-center gap-2 border-t border-border p-3">
                  <Input
                    placeholder="Type a message..."
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button size="icon" onClick={sendMessage}>
                    <Send className="size-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Select a conversation</div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
