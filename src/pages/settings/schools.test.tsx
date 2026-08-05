import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SchoolsSettingsPage from './schools'
import { schools as initialSchools } from '@/mock/schools'

beforeEach(() => {
  localStorage.clear()
})

describe('SchoolsSettingsPage', () => {
  it('renders a card for every school in the account', () => {
    render(<SchoolsSettingsPage />)
    for (const s of initialSchools) {
      expect(screen.getByText(s.name)).toBeInTheDocument()
    }
  })

  it('shows validation errors and does not add a school when the form is invalid', async () => {
    const user = userEvent.setup()
    render(<SchoolsSettingsPage />)

    await user.click(screen.getByRole('button', { name: /add school/i }))
    await user.click(screen.getByRole('button', { name: /create school/i }))

    expect(await screen.findByText('School name is required')).toBeInTheDocument()
    expect(screen.getByText('City is required')).toBeInTheDocument()
    // Still just the original schools — nothing was added.
    expect(screen.getAllByText(initialSchools[0].name)).toHaveLength(1)
  })

  it('adds a new school to the list on valid submit', async () => {
    const user = userEvent.setup()
    render(<SchoolsSettingsPage />)

    await user.click(screen.getByRole('button', { name: /add school/i }))
    await user.type(screen.getByLabelText(/school name/i), 'Test Academy')
    await user.type(screen.getByLabelText(/city/i), 'Chennai')
    await user.click(screen.getByRole('button', { name: /create school/i }))

    expect(await screen.findByText('Test Academy', {}, { timeout: 2000 })).toBeInTheDocument()
    // Dialog closes after a successful submit.
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('removes a school after confirming delete', async () => {
    const user = userEvent.setup()
    render(<SchoolsSettingsPage />)
    const target = initialSchools[0]

    const deleteButtons = screen.getAllByRole('button').filter((b) => b.querySelector('svg.lucide-trash-2'))
    await user.click(deleteButtons[0])
    await user.click(await screen.findByRole('button', { name: /^delete$/i }))

    expect(screen.queryByText(target.name)).not.toBeInTheDocument()
  })

  it('refuses to delete the last remaining school (pre-existing guard in handleDelete)', async () => {
    const user = userEvent.setup()
    render(<SchoolsSettingsPage />)

    // Delete all schools but the last one.
    for (let i = 0; i < initialSchools.length - 1; i++) {
      const deleteButtons = screen.getAllByRole('button').filter((b) => b.querySelector('svg.lucide-trash-2'))
      await user.click(deleteButtons[0])
      await user.click(await screen.findByRole('button', { name: /^delete$/i }))
    }

    const lastSchool = screen.getAllByRole('button').filter((b) => b.querySelector('svg.lucide-trash-2'))
    expect(lastSchool).toHaveLength(1)

    await user.click(lastSchool[0])
    await user.click(await screen.findByRole('button', { name: /^delete$/i }))

    // The guard toasts an error and returns before removing — the last school stays.
    expect(screen.getAllByRole('button').filter((b) => b.querySelector('svg.lucide-trash-2'))).toHaveLength(1)
  })
})
