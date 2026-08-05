import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { CommandPalette } from './command-palette'
import { useUiStore } from '@/store/ui-store'

beforeEach(() => {
  useUiStore.setState({ commandPaletteOpen: false })
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

function renderPalette(initialEntries = ['/app/dashboard']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/app/dashboard" element={<div>Dashboard page</div>} />
        <Route path="/app/students" element={<div>Students page</div>} />
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
      <CommandPalette />
    </MemoryRouter>,
  )
}

describe('CommandPalette', () => {
  it('is not visible in the DOM when closed', () => {
    renderPalette()
    expect(screen.queryByPlaceholderText(/search pages, students, teachers/i)).not.toBeInTheDocument()
  })

  it('shows navigation and action items when open', () => {
    useUiStore.setState({ commandPaletteOpen: true })
    renderPalette()
    expect(screen.getByPlaceholderText(/search pages, students, teachers/i)).toBeInTheDocument()
    expect(screen.getByText('Students')).toBeInTheDocument()
    expect(screen.getByText('Log out')).toBeInTheDocument()
  })

  it('navigates and closes the palette when a nav item is selected', async () => {
    const user = userEvent.setup()
    useUiStore.setState({ commandPaletteOpen: true })
    renderPalette()

    await user.click(screen.getByText('Students'))

    expect(useUiStore.getState().commandPaletteOpen).toBe(false)
  })

  it('opens via the Cmd+K / Ctrl+K keyboard shortcut', async () => {
    const user = userEvent.setup()
    renderPalette()
    expect(useUiStore.getState().commandPaletteOpen).toBe(false)

    await user.keyboard('{Control>}k{/Control}')

    expect(useUiStore.getState().commandPaletteOpen).toBe(true)
  })
})
