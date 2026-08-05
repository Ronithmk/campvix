import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './protected-route'
import { useAuthStore } from '@/store/auth-store'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/app/dashboard" element={<div>Dashboard content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
  useAuthStore.getState().logout()
})

describe('ProtectedRoute', () => {
  it('redirects to /login when not authenticated', () => {
    renderAt('/app/dashboard')
    expect(screen.getByText('Login page')).toBeInTheDocument()
    expect(screen.queryByText('Dashboard content')).not.toBeInTheDocument()
  })

  it('renders the outlet when authenticated', () => {
    useAuthStore.getState().loginAsRole('teacher')
    renderAt('/app/dashboard')
    expect(screen.getByText('Dashboard content')).toBeInTheDocument()
    expect(screen.queryByText('Login page')).not.toBeInTheDocument()
  })
})
