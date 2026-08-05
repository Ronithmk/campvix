import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LmsPage from './lms'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'
import { schools } from '@/mock/schools'

beforeEach(() => {
  localStorage.clear()
  usePermissionsStore.getState().resetToDefaults()
  useAuthStore.getState().logout()
})

describe('LmsPage — role-gated course creation', () => {
  it('shows the New Course button for administrator', () => {
    useAuthStore.getState().loginAsRole('administrator')
    render(<LmsPage />)
    expect(screen.getByRole('button', { name: /new course/i })).toBeInTheDocument()
  })

  it('shows the New Course button for teacher', () => {
    useAuthStore.getState().loginAsRole('teacher')
    render(<LmsPage />)
    expect(screen.getByRole('button', { name: /new course/i })).toBeInTheDocument()
  })

  it('hides the New Course button for student', () => {
    useAuthStore.getState().loginAsRole('student')
    render(<LmsPage />)
    expect(screen.queryByRole('button', { name: /new course/i })).not.toBeInTheDocument()
  })

  it('hides the New Course button for parent', () => {
    useAuthStore.getState().loginAsRole('parent')
    render(<LmsPage />)
    expect(screen.queryByRole('button', { name: /new course/i })).not.toBeInTheDocument()
  })

  it('respects an admin-revoked action permission even for a teacher', () => {
    usePermissionsStore.getState().toggleAccess('teacher', 'action:lms:create')
    useAuthStore.getState().loginAsRole('teacher')
    render(<LmsPage />)
    expect(screen.queryByRole('button', { name: /new course/i })).not.toBeInTheDocument()
  })

  it('creates a new course scoped to the current school and adds it to the list', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('teacher')
    const before = useAuthStore.getState().schoolId
    render(<LmsPage />)

    await user.click(screen.getByRole('button', { name: /new course/i }))
    await user.type(screen.getByLabelText(/course title/i), 'Test Automation 101')
    await user.click(screen.getByRole('combobox', { name: /subject/i }))
    await user.click(await screen.findByRole('option', { name: /mathematics/i }))
    await user.type(screen.getByLabelText(/instructor/i), 'QA Bot')
    await user.click(screen.getByRole('button', { name: /create course/i }))

    expect(await screen.findByText('Test Automation 101')).toBeInTheDocument()
    expect(useAuthStore.getState().schoolId).toBe(before)
  })

  it('does not show a course created for one school when viewing another (Architecture #1)', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('teacher')
    useAuthStore.setState({ schoolId: schools[0].id })
    const { rerender } = render(<LmsPage />)

    await user.click(screen.getByRole('button', { name: /new course/i }))
    await user.type(screen.getByLabelText(/course title/i), 'School A Exclusive Course')
    await user.click(screen.getByRole('combobox', { name: /subject/i }))
    await user.click(await screen.findByRole('option', { name: /mathematics/i }))
    await user.type(screen.getByLabelText(/instructor/i), 'QA Bot')
    await user.click(screen.getByRole('button', { name: /create course/i }))
    expect(await screen.findByText('School A Exclusive Course')).toBeInTheDocument()

    useAuthStore.setState({ schoolId: schools[1].id })
    rerender(<LmsPage />)
    expect(screen.queryByText('School A Exclusive Course')).not.toBeInTheDocument()
  })
})
