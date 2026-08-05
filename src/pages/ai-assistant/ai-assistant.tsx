import { useMemo, useState } from 'react'
import { Sparkles, Send, Users, Wallet, CalendarCheck, TrendingUp } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { students as allStudents } from '@/mock/students'
import { feeRecords as allFeeRecords } from '@/mock/fees'
import { attendanceRecords, buildAttendanceTrend } from '@/mock/attendance'
import { cn, formatCurrency } from '@/lib/utils'
import { useActiveSchool } from '@/hooks/use-active-school'
import type { Student, FeeRecord } from '@/types'

interface Msg {
  id: string
  role: 'user' | 'assistant'
  text: string
}

const SUGGESTIONS = [
  { label: 'How many students are enrolled?', icon: Users },
  { label: "What's the pending fee amount?", icon: Wallet },
  { label: "What's today's attendance rate?", icon: CalendarCheck },
  { label: 'Show revenue growth this month', icon: TrendingUp },
]

function generateReply(question: string, students: Student[], feeRecords: FeeRecord[], attendancePercent: number): string {
  const q = question.toLowerCase()
  if (q.includes('student') && (q.includes('how many') || q.includes('enroll'))) {
    return `There are currently ${students.length} students enrolled across all grades, with ${students.filter((s) => s.status === 'active').length} marked active this term.`
  }
  if (q.includes('fee') || q.includes('pending') || q.includes('due')) {
    const pending = feeRecords.filter((f) => f.status === 'pending' || f.status === 'overdue').reduce((sum, f) => sum + (f.amount - f.paidAmount), 0)
    return `Outstanding fees currently total ${formatCurrency(pending)} across ${feeRecords.filter((f) => f.status !== 'paid').length} unpaid invoices. Would you like me to draft reminder emails for overdue accounts?`
  }
  if (q.includes('attendance')) {
    return `Today's attendance is running at ${attendancePercent}%, which is in line with the 14-day average.`
  }
  if (q.includes('revenue') || q.includes('growth')) {
    return 'Revenue is up 8.6% month-over-month, driven mostly by Term 2 tuition collections. Transport and hostel fee collection is slightly behind target.'
  }
  return "I've pulled together a quick summary based on your school's live data. Try asking about students, fees, attendance, or revenue trends for a more specific answer."
}

export default function AiAssistantPage() {
  const school = useActiveSchool()
  const students = useMemo(() => allStudents.filter((s) => s.schoolId === school.id), [school.id])
  const feeRecords = useMemo(() => allFeeRecords.filter((f) => f.schoolId === school.id), [school.id])
  const schoolAttendance = useMemo(() => attendanceRecords.filter((a) => a.schoolId === school.id), [school.id])
  const attendanceTrend = useMemo(() => buildAttendanceTrend(schoolAttendance), [schoolAttendance])
  const latestAttendance = attendanceTrend.length ? attendanceTrend[attendanceTrend.length - 1].percent : 0

  const [messages, setMessages] = useState<Msg[]>([
    { id: 'welcome', role: 'assistant', text: `Hi Aditi! I'm your CampusFlow AI assistant. Ask me anything about students, fees, attendance, or performance at ${school.name}.` },
  ])
  const [input, setInput] = useState('')

  function handleSend(text?: string) {
    const question = text ?? input
    if (!question.trim()) return
    const userMsg: Msg = { id: `u-${Date.now()}`, role: 'user', text: question }
    const replyMsg: Msg = { id: `a-${Date.now()}`, role: 'assistant', text: generateReply(question, students, feeRecords, latestAttendance) }
    setMessages((prev) => [...prev, userMsg, replyMsg])
    setInput('')
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="AI Assistant" description="Ask questions in plain English and get instant, data-backed answers." />

      <Card className="flex flex-col overflow-hidden p-0" style={{ height: '600px' }}>
        <ScrollArea className="flex-1 p-5">
          <div className="flex flex-col gap-4">
            {messages.map((m) => (
              <div key={m.id} className={cn('flex gap-2.5', m.role === 'user' && 'flex-row-reverse')}>
                {m.role === 'assistant' && (
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Sparkles className="size-4" />
                  </div>
                )}
                <div className={cn('max-w-[75%] rounded-2xl px-4 py-2.5 text-sm', m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground')}>{m.text}</div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {messages.length <= 1 && (
          <div className="grid grid-cols-2 gap-2 px-5 pb-3">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                onClick={() => handleSend(s.label)}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-secondary"
              >
                <s.icon className="size-3.5 text-primary" /> {s.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 border-t border-border p-3">
          <Input placeholder="Ask CampusFlow AI anything..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} />
          <Button size="icon" onClick={() => handleSend()}>
            <Send className="size-4" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
