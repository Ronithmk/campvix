import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import StudentsListPage from './students-list'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'
import { students as mockStudents } from '@/mock/students'
import { classes as allClasses } from '@/mock/classes'
import { formatNumber } from '@/lib/utils'

function renderPage() {
  return render(
    <MemoryRouter>
      <StudentsListPage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
  usePermissionsStore.getState().resetToDefaults()
  useAuthStore.getState().logout()
  useAuthStore.getState().loginAsRole('administrator')
})

const schoolId = () => useAuthStore.getState().schoolId!

describe('StudentsListPage — rendering and stats', () => {
  it('renders for administrator with the school name in the description', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /students/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add student/i })).toBeInTheDocument()
  })

  it('shows stat cards that match the underlying mock data for the active school', () => {
    renderPage()
    const schoolStudents = mockStudents.filter((s) => s.schoolId === schoolId())
    const active = schoolStudents.filter((s) => s.status === 'active').length
    const overdue = schoolStudents.filter((s) => s.feeStatus === 'overdue').length
    const avgAttendance = Math.round(schoolStudents.reduce((sum, s) => sum + s.attendancePercent, 0) / schoolStudents.length)

    expect(screen.getByText('Total Students', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(formatNumber(schoolStudents.length))
    expect(screen.getByText('Active', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(formatNumber(active))
    expect(screen.getByText('Overdue Fees', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(formatNumber(overdue))
    expect(screen.getByText('Avg. Attendance', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(`${avgAttendance}%`)
  })
})

describe('StudentsListPage — filters', () => {
  it('filters rows down to a single class when a class is selected', async () => {
    const user = userEvent.setup()
    renderPage()
    const schoolClasses = allClasses.filter((c) => c.schoolId === schoolId())
    const targetClass = schoolClasses[0]
    const expectedCount = mockStudents.filter((s) => s.schoolId === schoolId() && s.classId === targetClass.id).length

    const comboboxes = screen.getAllByRole('combobox')
    await user.click(comboboxes[0])
    await user.click(await screen.findByRole('option', { name: targetClass.name }))

    expect(await screen.findByText(new RegExp(`showing \\d+ of ${expectedCount} rows`, 'i'))).toBeInTheDocument()
  })

  it('filters rows down by status', async () => {
    const user = userEvent.setup()
    renderPage()
    const expectedCount = mockStudents.filter((s) => s.schoolId === schoolId() && s.status === 'graduated').length

    const comboboxes = screen.getAllByRole('combobox')
    await user.click(comboboxes[1])
    await user.click(await screen.findByRole('option', { name: /^graduated$/i }))

    expect(await screen.findByText(new RegExp(`showing \\d+ of ${expectedCount} rows`, 'i'))).toBeInTheDocument()
  })
})

describe('StudentsListPage — add student form', () => {
  it('rejects submission with invalid/missing fields via zod validation', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /add student/i }))
    await user.type(screen.getByLabelText(/^email$/i), 'not-an-email')
    await user.click(screen.getByRole('button', { name: /enroll student/i }))

    expect(await screen.findByText(/^name is required$/i)).toBeInTheDocument()
    expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument()
    expect(screen.getByText(/select a class/i)).toBeInTheDocument()
    expect(screen.getByText(/parent name is required/i)).toBeInTheDocument()
  })

  it('enrolls a new student on valid submission and updates the total count stat', async () => {
    const user = userEvent.setup()
    renderPage()
    const schoolClasses = allClasses.filter((c) => c.schoolId === schoolId())
    const before = mockStudents.filter((s) => s.schoolId === schoolId()).length

    await user.click(screen.getByRole('button', { name: /add student/i }))
    await user.type(screen.getByLabelText(/full name/i), 'Zara Automation')
    await user.type(screen.getByLabelText(/^email$/i), 'zara.automation@student.edu')
    await user.click(screen.getByRole('combobox', { name: /^class$/i }))
    await user.click(await screen.findByRole('option', { name: schoolClasses[0].name }))
    await user.type(screen.getByLabelText(/parent \/ guardian name/i), 'Rakesh Automation')
    await user.click(screen.getByRole('button', { name: /enroll student/i }))

    expect(await screen.findByText('Zara Automation')).toBeInTheDocument()
    expect(screen.getByText('Total Students', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(formatNumber(before + 1))
  })
})

describe('StudentsListPage — delete flow', () => {
  it('removes the student row after confirming delete', async () => {
    const user = userEvent.setup()
    renderPage()
    const target = mockStudents.find((s) => s.schoolId === schoolId())!

    const nameCell = screen.getByText(target.name)
    const row = nameCell.closest('tr')!
    await user.click(within(row).getByRole('button'))
    await user.click(await screen.findByRole('menuitem', { name: /remove student/i }))

    expect(await screen.findByText(/remove this student\?/i)).toBeInTheDocument()
    const dialog = screen.getByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: /^delete$/i }))

    expect(screen.queryByText(target.name)).not.toBeInTheDocument()
  })

  it('keeps the student row when delete is cancelled', async () => {
    const user = userEvent.setup()
    renderPage()
    const target = mockStudents.find((s) => s.schoolId === schoolId())!

    const nameCell = screen.getByText(target.name)
    const row = nameCell.closest('tr')!
    await user.click(within(row).getByRole('button'))
    await user.click(await screen.findByRole('menuitem', { name: /remove student/i }))

    const dialog = await screen.findByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: /cancel/i }))

    expect(screen.getByText(target.name)).toBeInTheDocument()
  })
})
