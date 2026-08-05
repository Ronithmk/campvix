import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProfilePage from './profile'
import { useAuthStore } from '@/store/auth-store'
import { schools } from '@/mock/schools'
import { ROLE_LABELS } from '@/types'

beforeEach(() => {
  localStorage.clear()
  useAuthStore.getState().logout()
})

describe('ProfilePage', () => {
  it('renders the logged-in administrator name, role, and school', () => {
    useAuthStore.getState().loginAsRole('administrator')
    useAuthStore.setState({ schoolId: schools[0].id })
    render(<ProfilePage />)

    const { name } = useAuthStore.getState()
    expect(screen.getByRole('heading', { name })).toBeInTheDocument()
    expect(screen.getByText(new RegExp(`${ROLE_LABELS.administrator}.*${schools[0].name}`))).toBeInTheDocument()
  })

  it('pre-fills the personal information form with the current session data', () => {
    useAuthStore.getState().loginAsRole('teacher')
    render(<ProfilePage />)

    const { name, email } = useAuthStore.getState()
    expect(screen.getByLabelText(/full name/i)).toHaveValue(name)
    expect(screen.getByLabelText(/email address/i)).toHaveValue(email)
    const roleInput = screen.getByLabelText(/^role$/i)
    expect(roleInput).toHaveValue(ROLE_LABELS.teacher)
    expect(roleInput).toBeDisabled()
  })

  it('shows a Guest role label when no role is set', () => {
    render(<ProfilePage />)
    expect(screen.getByText(/guest/i)).toBeInTheDocument()
  })
})
