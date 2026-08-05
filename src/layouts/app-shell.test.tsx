import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from './app-shell'
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

function renderShell() {
  return render(
    <MemoryRouter initialEntries={['/app/dashboard']}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/app/dashboard" element={<div>Nested route content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('AppShell', () => {
  it('renders the sidebar, topbar, and the nested route content via Outlet', async () => {
    useAuthStore.getState().loginAsRole('administrator')
    renderShell()

    // Topbar's search trigger, present regardless of role
    expect(screen.getByText(/search students, teachers, pages/i)).toBeInTheDocument()
    // Sidebar nav item
    expect(screen.getAllByRole('link', { name: /dashboard/i }).length).toBeGreaterThan(0)
    // The routed child content rendered inside <Outlet />, wrapped in Suspense/RouteErrorBoundary
    expect(await screen.findByText('Nested route content')).toBeInTheDocument()
  })
})
