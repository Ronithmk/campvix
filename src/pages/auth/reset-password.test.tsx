import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ResetPasswordPage from './reset-password'

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/reset-password']}>
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ResetPasswordPage', () => {
  it('live-updates the password rule checklist as the user types', async () => {
    const user = userEvent.setup()
    renderPage()

    const rule = screen.getByText('One number').closest('div')
    expect(rule).not.toBeNull()
    expect(rule).toHaveClass('text-muted-foreground')

    await user.type(screen.getByLabelText(/^new password$/i), 'Password1')
    expect(rule).toHaveClass('text-success')
  })

  it('shows a validation error when the password is too short', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/^new password$/i), 'short1')
    await user.type(screen.getByLabelText(/confirm password/i), 'short1')
    await user.click(screen.getByRole('button', { name: /update password/i }))

    expect(await screen.findByText(/must be at least 8 characters/i)).toBeInTheDocument()
  })

  it('shows a validation error when the passwords do not match', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/^new password$/i), 'Password1')
    await user.type(screen.getByLabelText(/confirm password/i), 'Password2')
    await user.click(screen.getByRole('button', { name: /update password/i }))

    expect(await screen.findByText(/passwords don't match/i)).toBeInTheDocument()
  })

  it('navigates to /login after a successful password update', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/^new password$/i), 'Password1')
    await user.type(screen.getByLabelText(/confirm password/i), 'Password1')
    await user.click(screen.getByRole('button', { name: /update password/i }))

    expect(await screen.findByText('Login page', {}, { timeout: 3000 })).toBeInTheDocument()
  })
})
