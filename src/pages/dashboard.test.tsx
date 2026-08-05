import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DashboardPage from './dashboard'
import { useAuthStore } from '@/store/auth-store'
import { schools } from '@/mock/schools'
import { students, teachers } from '@/mock'
import { formatNumber } from '@/lib/utils'

beforeEach(() => {
  localStorage.clear()
  useAuthStore.getState().logout()
})

function renderDashboard() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  )
}

describe('DashboardPage', () => {
  it('renders the admin dashboard with real stat counts for the active school', () => {
    useAuthStore.getState().loginAsRole('administrator')
    useAuthStore.setState({ schoolId: schools[0].id })
    renderDashboard()

    const { name } = useAuthStore.getState()
    expect(screen.getByText(new RegExp(`Good morning, ${name.split(' ')[0]}`, 'i'))).toBeInTheDocument()

    const schoolStudents = students.filter((s) => s.schoolId === schools[0].id)
    const activeTeachers = teachers.filter((t) => t.schoolId === schools[0].id && t.status === 'active')
    expect(screen.getByText('Total Students')).toBeInTheDocument()
    expect(screen.getByText(formatNumber(schoolStudents.length))).toBeInTheDocument()
    expect(screen.getByText(formatNumber(activeTeachers.length))).toBeInTheDocument()
  })

  it('does not show admin-style stat cards when logged in as a student (role-specific dashboard)', () => {
    useAuthStore.getState().loginAsRole('student')
    renderDashboard()

    expect(screen.queryByText('Total Students')).not.toBeInTheDocument()
  })
})
