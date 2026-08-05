import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { ProfileMenu } from './profile-menu'
import { useAuthStore } from '@/store/auth-store'

beforeEach(() => {
  localStorage.clear()
  useAuthStore.getState().logout()
})

function renderMenu() {
  return render(
    <MemoryRouter>
      <ProfileMenu />
    </MemoryRouter>,
  )
}

describe('ProfileMenu', () => {
  it("shows the logged-in user's name and role label", () => {
    useAuthStore.getState().loginAsRole('teacher')
    renderMenu()
    expect(screen.getByText(useAuthStore.getState().name)).toBeInTheDocument()
    expect(screen.getByText('Teacher')).toBeInTheDocument()
  })

  it('shows "Guest" as the role label when no role is set', () => {
    renderMenu()
    expect(screen.getByText('Guest')).toBeInTheDocument()
  })

  it('opens a menu with Profile, Settings, Support, and Log out items', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('administrator')
    renderMenu()

    await user.click(screen.getByRole('button'))

    expect(await screen.findByRole('menuitem', { name: /profile/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /settings/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /support/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /log out/i })).toBeInTheDocument()
  })

  it('logs out and clears authentication state when "Log out" is selected', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('administrator')
    renderMenu()

    await user.click(screen.getByRole('button'))
    await user.click(await screen.findByRole('menuitem', { name: /log out/i }))

    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(useAuthStore.getState().role).toBeNull()
  })
})
