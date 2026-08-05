import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ClassesPage from './classes'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'
import { classes as mockClasses } from '@/mock/classes'
import { formatNumber } from '@/lib/utils'

beforeEach(() => {
  localStorage.clear()
  usePermissionsStore.getState().resetToDefaults()
  useAuthStore.getState().logout()
  useAuthStore.getState().loginAsRole('administrator')
})

const schoolId = () => useAuthStore.getState().schoolId!

describe('ClassesPage — rendering and stats', () => {
  it('renders for administrator', () => {
    render(<ClassesPage />)
    expect(screen.getByRole('heading', { name: /classes/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add class/i })).toBeInTheDocument()
  })

  it('shows stat cards matching the underlying mock data', () => {
    render(<ClassesPage />)
    const schoolClasses = mockClasses.filter((c) => c.schoolId === schoolId())
    const totalStrength = schoolClasses.reduce((sum, c) => sum + c.strength, 0)
    const avgStrength = Math.round(totalStrength / schoolClasses.length)

    expect(screen.getByText('Total Classes', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(String(schoolClasses.length))
    expect(screen.getByText('Total Students', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(formatNumber(totalStrength))
    expect(screen.getByText('Avg. Class Size', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(String(avgStrength))
  })

  it('renders a card for every class in the active school', () => {
    render(<ClassesPage />)
    const schoolClasses = mockClasses.filter((c) => c.schoolId === schoolId())
    for (const klass of schoolClasses) {
      expect(screen.getByText(klass.name)).toBeInTheDocument()
    }
  })
})

describe('ClassesPage — Add Class button is a stub', () => {
  it('shows a success toast but does not add a new class card (known UI stub)', async () => {
    const user = userEvent.setup()
    render(<ClassesPage />)
    const before = mockClasses.filter((c) => c.schoolId === schoolId()).length

    await user.click(screen.getByRole('button', { name: /add class/i }))

    expect(screen.getByText('Total Classes', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(String(before))
  })
})

describe('ClassesPage — delete flow', () => {
  it('removes the class card after confirming delete', async () => {
    const user = userEvent.setup()
    render(<ClassesPage />)
    const target = mockClasses.find((c) => c.schoolId === schoolId())!
    const before = mockClasses.filter((c) => c.schoolId === schoolId()).length

    const nameEl = screen.getByText(target.name)
    const card = nameEl.closest('[data-slot="card"]') as HTMLElement
    await user.click(within(card).getByRole('button'))

    const dialog = await screen.findByRole('alertdialog')
    expect(within(dialog).getByText(/delete this class\?/i)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: /^delete$/i }))

    expect(screen.queryByText(target.name)).not.toBeInTheDocument()
    expect(screen.getByText('Total Classes', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(String(before - 1))
  })
})
