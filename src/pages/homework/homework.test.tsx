import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HomeworkPage from './homework'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'
import { homeworkEntries as mockHomework } from '@/mock/coursework'
import { formatDate } from '@/lib/utils'

beforeEach(() => {
  localStorage.clear()
  usePermissionsStore.getState().resetToDefaults()
  useAuthStore.getState().logout()
  useAuthStore.getState().loginAsRole('administrator')
})

const schoolId = () => useAuthStore.getState().schoolId!

function findHomeworkCard(target: (typeof mockHomework)[number]) {
  const dateText = formatDate(target.date)
  const percentText = `${target.completionPercent}%`
  const titleMatches = screen.getAllByText(target.title)
  const card = titleMatches
    .map((el) => el.closest('[data-slot="card"]') as HTMLElement)
    .find((c) => c.textContent?.includes(dateText) && c.textContent?.includes(percentText))
  if (!card) throw new Error('homework card not found')
  return card
}

describe('HomeworkPage — rendering and stats', () => {
  it('renders for administrator', () => {
    render(<HomeworkPage />)
    expect(screen.getByRole('heading', { name: /homework/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /assign homework/i })).toBeInTheDocument()
  })

  it('shows stat cards matching the underlying mock data', () => {
    render(<HomeworkPage />)
    const schoolHomework = mockHomework.filter((h) => h.schoolId === schoolId())
    const avgCompletion = Math.round(schoolHomework.reduce((sum, h) => sum + h.completionPercent, 0) / schoolHomework.length)
    const dueToday = schoolHomework.filter((h) => new Date(h.date).toDateString() === new Date().toDateString()).length

    expect(screen.getByText('Total Entries', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(String(schoolHomework.length))
    expect(screen.getByText('Assigned Today', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(String(dueToday))
    expect(screen.getByText('Avg. Completion', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(`${avgCompletion}%`)
  })
})

describe('HomeworkPage — assigns new homework', () => {
  it('adds a new homework entry scoped to the current school', async () => {
    const user = userEvent.setup()
    render(<HomeworkPage />)
    const before = mockHomework.filter((h) => h.schoolId === schoolId()).length

    await user.click(screen.getByRole('button', { name: 'Assign Homework' }))
    await user.type(screen.getByLabelText(/title/i), 'Test Automation Worksheet')
    await user.type(screen.getByLabelText(/description/i), 'Complete the QA checklist')
    await user.click(screen.getByRole('combobox', { name: /subject/i }))
    await user.click(await screen.findByRole('option', { name: /mathematics/i }))
    await user.click(screen.getByRole('combobox', { name: /class/i }))
    await user.click((await screen.findAllByRole('option'))[0])
    await user.click(screen.getByRole('button', { name: 'Assign homework' }))

    expect(await screen.findByText('Test Automation Worksheet')).toBeInTheDocument()
    expect(screen.getByText('Total Entries', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(String(before + 1))
  })
})

describe('HomeworkPage — delete flow', () => {
  it('removes the homework entry after confirming delete', async () => {
    const user = userEvent.setup()
    render(<HomeworkPage />)
    const target = mockHomework.find((h) => h.schoolId === schoolId())!
    const before = mockHomework.filter((h) => h.schoolId === schoolId()).length

    const card = findHomeworkCard(target)
    await user.click(within(card).getByRole('button'))

    const dialog = await screen.findByRole('alertdialog')
    expect(within(dialog).getByText(/delete this homework entry\?/i)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: /^delete$/i }))

    expect(screen.getByText('Total Entries', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(String(before - 1))
  })
})
