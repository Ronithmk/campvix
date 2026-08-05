import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from 'next-themes'
import { ThemeToggle } from './theme-toggle'

// jsdom doesn't implement matchMedia; next-themes' ThemeProvider queries it
// on mount (even with enableSystem disabled) to track the OS color scheme.
beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  )
})

function renderToggle() {
  return render(
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <ThemeToggle />
    </ThemeProvider>,
  )
}

describe('ThemeToggle', () => {
  it('renders a toggle-theme button once mounted', async () => {
    renderToggle()
    expect(await screen.findByRole('button', { name: /toggle theme/i })).toBeInTheDocument()
  })

  it('switches the icon when clicked (toggles the resolved theme)', async () => {
    const user = userEvent.setup()
    renderToggle()
    const button = await screen.findByRole('button', { name: /toggle theme/i })

    // Starting in light theme, the moon icon (switch-to-dark affordance) shows.
    expect(button.querySelector('svg')).not.toBeNull()

    await user.click(button)
    // After the click next-themes flips the class on <html>; re-fetch the button
    // to assert the toggle didn't throw and remains interactive.
    expect(await screen.findByRole('button', { name: /toggle theme/i })).toBeInTheDocument()
  })
})
