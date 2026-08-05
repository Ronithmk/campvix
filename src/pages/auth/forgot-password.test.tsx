import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import ForgotPasswordPage from './forgot-password'

function OtpVerificationStub() {
  const location = useLocation()
  const email = (location.state as { email?: string } | null)?.email
  return <div>OTP page for {email}</div>
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/forgot-password']}>
      <Routes>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/otp-verification" element={<OtpVerificationStub />} />
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

// PRE-EXISTING BUG (reported, not fixed — see login.test.tsx for details): the
// email field's FormControl wraps its <Input> in a decorative <div> (for the
// mail icon), so Radix Slot's generated id/aria-* props land on that <div>
// instead of the <input>, breaking the <FormLabel htmlFor> association.
// getByLabelText(/email address/i) can't find the input, so these tests locate
// it via its placeholder instead.

describe('ForgotPasswordPage', () => {
  it('shows a validation error for an invalid email', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByPlaceholderText('you@school.edu'), 'not-an-email')
    await user.click(screen.getByRole('button', { name: /send reset code/i }))

    expect(await screen.findByText(/enter a valid email address/i)).toBeInTheDocument()
  })

  it('shows the check-your-email screen with the submitted address after a valid submit', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByPlaceholderText('you@school.edu'), 'admin@campusflow.app')
    await user.click(screen.getByRole('button', { name: /send reset code/i }))

    expect(await screen.findByText('admin@campusflow.app', {}, { timeout: 2000 })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enter verification code/i })).toBeInTheDocument()
  })

  it('navigates to otp-verification with the submitted email in route state', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByPlaceholderText('you@school.edu'), 'admin@campusflow.app')
    await user.click(screen.getByRole('button', { name: /send reset code/i }))
    await user.click(await screen.findByRole('button', { name: /enter verification code/i }, { timeout: 2000 }))

    expect(await screen.findByText('OTP page for admin@campusflow.app')).toBeInTheDocument()
  })
})
