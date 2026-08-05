import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from './login'
import { useAuthStore } from '@/store/auth-store'
import type { Role } from '@/types'

function renderLogin() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
  useAuthStore.getState().logout()
})

describe('LoginPage — quick access roles', () => {
  const quickAccessRoles: [string, Role][] = [
    ['Administrator', 'administrator'],
    ['Teacher', 'teacher'],
    ['Student', 'student'],
    ['Parent', 'parent'],
  ]

  it.each(quickAccessRoles)('logs in as %s and authenticates with the matching role', async (label, role) => {
    const user = userEvent.setup()
    renderLogin()

    await user.click(screen.getByRole('button', { name: label }))

    await waitFor(() => expect(useAuthStore.getState().isAuthenticated).toBe(true), { timeout: 3000 })
    expect(useAuthStore.getState().role).toBe(role)
  })

  it('reveals the additional role buttons after clicking "Show more roles"', async () => {
    const user = userEvent.setup()
    renderLogin()

    expect(screen.queryByRole('button', { name: 'Principal' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Accountant' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /show more roles/i }))

    expect(screen.getByRole('button', { name: 'Principal' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Accountant' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Receptionist' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Driver' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Librarian' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /show more roles/i })).not.toBeInTheDocument()
  })

  it('logs in via a revealed "more roles" quick-access button', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.click(screen.getByRole('button', { name: /show more roles/i }))
    await user.click(screen.getByRole('button', { name: 'Librarian' }))

    await waitFor(() => expect(useAuthStore.getState().isAuthenticated).toBe(true), { timeout: 3000 })
    expect(useAuthStore.getState().role).toBe('librarian')
  })
})

describe('LoginPage — manual sign-in form', () => {
  it('logs in with valid demo credentials for a non-default role', async () => {
    const user = userEvent.setup()
    renderLogin()

    // The password field's <label htmlFor> is a pre-existing bug (see note at the
    // bottom of this file): it points at the wrapper <div>, not the <input>, so
    // getByLabelText can't find it. The default password (demo1234) is already
    // valid for every demo account, so we only need to change the email.
    const emailInput = screen.getByLabelText(/email address/i)
    await user.clear(emailInput)
    await user.type(emailInput, 'teacher@campusflow.app')
    await user.click(screen.getByRole('button', { name: /^sign in$/i }))

    await waitFor(() => expect(useAuthStore.getState().isAuthenticated).toBe(true), { timeout: 3000 })
    expect(useAuthStore.getState().role).toBe('teacher')
  })

  it('shows an inline error and does not authenticate on an invalid password', async () => {
    const user = userEvent.setup()
    renderLogin()

    // Default email (admin@campusflow.app) is valid; only the password is wrong.
    const passwordInput = screen.getByLabelText(/password/i)
    await user.clear(passwordInput)
    await user.type(passwordInput, 'wrongpass')
    await user.click(screen.getByRole('button', { name: /^sign in$/i }))

    expect(await screen.findByText(/invalid email or password/i, {}, { timeout: 3000 })).toBeInTheDocument()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})
