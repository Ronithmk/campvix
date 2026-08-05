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

describe('ForgotPasswordPage', () => {
  it('shows a validation error for an invalid email', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/email address/i), 'not-an-email')
    await user.click(screen.getByRole('button', { name: /send reset code/i }))

    expect(await screen.findByText(/enter a valid email address/i)).toBeInTheDocument()
  })

  it('shows the check-your-email screen with the submitted address after a valid submit', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/email address/i), 'admin@campusflow.app')
    await user.click(screen.getByRole('button', { name: /send reset code/i }))

    expect(await screen.findByText('admin@campusflow.app', {}, { timeout: 2000 })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enter verification code/i })).toBeInTheDocument()
  })

  it('navigates to otp-verification with the submitted email in route state', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/email address/i), 'admin@campusflow.app')
    await user.click(screen.getByRole('button', { name: /send reset code/i }))
    await user.click(await screen.findByRole('button', { name: /enter verification code/i }, { timeout: 2000 }))

    expect(await screen.findByText('OTP page for admin@campusflow.app')).toBeInTheDocument()
  })
})
