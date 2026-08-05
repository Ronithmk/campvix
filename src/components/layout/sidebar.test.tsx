import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { Sidebar } from './sidebar'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'
import { useUiStore } from '@/store/ui-store'

beforeEach(() => {
  localStorage.clear()
  usePermissionsStore.getState().resetToDefaults()
  useAuthStore.getState().logout()
  useUiStore.setState({ sidebarCollapsed: false })
})

function renderSidebar() {
  return render(
    <MemoryRouter>
      <Sidebar />
    </MemoryRouter>,
  )
}

describe('Sidebar', () => {
  it('renders navigation links appropriate for the logged-in role', () => {
    useAuthStore.getState().loginAsRole('teacher')
    renderSidebar()
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /payroll/i })).not.toBeInTheDocument()
  })

  it('hides nav links that have been revoked via the permissions store', () => {
    useAuthStore.getState().loginAsRole('teacher')
    usePermissionsStore.getState().toggleAccess('teacher', '/app/dashboard')
    renderSidebar()
    expect(screen.queryByRole('link', { name: /dashboard/i })).not.toBeInTheDocument()
  })

  it('shows the role label at the bottom when expanded', () => {
    useAuthStore.getState().loginAsRole('administrator')
    renderSidebar()
    expect(screen.getByText('Administrator')).toBeInTheDocument()
    expect(screen.getByText('Signed in')).toBeInTheDocument()
  })

  it('toggles the sidebar-collapsed ui state when the collapse button is clicked', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('administrator')
    renderSidebar()

    expect(useUiStore.getState().sidebarCollapsed).toBe(false)
    await user.click(screen.getByRole('button', { name: /toggle sidebar/i }))
    expect(useUiStore.getState().sidebarCollapsed).toBe(true)
  })

  it('hides the role label text when collapsed', () => {
    useAuthStore.getState().loginAsRole('administrator')
    useUiStore.setState({ sidebarCollapsed: true })
    renderSidebar()
    expect(screen.queryByText('Signed in')).not.toBeInTheDocument()
  })
})
