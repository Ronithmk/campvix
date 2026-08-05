import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { Topbar } from './topbar'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'
import { useUiStore } from '@/store/ui-store'
import { schools } from '@/mock/schools'

beforeEach(() => {
  localStorage.clear()
  usePermissionsStore.getState().resetToDefaults()
  useAuthStore.getState().logout()
  useAuthStore.setState({ schoolId: schools[0].id })
  useUiStore.setState({ sidebarCollapsed: false, commandPaletteOpen: false })

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

function renderTopbar(path = '/app/dashboard') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Topbar />
    </MemoryRouter>,
  )
}

describe('Topbar', () => {
  it('renders breadcrumbs, search trigger, and profile controls', () => {
    useAuthStore.getState().loginAsRole('administrator')
    renderTopbar('/app/students')
    expect(screen.getByText('Students')).toBeInTheDocument()
    expect(screen.getByText(/search students, teachers, pages/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument()
  })

  it('opens the command palette store state when the search trigger is clicked', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('administrator')
    renderTopbar()

    expect(useUiStore.getState().commandPaletteOpen).toBe(false)
    await user.click(screen.getByText(/search students, teachers, pages/i))
    expect(useUiStore.getState().commandPaletteOpen).toBe(true)
  })

  it('opens the mobile sidebar when the menu button is clicked', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('teacher')
    renderTopbar()

    await user.click(screen.getByRole('button', { name: /open menu/i }))
    expect(await screen.findAllByRole('link', { name: /dashboard/i })).not.toHaveLength(0)
  })
})
