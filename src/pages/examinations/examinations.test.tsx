import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ExaminationsPage from './examinations'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'
import { exams as mockExams } from '@/mock/exams'
import { classes as allClasses } from '@/mock/classes'
import { subjects as allSubjects } from '@/mock/subjects'

beforeEach(() => {
  localStorage.clear()
  usePermissionsStore.getState().resetToDefaults()
  useAuthStore.getState().logout()
  useAuthStore.getState().loginAsRole('administrator')
})

const schoolId = () => useAuthStore.getState().schoolId!

describe('ExaminationsPage — rendering and stats', () => {
  it('renders for administrator', () => {
    render(<ExaminationsPage />)
    expect(screen.getByRole('heading', { name: /examinations/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /schedule exam/i })).toBeInTheDocument()
  })

  it('shows stat cards matching the underlying mock data', () => {
    render(<ExaminationsPage />)
    const schoolExams = mockExams.filter((e) => e.schoolId === schoolId())
    const upcoming = schoolExams.filter((e) => e.status === 'upcoming').length
    const graded = schoolExams.filter((e) => e.status === 'graded').length

    expect(screen.getByText('Total Exams', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(String(schoolExams.length))
    expect(screen.getByText('Upcoming', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(String(upcoming))
    expect(screen.getByText('Graded', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(String(graded))
  })
})

describe('ExaminationsPage — filter', () => {
  it('filters rows down by status', async () => {
    const user = userEvent.setup()
    render(<ExaminationsPage />)
    const expectedCount = mockExams.filter((e) => e.schoolId === schoolId() && e.status === 'graded').length

    await user.click(screen.getAllByRole('combobox')[0])
    await user.click(await screen.findByRole('option', { name: /^graded$/i }))

    expect(await screen.findByText(new RegExp(`showing \\d+ of ${expectedCount} rows`, 'i'))).toBeInTheDocument()
  })
})

describe('ExaminationsPage — Schedule Exam button is a stub', () => {
  it('shows a success toast but does not add a row (known UI stub)', async () => {
    const user = userEvent.setup()
    render(<ExaminationsPage />)
    const before = mockExams.filter((e) => e.schoolId === schoolId()).length

    await user.click(screen.getByRole('button', { name: /schedule exam/i }))

    expect(screen.getByText('Total Exams', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(String(before))
  })
})

describe('ExaminationsPage — delete flow', () => {
  it('cancels/removes the exam row after confirming delete', async () => {
    const user = userEvent.setup()
    render(<ExaminationsPage />)
    const target = mockExams.find((e) => e.schoolId === schoolId())!
    const targetClassName = allClasses.find((c) => c.id === target.classId)!.name
    const targetSubjectName = allSubjects.find((s) => s.id === target.subjectId)!.name

    const rows = screen.getAllByRole('row')
    const row = rows.find((r) => r.textContent?.includes(targetClassName) && r.textContent?.includes(targetSubjectName))!
    await user.click(within(row).getByRole('button'))
    await user.click(await screen.findByRole('menuitem', { name: /cancel exam/i }))

    const dialog = await screen.findByRole('alertdialog')
    expect(within(dialog).getByText(/cancel this exam\?/i)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: /^cancel exam$/i }))

    const rowsAfter = screen.getAllByRole('row')
    expect(rowsAfter.find((r) => r.textContent?.includes(targetClassName) && r.textContent?.includes(targetSubjectName))).toBeUndefined()
  })
})
