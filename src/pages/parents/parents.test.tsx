import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ParentsPage from './parents'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'
import { parents as mockParents } from '@/mock/parents'
import { formatNumber } from '@/lib/utils'

beforeEach(() => {
  localStorage.clear()
  usePermissionsStore.getState().resetToDefaults()
  useAuthStore.getState().logout()
  useAuthStore.getState().loginAsRole('administrator')
})

const schoolId = () => useAuthStore.getState().schoolId!

describe('ParentsPage — rendering and stats', () => {
  it('renders for administrator', () => {
    render(<ParentsPage />)
    expect(screen.getByRole('heading', { name: /parents/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /invite parent/i })).toBeInTheDocument()
  })

  it('shows stat cards matching the underlying mock data', () => {
    render(<ParentsPage />)
    const schoolParents = mockParents.filter((p) => p.schoolId === schoolId())
    const totalChildren = schoolParents.reduce((sum, p) => sum + p.childrenIds.length, 0)
    const multiChild = schoolParents.filter((p) => p.childrenIds.length > 1).length

    expect(screen.getByText('Total Parents', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(formatNumber(schoolParents.length))
    expect(screen.getByText('Linked Students', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(formatNumber(totalChildren))
    expect(screen.getByText('Multi-child Families', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(formatNumber(multiChild))
  })
})

describe('ParentsPage — Invite Parent', () => {
  it('creates a new parent scoped to the current school, links a child, and adds it to the list', async () => {
    const user = userEvent.setup()
    render(<ParentsPage />)
    const before = mockParents.filter((p) => p.schoolId === schoolId()).length

    await user.click(screen.getByRole('button', { name: /invite parent/i }))
    await user.type(screen.getByLabelText(/full name/i), 'Test Automation Parent')
    await user.type(screen.getByLabelText(/email/i), 'test.parent@example.com')
    await user.click(screen.getByRole('combobox', { name: /child/i }))
    const option = (await screen.findAllByRole('option'))[0]
    await user.click(option)
    await user.click(screen.getByRole('button', { name: /send invite/i }))

    expect(await screen.findByText('Test Automation Parent')).toBeInTheDocument()
    expect(screen.getByText('Total Parents', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(formatNumber(before + 1))
  })
})

describe('ParentsPage — delete flow', () => {
  it('removes the parent row after confirming delete', async () => {
    const user = userEvent.setup()
    render(<ParentsPage />)
    const target = mockParents.find((p) => p.schoolId === schoolId())!

    const nameCell = screen.getByText(target.name)
    const row = nameCell.closest('tr')!
    await user.click(within(row).getByRole('button'))
    await user.click(await screen.findByRole('menuitem', { name: /^remove$/i }))

    const dialog = await screen.findByRole('alertdialog')
    expect(within(dialog).getByText(/remove this parent\?/i)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: /^delete$/i }))

    expect(screen.queryByText(target.name)).not.toBeInTheDocument()
  })

  it('keeps the parent row when delete is cancelled', async () => {
    const user = userEvent.setup()
    render(<ParentsPage />)
    const target = mockParents.find((p) => p.schoolId === schoolId())!

    const nameCell = screen.getByText(target.name)
    const row = nameCell.closest('tr')!
    await user.click(within(row).getByRole('button'))
    await user.click(await screen.findByRole('menuitem', { name: /^remove$/i }))

    const dialog = await screen.findByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: /cancel/i }))

    expect(screen.getByText(target.name)).toBeInTheDocument()
  })
})
