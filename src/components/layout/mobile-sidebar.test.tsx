import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { MobileSidebar } from './mobile-sidebar'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'

beforeEach(() => {
  localStorage.clear()
  usePermissionsStore.getState().resetToDefaults()
  useAuthStore.getState().logout()
})

describe('MobileSidebar', () => {
  it('renders nothing visible when closed', () => {
    useAuthStore.getState().loginAsRole('teacher')
    render(
      <MemoryRouter>
        <MobileSidebar open={false} onOpenChange={vi.fn()} />
      </MemoryRouter>,
    )
    expect(screen.queryByRole('link', { name: /dashboard/i })).not.toBeInTheDocument()
  })

  it('renders role-appropriate nav links when open', () => {
    useAuthStore.getState().loginAsRole('teacher')
    render(
      <MemoryRouter>
        <MobileSidebar open onOpenChange={vi.fn()} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /payroll/i })).not.toBeInTheDocument()
  })

  it('calls onOpenChange(false) when a nav link is clicked', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    useAuthStore.getState().loginAsRole('teacher')
    render(
      <MemoryRouter>
        <MobileSidebar open onOpenChange={onOpenChange} />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('link', { name: /dashboard/i }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
