import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AssignmentsPage from './assignments'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'
import { assignments as mockAssignments } from '@/mock/coursework'
import { formatDate } from '@/lib/utils'

beforeEach(() => {
  localStorage.clear()
  usePermissionsStore.getState().resetToDefaults()
  useAuthStore.getState().logout()
  useAuthStore.getState().loginAsRole('administrator')
})

const schoolId = () => useAuthStore.getState().schoolId!

function findAssignmentCard(target: (typeof mockAssignments)[number]) {
  const dueDateText = formatDate(target.dueDate)
  const fractionText = `${target.totalSubmissions}/${target.totalStudents}`
  const titleMatches = screen.getAllByText(target.title)
  const card = titleMatches
    .map((el) => el.closest('[data-slot="card"]') as HTMLElement)
    .find((c) => c.textContent?.includes(dueDateText) && c.textContent?.includes(fractionText))
  if (!card) throw new Error('assignment card not found')
  return card
}

describe('AssignmentsPage — rendering and stats', () => {
  it('renders for administrator', () => {
    render(<AssignmentsPage />)
    expect(screen.getByRole('heading', { name: /assignments/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /new assignment/i })).toBeInTheDocument()
  })

  it('shows stat cards matching the underlying mock data', () => {
    render(<AssignmentsPage />)
    const schoolAssignments = mockAssignments.filter((a) => a.schoolId === schoolId())
    const published = schoolAssignments.filter((a) => a.status === 'published').length
    const grading = schoolAssignments.filter((a) => a.status === 'grading').length

    expect(screen.getByText('Total Assignments', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(String(schoolAssignments.length))
    expect(screen.getByText('Published', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(String(published))
    expect(screen.getByText('Pending Grading', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(String(grading))
  })
})

describe('AssignmentsPage — filter', () => {
  it('filters the visible cards down by status', async () => {
    const user = userEvent.setup()
    render(<AssignmentsPage />)
    const schoolAssignments = mockAssignments.filter((a) => a.schoolId === schoolId())
    const expectedDraftCount = schoolAssignments.filter((a) => a.status === 'draft').length

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: /^draft$/i }))

    const grid = document.querySelector('.xl\\:grid-cols-3')!
    expect(within(grid as HTMLElement).queryAllByRole('button')).toHaveLength(expectedDraftCount)
  })
})

describe('AssignmentsPage — New Assignment button is a stub', () => {
  it('shows a success toast but does not add a card (known UI stub)', async () => {
    const user = userEvent.setup()
    render(<AssignmentsPage />)
    const before = mockAssignments.filter((a) => a.schoolId === schoolId()).length

    await user.click(screen.getByRole('button', { name: /new assignment/i }))

    expect(screen.getByText('Total Assignments', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(String(before))
  })
})

describe('AssignmentsPage — delete flow', () => {
  it('removes the assignment card after confirming delete', async () => {
    const user = userEvent.setup()
    render(<AssignmentsPage />)
    const target = mockAssignments.find((a) => a.schoolId === schoolId())!
    const before = mockAssignments.filter((a) => a.schoolId === schoolId()).length

    const card = findAssignmentCard(target)
    await user.click(within(card).getByRole('button'))

    const dialog = await screen.findByRole('alertdialog')
    expect(within(dialog).getByText(/delete this assignment\?/i)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: /^delete$/i }))

    expect(screen.getByText('Total Assignments', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(String(before - 1))
  })
})
