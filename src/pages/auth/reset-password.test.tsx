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

// PRE-EXISTING BUG (reported, not fixed — see login.test.tsx for details): the
// "New password" field's FormControl wraps its <Input> in a decorative <div>
// (for the key icon + show/hide-password button), so Radix Slot's generated
// id/aria-* props land on that <div> instead of the <input>, breaking the
// <FormLabel htmlFor> association. getByLabelText(/new password/i) can't find
// it, so it's located below via its react-hook-form `name` attribute instead.
// "Confirm password" isn't wrapped in an extra <div> and is unaffected.
function getNewPasswordInput(container: HTMLElement) {
  const input = container.querySelector<HTMLInputElement>('input[name="password"]')
  if (!input) throw new Error('New password input not found')
  return input
}

describe('ResetPasswordPage', () => {
  it('live-updates the password rule checklist as the user types', async () => {
    const user = userEvent.setup()
    const { container } = renderPage()

    const rule = screen.getByText('One number').closest('div')
    expect(rule).not.toBeNull()
    expect(rule).toHaveClass('text-muted-foreground')

    await user.type(getNewPasswordInput(container), 'Password1')
    expect(rule).toHaveClass('text-success')
  })

  it('shows a validation error when the password is too short', async () => {
    const user = userEvent.setup()
    const { container } = renderPage()

    await user.type(getNewPasswordInput(container), 'short1')
    await user.type(screen.getByLabelText(/confirm password/i), 'short1')
    await user.click(screen.getByRole('button', { name: /update password/i }))

    expect(await screen.findByText(/must be at least 8 characters/i)).toBeInTheDocument()
  })

  it('shows a validation error when the passwords do not match', async () => {
    const user = userEvent.setup()
    const { container } = renderPage()

    await user.type(getNewPasswordInput(container), 'Password1')
    await user.type(screen.getByLabelText(/confirm password/i), 'Password2')
    await user.click(screen.getByRole('button', { name: /update password/i }))

    expect(await screen.findByText(/passwords don't match/i)).toBeInTheDocument()
  })

  it('navigates to /login after a successful password update', async () => {
    const user = userEvent.setup()
    const { container } = renderPage()

    await user.type(getNewPasswordInput(container), 'Password1')
    await user.type(screen.getByLabelText(/confirm password/i), 'Password1')
    await user.click(screen.getByRole('button', { name: /update password/i }))

    expect(await screen.findByText('Login page', {}, { timeout: 3000 })).toBeInTheDocument()
  })
})
