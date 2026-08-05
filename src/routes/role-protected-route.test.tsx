import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { RoleProtectedRoute } from './role-protected-route'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<RoleProtectedRoute />}>
          <Route path="/app/dashboard" element={<div>Dashboard content</div>} />
          <Route path="/app/finance/payroll" element={<div>Payroll content</div>} />
          <Route path="/app/unregistered-route" element={<div>Unregistered content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
  usePermissionsStore.getState().resetToDefaults()
  useAuthStore.getState().logout()
})

describe('RoleProtectedRoute', () => {
  it('renders the route when the role has access', () => {
    useAuthStore.getState().loginAsRole('teacher')
    renderAt('/app/dashboard')
    expect(screen.getByText('Dashboard content')).toBeInTheDocument()
  })

  it('does not render the route when the role lacks access (student -> payroll)', () => {
    useAuthStore.getState().loginAsRole('student')
    renderAt('/app/finance/payroll')
    expect(screen.queryByText('Payroll content')).not.toBeInTheDocument()
  })

  it('denies access to a route with no matching NAV_SECTIONS entry (fail-closed)', () => {
    useAuthStore.getState().loginAsRole('administrator')
    renderAt('/app/unregistered-route')
    expect(screen.queryByText('Unregistered content')).not.toBeInTheDocument()
  })

  it('administrator always passes, even for an otherwise-restricted route', () => {
    useAuthStore.getState().loginAsRole('administrator')
    renderAt('/app/finance/payroll')
    expect(screen.getByText('Payroll content')).toBeInTheDocument()
  })
})
