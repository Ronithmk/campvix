import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import OtpVerificationPage from './otp-verification'

// The input-otp library polls document.elementFromPoint (a real-browser API) on
// an interval while its input is focused, to detect password-manager badges.
// jsdom doesn't implement it, and it isn't polyfilled in the shared
// src/test/setup.ts, so any test that focuses the OTP input needs it stubbed
// locally or the background timer throws once it fires.
if (!document.elementFromPoint) {
  document.elementFromPoint = () => null
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/otp-verification']}>
      <Routes>
        <Route path="/otp-verification" element={<OtpVerificationPage />} />
        <Route path="/reset-password" element={<div>Reset password page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('OtpVerificationPage', () => {
  it('disables Verify code until all 6 digits are entered', async () => {
    const user = userEvent.setup()
    renderPage()

    const verifyButton = screen.getByRole('button', { name: /verify code/i })
    expect(verifyButton).toBeDisabled()

    await user.type(screen.getByRole('textbox'), '123456')
    expect(verifyButton).not.toBeDisabled()
  })

  it('navigates to /reset-password after a successful verify', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByRole('textbox'), '123456')
    await user.click(screen.getByRole('button', { name: /verify code/i }))

    expect(await screen.findByText('Reset password page', {}, { timeout: 3000 })).toBeInTheDocument()
  })

  it('counts down and reveals the resend option at zero, resetting the timer on click', async () => {
    vi.useFakeTimers()
    try {
      renderPage()
      expect(screen.getByText(/resend code in 45s/i)).toBeInTheDocument()

      // The countdown re-schedules its own setTimeout from inside a useEffect on
      // every tick, so a single big advanceTimersByTime(45000) only fires the
      // one timer that already exists — the *next* timeout isn't scheduled
      // until React flushes the effect for the resulting re-render. Stepping
      // one second at a time inside act() lets each tick's effect flush and
      // schedule the next timer before we advance again.
      for (let i = 0; i < 45; i++) {
        act(() => {
          vi.advanceTimersByTime(1000)
        })
      }

      expect(screen.queryByText(/resend code in/i)).not.toBeInTheDocument()
      const resendButton = screen.getByRole('button', { name: /^resend code$/i })

      fireEvent.click(resendButton)
      expect(screen.getByText(/resend code in 45s/i)).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })
})
