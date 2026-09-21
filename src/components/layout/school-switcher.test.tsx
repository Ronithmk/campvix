import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { SchoolSwitcher } from './school-switcher'
import { useAuthStore } from '@/store/auth-store'
import { schools } from '@/mock/schools'

beforeEach(() => {
  localStorage.clear()
  useAuthStore.getState().logout()
  useAuthStore.setState({ schoolId: schools[0].id })
})

function renderSwitcher(props?: { collapsed?: boolean }) {
  return render(
    <MemoryRouter>
      <SchoolSwitcher {...props} />
    </MemoryRouter>,
  )
}

describe('SchoolSwitcher', () => {
  it('shows the active school name in the trigger', () => {
    renderSwitcher()
    expect(screen.getByText(schools[0].name)).toBeInTheDocument()
  })

  it('lists every school in the dropdown when opened', async () => {
    const user = userEvent.setup()
    renderSwitcher()
    await user.click(screen.getByRole('button'))

    for (const s of schools) {
      expect(await screen.findByRole('menuitem', { name: new RegExp(s.name) })).toBeInTheDocument()
    }
  })

  it('switches the active school via setSchool when a different school is selected', async () => {
    const user = userEvent.setup()
    renderSwitcher()
    await user.click(screen.getByRole('button'))

    const target = schools[1]
    await user.click(await screen.findByRole('menuitem', { name: new RegExp(target.name) }))

    expect(useAuthStore.getState().schoolId).toBe(target.id)
  })

  it('renders in a collapsed, icon-only mode without the school name text', () => {
    renderSwitcher({ collapsed: true })
    expect(screen.queryByText(schools[0].name)).not.toBeInTheDocument()
  })

  it('links "Add a school" to the schools settings page instead of a stub toast', async () => {
    const user = userEvent.setup()
    renderSwitcher()
    await user.click(screen.getByRole('button'))

    const addSchool = await screen.findByRole('menuitem', { name: /add a school/i })
    expect(addSchool).toHaveAttribute('href', '/app/settings/schools')
  })
})
