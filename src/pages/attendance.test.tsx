import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AttendancePage from './attendance'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'
import { classes as allClasses } from '@/mock/classes'
import { students as allStudents } from '@/mock/students'

beforeEach(() => {
  localStorage.clear()
  usePermissionsStore.getState().resetToDefaults()
  useAuthStore.getState().logout()
  useAuthStore.getState().loginAsRole('teacher')
})

const schoolId = () => useAuthStore.getState().schoolId!

function rosterFor(classId: string) {
  return allStudents.filter((s) => s.classId === classId).slice(0, 12)
}

describe('AttendancePage — rendering and stats', () => {
  it('renders for teachers with all students marked present by default', () => {
    render(<AttendancePage />)
    const schoolClasses = allClasses.filter((c) => c.schoolId === schoolId())
    const roster = rosterFor(schoolClasses[0].id)

    expect(screen.getByRole('heading', { name: /attendance/i })).toBeInTheDocument()
    expect(screen.getByText('Present today', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(String(roster.length))
    expect(screen.getByText('Absent today', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent('0')
    expect(screen.getByText('Class strength', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(String(roster.length))
  })
})

describe('AttendancePage — marking attendance', () => {
  it('moves a student from present to absent when its Absent button is clicked', async () => {
    const user = userEvent.setup()
    render(<AttendancePage />)
    const schoolClasses = allClasses.filter((c) => c.schoolId === schoolId())
    const roster = rosterFor(schoolClasses[0].id)
    const target = roster[0]

    const nameEl = screen.getByText(target.name)
    const row = nameEl.closest('div.flex.items-center.gap-3')!
    const absentButton = row.querySelector('button[title="Absent"]') as HTMLElement
    await user.click(absentButton)

    expect(screen.getByText('Present today', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(String(roster.length - 1))
    expect(screen.getByText('Absent today', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent('1')
  })
})

describe('AttendancePage — class switcher', () => {
  it('reloads the roster and resets marks when a different class is selected', async () => {
    const user = userEvent.setup()
    render(<AttendancePage />)
    const schoolClasses = allClasses.filter((c) => c.schoolId === schoolId())
    const nextClass = schoolClasses[1]
    const nextRoster = rosterFor(nextClass.id)

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: nextClass.name }))

    expect(await screen.findByText('Class strength', { selector: 'p.text-muted-foreground' })).toBeInTheDocument()
    expect(screen.getByText('Class strength', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(String(nextRoster.length))
    expect(screen.getByText('Present today', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(String(nextRoster.length))
  })
})

describe('AttendancePage — role restriction', () => {
  it('shows a personal attendance report for students and hides the teacher editing section', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().logout()
    useAuthStore.getState().loginAsRole('student')
    const { unmount } = render(<AttendancePage />)

    expect(screen.getByText('Your attendance')).toBeInTheDocument()
    expect(screen.queryByText('Mark attendance')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument()

    unmount()
    useAuthStore.getState().logout()
    useAuthStore.getState().loginAsRole('teacher')
    render(<AttendancePage />)

    expect(screen.getByText('Mark attendance')).toBeInTheDocument()
    const teacherButtons = document.querySelectorAll('button[title="Absent"]')
    expect(Array.from(teacherButtons).some((button) => !button.hasAttribute('disabled'))).toBe(true)

    await user.click(teacherButtons[0])
    expect(screen.getByText('Absent today', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent('1')
  })
})
